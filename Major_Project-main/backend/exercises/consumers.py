import json
import base64
import numpy as np
import cv2
import mediapipe as mp
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.exercise_analysis import ExerciseAnalyzer
from channels.auth import AuthMiddlewareStack
import time
from asyncio import Lock

class ExerciseAnalysisConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.last_process_time = 0
        self.PROCESS_FPS = 15
        self.process_interval = 1.0 / self.PROCESS_FPS
        self.lock = Lock()
        self.counter = 0
        self.stage = None
        self.start_time = None
        self.duration = 0
        self.correct_form_count = 0
        self.total_frames = 0

    async def connect(self):
        """Initialize connection and ExerciseAnalyzer"""
        self.exercise_type = self.scope['url_route']['kwargs']['exercise_type']
        
        try:
            self.analyzer = ExerciseAnalyzer(self.exercise_type)
            await self.accept()
            print(f"WebSocket connected for {self.exercise_type}")
        except Exception as e:
            print(f"Error initializing analyzer: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        """Handle disconnection"""
        self.is_analyzing = False
        if hasattr(self, 'analyzer'):
            # Clean up analyzer resources if needed
            del self.analyzer

    async def receive(self, text_data):
        """Handle incoming frames"""
        current_time = time.time()
        if current_time - self.last_process_time < self.process_interval:
            return  # Skip processing if too soon

        try:
            async with self.lock:
                data = json.loads(text_data)
                if data.get('type') == 'frame':
                    # Decode base64 image
                    frame_data = data['frame'].split(',')[1]
                    frame_bytes = base64.b64decode(frame_data)
                    np_arr = np.frombuffer(frame_bytes, np.uint8)
                    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                    
                    if frame is None:
                        return
                    
                    # Process frame and get metrics
                    processed_frame, metrics = self.analyzer.process_frame(frame)
                    
                    # Debug print
                    print(f"Frame processed - Counter: {metrics['counter']}, Stage: {metrics['stage']}")
                    
                    # Encode processed frame
                    _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    processed_frame_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    self.last_process_time = current_time
                    
                    # Send back processed frame and metrics
                    await self.send(text_data=json.dumps({
                        'type': 'frame_processed',
                        'frame': f'data:image/jpeg;base64,{processed_frame_base64}',
                        'metrics': metrics
                    }))
                    
        except Exception as e:
            print(f"Error processing frame: {str(e)}")

    async def handle_start_exercise(self):
        """Handle exercise start"""
        self.is_analyzing = True
        await self.send(text_data=json.dumps({
            'type': 'exercise_started'
        }))

    async def handle_stop_exercise(self):
        """Handle exercise stop"""
        self.is_analyzing = False
        # Send final statistics
        await self.send(text_data=json.dumps({
            'type': 'exercise_completed',
            'metrics': {
                'total_reps': self.counter,
                'form_accuracy': self.analyze_exercise(self.pose.PoseLandmark),
                'feedback': self.analyze_exercise(self.pose.PoseLandmark)
            }
        }))

    def analyze_exercise(self, landmarks):
        """Analyze exercise form based on exercise type"""
        if self.exercise_type == 'bicep_curls':
            return self._analyze_bicep_curl(landmarks)
        elif self.exercise_type == 'squats':
            return self._analyze_squat(landmarks)
        elif self.exercise_type == 'pushups':
            return self._analyze_pushup(landmarks)
        elif self.exercise_type == 'planks':
            return self._analyze_plank(landmarks)
        elif self.exercise_type == 'lunges':
            return self._analyze_lunge(landmarks)
        
        return {'error': 'Unknown exercise type'}

    def _analyze_bicep_curl(self, landmarks):
        """Analyze bicep curl form"""
        shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        elbow = landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value]
        
        angle = self.calculate_angle(shoulder, elbow, wrist)
        
        # Extract keypoints for model
        keypoints = self.extract_keypoints(landmarks)
        prediction = self.model.predict(keypoints, verbose=0)[0][0]
        form_accuracy = float(prediction * 100)
        
        if angle > 160 and self.stage != "down":
            self.stage = "down"
            self.correct_form = prediction > 0.7
        elif angle < 30 and self.stage == 'down':
            self.stage = "up"
            self.counter += 1
            self.correct_form = prediction > 0.7

        return {
            'reps': self.counter,
            'stage': self.stage,
            'angle': int(angle),
            'form_accuracy': form_accuracy,
            'feedback': self._get_feedback(angle, prediction)
        }

    def _analyze_squat(self, landmarks):
        """Analyze squat form"""
        hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value]
        knee = landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value]
        ankle = landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value]
        
        angle = self.calculate_angle(hip, knee, ankle)
        keypoints = self.extract_keypoints(landmarks)
        prediction = self.model.predict(keypoints, verbose=0)[0][0]
        form_accuracy = float(prediction * 100)
        
        if angle < 100 and self.stage != "down":
            self.stage = "down"
            self.correct_form = prediction > 0.7
        elif angle > 160 and self.stage == 'down':
            self.stage = "up"
            self.counter += 1
            self.correct_form = prediction > 0.7

        return {
            'reps': self.counter,
            'stage': self.stage,
            'angle': int(angle),
            'form_accuracy': form_accuracy,
            'feedback': self._get_squat_feedback(angle, prediction)
        }

    def _analyze_plank(self, landmarks):
        """Analyze plank form"""
        # Extract relevant landmarks for plank
        shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value]
        ankle = landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value]
        
        # Calculate body alignment angle
        angle = self.calculate_angle(shoulder, hip, ankle)
        keypoints = self.extract_keypoints(landmarks)
        prediction = self.model.predict(keypoints, verbose=0)[0][0]
        form_accuracy = float(prediction * 100)
        
        # Update duration for plank
        if self.start_time is None:
            self.start_time = time.time()
        self.duration = time.time() - self.start_time
        
        return {
            'duration': self.duration,
            'angle': int(angle),
            'form_accuracy': form_accuracy,
            'feedback': self._get_plank_feedback(angle, prediction)
        }

    def _analyze_pushup(self, landmarks):
        """Analyze pushup form"""
        shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        elbow = landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value]
        
        angle = self.calculate_angle(shoulder, elbow, wrist)
        keypoints = self.extract_keypoints(landmarks)
        prediction = self.model.predict(keypoints, verbose=0)[0][0]
        form_accuracy = float(prediction * 100)
        
        if angle > 160 and self.stage != "down":
            self.stage = "down"
            self.correct_form = prediction > 0.7
        elif angle < 90 and self.stage == 'down':
            self.stage = "up"
            self.counter += 1
            self.correct_form = prediction > 0.7

        return {
            'reps': self.counter,
            'stage': self.stage,
            'angle': int(angle),
            'form_accuracy': form_accuracy,
            'feedback': self._get_pushup_feedback(angle, prediction)
        }

    def _analyze_lunge(self, landmarks):
        """Analyze lunge form"""
        hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value]
        knee = landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value]
        ankle = landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value]
        
        angle = self.calculate_angle(hip, knee, ankle)
        keypoints = self.extract_keypoints(landmarks)
        prediction = self.model.predict(keypoints, verbose=0)[0][0]
        form_accuracy = float(prediction * 100)
        
        if angle > 160:
            self.stage = "up"
        elif angle < 90 and self.stage == 'up':
            self.stage = "down"
            self.counter += 1
            self.correct_form = prediction > 0.7

        return {
            'reps': self.counter,
            'stage': self.stage,
            'angle': int(angle),
            'form_accuracy': form_accuracy,
            'feedback': self._get_lunge_feedback(angle, prediction)
        }

    def _get_feedback(self, angle, prediction):
        """Get exercise-specific feedback"""
        if prediction < 0.7:
            return "Incorrect form detected, please check your posture"
        if self.exercise_type == 'bicep_curls':
            if angle > 30 and angle < 160:
                return "Complete the full range of motion"
        elif self.exercise_type == 'squats':
            if angle > 100:
                return "Squat deeper for full range of motion"
        elif self.exercise_type == 'pushups':
            if angle > 90:
                return "Lower your body more"
        elif self.exercise_type == 'planks':
            if angle < 160:
                return "Keep your body straight"
        elif self.exercise_type == 'lunges':
            if angle > 90:
                return "Lower your back knee more"
        return "Good form!"

    def calculate_angle(self, shoulder, elbow, wrist):
        """Calculate angle between three points"""
        a = np.array([shoulder.x, shoulder.y])
        b = np.array([elbow.x, elbow.y])
        c = np.array([wrist.x, wrist.y])

        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - \
                 np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)

        if angle > 180.0:
            angle = 360-angle

        return angle

    async def send_feedback(self, feedback):
        """Send real-time feedback to client"""
        await self.send(text_data=json.dumps({
            'type': 'feedback',
            'message': feedback
        }))

class ExerciseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Initialize connection and MediaPipe"""
        self.exercise_type = self.scope['url_route']['kwargs']['exercise_type']
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.counter = 0
        self.stage = None
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            # Decode base64 image
            frame_data = json.loads(text_data)
            frame_bytes = base64.b64decode(frame_data['frame'].split(',')[1])
            np_arr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # Process frame with MediaPipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(frame_rgb)

            if results.pose_landmarks:
                # Draw pose landmarks
                self.mp_drawing.draw_landmarks(
                    frame, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS)

                # Calculate bicep curl metrics
                metrics = self.analyze_bicep_curl(results.pose_landmarks.landmark, frame)

                # Encode processed frame
                _, buffer = cv2.imencode('.jpg', frame)
                processed_frame = base64.b64encode(buffer).decode('utf-8')

                # Send back processed frame and metrics
                await self.send(text_data=json.dumps({
                    'frame': f'data:image/jpeg;base64,{processed_frame}',
                    'metrics': metrics
                }))

        except Exception as e:
            print(f"Error processing frame: {str(e)}")

import tensorflow as tf
import mediapipe as mp
import numpy as np
import cv2
import os
from django.conf import settings
from pathlib import Path

class ExerciseAnalyzer:
    def __init__(self, exercise_type):
        # Initialize for specific exercise type
        self.exercise_type = exercise_type
        self.counter = 0
        self.correct_poses = 0
        self.total_poses = 0
        self.stage = None
        self.feedback = ""
        self.form_feedback = []
        self.correct_form = False
        
        # Load ML model
        ml_models_dir = Path(settings.BASE_DIR) / 'exercises' / 'ml_models'
        self.model_paths = {
            'bicep_curls': str(ml_models_dir / 'bicep_model.h5'),
            'pushups': str(ml_models_dir / 'pushups_model.h5'),
            'squats': str(ml_models_dir / 'squats_model.h5'),
            'lunges': str(ml_models_dir / 'lunges_model.h5'),
            'planks': str(ml_models_dir / 'planks_model.h5')
        }
        # Load model based on exercise type from model_paths dictionary
        if exercise_type in self.model_paths:
            self.model = tf.keras.models.load_model(self.model_paths[exercise_type])
        else:
            raise ValueError(f"No model found for exercise type: {exercise_type}")
        
        # Initialize MediaPipe
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Define keypoints based on exercise type
        self.keypoints_config = {
            'bicep_curls': [
                'nose', 'left_elbow', 'right_elbow', 'left_shoulder', 
                'right_shoulder', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip'
            ],
            'planks': [
                'nose', 'left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder',
                'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee',
                'right_knee', 'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
                'left_foot_index', 'right_foot_index'
            ],
            'lunges': [
                'nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip',
                'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel',
                'right_heel', 'left_foot_index', 'right_foot_index'
            ]
        }

    def calculate_angle(self, a, b, c):
        """Calculate angle between three points"""
        a = np.array([a.x, a.y])  # First point
        b = np.array([b.x, b.y])  # Mid point
        c = np.array([c.x, c.y])  # End point
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
            
        return angle

    def extract_keypoints(self, landmarks):
        """Extract relevant keypoints based on exercise type"""
        keypoints = []
        keypoint_list = self.keypoints_config.get(self.exercise_type, [])
        
        for landmark in landmarks:
            # Extract x, y, z coordinates and visibility for each landmark
            keypoints.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
            
        # Reshape according to the model's input shape
        input_shape = (1, 1, len(keypoints))
        return np.array(keypoints).reshape(input_shape)

    def get_feedback(self, prediction, exercise_type):
        """Generate feedback based on prediction and exercise type"""
        if exercise_type == 'planks':
            # Planks has 3 classes (correct, incorrect, slightly incorrect)
            class_idx = np.argmax(prediction)
            if class_idx == 1:  # Correct form
                return "Correct form!", True
            elif class_idx == 2:  # Slightly incorrect
                return "Form needs minor adjustment. Keep your body straight.", False
            else:  # Incorrect
                return "Incorrect form. Lower your hips and keep your body straight.", False
        else:
            # Binary classification for other exercises
            threshold = self.models[exercise_type]['threshold']
            if prediction > threshold:
                if exercise_type == 'bicep_curls':
                    return "Good form! Full range of motion.", True
                elif exercise_type == 'lunges':
                    return "Good form! Keep it up.", True
            else:
                if exercise_type == 'bicep_curls':
                    return "Incorrect form. Complete the full range of motion.", False
                elif exercise_type == 'lunges':
                    return "Incorrect form. Keep your back straight and go lower.", False
        
        return "Form needs improvement.", False

    def analyze_frame(self, frame, exercise_type):
        """Analyze a single frame for the given exercise type"""
        if exercise_type not in self.keypoints_config:
            raise ValueError(f"Unsupported exercise type: {exercise_type}")

        # Convert frame to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Get pose landmarks
        results = self.pose.process(rgb_frame)
        
        if not results.pose_landmarks:
            return None, "No pose detected", False, ""

        # Extract and prepare keypoints
        input_data = self.extract_keypoints(results.pose_landmarks.landmark)
        
        # Get prediction from model
        prediction = self.model.predict(input_data, verbose=0)
        
        # Get feedback based on prediction
        feedback, is_correct = self.get_feedback(prediction[0], exercise_type)
        
        return prediction[0], "Frame analyzed successfully", is_correct, feedback

    def process_video(self, video_path, exercise_type):
        """Process a video file for exercise analysis"""
        cap = cv2.VideoCapture(video_path)
        frames_predictions = []
        feedback_list = []
        correct_form_count = 0
        total_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            prediction, message, is_correct, feedback = self.analyze_frame(frame, exercise_type)
            if prediction is not None:
                frames_predictions.append(prediction)
                feedback_list.append(feedback)
                if is_correct:
                    correct_form_count += 1
                total_frames += 1
        
        cap.release()
        
        if not frames_predictions:
            return None, "No valid frames analyzed", 0, []
            
        accuracy = (correct_form_count / total_frames * 100) if total_frames > 0 else 0
        return np.mean(frames_predictions, axis=0), "Video analysis complete", accuracy, feedback_list

    def process_frame(self, frame):
        # Convert to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(frame_rgb)
        
        # Draw pose landmarks
        annotated_frame = frame.copy()
        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                annotated_frame,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS
            )
            
            # Extract keypoints and get prediction
            keypoints = self._extract_keypoints(results)
            if keypoints is not None:
                prediction = self.model.predict(keypoints, verbose=0)
                
                # Get exercise-specific feedback
                feedback = self._get_exercise_feedback(prediction, keypoints.flatten())
                
                # Update metrics
                form_accuracy = float(prediction[0] if self.exercise_type != 'planks' else max(prediction))
                
                return annotated_frame, {
                    'counter': self.counter,
                    'stage': self.stage,
                    'form_accuracy': form_accuracy * 100,  # Convert to percentage
                    'feedback': feedback,
                    'correct_form': form_accuracy > 0.7
                }
        
        return frame, {
            'counter': self.counter,
            'stage': self.stage,
            'form_accuracy': 0,
            'feedback': ["No pose detected"],
            'correct_form': False
        }

    def _extract_keypoints(self, results):
        keypoints = []
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Get required landmarks based on exercise type
            for point in self.keypoints_config.get(self.exercise_type, []):
                landmark = getattr(self.mp_pose.PoseLandmark, point.upper())
                keypoints.extend([
                    landmarks[landmark].x,
                    landmarks[landmark].y,
                    landmarks[landmark].z,
                    landmarks[landmark].visibility
                ])
            
            # Reshape based on exercise type
            if self.exercise_type == 'bicep_curls':
                return np.array(keypoints).reshape(1, 1, 36)
            elif self.exercise_type == 'planks':
                return np.array(keypoints).reshape(1, 1, 68)
            elif self.exercise_type == 'lunges':
                return np.array(keypoints).reshape(1, 1, 52)
            
        return None

    def _get_exercise_feedback(self, prediction, keypoints):
        """Generate exercise-specific feedback"""
        feedback = []
        
        if self.exercise_type == 'bicep_curls':
            # Example feedback for bicep curls
            left_elbow = keypoints[4:8]  # left elbow coordinates
            left_shoulder = keypoints[12:16]  # left shoulder coordinates
            if prediction < 0.7:
                feedback.append("Keep your elbows close to your body")
                feedback.append("Control the movement speed")
            
        elif self.exercise_type == 'planks':
            # Example feedback for planks
            if prediction[0] > 0.7:  # Correct form
                feedback.append("Good plank position")
            elif prediction[1] > 0.7:  # Low hips
                feedback.append("Raise your hips to align with shoulders")
            else:  # High hips
                feedback.append("Lower your hips to align with shoulders")
            
        elif self.exercise_type == 'lunges':
            # Example feedback for lunges
            if prediction < 0.7:
                feedback.append("Keep your upper body straight")
                feedback.append("Step forward far enough")
                
        return feedback

    def get_accuracy(self):
        """Return overall form accuracy"""
        return sum(self.form_feedback) / len(self.form_feedback) if self.form_feedback else 0

    def _process_bicep_curl(self, landmarks, image):
        """Process bicep curl exercise"""
        # Get coordinates
        shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        elbow = landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value]
        
        # Calculate angle
        angle = self.calculate_angle(shoulder, elbow, wrist)
        
        # Visualize angle
        cv2.putText(image, str(int(angle)), 
                    tuple(np.multiply([elbow.x, elbow.y], [640, 480]).astype(int)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
        
        # Curl counter logic
        if angle > 160:
            self.stage = "down"
            self.correct_form = True
        elif angle < 30 and self.stage == 'down':
            self.stage = "up"
            self.counter += 1
            self.correct_form = True
        else:
            self.correct_form = False
            
        # Form feedback
        if not self.correct_form:
            if angle > 30 and angle < 160:
                self.form_feedback = "Complete the full range of motion"
            else:
                self.form_feedback = "Maintain proper form"
        else:
            self.form_feedback = "Good form!"

    def _process_squat(self, landmarks, image):
        """Process squat exercise"""
        # Similar implementation for squats
        pass

    def _process_pushup(self, landmarks, image):
        """Process pushup exercise"""
        # Similar implementation for pushups
        pass 
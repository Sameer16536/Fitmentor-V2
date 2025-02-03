import tensorflow as tf
import mediapipe as mp
import numpy as np
import cv2
import os
from django.conf import settings

class ExerciseAnalyzer:
    def __init__(self, exercise_type):
        self.exercise_type = exercise_type
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.counter = 0  # rep counter
        self.stage = None  # up or down stage
        self.feedback = ""
        self.form_feedback = ""
        self.correct_form = False
        self.correct_poses = 0
        self.total_poses = 0

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

    def process_frame(self, frame):
        """Process each frame and return pose analysis"""
        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Make detection
        results = self.pose.process(image)
        
        # Convert back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        try:
            if results.pose_landmarks:
                # Draw landmarks
                self.mp_drawing.draw_landmarks(
                    image,
                    results.pose_landmarks,
                    self.mp_pose.POSE_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
                    self.mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
                )
                
                # Extract landmarks
                landmarks = results.pose_landmarks.landmark

                if self.exercise_type == "bicep_curls":
                    metrics = self._process_bicep_curl(landmarks, image)
                elif self.exercise_type == "squats":
                    metrics = self._process_squat(landmarks, image)
                elif self.exercise_type == "pushups":
                    metrics = self._process_pushup(landmarks, image)
                
                # Update form statistics
                self.total_poses += 1
                if self.correct_form:
                    self.correct_poses += 1

                return image, {
                    'counter': self.counter,
                    'stage': self.stage,
                    'feedback': self.feedback,
                    'form_feedback': self.form_feedback,
                    'correct_form': self.correct_form,
                    'form_accuracy': (self.correct_poses / self.total_poses * 100) if self.total_poses > 0 else 0
                }

        except Exception as e:
            print(f"Error processing frame: {str(e)}")
            
        return frame, {}

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
import streamlit as st
import tensorflow as tf
import mediapipe as mp
import cv2
import numpy as np
from PIL import Image
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, RTCConfiguration, WebRtcMode
import os
import tempfile
import time
import base64
from custom_video import custom_video_component, get_video_frame, video_frame_callback

# Load the trained model
@st.cache_resource
def load_model(exercise):
    model_filename = f"{exercise.lower()}_model.h5"
    model_path = os.path.join(os.path.dirname(__file__), 'legs', model_filename)
    if not os.path.exists(model_path):
        st.error(f"Model file not found: {model_path}")
        st.info(f"Please make sure the '{model_filename}' file is in the 'legs' directory.")
        st.info(f"Current directory: {os.path.dirname(__file__)}")
        st.info(f"Files in 'legs' directory: {os.listdir(os.path.join(os.path.dirname(__file__), 'legs'))}")
        return None
    return tf.keras.models.load_model(model_path)


class ExerciseProcessor(VideoProcessorBase):
    def __init__(self, exercise_type, exercise):
        self.exercise_type = exercise_type
        self.exercise = exercise
        self.model = load_model(exercise)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()
        self.mp_drawing = mp.solutions.drawing_utils
        self.reps = 0
        self.stage = None
        self.correct_form_count = 0
        self.total_frames = 0

    def recv(self, frame):
        img = frame.to_ndarray(format="bgr24")
        
        # Process the frame and get exercise metrics
        img, metrics = self.process_frame(img)
        
        # Display metrics on the frame
        self.display_metrics(img, metrics)
        
        return img

    def process_frame(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(frame_rgb)

        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS)

            # Extract keypoints for the model
            keypoints = []
            for landmark in results.pose_landmarks.landmark:
                keypoints.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
            keypoints = np.array(keypoints[:52]).reshape(1, 1, 52)

            # Predict form correctness
            prediction = self.model.predict(keypoints)[0][0]
            correct_form = prediction > 0.5

            # Count reps and track form
            if self.exercise == "Lunges":
                self.count_lunges(results.pose_landmarks.landmark, correct_form)
            elif self.exercise == "Squats":
                self.count_squats(results.pose_landmarks.landmark, correct_form)

            self.total_frames += 1
            if correct_form:
                self.correct_form_count += 1

            form_accuracy = (self.correct_form_count / self.total_frames) * 100 if self.total_frames > 0 else 0

            knee_angle = self.calculate_angle(results.pose_landmarks.landmark)

            return frame, {
                "reps": self.reps,
                "form_accuracy": form_accuracy,
                "correct_form": correct_form,
                "knee_angle": knee_angle
            }
        
        return frame, {}

    def calculate_angle(self, landmarks):
        def get_coordinates(landmark):
            return [landmark.x, landmark.y]

        hip = get_coordinates(landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value])
        knee = get_coordinates(landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value])
        ankle = get_coordinates(landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value])

        radians = np.arctan2(ankle[1] - knee[1], ankle[0] - knee[0]) - \
                  np.arctan2(hip[1] - knee[1], hip[0] - knee[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
                
        return angle

    def count_lunges(self, landmarks, correct_form):
        knee_angle = self.calculate_angle(landmarks)

        if knee_angle > 160:
            self.stage = "down"
        if knee_angle < 100 and self.stage == 'down' and correct_form:
            self.stage = "up"
            self.reps += 1

    def count_squats(self, landmarks, correct_form):
        # Implement hammer curl counting logic here (similar to bicep curls)
        squats_angle = self.calculate_angle(landmarks)

        if squats_angle > 160:
            self.stage = "down"
        if squats_angle < 40 and self.stage == 'down' and correct_form:
            self.stage = "up"
            self.reps += 1



def process_uploaded_video(video_file, exercise):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tfile:
        tfile.write(video_file.read())
        temp_filename = tfile.name

    cap = None
    try:
        cap = cv2.VideoCapture(temp_filename)
        processor = ExerciseProcessor("Arms", exercise)
        
        # Create placeholders for real-time updates
        status_placeholder = st.empty()
        video_placeholder = st.empty()
        metrics_placeholder = st.empty()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            processed_frame, metrics = processor.process_frame(frame)
            
            # Update video frame
            video_placeholder.image(processed_frame, channels="BGR", use_column_width=True)
            
            # Update metrics
            metrics_placeholder.write(f"""
            Reps: {metrics.get('reps', 0)}
            Form Accuracy: {metrics.get('form_accuracy', 0):.2f}%
            Current Form: {"Correct" if metrics.get('correct_form', False) else "Incorrect"}
            Knee Angle: {metrics.get('knee_angle', 0):.2f}°
            """)
            
            # Simulate real-time processing
            time.sleep(0)  # Adjust this value to control the playback speed
        
        status_placeholder.success("Video processing complete!")
    finally:
        if cap is not None:
            cap.release()
        try:
            os.unlink(temp_filename)
        except PermissionError:
            print(f"Warning: Unable to delete temporary file {temp_filename}")
    
    return processor.reps, processor.correct_form_count / processor.total_frames * 100 if processor.total_frames > 0 else 0

def legs(video_option, uploaded_file=None):
    st.title("Leg Exercises")
    exercise = st.selectbox("Select a Legs exercise", ["Lunges", "Squats"])

    st.write(f"Let's do some {exercise}!")
    st.write("Position yourself so that your full body is visible in the camera.")

    processor = ExerciseProcessor("Lunges", exercise)

    if video_option == "Live Webcam":
        # Create placeholders for the image and metrics in the Streamlit app
        frame_placeholder = st.empty()
        metrics_placeholder = st.empty()
        
        # Add a button to start/stop the webcam
        start_button = st.button("Start/Stop Webcam")

        if 'webcam_running' not in st.session_state:
            st.session_state.webcam_running = False

        if start_button:
            st.session_state.webcam_running = not st.session_state.webcam_running

        if st.session_state.webcam_running:
            cap = cv2.VideoCapture(0)
            
            while st.session_state.webcam_running:
                ret, frame = cap.read()
                if not ret:
                    st.error("Failed to grab frame from the camera.")
                    break

                frame = cv2.flip(frame, 1)
                
                # Process the frame
                processed_frame, metrics = processor.process_frame(frame)

                # Display metrics on the frame
                cv2.putText(processed_frame, f'Reps: {metrics.get("reps", 0)}', (15, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2, cv2.LINE_AA)
                # cv2.putText(processed_frame, f'Form Accuracy: {metrics.get("form_accuracy", 0):.2f}%', (200, 15),
                #             cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(processed_frame, f'Knee Angle: {int(metrics.get("knee_angle", 0))}', (150, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(processed_frame, f'Form: {"Correct" if metrics.get("correct_form", False) else "Incorrect"}', (400, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0) if metrics.get("correct_form", False) else (0, 0, 255), 2, cv2.LINE_AA)

                # Convert the frame to a PIL image and display it in Streamlit
                img_pil = Image.fromarray(cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB))
                frame_placeholder.image(img_pil, use_column_width=True)

                # Display metrics
                metrics_placeholder.write(f"""
                Reps: {metrics.get("reps", 0)}
                Form Accuracy: {metrics.get("form_accuracy", 0):.2f}%
                Knee Angle: {int(metrics.get("knee_angle", 0))}
                Current Form: {"Correct" if metrics.get("correct_form", False) else "Incorrect"}
                """)

                # Add a small delay to reduce CPU usage
                import time
                time.sleep(0.1)

            cap.release()
        else:
            st.write("Click 'Start/Stop Webcam' to begin.")
    
    elif video_option == "Upload Video":
        if uploaded_file is not None:
            st.video(uploaded_file)
            if st.button("Process Video"):
                with st.spinner('Processing video...'):
                    reps, form_accuracy = process_uploaded_video(uploaded_file, exercise)
                st.success('Video processing complete!')
                st.write(f"Total Reps: {reps}")
                st.write(f"Overall Form Accuracy: {form_accuracy:.2f}%")
        else:
            st.warning("Please upload a video file.")
    
    # Add some tips for the exercise
    st.markdown("---")
    st.subheader("Tips for perfect form:")
    if exercise == "Squats":
        st.write("- Keep your feet shoulder-width apart")
        st.write("- Lower your body as if sitting back into a chair")
        st.write("- Keep your chest up and your weight on your heels")
    elif exercise == "Lunges":
        st.write("- Step forward with one leg, lowering your hips")
        st.write("- Keep your front knee directly above your ankle")
        st.write("- Push back up to the starting position and repeat with the other leg")

    # Add a placeholder for displaying real-time metrics
    metrics_placeholder = st.empty()

    # You can update this placeholder with real-time metrics from the video processor
    # This would require some additional logic to pass data from the video processor to the Streamlit app

# Run the main function
if __name__ == "__main__":
    legs()

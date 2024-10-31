import streamlit as st
import tensorflow as tf
import mediapipe as mp
import cv2
import numpy as np
from PIL import Image
import os
import tempfile
import time

# Load the trained model
@st.cache_resource
def load_model():
    model_path = os.path.join(os.path.dirname(__file__), 'core/planks_model.h5')
    if not os.path.exists(model_path):
        st.error(f"Model file not found: {model_path}")
        st.info("Please make sure the 'planks_model.h5' file is in the 'core' directory.")
        st.info(f"Current directory: {os.path.dirname(__file__)}")
        st.info(f"Files in 'core' directory: {os.listdir(os.path.join(os.path.dirname(__file__), 'core'))}")
        return None
    return tf.keras.models.load_model(model_path)

class ExerciseProcessor:
    def __init__(self, exercise_type, exercise, target_duration):
        self.exercise_type = exercise_type
        self.exercise = exercise
        self.model = load_model()
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()
        self.mp_drawing = mp.solutions.drawing_utils
        self.correct_form_count = 0
        self.total_frames = 0
        self.start_time = None
        self.duration = 0
        self.target_duration = target_duration
        self.timer_running = False

    def process_frame(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(frame_rgb)

        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS)

            keypoints = []
            for landmark in results.pose_landmarks.landmark:
                keypoints.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
            keypoints = np.array(keypoints[:68]).reshape(1, 1, 68)

            prediction = self.model.predict(keypoints)
            correct_form = np.argmax(prediction) == 1  # Assuming 1 is the index for correct form

            self.total_frames += 1
            if correct_form:
                self.correct_form_count += 1
                if not self.timer_running:
                    self.timer_running = True
                    if self.start_time is None:
                        self.start_time = time.time()
            else:
                self.timer_running = False

            if self.timer_running:
                self.duration = time.time() - self.start_time

            form_accuracy = (self.correct_form_count / self.total_frames) * 100 if self.total_frames > 0 else 0

            return frame, {
                "duration": self.duration,
                "form_accuracy": form_accuracy,
                "correct_form": correct_form,
                "completed": self.duration >= self.target_duration
            }
        
        return frame, {}

def process_uploaded_video(video_file, exercise, target_duration):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tfile:
        tfile.write(video_file.read())
        temp_filename = tfile.name

    cap = None
    try:
        cap = cv2.VideoCapture(temp_filename)
        processor = ExerciseProcessor("Core", exercise, target_duration)
        
        status_placeholder = st.empty()
        video_placeholder = st.empty()
        metrics_placeholder = st.empty()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            processed_frame, metrics = processor.process_frame(frame)
            
            video_placeholder.image(processed_frame, channels="BGR", use_column_width=True)
            
            metrics_placeholder.write(f"""
            Duration: {metrics.get('duration', 0):.2f} seconds
            Form Accuracy: {metrics.get('form_accuracy', 0):.2f}%
            Current Form: {"Correct" if metrics.get('correct_form', False) else "Incorrect"}
            """)
            
            if metrics.get('completed', False):
                status_placeholder.success(f"Completed plank for {target_duration} seconds!")
                break
            
            time.sleep(0.01)  # Adjust this value to control the playback speed
        
        if not metrics.get('completed', False):
            status_placeholder.info("Video ended before completing the target duration.")
    finally:
        if cap is not None:
            cap.release()
        try:
            os.unlink(temp_filename)
        except PermissionError:
            print(f"Warning: Unable to delete temporary file {temp_filename}")
    
    return processor.duration, processor.correct_form_count / processor.total_frames * 100 if processor.total_frames > 0 else 0

def core(video_option, uploaded_file=None):
    st.title("Core Exercises")
    exercise = st.selectbox("Select a core exercise", ["Planks"])

    target_duration = st.selectbox("Select plank duration", [30, 60, 120, 150, 180], format_func=lambda x: f"{x} seconds")

    st.write(f"Let's do some {exercise} for {target_duration} seconds!")
    st.write("Position yourself so that your full body is visible in the camera.")

    processor = ExerciseProcessor("Core", exercise, target_duration)

    if video_option == "Live Webcam":
        frame_placeholder = st.empty()
        metrics_placeholder = st.empty()
        status_placeholder = st.empty()
        
        start_button = st.button("Start Analysis")

        if 'analysis_started' not in st.session_state:
            st.session_state.analysis_started = False

        if start_button:
            st.session_state.analysis_started = True

        if st.session_state.analysis_started:
            cap = cv2.VideoCapture(0)
            
            # Countdown timer
            for i in range(10, 0, -1):
                ret, frame = cap.read()
                if not ret:
                    st.error("Failed to grab frame from the camera.")
                    break
                
                frame = cv2.flip(frame, 1)
                cv2.putText(frame, f"Get ready! Starting in {i} seconds", (50, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                
                img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                frame_placeholder.image(img_pil, use_column_width=True)
                time.sleep(1)

            status_placeholder.success("Analysis started!")
            
            while st.session_state.analysis_started:
                ret, frame = cap.read()
                if not ret:
                    st.error("Failed to grab frame from the camera.")
                    break

                frame = cv2.flip(frame, 1)
                
                processed_frame, metrics = processor.process_frame(frame)

                cv2.putText(processed_frame, f'Duration: {metrics.get("duration", 0):.2f}s', (15, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(processed_frame, f'Form: {"Correct" if metrics.get("correct_form", False) else "Incorrect"}', (400, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0) if metrics.get("correct_form", False) else (0, 0, 255), 2, cv2.LINE_AA)

                img_pil = Image.fromarray(cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB))
                frame_placeholder.image(img_pil, use_column_width=True)

                metrics_placeholder.write(f"""
                Duration: {metrics.get("duration", 0):.2f} seconds
                Form Accuracy: {metrics.get("form_accuracy", 0):.2f}%
                Current Form: {"Correct" if metrics.get("correct_form", False) else "Incorrect"}
                """)

                if metrics.get('completed', False):
                    status_placeholder.success(f"Completed plank for {target_duration} seconds!")
                    st.session_state.analysis_started = False
                    break

                time.sleep(0.1)

            cap.release()
        else:
            st.write("Click 'Start Analysis' to begin.")
    
    elif video_option == "Upload Video":
        if uploaded_file is not None:
            st.video(uploaded_file)
            if st.button("Process Video"):
                with st.spinner('Processing video...'):
                    duration, form_accuracy = process_uploaded_video(uploaded_file, exercise, target_duration)
                st.success('Video processing complete!')
                st.write(f"Total Duration: {duration:.2f} seconds")
                st.write(f"Overall Form Accuracy: {form_accuracy:.2f}%")
        else:
            st.warning("Please upload a video file.")
    
    st.markdown("---")
    st.subheader("Tips for perfect plank form:")
    st.write("- Keep your body in a straight line from head to heels")
    st.write("- Engage your core and glutes")
    st.write("- Keep your head in a neutral position, looking at the floor")
    st.write("- Don't let your hips sag or lift too high")

    metrics_placeholder = st.empty()

if __name__ == "__main__":
    core("Live Webcam")
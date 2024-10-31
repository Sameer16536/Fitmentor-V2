import streamlit as st
from login import login_page
from streamlit_option_menu import option_menu
from arms import arms
from legs import legs
from core import core
import cv2

# Set page config for consistent styling
st.set_page_config(page_title="FitMentor", page_icon="💪", layout="wide")

# Initialize session state for login
if "logged_in" not in st.session_state:
    st.session_state["logged_in"] = False

def main():
    # Custom CSS for better styling
    st.markdown("""
    <style>
    .big-font {
        font-size: 50px !important;
        color: #1E90FF;
        text-align: center;
    }
    .stButton>button {
        width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

    # If not logged in, show login/signup page
    if not st.session_state["logged_in"]:
        login_page()
    else:
        # Once logged in, show the main app interface
        st.markdown('<p class="big-font">FitMentor</p>', unsafe_allow_html=True)
        
        # Sidebar for user info and logout
        with st.sidebar:
            st.title(f"Welcome, {st.session_state['username']}!")
            st.write("Track your fitness journey with AI-powered form correction.")
            if st.button("Logout"):
                st.session_state["logged_in"] = False
                st.rerun()

        # Main content area
        st.title("Select Your Workout")
        
        # Use option_menu for a more visually appealing selection
        muscle_group = option_menu(
            menu_title=None,
            options=["Arms", "Legs", "Chest", "Back", "Shoulders", "Core"],
            icons=["bi-arm", "bi-lightning", "bi-heart-pulse", "bi-arrow-clockwise", "bi-person", "bi-bullseye"],
            menu_icon="cast",
            default_index=0,
            orientation="horizontal",
        )

        # Choose between live video and uploaded video
        video_option = st.radio("Choose video input:", ["Live Webcam", "Upload Video"])

        if video_option == "Upload Video":
            uploaded_file = st.file_uploader("Choose a video file", type=["mp4", "mov", "avi"])
        else:
            uploaded_file = None

        # Display the selected exercise module
        if muscle_group == "Arms":
            arms(video_option, uploaded_file)
        elif muscle_group == "Legs":
            legs(video_option, uploaded_file)
        elif muscle_group == "Core":
            core(video_option, uploaded_file)
        else:
            st.info(f"{muscle_group} exercises coming soon!")

        # Add a motivational quote or tip
        st.markdown("---")
        st.write("💡 Tip of the day: Consistency is key to achieving your fitness goals!")

# Run the main function
if __name__ == "__main__":
    main()

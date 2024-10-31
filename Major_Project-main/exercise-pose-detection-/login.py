import streamlit as st
import bcrypt
import re

def login_page():
    # st.set_page_config(page_title="Fitness Tracker Login", layout="centered")
    
    # Custom CSS for better styling
    st.markdown("""
    <style>
    .big-font {
        font-size:30px !important;
        font-weight: bold;
        color: #1E90FF;
    }
    .stRadio > label {
        background-color: #f0f2f6;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
    }
    .stButton>button {
        width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<p class="big-font">Fitness Tracker</p>', unsafe_allow_html=True)

    # Create three columns
    col1, col2, col3 = st.columns([1,2,1])

    with col2:
        option = st.radio("", ["Login", "Signup", "Guest"], horizontal=True)

        if option == "Login":
            with st.form("login_form"):
                st.subheader("Welcome back!")
                username = st.text_input("Username", key="login_username")
                password = st.text_input("Password", type="password", key="login_password")
                submit = st.form_submit_button("Login")
                if submit:
                    if validate_login(username, password):
                        login_success(username)
                    else:
                        st.error("Invalid username or password")

        elif option == "Signup":
            with st.form("signup_form"):
                st.subheader("Create an account")
                username = st.text_input("Create a username", key="signup_username")
                password = st.text_input("Create a password", type="password", key="signup_password")
                confirm_password = st.text_input("Confirm password", type="password", key="signup_confirm")
                submit = st.form_submit_button("Sign Up")
                if submit:
                    if validate_signup(username, password, confirm_password):
                        signup_success(username, password)

        elif option == "Guest":
            st.info("You're about to continue as a guest. Some features may be limited.")
            if st.button("Continue as Guest", key="guest_button"):
                login_success("Guest")

def validate_login(username, password):
    # TODO: Implement actual database check
    # This is a placeholder for demonstration
    return username and password

def validate_signup(username, password, confirm_password):
    if not username or not password:
        st.error("Please enter a username and password")
        return False
    if password != confirm_password:
        st.error("Passwords do not match")
        return False
    if len(password) < 8:
        st.error("Password must be at least 8 characters long")
        return False
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        st.error("Username can only contain letters, numbers, and underscores")
        return False
    return True

def login_success(username):
    st.success(f"Logged in successfully as {username}")
    st.session_state["logged_in"] = True
    st.session_state["username"] = username
    st.rerun()

def signup_success(username, password):
    # TODO: Save user to database
    # This is a placeholder for demonstration
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    st.success("Signed up successfully")
    login_success(username)

# To import this function in the main app later.

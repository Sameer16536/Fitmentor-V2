import streamlit as st
import streamlit.components.v1 as components

def custom_video_component():
    components.html(
        """
        <video id="video" width="640" height="480" autoplay></video>
        <canvas id="canvas" width="640" height="480" style="display: none;"></canvas>
        <script>
            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            let stream;

            async function setupCamera() {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    video.srcObject = stream;
                } catch (err) {
                    console.error("Error accessing the camera", err);
                }
            }

            function captureFrame() {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = canvas.toDataURL('image/jpeg');
                    window.parent.postMessage({type: 'video_frame', image: imageData}, '*');
                }
            }

            function stopCamera() {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }

            setupCamera();
            const intervalId = setInterval(captureFrame, 100);  // Capture frame every 100ms

            // Clean up resources when the page is unloaded
            window.addEventListener('beforeunload', () => {
                clearInterval(intervalId);
                stopCamera();
            });

            // Also clean up when the Streamlit script re-runs
            window.addEventListener('message', (event) => {
                if (event.data.type === 'streamlit:render') {
                    clearInterval(intervalId);
                    stopCamera();
                }
            });
        </script>
        """,
        height=500,
    )

def get_video_frame():
    return st.session_state.get('video_frame', None)

def video_frame_callback():
    def callback():
        while True:
            try:
                message = st.session_state.video_receiver.receive()
                if message:
                    st.session_state['video_frame'] = message.get('image')
            except:
                break

    return callback
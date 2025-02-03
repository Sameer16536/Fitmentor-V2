import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import math
import seaborn as sns
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv(r'C:\Users\Sameer Marathe\Desktop\Major_Project\exercise-pose-detection-\legs\lunges_data.csv')

# Select the keypoints for both left and right sides
keypoints = [
    'nose_x', 'nose_y', 'nose_z', 'nose_v',
    'left_shoulder_x', 'left_shoulder_y', 'left_shoulder_z', 'left_shoulder_v',
    'right_shoulder_x', 'right_shoulder_y', 'right_shoulder_z', 'right_shoulder_v',
    'left_hip_x', 'left_hip_y', 'left_hip_z', 'left_hip_v',
    'right_hip_x', 'right_hip_y', 'right_hip_z', 'right_hip_v',
    'right_knee_x','right_knee_y','right_knee_z','right_knee_v',
    'left_knee_x','left_knee_y','left_knee_z','left_knee_v',
    'left_ankle_x','left_ankle_y','left_ankle_z','left_ankle_v',
    'right_ankle_x','right_ankle_y','right_ankle_z','right_ankle_v',
    'left_heel_x','left_heel_y','left_heel_z','left_heel_v',
    'right_heel_x','right_heel_y','right_heel_z','right_heel_v',
    'left_foot_index_x','left_foot_index_y','left_foot_index_z','left_foot_index_v',
    'right_foot_index_x','right_foot_index_y','right_foot_index_z','right_foot_index_v',

]

# Extract keypoints
X = df[keypoints].values

# Assuming your dataset contains labels (e.g., 1 for correct form, 0 for incorrect)
# You will need to ensure your CSV has a 'label' column
df['label'] = df['label'].replace('C',0)
df['label'] = df['label'].replace('L',1)
df['label'] = df['label'].astype('float64')
y = df['label'].values

# Split the data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Reshape the data for LSTM input (samples, timesteps, features)
# Assuming each sequence corresponds to a single row
X_train = X_train.reshape((X_train.shape[0], 1,52))
X_test = X_test.reshape((X_test.shape[0], 1, 52))


from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input

# Define LSTM model
model = Sequential()
model.add(Input(shape=(X_train.shape[1], X_train.shape[2])))
model.add(LSTM(32, return_sequences=True))
model.add(Dropout(0.5))
model.add(LSTM(32, return_sequences=False))
model.add(Dropout(0.5))
model.add(Dense(32, activation='relu'))
model.add(Dense(1, activation='sigmoid'))  # Binary classification (correct/incorrect form)

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))

model.save(r'C:\Users\Sameer Marathe\Desktop\Major_Project\exercise-pose-detection-\legs\lunges_model.h5')


def plot_training_history(history):
    sns.set(style='whitegrid')

    # Accuracy plot
    plt.figure(figsize=(12, 5))

    # Plot accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()

    # Plot loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()

    plt.tight_layout()
    plt.show()

# Call the function after training
plot_training_history(history)
        
# import mediapipe as mp
# import cv2
# import numpy as np

# # Initialize MediaPipe Pose
# mp_pose = mp.solutions.pose
# pose = mp_pose.Pose()

# # Start video capture
# cap = cv2.VideoCapture(0)


# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         break
    
#     # Convert the image to RGB
#     frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
#     # Process the image and extract pose landmarks
#     results = pose.process(frame_rgb)
    
#     # Check if landmarks were detected
#     if results.pose_landmarks:
#         # Extract necessary keypoints (e.g., nose, elbows, shoulders, wrists, hips)
#         keypoints = []
#         for landmark in results.pose_landmarks.landmark:
#             keypoints.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
        
#         # Convert to numpy array and reshape for model input
#         keypoints = np.array(keypoints[:36]).reshape(1, 1,36)
        
#         # Use the trained model to predict if the form is correct or not
#         prediction = model.predict(keypoints)
#         prediction_value = prediction[0][0] 
        
#         # Display the result on the frame
#         if prediction > 0.7:
#             cv2.putText(frame, 'Correct Form', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
#         else:
#             cv2.putText(frame, 'Incorrect Form', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
           
        
#     # Show the frame with the prediction
#     cv2.imshow('Bicep Curl Form Detection', frame)
    
#     # Break the loop if 'q' is pressed
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break

# # Release resources
# cap.release()
# cv2.destroyAllWindows()
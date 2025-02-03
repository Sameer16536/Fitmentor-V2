from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
import cv2
import numpy as np
from .models import Exercise, UserExercise
from .serializers import ExerciseSerializer, UserExerciseSerializer
from .services.exercise_analysis import ExerciseAnalyzer
from django.shortcuts import render
import mediapipe as mp
import base64
from django.core.files.storage import default_storage
import os

class ExerciseList(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

class UserExerciseList(generics.ListCreateAPIView):
    serializer_class = UserExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserExercise.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_exercise_video(request, exercise_id):
    try:
        exercise = Exercise.objects.get(id=exercise_id)
        video_file = request.FILES.get('video')
        
        if not video_file:
            return Response({'error': 'No video file provided'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        analyzer = ExerciseAnalyzer(exercise.name)
        results = analyzer.analyze_video(video_file)
        
        user_exercise = UserExercise.objects.create(
            user=request.user,
            exercise=exercise,
            reps=results['reps'],
            form_accuracy=results['accuracy'],
            feedback=results['feedback'],
            video_recording=video_file
        )
        
        return Response({
            'exercise_id': user_exercise.id,
            'results': results
        })
        
    except Exercise.DoesNotExist:
        return Response({'error': 'Exercise not found'}, 
                      status=status.HTTP_404_NOT_FOUND)
        
@api_view(['POST'])
def process_video(request, exercise_type):
    video_file = request.FILES.get('video')
    if not video_file:
        return Response({'error': 'No video file provided'}, 
                      status=status.HTTP_400_BAD_REQUEST)

    # Save video temporarily
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
        for chunk in video_file.chunks():
            tmp_file.write(chunk)
        video_path = tmp_file.name

    try:
        analyzer = ExerciseAnalyzer(exercise_type)
        cap = cv2.VideoCapture(video_path)
        
        total_metrics = {
            'reps': 0,
            'form_accuracy': 0,
            'total_frames': 0,
            'correct_frames': 0
        }

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            processed_frame, metrics = analyzer.process_frame(frame)
            total_metrics['total_frames'] += 1
            if metrics.get('correct_form'):
                total_metrics['correct_frames'] += 1
            
        cap.release()

        # Calculate final metrics
        form_accuracy = (total_metrics['correct_frames'] / total_metrics['total_frames'] * 100 
                        if total_metrics['total_frames'] > 0 else 0)

        # Save exercise record
        exercise_data = {
            'user': request.user,
            'exercise_type': exercise_type,
            'reps': analyzer.reps,
            'form_accuracy': form_accuracy,
            'video_file': video_file
        }
        
        serializer = UserExerciseSerializer(data=exercise_data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'reps': analyzer.reps,
                'form_accuracy': form_accuracy,
                'exercise_id': serializer.data['id']
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    finally:
        import os
        os.unlink(video_path)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bicep_curls(request):
    """
    Handle bicep curl exercise analysis
    GET: Returns exercise information
    POST: Processes a single frame or video
    """
    if request.method == 'GET':
        return Response({
            'exercise': 'Bicep Curls',
            'instructions': [
                'Stand straight with your feet shoulder-width apart',
                'Keep your arms at your sides with palms facing forward',
                'Curl your arms up while keeping upper arms still',
                'Lower back down with control',
                'Maintain proper form throughout the movement'
            ],
            'target_muscles': ['Biceps', 'Forearms'],
            'difficulty': 'Beginner'
        })

    elif request.method == 'POST':
        try:
            # Initialize exercise analyzer
            analyzer = ExerciseAnalyzer('bicep_curls')
            
            # Get frame data from request
            frame_data = request.data.get('frame')
            if not frame_data:
                return Response({'error': 'No frame data provided'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            # Decode base64 frame
            frame_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Process frame
            processed_frame, metrics = analyzer.process_frame(frame)

            # Encode processed frame back to base64
            _, buffer = cv2.imencode('.jpg', processed_frame)
            processed_frame_data = base64.b64encode(buffer).decode('utf-8')

            return Response({
                'frame': processed_frame_data,
                'metrics': metrics
            })

        except Exception as e:
            return Response({'error': str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def squats(request):
    """
    Handle squat exercise analysis
    GET: Returns exercise information
    POST: Processes a single frame or video
    """
    if request.method == 'GET':
        return Response({
            'exercise': 'Squats',
            'instructions': [
                'Stand with feet shoulder-width apart',
                'Keep your back straight and chest up',
                'Lower your body as if sitting back into a chair',
                'Keep knees aligned with toes',
                'Push through heels to return to starting position'
            ],
            'target_muscles': ['Quadriceps', 'Hamstrings', 'Glutes'],
            'difficulty': 'Beginner'
        })

    elif request.method == 'POST':
        try:
            analyzer = ExerciseAnalyzer('squats')
            frame_data = request.data.get('frame')
            if not frame_data:
                return Response({'error': 'No frame data provided'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            frame_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            processed_frame, metrics = analyzer.process_frame(frame)

            _, buffer = cv2.imencode('.jpg', processed_frame)
            processed_frame_data = base64.b64encode(buffer).decode('utf-8')

            return Response({
                'frame': processed_frame_data,
                'metrics': metrics
            })

        except Exception as e:
            return Response({'error': str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def pushups(request):
    """
    Handle pushup exercise analysis
    GET: Returns exercise information
    POST: Processes a single frame or video
    """
    if request.method == 'GET':
        return Response({
            'exercise': 'Push Ups',
            'instructions': [
                'Start in plank position with hands shoulder-width apart',
                'Keep your body in a straight line',
                'Lower your body until chest nearly touches the ground',
                'Push back up to starting position',
                'Keep core engaged throughout the movement'
            ],
            'target_muscles': ['Chest', 'Shoulders', 'Triceps', 'Core'],
            'difficulty': 'Intermediate'
        })

    elif request.method == 'POST':
        try:
            analyzer = ExerciseAnalyzer('pushups')
            frame_data = request.data.get('frame')
            if not frame_data:
                return Response({'error': 'No frame data provided'}, 
                              status=status.HTTP_400_BAD_REQUEST)

            frame_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            processed_frame, metrics = analyzer.process_frame(frame)

            _, buffer = cv2.imencode('.jpg', processed_frame)
            processed_frame_data = base64.b64encode(buffer).decode('utf-8')

            return Response({
                'frame': processed_frame_data,
                'metrics': metrics
            })

        except Exception as e:
            return Response({'error': str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_exercise_session(request):
    """Save completed exercise session data"""
    try:
        exercise_type = request.data.get('exercise_type')
        metrics = request.data.get('metrics')
        
        if not exercise_type or not metrics:
            return Response({'error': 'Missing required data'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Save exercise session to database
        exercise_session = UserExercise.objects.create(
            user=request.user,
            exercise_type=exercise_type,
            reps=metrics.get('counter', 0),
            form_accuracy=metrics.get('form_accuracy', 0),
            feedback=metrics.get('feedback', '')
        )

        return Response({
            'message': 'Exercise session saved successfully',
            'session_id': exercise_session.id
        })

    except Exception as e:
        return Response({'error': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_video(request, exercise_type):
    if 'video' not in request.FILES:
        return Response({'error': 'No video file provided'}, status=400)
    
    video_file = request.FILES['video']
    file_path = f'exercise_videos/{exercise_type}/{video_file.name}'
    
    # Save the file
    file_path = default_storage.save(file_path, video_file)
    
    # Process the video (implement your video processing logic here)
    try:
        # Your video processing code here
        return Response({
            'message': 'Video uploaded successfully',
            'file_path': file_path
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
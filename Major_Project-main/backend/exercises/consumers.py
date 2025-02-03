import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.exercise_analysis import ExerciseAnalyzer
import base64
import numpy as np
import cv2
import asyncio

class ExerciseAnalysisConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Initialize connection and exercise analyzer"""
        self.exercise_type = self.scope['url_route']['kwargs']['exercise_type']
        self.analyzer = ExerciseAnalyzer(self.exercise_type)
        self.is_analyzing = False
        await self.accept()
        
        # Send initial connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'exercise_type': self.exercise_type
        }))

    async def disconnect(self, close_code):
        """Handle disconnection"""
        self.is_analyzing = False
        # Clean up resources if needed
        pass

    async def receive(self, text_data):
        """Process received frames and send back analysis"""
        try:
            data = json.loads(text_data)
            
            if data.get('type') == 'start_exercise':
                self.is_analyzing = True
                await self.send(text_data=json.dumps({
                    'type': 'exercise_started'
                }))
                return
                
            if data.get('type') == 'stop_exercise':
                self.is_analyzing = False
                # Send final statistics
                await self.send(text_data=json.dumps({
                    'type': 'exercise_completed',
                    'total_reps': self.analyzer.counter,
                    'form_accuracy': (self.analyzer.correct_poses / self.analyzer.total_poses * 100) 
                        if self.analyzer.total_poses > 0 else 0
                }))
                return

            if not self.is_analyzing:
                return

            # Process video frame
            frame_data = base64.b64decode(data['frame'])
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Analyze frame
            processed_frame, metrics = self.analyzer.process_frame(frame)
            
            # Encode processed frame
            _, buffer = cv2.imencode('.jpg', processed_frame)
            processed_frame_data = base64.b64encode(buffer).decode('utf-8')

            # Send analysis results
            await self.send(text_data=json.dumps({
                'type': 'exercise_frame',
                'frame': processed_frame_data,
                'metrics': {
                    'counter': metrics.get('counter', 0),
                    'stage': metrics.get('stage', ''),
                    'feedback': metrics.get('feedback', ''),
                    'form_feedback': metrics.get('form_feedback', ''),
                    'correct_form': metrics.get('correct_form', False),
                    'form_accuracy': metrics.get('form_accuracy', 0)
                }
            }))

        except Exception as e:
            # Send error message to client
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def send_feedback(self, feedback):
        """Send real-time feedback to client"""
        await self.send(text_data=json.dumps({
            'type': 'feedback',
            'message': feedback
        }))

class ExerciseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.exercise_type = self.scope['url_route']['kwargs']['exercise_type']
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if 'frame' in data:
                # Process the frame data
                # Your frame processing logic here
                await self.send(json.dumps({
                    'type': 'frame_processed',
                    'metrics': {
                        'counter': 0,
                        'form_accuracy': 0.0,
                        'stage': 'initial',
                        'form_feedback': 'Processing...'
                    }
                }))
        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)
            }))
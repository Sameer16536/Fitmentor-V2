import json
import base64
import numpy as np
import cv2
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.exercise_analysis import ExerciseAnalyzer
from channels.auth import AuthMiddlewareStack

class ExerciseAnalysisConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Initialize connection and exercise analyzer"""
        # Get exercise type from URL route
        self.exercise_type = self.scope['url_route']['kwargs']['exercise_type']
        
        # Initialize analyzer for this exercise type
        self.analyzer = ExerciseAnalyzer(self.exercise_type)
        self.is_analyzing = False
        
        # Accept the connection
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'exercise_type': self.exercise_type
        }))

    async def disconnect(self, close_code):
        """Handle disconnection"""
        self.is_analyzing = False

    async def receive(self, text_data):
        """Handle incoming messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'start_exercise':
                await self.handle_start_exercise()
            elif message_type == 'stop_exercise':
                await self.handle_stop_exercise()
            elif message_type == 'frame':
                await self.handle_frame(data)
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def handle_start_exercise(self):
        """Handle exercise start"""
        self.is_analyzing = True
        await self.send(text_data=json.dumps({
            'type': 'exercise_started'
        }))

    async def handle_stop_exercise(self):
        """Handle exercise stop"""
        self.is_analyzing = False
        # Send final statistics
        await self.send(text_data=json.dumps({
            'type': 'exercise_completed',
            'metrics': {
                'total_reps': self.analyzer.counter,
                'form_accuracy': self.analyzer.get_accuracy(),
                'feedback': self.analyzer.form_feedback
            }
        }))

    async def handle_frame(self, data):
        """Process a single frame"""
        if not self.is_analyzing:
            return

        try:
            # Decode base64 frame
            frame_data = base64.b64decode(data['frame'])
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Process frame
            processed_frame, metrics = self.analyzer.process_frame(frame)

            # Encode processed frame
            _, buffer = cv2.imencode('.jpg', processed_frame)
            processed_frame_data = base64.b64encode(buffer).decode('utf-8')

            # Send results back to client
            await self.send(text_data=json.dumps({
                'type': 'frame_processed',
                'frame': processed_frame_data,
                'metrics': {
                    'counter': metrics['counter'],
                    'stage': metrics['stage'],
                    'feedback': metrics['feedback'],
                    'form_feedback': metrics['form_feedback'],
                    'correct_form': metrics['correct_form'],
                    'form_accuracy': metrics['form_accuracy']
                }
            }))

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Frame processing error: {str(e)}'
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
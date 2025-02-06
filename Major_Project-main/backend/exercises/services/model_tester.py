import tensorflow as tf
import numpy as np
import os
from django.conf import settings
from pathlib import Path

class ModelTester:
    def __init__(self):
        self.models = {}
        ml_models_dir = Path(settings.BASE_DIR) / 'exercises' / 'ml_models'
        self.model_paths = {
            'bicep_curls': str(ml_models_dir / 'bicep_model.h5'),
            'pushups': str(ml_models_dir / 'pushups_model.h5'),
            'squats': str(ml_models_dir / 'squats_model.h5'),
            'lunges': str(ml_models_dir / 'lunges_model.h5'),
            'planks': str(ml_models_dir / 'planks_model.h5')
        }


    def load_and_test_models(self):
        results = {}
        for exercise_type, model_path in self.model_paths.items():
            try:
                model_path = Path(model_path)
                print(f"Checking model path: {model_path}")
                
                if model_path.exists():
                    model = tf.keras.models.load_model(str(model_path))
                    input_shape = model.input_shape
                    dummy_input = np.random.random((1,) + input_shape[1:])
                    _ = model.predict(dummy_input)
                    
                    results[exercise_type] = {
                        'status': 'loaded',
                        'input_shape': str(input_shape),
                        'model_path': str(model_path),
                        'model_summary': str(model.summary())
                    }
                else:
                    results[exercise_type] = {
                        'status': 'error',
                        'message': f'Model file not found at {model_path}',
                        'exists': model_path.parent.exists(),
                        'directory': str(model_path.parent),
                        'absolute_path': str(model_path.absolute()),
                        'base_dir': str(settings.BASE_DIR)
                    }
            except Exception as e:
                results[exercise_type] = {
                    'status': 'error',
                    'message': str(e),
                    'model_path': str(model_path)
                }
        
        return results 
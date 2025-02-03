from rest_framework import serializers
from .models import Exercise, UserExercise

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

class UserExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    
    class Meta:
        model = UserExercise
        fields = ['id', 'exercise', 'exercise_name', 'reps', 'duration', 
                 'form_accuracy', 'feedback', 'created_at']
        read_only_fields = ('user', 'form_accuracy', 'feedback')

from django.db import models
from authentication.models import User

class Exercise(models.Model):
    EXERCISE_TYPES = [
        ('bicep_curls', 'Bicep Curls'),
        ('squats', 'Squats'),
        ('lunges', 'Lunges'),
        ('planks', 'Planks'),
    ]
    
    BODY_PARTS = [
        ('arms', 'Arms'),
        ('legs', 'Legs'),
        ('core', 'Core'),
    ]

    name = models.CharField(max_length=100, choices=EXERCISE_TYPES)
    body_part = models.CharField(max_length=50, choices=BODY_PARTS)
    description = models.TextField()
    video_tutorial = models.URLField(null=True, blank=True)
    difficulty = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced')
    ])
    created_at = models.DateTimeField(auto_now_add=True)

class UserExercise(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    reps = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)  # in seconds
    form_accuracy = models.FloatField()
    video_recording = models.FileField(upload_to='exercise_videos/', null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
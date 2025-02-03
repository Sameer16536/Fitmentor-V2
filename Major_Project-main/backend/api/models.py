from django.db import models
from authentication.models import User
from exercises.models import Exercise

class ExerciseRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    confidence_score = models.FloatField()
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class WorkoutPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
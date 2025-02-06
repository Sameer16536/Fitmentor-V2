from django.contrib import admin
from .models import Exercise, UserExercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'body_part', 'difficulty', 'created_at')
    list_filter = ('body_part', 'difficulty')
    search_fields = ('name', 'description')

@admin.register(UserExercise)
class UserExerciseAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'form_accuracy', 'created_at')
    list_filter = ('exercise', 'created_at')
    search_fields = ('user__username', 'feedback')

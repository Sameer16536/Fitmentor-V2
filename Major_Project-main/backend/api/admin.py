from django.contrib import admin
from .models import ExerciseRecommendation, WorkoutPlan

class ExerciseRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'confidence_score', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'exercise__name')

class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'created_at')
    search_fields = ('user__username', 'name')

admin.site.register(ExerciseRecommendation, ExerciseRecommendationAdmin)
admin.site.register(WorkoutPlan, WorkoutPlanAdmin)
from django.urls import path
from . import views

urlpatterns = [
    path('', views.ExerciseList.as_view(), name='exercise-list'),
    path('user/', views.UserExerciseList.as_view(), name='user-exercise-list'),
    path('process/<int:exercise_id>/', views.process_exercise_video, 
         name='process-video'),
    path('process-video/<str:exercise_type>/', views.process_video, name='process-video'),
        path('bicep_curls/', views.bicep_curls, name='bicep_curls'),
    path('squats/', views.squats, name='squats'),
    path('pushups/', views.pushups, name='pushups'),
]
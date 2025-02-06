from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ExerciseViewSet, basename='exercise')

urlpatterns = [
    path('', include(router.urls)),
    path('user/', views.UserExerciseList.as_view(), name='user-exercise-list'),
    path('process/<int:exercise_id>/', views.process_exercise_video, 
         name='process-video'),
    path('process-video/<str:exercise_type>/', views.process_video, name='process-video'),
    path('bicep_curls/', views.bicep_curls, name='bicep_curls'),
    path('squats/', views.squats, name='squats'),
    path('pushups/', views.pushups, name='pushups'),
    path('test-models/', views.test_ml_models, name='test-ml-models'),
]
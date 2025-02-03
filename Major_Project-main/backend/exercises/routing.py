from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/exercise/(?P<exercise_type>\w+)/$', consumers.ExerciseAnalysisConsumer.as_asgi()),
]
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('stats/', views.get_user_stats, name='user_stats'),
    path('settings/', views.get_user_settings, name='user_settings'),
    path('settings/update/', views.update_user_settings, name='update_user_settings'),
    path('progress/', views.get_progress_stats, name='progress_stats'),
    path('achievements/', views.get_user_achievements, name='user_achievements'),
    path('logout/', views.logout_user, name='logout'),
]
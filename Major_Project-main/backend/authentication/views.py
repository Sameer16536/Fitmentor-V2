from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from .models import User, UserStats, PasswordResetOTP
from .serializers import UserSerializer, UserStatsSerializer, UserSettingsSerializer
from rest_framework.views import APIView
from django.utils import timezone
import random
from django.core.mail import send_mail

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response({
            'error': serializer.errors,
            'message': 'Invalid data provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Registration failed'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(email=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(
        {'error': 'Invalid credentials'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        # Get the token from request headers
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return Response({
                'error': 'Invalid token format'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get the refresh token from request cookies or body
        refresh_token = request.COOKIES.get('refreshToken') or request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # If refresh token is invalid, we still want to logout

        return Response({
            'message': 'Successfully logged out'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Logout failed'
        }, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['PUT'])
def reset_password(request):
    try:
        user = User.objects.get(email=request.data['email'])
        user.set_password(request.data['new_password'])
        user.save()
        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_reset_otp(request):
    try:
        email = request.data.get('email')
        user = User.objects.get(email=email)
        
        # Generate a 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        
        # Save OTP to the database
        PasswordResetOTP.objects.update_or_create(user=user, defaults={'otp': otp})
        
        # Send OTP via email
        send_mail(
            subject="Password Reset OTP",
            message=f"Your OTP for password reset is: {otp}",
            from_email="noreply@fitmentor.com",
            recipient_list=[email],
        )
        
        return Response({'message': 'OTP sent to your email'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    try:
        email = request.data.get('email')
        otp = request.data.get('otp')
        user = User.objects.get(email=email)
        reset_otp = PasswordResetOTP.objects.get(user=user)
        
        # Check if OTP matches
        if reset_otp.otp == otp:
            return Response({'message': 'OTP verified'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except PasswordResetOTP.DoesNotExist:
        return Response({'error': 'OTP not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_stats(request):
    stats = UserStats.objects.get(user=request.user)
    serializer = UserStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_settings(request):
    try:
        user = request.user
        serializer = UserSettingsSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_settings(request):
    try:
        user = request.user
        serializer = UserSettingsSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_progress_stats(request):
    try:
        user = request.user
        stats = UserStats.objects.get(user=user)
        progress_data = [
            {'name': 'Weekly Workouts', 'value': stats.weekly_workouts},
            {'name': 'Monthly Progress', 'value': f"{stats.monthly_progress}%"},
            {'name': 'Current Streak', 'value': user.daily_streak}
        ]
        return Response(progress_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_achievements(request):
    try:
        user = request.user
        achievements = [
            {
                'title': 'First Workout',
                'description': 'Completed your first workout session',
                'achieved': user.stats.total_exercises > 0
            },
            {
                'title': 'Streak Master',
                'description': 'Maintained a 7-day workout streak',
                'achieved': user.daily_streak >= 7
            },
            {
                'title': 'Calorie Crusher',
                'description': 'Burned over 1000 calories',
                'achieved': user.stats.calories_burned > 1000
            }
        ]
        return Response(achievements)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateUserStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            stats = UserStats.objects.get(user=user)
            
            # Update stats using the helper method
            stats.update_stats(request.data)
            
            # Get fresh stats
            updated_stats = UserStats.objects.get(user=user)
            serializer = UserStatsSerializer(updated_stats)
            
            return Response({
                'message': 'Stats updated successfully',
                'stats': serializer.data,
                'current_streak': user.daily_streak
            })
            
        except Exception as e:
            print(f"Error updating stats: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
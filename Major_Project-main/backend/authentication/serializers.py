from rest_framework import serializers
from .models import User, UserStats

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'height', 'weight', 
                 'fitness_goal', 'daily_streak')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True},
            'height': {'required': True},
            'weight': {'required': True},
            'fitness_goal': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                email=validated_data['email'],
                username=validated_data['username'],
                password=validated_data['password'],
                height=validated_data.get('height'),
                weight=validated_data.get('weight'),
                fitness_goal=validated_data.get('fitness_goal')
            )
            UserStats.objects.create(user=user)
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))

class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = (
            'total_exercises',
            'total_minutes',
            'highest_streak',
            'calories_burned',
            'weekly_workouts',
            'monthly_progress'
        )

    def to_representation(self, instance):
        # Refresh from database to get latest stats
        instance.refresh_from_db()
        data = super().to_representation(instance)
        # Round floating point values
        data['calories_burned'] = round(data['calories_burned'], 2)
        data['monthly_progress'] = round(data['monthly_progress'], 1)
        return data

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('height', 'weight', 'fitness_goal', 'daily_streak')
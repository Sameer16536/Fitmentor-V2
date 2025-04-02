from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings  # Import settings for AUTH_USER_MODEL

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
            
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
class PasswordResetOTP(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='password_reset_otp')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.user.email}"

class User(AbstractUser):
    email = models.EmailField(unique=True)
    daily_streak = models.IntegerField(default=0)
    last_activity = models.DateField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)  # in cm
    weight = models.FloatField(null=True, blank=True)  # in kg
    fitness_goal = models.CharField(
        max_length=50, 
        choices=[
            ('weight_loss', 'Weight Loss'),
            ('muscle_gain', 'Muscle Gain'),
            ('endurance', 'Endurance'),
            ('flexibility', 'Flexibility')
        ],
        null=True
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def update_streak(self):
        today = timezone.now().date()
        
        if self.last_activity is None:
            # First activity
            self.daily_streak = 1
        elif self.last_activity == today:
            # Already updated today, don't increment
            pass
        elif (today - self.last_activity).days == 1:
            # Consecutive day
            self.daily_streak += 1
        else:
            # Streak broken
            self.daily_streak = 1
        
        self.last_activity = today
        self.save()
        return self.daily_streak

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    total_exercises = models.IntegerField(default=0)
    total_minutes = models.IntegerField(default=0)
    highest_streak = models.IntegerField(default=0)
    calories_burned = models.FloatField(default=0)
    weekly_workouts = models.IntegerField(default=0)  # Number of workouts this week
    monthly_workouts = models.IntegerField(default=0)  # Number of workouts this month
    current_streak = models.IntegerField(default=0)    # Current active streak
    last_workout_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s stats"

    def update_stats(self, exercise_data):
        """Update user stats with new exercise data"""
        self.total_exercises += 1
        self.total_minutes += exercise_data.get('duration', 0) // 60
        self.calories_burned += float(exercise_data.get('calories_burned', 0))
        self.weekly_workouts += 1
        
        # Update streak if enough reps
        if exercise_data.get('reps', 0) >= 5:
            current_streak = self.user.update_streak()
            if current_streak > self.highest_streak:
                self.highest_streak = current_streak
        
        # Update monthly progress (20 workouts = 100%)
        self.monthly_workouts += 1
        self.current_streak = current_streak
        self.last_workout_date = timezone.now().date()
        self.save()



@receiver(post_save, sender=User)
def create_user_stats(sender, instance, created, **kwargs):
    if created:
        UserStats.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_stats(sender, instance, **kwargs):
    if not hasattr(instance, 'stats'):
        UserStats.objects.create(user=instance)
    instance.stats.save()
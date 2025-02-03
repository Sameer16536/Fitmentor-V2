from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager

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
        if not self.last_activity:
            self.daily_streak = 1
        elif (today - self.last_activity).days == 1:
            self.daily_streak += 1
        elif (today - self.last_activity).days > 1:
            self.daily_streak = 1
        self.last_activity = today
        self.save()

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_exercises = models.IntegerField(default=0)
    total_minutes = models.IntegerField(default=0)
    highest_streak = models.IntegerField(default=0)
    calories_burned = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
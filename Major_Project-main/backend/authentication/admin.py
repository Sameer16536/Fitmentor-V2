from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserStats

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'fitness_goal', 'daily_streak', 'is_staff')
    list_filter = ('fitness_goal', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('height', 'weight', 'fitness_goal')}),
        ('Stats', {'fields': ('daily_streak', 'last_activity')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'height', 'weight', 'fitness_goal'),
        }),
    )
    search_fields = ('username', 'email')
    ordering = ('username',)

class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_exercises', 'total_minutes', 'highest_streak', 'calories_burned')
    search_fields = ('user__username', 'user__email')

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserStats, UserStatsAdmin)
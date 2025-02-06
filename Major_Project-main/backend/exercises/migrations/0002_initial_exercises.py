from django.db import migrations

def create_initial_exercises(apps, schema_editor):
    Exercise = apps.get_model('exercises', 'Exercise')
    
    exercises_data = [
        {
            'name': 'bicep_curls',
            'body_part': 'arms',
            'description': 'A strength exercise that targets the biceps muscles.',
            'difficulty': 'beginner',
        },
        {
            'name': 'squats',
            'body_part': 'legs',
            'description': 'A compound exercise that primarily targets the legs and core.',
            'difficulty': 'beginner',
        },
        {
            'name': 'lunges',
            'body_part': 'legs',
            'description': 'A unilateral exercise that works the legs and improves balance.',
            'difficulty': 'intermediate',
        },
        {
            'name': 'planks',
            'body_part': 'core',
            'description': 'An isometric core exercise that builds stability and strength.',
            'difficulty': 'beginner',
        },
    ]
    
    for exercise_data in exercises_data:
        Exercise.objects.create(**exercise_data)

def remove_exercises(apps, schema_editor):
    Exercise = apps.get_model('exercises', 'Exercise')
    Exercise.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('exercises', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_exercises, remove_exercises),
    ]

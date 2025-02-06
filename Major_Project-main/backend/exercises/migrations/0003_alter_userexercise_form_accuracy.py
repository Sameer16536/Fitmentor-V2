from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('exercises', '0002_initial_exercises'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userexercise',
            name='form_accuracy',
            field=models.FloatField(blank=True, null=True),
        ),
    ]

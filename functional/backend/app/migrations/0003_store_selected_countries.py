# Generated by Django 3.2.25 on 2024-09-30 06:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_store'),
    ]

    operations = [
        migrations.AddField(
            model_name='store',
            name='selected_countries',
            field=models.JSONField(blank=True, null=True),
        ),
    ]

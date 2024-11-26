# Generated by Django 3.2.25 on 2024-10-28 06:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_plan_updated_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShopPreferences',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shop_url', models.CharField(max_length=255, unique=True)),
                ('show_reopen_button', models.BooleanField(default=False)),
            ],
        ),
    ]
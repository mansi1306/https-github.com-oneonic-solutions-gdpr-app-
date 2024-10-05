from django.db import models

class Shop(models.Model):
    shop_url = models.CharField(max_length=255, unique=True)
    access_token = models.CharField(max_length=255)
    is_authenticated = models.BooleanField(default=False)  # Add this field
    
    def __str__(self):
        return self.shop_url


class Store(models.Model):
    shop_url = models.CharField(max_length=255, unique=True)
    banner_type = models.CharField(max_length=255, blank=True, null=True)  # Store the selected banner type
    selected_countries = models.JSONField(blank=True, null=True)  # Store selected countries as JSON
    selected_theme = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return self.shop_url


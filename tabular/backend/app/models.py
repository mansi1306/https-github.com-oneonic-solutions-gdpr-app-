from django.db import models
from django.utils import timezone

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


class Plan(models.Model):
    shop_url = models.CharField(max_length=255, unique=True, null=True)  # Unique for each shop
    plan_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)  # Add an updated_at field

    def __str__(self):
        return self.plan_name


class ShopPreferences(models.Model):
    shop_url = models.CharField(max_length=255, unique=True)  
    show_reopen_button = models.BooleanField(default=False) 

    def __str__(self):
        return f"{self.shop_url} - Show Re-open Button: {self.show_reopen_button}"


class PrivacyPolicySetting(models.Model):
    shop_url = models.CharField(max_length=255, unique=True)
    show_google_privacy_policy = models.BooleanField(default=False)
    show_privacy_policy_link = models.BooleanField(default=False)
    use_specific_privacy_policy = models.BooleanField(default=False)
    selected_option = models.CharField(max_length=100, default='Shopify Policy (/policies/privacy-policy)')

    def __str__(self):
        return f"Privacy Policy Settings ({self.id})"


class CookiePreference(models.Model):
    preference = models.CharField(max_length=10)
    url = models.URLField()
    created_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    shop_url = models.CharField(max_length=255, default='default_shop_url')
    selected_preferences = models.JSONField(null=True)  # This is the JSON field

    def __str__(self):
        return f'{self.preference} - {self.url} - {self.shop_url}'

    @property
    def given_consent(self):
        """Returns the preferences that are True from the selected_preferences JSON."""
        if not self.selected_preferences:
            return ''
        return ', '.join([key for key, value in self.selected_preferences.items() if value])

    @property
    def total(self):
        """Returns the auto-incremented ID as Total."""
        return self.id



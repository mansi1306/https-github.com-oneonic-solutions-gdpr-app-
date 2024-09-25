from django.db import models

class Shop(models.Model):
    shop_url = models.CharField(max_length=255, unique=True)
    access_token = models.CharField(max_length=255)
    is_authenticated = models.BooleanField(default=False)  # Add this field
    
    def __str__(self):
        return self.shop_url

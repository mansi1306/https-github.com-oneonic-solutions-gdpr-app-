from django.db import models
from django.utils import timezone

class Shop(models.Model):
    shop_url = models.CharField(max_length=255, unique=True)
    access_token = models.CharField(max_length=255)

class Product(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE,default=2)
    product_id = models.CharField(max_length=255, default='default_id')
    title = models.CharField(max_length=255)
    sku = models.CharField(max_length=255)
    inventory = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class OrderLimit(models.Model):
    limit_name = models.CharField(max_length=255)
    status = models.BooleanField(default=True)
    limit_type = models.CharField(max_length=255)
    min_value = models.IntegerField()
    max_value = models.IntegerField()
    multiple = models.BooleanField(default=False)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(blank=True, null=True)
    action = models.CharField(max_length=255)
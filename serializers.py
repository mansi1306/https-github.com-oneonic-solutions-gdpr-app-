from rest_framework import serializers
from .models import OrderLimit

class OrderLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLimit
        fields = '__all__'

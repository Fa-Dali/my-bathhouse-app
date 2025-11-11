# File: backend/my_bathhouse_backend/apps/scheduling/models.py
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Availability(models.Model):
    """Когда мастер может работать"""
    master = models.ForeignKey(User, on_delete=models.CASCADE, related_name="availabilities")
    start = models.DateTimeField()
    end = models.DateTimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.master.username} — {self.start} до {self.end}"

class Booking(models.Model):
    """Бронирование: клиент или аренда"""
    BOOKING_TYPE_CHOICES = [
        ('client', 'Клиент'),
        ('rent', 'Аренда бани'),
    ]

    master = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    client_name = models.CharField(max_length=100, blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE_CHOICES)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))

    def __str__(self):
        return f"{self.booking_type} — {self.start}"
# backend/my_bathhouse_backend/apps/scheduling/serializers.py
# преобразование в JSON

from rest_framework import serializers
from .models import Availability, Booking

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'master', 'start', 'end', 'is_available']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'master', 'client_name', 'start', 'end', 'booking_type', 'total_cost']
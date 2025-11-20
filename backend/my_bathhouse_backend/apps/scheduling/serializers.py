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
        fields = [
            'id', 'master_ids', 'start', 'end', 'booking_type',
            'steam_program', 'massage', 'total_cost', 'payments'
        ]
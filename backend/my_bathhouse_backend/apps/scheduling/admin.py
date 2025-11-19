# backend/my_bathhouse_backend/apps/scheduling/admin.py
from django.contrib import admin
from .models import Availability, Booking

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('master', 'start', 'end', 'is_available')
    list_filter = ('is_available', 'master', 'start')
    search_fields = ('master__username',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_type', 'start', 'end', 'master', 'client_name')
    list_filter = ('booking_type', 'master', 'start')

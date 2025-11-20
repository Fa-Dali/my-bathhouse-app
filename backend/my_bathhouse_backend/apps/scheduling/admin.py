# backend/my_bathhouse_backend/apps/scheduling/admin.py
from django.contrib import admin
from .models import Availability, Booking
from my_bathhouse_backend.apps.users.models import CustomUser

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['id', 'master', 'start', 'end', 'is_available']
    list_filter = ['is_available', 'master', 'start']
    search_fields = ['master__username']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'start', 'end', 'booking_type', 'display_masters']
    list_filter = ['booking_type', 'start']
    search_fields = ['payments']

    def display_masters(self, obj):
        users = CustomUser.objects.filter(id__in=obj.master_ids)
        return ", ".join([f"{u.first_name} {u.last_name}" for u in users if u.first_name or u.last_name])

    display_masters.short_description = 'Мастера'

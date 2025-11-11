# backend/my_bathhouse_backend/apps/scheduling/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('availabilities/', views.get_availabilities, name='get_availabilities'),
    path('availabilities/create/', views.create_availability, name='create_availability'),
    path('bookings/', views.get_bookings, name='get_bookings'),
    path('bookings/create/', views.create_booking, name='create_booking'),
]
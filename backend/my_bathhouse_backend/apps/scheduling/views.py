# backend/my_bathhouse_backend/apps/scheduling/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Availability, Booking
from .serializers import AvailabilitySerializer, BookingSerializer

@api_view(['GET'])
def get_availabilities(request):
    """Получить доступность мастеров (по дате)"""
    date_str = request.GET.get('date')
    if date_str:
        target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
        availabilities = Availability.objects.filter(start__date=target_date)
    else:
        availabilities = Availability.objects.filter(start__gte=timezone.now())
    return Response(AvailabilitySerializer(availabilities, many=True).data)

@api_view(['POST'])
def create_availability(request):
    """Мастер указывает, когда может работать"""
    serializer = AvailabilitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_bookings(request):
    """Получить все брони (по дате)"""
    date_str = request.GET.get('date')
    if date_str:
        target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
        bookings = Booking.objects.filter(start__date=target_date)
    else:
        bookings = Booking.objects.all()
    return Response(BookingSerializer(bookings, many=True).data)

@api_view(['POST'])
def create_booking(request):
    """Админ создаёт бронь — с проверкой доступности мастера"""
    start = timezone.datetime.fromisoformat(request.data['start'])
    end = timezone.datetime.fromisoformat(request.data['end'])
    master_id = request.data.get('master')

    # Проверка: мастер доступен?
    if master_id:
        overlaps = Availability.objects.filter(
            master_id=master_id,
            start__lt=end,
            end__gt=start,
            is_available=True
        ).exists()

        if not overlaps:
            return Response(
                {"error": "Мастер не доступен в это время"},
                status=400
            )

    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
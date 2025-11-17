# backend/my_bathhouse_backend/apps/scheduling/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Availability, Booking
from .serializers import AvailabilitySerializer, BookingSerializer

# """Получить доступность мастеров (по дате)"""
@api_view(['GET'])
def get_availabilities(request):

    # date_str = request.GET.get('date')
    # if date_str:
    #     target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
    #     availabilities = Availability.objects.filter(start__date=target_date)
    # else:
    #     availabilities = Availability.objects.filter(start__gte=timezone.now())
    # return Response(AvailabilitySerializer(availabilities, many=True).data)
    user = request.user

    if user.has_role('admin'):
        availabilities = Availability.objects.all()
    elif user.has_role('paramaster') or user.has_role('masseur'):
        availabilities = Availability.objects.filter(master=user)
    else:
        availabilities = Availability.objects.none()

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
    # """Получить все брони (по дате)"""
    # date_str = request.GET.get('date')
    # if date_str:
    #     target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
    #     bookings = Booking.objects.filter(start__date=target_date)
    # else:
    #     bookings = Booking.objects.all()
    # return Response(BookingSerializer(bookings, many=True).data)
    user = request.user

    if user.has_role('admin'):
        bookings = Booking.objects.all()
    elif user.has_role('paramaster') or user.has_role('masseur'):
        bookings = Booking.objects.filter(master=user)
    else:
        bookings = Booking.objects.none()

    return Response(AvailabilitySerializer(bookings, many=True).data)

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

@api_view(['DELETE'])
def delete_availability(request, availability_id):
    """Удалить слот доступности (только для мастера или админа)"""
    try:
        availability = Availability.objects.get(id=availability_id)
    except Availability.DoesNotExist:
        return Response({"error": "Слот не найден"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    # Проверка: может ли удалить?
    if user != availability.master and not user.has_role('admin'):
        return Response({"error": "Нет прав на удаление"}, status=status.HTTP_403_FORBIDDEN)

    availability.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
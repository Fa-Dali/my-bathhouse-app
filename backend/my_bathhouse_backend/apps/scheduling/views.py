# backend/my_bathhouse_backend/apps/scheduling/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
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

    # Определяем диапазон: сегодня + 7 дней
    week_from_now = timezone.now() + timedelta(days=7)

    if user.has_role('admin'):
        availabilities = Availability.objects.filter(start__lt=week_from_now)
    elif user.has_role('paramaster') or user.has_role('masseur'):
        availabilities = Availability.objects.filter(
            master=user,
            start__lt=week_from_now
        )
    else:
        availabilities = Availability.objects.none()

    return Response(AvailabilitySerializer(availabilities, many=True).data)

@api_view(['POST'])
def create_availability(request):
    """Мастер указывает, когда может работать"""

    master_id = request.data.get('master')
    start = timezone.datetime.fromisoformat(request.data['start'])
    end = timezone.datetime.fromisoformat(request.data['end'])

    if start >= end:
        return Response({"error": "Время окончания должно быть позже начала"}, status=400)

    # Проверка на пересечение
    if Availability.objects.filter(
        master_id=master_id,
        start__lt=end,
        end__gt=start
    ).exists():
        return Response({"error": "Слот пересекается с существующим"}, status=400)
    
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

@api_view(['PATCH'])
def update_availability(request, availability_id):
    """Обновить существующий слот доступности (только мастер или админ)"""
    try:
        availability = Availability.objects.get(id=availability_id)
    except Availability.DoesNotExist:
        return Response({"error": "Слот не найден"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user != availability.master and not user.has_role('admin'):
        return Response({"error": "Нет прав на редактирование"}, status=status.HTTP_403_FORBIDDEN)

    serializer = AvailabilitySerializer(availability, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# views.py
@api_view(['GET', 'PATCH', 'DELETE'])
def availability_detail(request, availability_id):
    try:
        availability = Availability.objects.get(id=availability_id)
    except Availability.DoesNotExist:
        return Response({"error": "Слот не найден"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user != availability.master and not user.has_role('admin'):
        return Response({"error": "Нет прав"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return Response(AvailabilitySerializer(availability).data)

    elif request.method == 'PATCH':
        serializer = AvailabilitySerializer(availability, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        availability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PATCH', 'DELETE'])
def booking_detail(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Бронь не найдена"}, status=404)

    user = request.user
    # Проверка: пользователь — мастер из брони или админ
    if user.has_role('admin') or user.id in booking.master_ids:
        pass
    else:
        return Response({"error": "Нет прав"}, status=403)

    if request.method == 'GET':
        return Response(BookingSerializer(booking).data)

    elif request.method == 'PATCH':
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        booking.delete()
        return Response(status=204)

@api_view(['GET'])
def get_bookings(request):
    user = request.user
    week_from_now = timezone.now() + timedelta(days=7)

    if user.has_role('admin'):
        bookings = Booking.objects.filter(start__lt=week_from_now)
    elif user.has_role('paramaster') or user.has_role('masseur'):
        bookings = Booking.objects.filter(
            master_ids__contains=[user.id],
            start__lt=week_from_now
        )
    else:
        bookings = Booking.objects.none()

    return Response(BookingSerializer(bookings, many=True).data)

@api_view(['POST'])
def create_booking(request):
    master_ids = request.data.get('master_ids', [])
    start = timezone.datetime.fromisoformat(request.data['start'])
    end = timezone.datetime.fromisoformat(request.data['end'])

    if not master_ids:
        return Response({"error": "Выберите хотя бы одного мастера"}, status=400)

    # Проверка доступности всех мастеров
    for master_id in master_ids:
        if not Availability.objects.filter(
            master_id=master_id,
            start__lt=end,
            end__gt=start,
            is_available=True
        ).exists():
            return Response(
                {"error": f"Мастер {master_id} недоступен в это время"},
                status=400
            )

    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        booking = serializer.save()

        # Обновляем availabilities: делаем недоступными
        for master_id in master_ids:
            Availability.objects.filter(
                master_id=master_id,
                start__gte=start,
                end__lte=end,
                is_available=True
            ).update(is_available=False)

        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
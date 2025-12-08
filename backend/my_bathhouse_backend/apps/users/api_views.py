# my_bathhouse_backend/apps/users/api_views.py
'''
Содержит представление (API view),
от фронтенда и сохранять их в базу данных.
'''
import logging
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import status

from .serializers import LoginSerializer, UserSerializer
from .models import CustomUser, Role
from datetime import datetime
from PIL import Image

from django.conf import settings
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.core.exceptions import SuspiciousOperation, PermissionDenied
from django.utils import timezone

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken


# ДЛЯ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ
class RegisterAPI(APIView):
    """Обрабатывает регистрацию новых пользователей."""
    permission_classes = [AllowAny] # *** ? ***

    def post(self, request, *args, **kwargs):
        # print(request.body.decode())
        print(request.data)  # Для вывода полученных данных в консоль
        print(type(request.data.get('avatar')))  # проверка наличия файла

        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            try:
                user = serializer.save()

                # Вернём ответ клиенту
                return Response({"message": "Регистрация прошла успешно.", "redirect_url": "/dashboard/timetable-guest"},
                                status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": f"Произошла ошибка: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

# =================================================
logger = logging.getLogger(__name__)
# ДЛЯ ЛОГИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ
class LoginAPI(APIView):
    """Авторизует пользователя и выдаёт токены."""
    permission_classes = [AllowAny]  # Доступ открыт без предварительного входа

    def post(self, request, *args, **kwargs):
        logger.info("=== Запрос на вход получен ===")
        logger.info(f"Data: {request.data}")

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():  # Если данные валидные
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            print("Access token:", str(refresh.access_token))
            print("Refresh token:", str(refresh))

            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }, status=status.HTTP_200_OK)

        else:
            # Если произошла ошибка, формируем детальное сообщение
            errors = serializer.errors
            print("errors (78): ", errors)

            # Формируем подходящее сообщение для пользователя
            if 'non_field_errors' in errors:
                # Преобразуем список ошибок в строку
                message = ', '.join(errors['non_field_errors'])
                print("message (84): ", message)

            elif 'username' in errors or 'password' in errors:
                message = 'Неправильно указаны имя пользователя или пароль.'
                print("message (88): ", message)

            else:
                message = 'Ошибка входа.'
                print("message (92): ", message)

            return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)

# =================================================
# Возвращает CSRF-токен для текущего запроса.
def get_csrf(request):
    """
    Возвращает CSRF-токен для текущего запроса.
    """

    return JsonResponse({'csrfToken': get_token(request)})

# =================================================

# ДЛЯ ОБНОВЛЕНИЯ ТОКЕНА JWT
class RefreshTokenAPI(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                access_token = str(token.access_token)
                return Response({'access_token': access_token}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

# =================================================

# ЧТЕНИЕ ТАБЛИЦЫ ПОЛЬЗОВАТЕЛЕЙ ИЗ БД
class UserListAPI(ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

# =================================================

# УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ БД И АВАТАР ИЗ ПАПКИ avatars/
class DeleteUserAPI(DestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'pk'  # Идентификатором будет первичный ключ пользователя

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()  # Получаем экземпляр пользователя

        # Удаляем аватар из папки avatars/, если он существует
        if instance.avatar:
            try:
                avatar_path = os.path.join(settings.MEDIA_ROOT,
                                           instance.avatar.name)
                if os.path.exists(avatar_path):
                    os.remove(avatar_path)
            except OSError as e:
                # Обрабатываем возможную ошибку при удалении файла
                pass

        # Удаляем пользователя
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

# =================================================

# ЗАМЕНА АВАТАР В БД
class UpdateAvatarAPI(UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'pk'
    http_method_names = ['patch', 'put']  # Только PATCH и PUT

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # пользователь может изменить только свой аватар
    def update(self, request, *args, **kwargs):
        print("🔹 НАЧАЛО UpdateAvatarAPI.update()")
        print("🔹 request.user:", request.user)
        print("🔹 request.user.id:", request.user.id)
        print("🔹 request.auth:", request.auth)  # JWT-specific
        print("🔹 Метод запроса:", request.method)
        print("🔹 Заголовки:", dict(request.headers))

        instance = self.get_object()
        print("🔹 instance.id:", instance.id)
        print("🔹 instance.username:", instance.username)
        print("🔹 user == instance:", request.user.id == instance.id)

        if request.user.id != instance.id:
            print("🚫 Доступ запрещён: пользователь не совпадает")
            return Response(
                {'error': 'Вы можете изменить только свой аватар.'},
                status=status.HTTP_403_FORBIDDEN
            )

        print("✅ Проверка пройдена — продолжаем обновление")

        user = request.user

        # 🔐 Проверка: можно менять ТОЛЬКО свой аватар
        if user.id != instance.id:
            return Response(
                {'error': 'Вы можете изменить только свой аватар.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ Разрешаем частичное обновление
        partial = True
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # === Обработка аватара (только если файл загружен) ===
        avatar = request.FILES.get('avatar')
        if avatar:
            # Удаляем старый аватар, если есть
            if instance.avatar:
                old_avatar_path = os.path.join(settings.MEDIA_ROOT, instance.avatar.name)
                if os.path.exists(old_avatar_path):
                    os.remove(old_avatar_path)

            # Подготавливаем путь и имя файла
            extension = avatar.name.split('.')[-1].lower()
            filename = f'{instance.id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}_avatar.{extension}'
            save_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)

            # Изменяем размер и сохраняем
            resized_avatar = self.resize_image(avatar, size=(250, 250))
            resized_avatar.save(save_path)

            # Обновляем поле аватара
            instance.avatar = os.path.join('avatars', filename)
            instance.save(update_fields=['avatar'])

        return Response(serializer.data)

    def resize_image(self, image, size):
        """Изменяет размер изображения."""
        img = Image.open(image)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        return img


# Функционал для изменения размера изображения
def resize_image(image, size):
    img = Image.open(image)
    img.thumbnail(size, Image.Resampling.LANCZOS)
    return img

# =================================================

# список пользователей и изменение ролей
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def user_list(request):
    """Все авторизованные пользователи могут просматривать список.
    Только админ — редактировать."""

    logger.info(f"Data: {request.data}")

    # print("🟢 user_list вызван!")
    # print("🔹 User:", request.user)
    # print("🔹 Authenticated:", request.user.is_authenticated)
    #
    # print("🔹 META keys:", list(request.META.keys()))
    # print("🔹 HTTP_AUTHORIZATION:", request.META.get('HTTP_AUTHORIZATION'))
    # print("🔹 request.user:", request.user)
    # print("🔹 is_authenticated:", request.user.is_authenticated)

    # if not request.user.is_authenticated:
    #     print("🔴 Пользователь НЕ авторизован")
    #     return Response({'error': 'Требуется авторизация'}, status=401)

    users = CustomUser.objects.all().prefetch_related('roles')
    data = [
        {
            'id': u.id,
            'username': u.username,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email,
            'phone_number': u.phone_number,
            'pin_code': u.pin_code,
            'avatar': u.avatar.url if u.avatar else None,
            'roles': [
                {'code': r.code, 'name': r.name}
                for r in u.roles.all()
            ],
            'can_edit': request.user.has_role('admin')
            # ← только админ может редактировать
        }
        for u in users
    ]

    print("🔹 User:", request.user)
    print("🔹 Authenticated:", request.user.is_authenticated)

    return Response(data)

# админ может изменять роли пользователей, кроме Fa-Dali
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_user_roles(request, user_id):


    print("🔹 User в update_user_roles:", request.user)
    print("🔹 User ID:", request.user.id)
    print("🔹 Roles:", [r.code for r in request.user.roles.all()])

    print("🔹 НАЧАЛО update_user_roles")
    print("🔹 User:", request.user)
    print("🔹 User ID:", request.user.id)
    print("🔹 Is authenticated:", request.user.is_authenticated)
    print("🔹 Roles:", [r.code for r in request.user.roles.all()])
    print("🔹 Has admin:", request.user.has_role('admin'))

    # 🔁 Перезагружаем пользователя из БД, чтобы избежать кэширования
    request_user = CustomUser.objects.prefetch_related('roles').get(
        id=request.user.id)

    if not request.user.has_role('admin'):
        return Response({'error': 'Доступ запрещён'}, status=403)

    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=404)

    # === Получаем новые роли ===
    role_codes = request.data.get('roles', [])
    valid_codes = Role.objects.filter(code__in=role_codes).values_list('code',
                                                                       flat=True)
    # === Проверка: нельзя снять admin у Fa-Dali ===
    if user.username == 'Fa-Dali':
        # Проверяем: был ли он админом раньше?
        was_admin = user.roles.filter(code='admin').exists()
        # Проверяем: будет ли админом после обновления?
        is_becoming_admin = 'admin' in role_codes

        if was_admin and not is_becoming_admin:
            return Response(
                {'error': 'Нельзя снять роль администратора с Fa-Dali'},
                status=400
            )

    user.roles.set(Role.objects.filter(code__in=valid_codes))

    return Response({
        'success': True,
        'roles': [{'code': r.code, 'name': r.name} for r in user.roles.all()]
    })


# =================================================
# ВОЗВРАЩАЕТ ПРОФИЛЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (с ролями)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_current_user(request):
    """
    Возвращает профиль текущего авторизованного пользователя.
    Используется фронтендом, чтобы определить роль (админ/мастер).
    """
    user = request.user  # ← берётся из JWT-токена

    # Сериализуем пользователя
    data = {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'phone_number': user.phone_number,
        'pin_code': user.pin_code,
        'avatar': user.avatar.url if user.avatar else None,
        'roles': [
            {'code': role.code, 'name': role.name}
            for role in user.roles.all()
        ]
    }

    return Response(data)

# =================================================
# КАРМА ПОЛЬЗОВАТЕЛЯ
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_karma(request):
    if not request.user.has_role('admin'):
        return Response({'error': 'Доступ запрещён'}, status=403)

    user_id = request.data.get('user_id')
    karma_type = request.data.get('type')  # 'good' или 'bad'

    if karma_type not in ['good', 'bad']:
        return Response({'error': 'Неверный тип кармы'}, status=400)

    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=404)

    # 🔁 Проверка: давал ли админ карму этому пользователю сегодня?
    today = timezone.now().date()
    if user.last_karma_date == today:
        return Response(
            {'error': 'Карму этому мастеру можно менять только раз в день'},
            status=400
        )

    # ✅ Обновляем карму
    if karma_type == 'good':
        user.karma_good += 1
    else:
        user.karma_bad += 1

    # ✅ Обновляем дату
    user.last_karma_date = today
    user.save(update_fields=[f'karma_{karma_type}', 'last_karma_date'])

    return Response({
        'success': True,
        'karma_good': user.karma_good,
        'karma_bad': user.karma_bad
    })

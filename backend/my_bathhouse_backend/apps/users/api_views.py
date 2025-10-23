# my_bathhouse_backend/apps/users/api_views.py
'''
Содержит представление (API view),
от фронтенда и сохранять их в базу данных.
'''


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer, UserSerializer
# ==========================
# ЧТЕНИЕ ТАБЛИЦЫ ПОЛЬЗОВАТЕЛЕЙ ИЗ БД
from rest_framework.generics import ListAPIView, DestroyAPIView
from .models import CustomUser
# from .serializers import UserSerializer
# ===========================
# УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЕЙ ИЗ БД
# from rest_framework.generics import DestroyAPIView
# from .models import CustomUser
# from .serializers import UserSerializer
# ===========================
# ЗАМЕНА АВАТАР ПОЛЬЗОВАТЕЛЯ В БД
from rest_framework.generics import UpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
# from .models import CustomUser
# from .serializers import UserSerializer
from datetime import datetime
import os
from django.conf import settings  # Для доступа к MEDIA_ROOT
# ===========================
# ДЛЯ CSRF ТОКЕНА
from django.http import JsonResponse
from django.middleware.csrf import get_token
# ===========================
# ДЛЯ УДАЛЕНИЯ АВАТАРА ИЗ БД
from django.core.exceptions import SuspiciousOperation
# ===========================

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

# ДЛЯ ЛОГИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ
class LoginAPI(APIView):
    """Авторизует пользователя и выдаёт токены."""
    permission_classes = [AllowAny]  # Доступ открыт без предварительного входа

    def post(self, request, *args, **kwargs):
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
    parser_classes = [MultiPartParser,
                      FormParser]  # Необходимо для обработки файлов
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        '''
        Решение готово к работе и поддержит работу с любыми изображениями
        независимо от расширения (.jpg/.png и т.д.).
        '''
        user = self.get_object()
        avatar = request.FILES.get('avatar')

        if avatar:
            # Удаляем старое изображение, если оно существовало
            if user.avatar:
                old_avatar_path = os.path.join(settings.MEDIA_ROOT,
                                               user.avatar.name)
                if os.path.exists(old_avatar_path):
                    os.remove(old_avatar_path)

            # Определим расширение файла
            extension = avatar.name.split('.')[-1].lower()
            filename = f'{user.id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}_avatar.{extension}'

            # Изменяем размер аватара до 250x250
            resized_avatar = resize_image(avatar, size=(250, 250))

            # Сохраняем измененный аватар
            save_path = os.path.join(settings.MEDIA_ROOT, 'avatars', filename)
            resized_avatar.save(save_path)

            # Обновляем запись пользователя
            user.avatar = os.path.join('avatars', filename)
            user.save()

        return super().update(request, *args, **kwargs)


# Функционал для изменения размера изображения
def resize_image(image, size):
    from PIL import Image
    img = Image.open(image)
    img.thumbnail(size, Image.Resampling.LANCZOS)
    return img
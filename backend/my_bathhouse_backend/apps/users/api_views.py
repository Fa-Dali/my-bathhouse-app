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


class RegisterAPI(APIView):
    """Обрабатывает регистрацию новых пользователей."""
    def post(self, request, *args, **kwargs):

        print(request.data)  # Для вывода полученных данных в консоль
        print(type(request.data.get('avatar')))  # проверка наличия файла

        serializer = UserSerializer(data=request.data)

        # if serializer.is_valid():
        #
        #     try:
        #         serializer.save()
        #     except Exception as e:
        #         print(
        #             f"Ошибка при сохранении: {e}")  # Выведет исключение в терминал
        #
        #     return Response({"my_bathhouse_backend/apps/users/api_views.py ("
        #                      "22): "
        #                      "message": "Регистрация успешна"},
        #                     status=status.HTTP_201_CREATED)
        #
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            try:
                user = serializer.save()

                # Вернём ответ клиенту
                return Response({"message": "Регистрация прошла успешно."},
                                status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": f"Произошла ошибка: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)


class LoginAPI(APIView):
    """Авторизует пользователя и выдаёт токены."""
    permission_classes = [AllowAny]  # Доступ открыт без предварительного входа

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():  # Если данные валидные
            token = RefreshToken.for_user(serializer.validated_data['user'])
            return Response({
                'access_token': str(token.access_token),
                'refresh_token': str(token)
            }, status=status.HTTP_200_OK)
        else:
            # Если произошла ошибка, формируем детальное сообщение
            errors = serializer.errors

            # Формируем подходящее сообщение для пользователя
            if 'non_field_errors' in errors:
                # Преобразуем список ошибок в строку
                message = ', '.join(errors['non_field_errors'])
            elif 'username' in errors or 'password' in errors:
                message = 'Неправильно указаны имя пользователя или пароль.'
            else:
                message = 'Ошибка входа.'

            return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)
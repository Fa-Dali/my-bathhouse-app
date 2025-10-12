# my_bathhouse_backend/apps/users/api_views.py
'''
Содержит представление (API view),
от фронтенда и сохранять их в базу данных.
'''


from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .serializers import LoginSerializer, UserSerializer


class RegisterAPI(APIView):
    """Обрабатывает регистрацию новых пользователей."""
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPI(APIView):
    """Авторизует пользователя и выдаёт токены."""
    permission_classes = [AllowAny]  # Доступ открыт без предварительного входа

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            token = RefreshToken.for_user(serializer.validated_data['user'])
            return Response({
                'access_token': str(token.access_token),
                'refresh_token': str(token)
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
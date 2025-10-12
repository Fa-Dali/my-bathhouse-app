# my_bathhouse_backend/apps/users/serializers.py
'''
Для преобразования данных из формата фронтенда в формат, подходящий
для Django и наоборот
'''

from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate  # Добавьте эту строку

class UserSerializer(serializers.ModelSerializer):

    # Сделаем поле аватара необязательным
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'phone_number',
            'pin_code',
            'avatar'
        ]
        # Пароль доступен только для записи
        extra_kwargs = {'password': {'write_only': True}, 'avatar': {'required': False}}

    # ========================
    def validate_first_name(self, value):
        if not value.strip():  # Убедись, что имя не пустое
            raise serializers.ValidationError("First Name cannot be empty.")
        return value

    def validate_last_name(self, value):
        if not value.strip():  # То же для фамилии
            raise serializers.ValidationError("Last Name cannot be empty.")
        return value
    # =========================

    def create(self, validated_data):
        # Извлекаем файл, если он есть
        avatar = validated_data.pop('avatar', None)

        user = CustomUser.objects.create_user(
            # Обязательное поле username - логин
            username=validated_data.get('username'),

            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            email=validated_data.get('email'),
            password=validated_data.get('password'),
            phone_number=validated_data.get('phone_number'),
            pin_code=validated_data.get('pin_code'),
        )

        if avatar:  # Если аватар был отправлен, добавляем его пользователю
            user.avatar = avatar
            user.save(update_fields=['avatar'])

        return user

class LoginSerializer(serializers.Serializer):
    """
    Сериализатор для проверки данных при входе пользователя.
    """
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)

        if not user or not user.is_active:
            raise serializers.ValidationError("Невалидные учетные данные")

        return {'user': user}
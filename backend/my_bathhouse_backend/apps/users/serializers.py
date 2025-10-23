# my_bathhouse_backend/apps/users/serializers.py
'''
Для преобразования данных из формата фронтенда в формат, подходящий
для Django и наоборот
'''

from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):

    # Сделаем поле аватара необязательным
    avatar = serializers.ImageField(use_url=True, required=False, allow_null=True)

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
        extra_kwargs = {
            'password': {'write_only': True},
            # 'avatar': {'allow_null': True, 'required': False}
        }

    # ========================
    def validate_first_name(self, value):
        if not value.strip():  # Убедись, что имя не пустое
            raise serializers.ValidationError("# "
                                              "my_bathhouse_backend/apps/users/serializers.py (36): Имя не может быть пустым.")
        return value

    def validate_last_name(self, value):
        if not value.strip():  # То же для фамилии
            raise serializers.ValidationError(
                "my_bathhouse_backend/apps/users/serializers.py (42) : "
                "Фамилия не может быть пустой.")
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
        print(f"Получено: {attrs}")

        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError(
                "Неверное имя пользователя или пароль.")

        if not user.is_active:
            raise serializers.ValidationError("Аккаунт неактивен.")

        return {'user': user}
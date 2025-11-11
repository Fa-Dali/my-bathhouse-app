# my_bathhouse_backend/apps/users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Админ'),
        ('paramaster', 'Пармастер'),
        ('masseur', 'Массажист'),
    ]

    # Добавляем: роли как множественный выбор
    roles = models.ManyToManyField(
        'Role',
        related_name='users',
        blank=True
    )
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    pin_code = models.CharField(max_length=5, null=True, blank=True)
      # Место хранения картинок и опции
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return self.username

    def has_role(self, role_code):
        """Проверка: есть ли у пользователя роль"""
        return self.roles.filter(code=role_code).exists()


# Модель: Role
class Role(models.Model):
    code = models.CharField(max_length=20, unique=True)  # admin, paramaster, masseur
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name



# my_bathhouse_backend/apps/users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    pin_code = models.CharField(max_length=5, null=True, blank=True)
      # Место хранения картинок и опции
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

# Create your models here.

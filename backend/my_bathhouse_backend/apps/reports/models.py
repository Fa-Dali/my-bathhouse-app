# backend/my-bathhouse-backend/apps/reports/models.py

# Таблица Отчета Администратора Ежедневный

from django.db import models
from django.utils import timezone

class Report(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    audience = models.CharField(max_length=100)
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    sales = models.DecimalField(max_digits=10, decimal_places=2)
    spa = models.DecimalField(max_digits=10, decimal_places=2)
    payment = models.CharField(max_length=100)
    admin_name = models.CharField(
        max_length=100)  # Фамилия и инициалы администратора
    created_at = models.DateTimeField(
        default=timezone.now)  # Дата создания таблицы

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"
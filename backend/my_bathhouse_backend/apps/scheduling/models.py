# File: backend/my_bathhouse_backend/apps/scheduling/models.py
from django.db import models
from django.conf import settings
from decimal import Decimal

from django.contrib.postgres.fields import ArrayField  # только ArrayField остаётся здесь
from django.db.models import JSONField  # JSONField теперь отсюда

class Availability(models.Model):
    """Когда мастер (CustomUser) может работать"""
    master = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="availabilities"
    )
    start = models.DateTimeField()
    end = models.DateTimeField()
    is_available = models.BooleanField(default=True)

    source = models.CharField(max_length=10, choices=[('user', 'Мастер'), ('system', 'Бронь')], default='user') # ***

    def __str__(self):
        return f"{self.master.username} — {self.start} до {self.end}"

class Booking(models.Model):
    """Бронирование: аудитория, клиент, мастер"""
    BOOKING_TYPE_CHOICES = [
        ('client', 'Клиент'),
        ('rent', 'Аренда бани'),
    ]

    HALL_CHOICES = [
        ('muromets', 'Муромец'),
        ('nikitich', 'Никитич'),
        ('popovich', 'Попович'),
        ('massage_l', 'Массаж Л'),
        ('massage_p', 'Массаж П'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('terminal', 'Терминал'),
        ('cash', 'Наличные'),
        ('website', 'Сайт'),
        ('reception', 'Ресепшн'),
        'certificate', 'Сертификат'
    ]

    master_ids = ArrayField(models.IntegerField(), default=list, help_text="Список ID мастеров")
    start = models.DateTimeField()
    end = models.DateTimeField()
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE_CHOICES)
    steam_program = models.TextField(blank=True, help_text="Программа парения")
    massage = models.TextField(blank=True, help_text="Описание массажа")
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    payments = JSONField(default=list, help_text="Список оплат: [{amount, method}, ...]")
    hall = models.CharField(
        max_length=20,
        choices=HALL_CHOICES,
        help_text="Зал, где проходит услуга",
        default='muromets'
    )


    # вычислять total_cost на бэкенде при сохранении
    def save(self, *args, **kwargs):
        # Пересчитываем total_cost из payments
        total = sum(item.get('amount', 0) for item in self.payments)
        self.total_cost = Decimal(str(total))
        super().save(*args, **kwargs)


def __str__(self):
        return f"Бронь — {self.start} ({self.get_hall_display()})"

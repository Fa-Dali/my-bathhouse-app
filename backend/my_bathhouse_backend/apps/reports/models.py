# backend/my-bathhouse-backend/apps/reports/models.py

# Таблица Отчета Администратора Ежедневный

# models.py
from django.db import models
from decimal import Decimal

class Report(models.Model):
    admin_name = models.CharField("Имя администратора", max_length=100)
    created_at = models.DateTimeField("Дата и время создания", db_index=True)
    updated_at = models.DateTimeField("Дата обновления", auto_now=True)
    data = models.JSONField("Данные отчёта", help_text="Полная структура строк, оплат, мастеров")
    total_payment = models.DecimalField("Общая оплата", max_digits=12, decimal_places=2)
    inserted_at = models.DateTimeField("Дата сохранения", auto_now_add=True)

    class Meta:
        verbose_name = "Отчёт"
        verbose_name_plural = "Отчёты"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.admin_name} — {self.created_at}"
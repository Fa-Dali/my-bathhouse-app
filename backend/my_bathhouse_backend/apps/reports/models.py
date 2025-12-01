# backend/my-bathhouse-backend/apps/reports/models.py

# Таблица Отчета Администратора Ежедневный

# models.py
from django.db import models
from decimal import Decimal

# Таблица Отчета Администратора Ежедневный
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


# Таблица Отчета Мастера Ежедневный
class MasterReport(models.Model):
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        verbose_name="Мастер",
        related_name='master_reports'
    )
    date = models.DateField("Дата отчёта", db_index=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлён", auto_now=True)
    data = models.JSONField("Данные отчёта", help_text="Услуги, клиенты, зарплата")
    total_clients = models.DecimalField("Всего клиентов", max_digits=6, decimal_places=1, default=0)
    total_salary = models.DecimalField("Общая зарплата", max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Отчёт мастера"
        verbose_name_plural = "Отчёты мастеров"
        unique_together = ('user', 'date')  # Один отчёт в день на мастера
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} — {self.date}"

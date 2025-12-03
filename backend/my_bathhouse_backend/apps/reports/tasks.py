# backend/my_bathhouse_backend/apps/reports/tasks.py

from celery import shared_task
from decimal import Decimal
from .models import MasterReport, Payment

@shared_task
def recalculate_payments(user_id):
    from my_bathhouse_backend.apps.users.models import CustomUser
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return

    # Получаем все неоплаченные отчёты — от самых старых
    reports = MasterReport.objects.filter(
        user=user,
        paid=False
    ).order_by('date')

    # Получаем все платежи — от самых старых
    payments = Payment.objects.filter(
        user=user
    ).order_by('paid_at')

    for payment in payments:
        amount = payment.amount

        for report in reports:
            if report.paid:
                continue

            remaining = report.total_salary - report.partially_paid_amount

            if amount >= remaining:
                # Полная оплата
                report.paid = True
                report.partially_paid_amount = report.total_salary
                report.paid_at = payment.paid_at
                report.paid_by = payment.paid_by
                report.save()
                amount -= remaining
            elif amount > 0:
                # Частичная оплата
                report.partially_paid_amount += amount
                report.save()
                amount = 0
                break

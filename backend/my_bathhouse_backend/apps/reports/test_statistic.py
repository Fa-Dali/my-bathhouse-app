# Получить все отчёты за сегодня
from django.utils import timezone
from .models import Report

today = timezone.now().date()
reports = Report.objects.filter(created_at__date=today)

# Общая выручка за период
total = sum(r.total_payment for r in reports)

# Анализ по способам оплаты (пример — нужно разобрать JSON)
from collections import Counter

methods = Counter()
for report in reports:
    for row in report.data:  # data — это Python-список
        for payment in row['payments']:
            method = payment['method']
            if method:
                methods[method] += payment['amount']
print(methods)  # {'НАЛ': 1200, 'Тер': 800}
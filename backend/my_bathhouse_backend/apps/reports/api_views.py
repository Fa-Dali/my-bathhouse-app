# backend/my-bathhouse-backend/reports/api_views.py

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.conf import settings
from django.template.loader import render_to_string
from weasyprint import HTML
from django.shortcuts import get_object_or_404
from .models import Report
import os
import json
from decimal import Decimal
from datetime import datetime

# === 1. Сохранение отчёта ===
@csrf_exempt  # Только если API с внешнего домена (иначе настройте CORS)
@require_http_methods(["POST"])
def save_report(request):
    try:
        data = json.loads(request.body)

        # Валидация
        required = ['admin_name', 'created_at', 'rows', 'totalPayment']
        if not all(k in data for k in required):
            return JsonResponse({'error': 'Отсутствуют обязательные поля'}, status=400)

        # Сохраняем
        report = Report.objects.create(
            admin_name = data['admin_name'],
            created_at = data['created_at'],
            data = data['rows'],  # массив
            # total_payment = data['totalPayment'],
            total_payment=Decimal(str(data.get('totalPayment', 0))),
        )

        return JsonResponse({'success': True, 'id': report.id})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# === 2. Проверка сервера ===
class CheckServerView(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({'status': 'ok'})


# === 3. Генерация PDF ===
@method_decorator(csrf_exempt, name='dispatch')
class GeneratePDFView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            date_str = data.get('date')
            overwrite = data.get('overwrite', False)

            if not date_str:
                return JsonResponse({'error': 'Дата не указана'}, status=400)

            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            formatted_date = selected_date.strftime('%d-%m-%Y')
            year = selected_date.year
            month = f"{selected_date.month:02d}"

            # Путь к файлу
            media_dir = os.path.join(settings.MEDIA_ROOT, 'reports', 'admin', str(year), month)
            os.makedirs(media_dir, exist_ok=True)
            file_path = os.path.join(media_dir, f"{formatted_date}.pdf")

            # Проверяем существование файла
            if os.path.exists(file_path) and not overwrite:
                return JsonResponse({
                    'exists': True,
                    'file_url': f'/media/reports/admin/{year}/{month}/{formatted_date}.pdf'
                }, status=409)

            # Получаем отчёт
            report = Report.objects.filter(created_at__date=selected_date).first()
            if not report:
                return JsonResponse({'error': 'Нет данных для этой даты'}, status=404)

            # Формат чисел: 1500000 → "1 500 000"
            def format_num(value):
                try:
                    n = int(float(value))
                    return f"{n:,}".replace(",", " ")
                except (ValueError, TypeError, OverflowError):
                    return "0"

            # Подготавливаем строки
            rows = []
            totals = {
                'total_rent': 0,
                'total_sales': 0,
                'total_spa': 0,
                'grand_total': 0,
                'total_masters_salary': 0
            }

            for row_data in report.data:
                rent = Decimal(row_data.get('rent', 0))
                sales = Decimal(row_data.get('sales', 0))
                spa = Decimal(row_data.get('spa', 0))
                total = rent + sales + spa

                totals['total_rent'] += rent
                totals['total_sales'] += sales
                totals['total_spa'] += spa
                for m in row_data.get('masters', []):
                    salary = Decimal(m.get('salary', 0))
                    totals['total_masters_salary'] += salary

                # Фильтруем payments — только непустые
                payments = [
                    p for p in row_data.get('payments', [])
                    if p.get('amount') or p.get('method')
                ]

                rows.append({
                    'start_time': row_data.get('start_time', ''),
                    'end_time': row_data.get('end_time', ''),
                    'audience': row_data.get('audience', ''),
                    'rent': format_num(rent),
                    'sales': format_num(sales),
                    'spa': format_num(spa),
                    'total': format_num(total),
                    'payments': [
                        {
                            'amount': format_num(p.get('amount', 0)),
                            'method': p.get('method', '').strip()
                        }
                        for p in payments
                        if p.get('method') or p.get('amount')
                    ],
                    'masters': [
                        {
                            'name': m.get('name', ''),
                            'salary': format_num(m.get('salary', 0))
                        }
                        for m in row_data.get('masters', [])
                    ]
                })

            # Форматируем итоги
            totals = {k: format_num(v) for k, v in totals.items()}

            # Рендерим
            html_string = render_to_string('report_pdf.html', {
                'admin_name': report.admin_name,
                'report_date': selected_date.strftime('%d.%m.%Y'),
                'rows': rows,
                'totals': totals,
                'generated_at': datetime.now().strftime('%d.%m.%Y %H:%M')
            })

            # Генерация PDF
            html = HTML(string=html_string)
            pdf = html.write_pdf()

            with open(file_path, 'wb') as f:
                f.write(pdf)

            return JsonResponse({
                'success': True,
                'file_url': f'/media/reports/admin/{year}/{month}/{formatted_date}.pdf'
            })

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

# === 4. Получение списка отчётов ===
def get_reports(request):
    reports = Report.objects.all().order_by('-created_at')[:10]  # последние 10
    data = [
        {
            'id': r.id,
            'admin_name': r.admin_name,
            'created_at': r.created_at.isoformat(),
            'total_payment': float(r.total_payment),
            'inserted_at': r.inserted_at.isoformat(),
        }
        for r in reports
    ]
    return JsonResponse({'reports': data}, safe=False)


# === 5. Создание отчёта (если нужно отдельно от save_report) ===
@csrf_exempt
@require_http_methods(["POST"])
def create_report(request):
    # Можно оставить как алиас для save_report или добавить логику
    return save_report(request)

# === 6. Автоматическое обновление отчета Админа
@csrf_exempt
def get_report_by_date(request, date):
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d').date()
        report = Report.objects.filter(created_at__date=target_date).first()
        if report:
            return JsonResponse({
                'id': report.id,
                'admin_name': report.admin_name,
                'created_at': report.created_at.isoformat(),
                'reports': report.data
            }, safe=False)
        return JsonResponse({'reports': []}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def update_report(request, id):
    try:
        report = Report.objects.get(id=id)
        data = json.loads(request.body)
        report.data = data['rows']
        report.admin_name = data['admin_name']
        report.save()
        return JsonResponse({'id': report.id, 'message': 'Обновлено'})
    except Report.DoesNotExist:
        return JsonResponse({'error': 'Не найдено'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# === 7. ...

# =====================================================================
#  предложено сделать таким образом:
'''
В вашем случае, вам нужно заменить комментарий 
`data = {...}  # замените на реальный источник данных` 
на реальный код, который будет собирать данные для генерации PDF. 

### Шаги:
1. **Определите источник данных:**
   - Вам нужно решить, откуда будут браться данные для PDF. 
   Это могут быть данные из базы данных, параметры запроса или 
   другие источники.

2. **Соберите данные:**
   - Напишите код, который будет извлекать данные из выбранного 
   источника.

3. **Передайте данные в HTML-шаблон:**
   - Используйте собранные данные для заполнения HTML-шаблона.

### Пример кода:
```python
# backend/my-bathhouse-backend/reports/views.py

from django.views import View
from django.http import HttpResponse
from weasyprint import HTML
from .models import Report  # Импортируйте вашу модель данных

class CheckServerView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponse("OK", status=200)

class GeneratePDFView(View):
    def get(self, request, *args, **kwargs):
        # Получаем данные из базы данных
        reports = Report.objects.all()  # Замените на ваш запрос к базе данных

        # Конструируем HTML-шаблон с данными
        html_template = """
        <html>
        <body>
            <table>
                <tr>
                    <th>Название</th>
                    <th>Описание</th>
                </tr>
                {% for report in reports %}
                <tr>
                    <td>{{ report.name }}</td>
                    <td>{{ report.description }}</td>
                </tr>
                {% endfor %}
            </table>
        </body>
        </html>
        """

        # Генерируем PDF
        pdf = HTML(string=html_template).write_pdf()

        # Возврат PDF в качестве аттача
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="report.pdf"'
        response.write(pdf)
        return response
```

### Объяснение:
1. **Получение данных:**
   - Мы используем модель `Report` для получения данных из базы данных. 
        Замените `Report` на вашу модель данных.

2. **HTML-шаблон:**
   - Мы используем шаблонный синтаксис Django для заполнения 
        HTML-шаблона данными.

3. **Генерация PDF:**
   - Мы используем библиотеку `weasyprint` для генерации PDF из 
        HTML-шаблона.

### Итог:
Теперь у вас есть готовый код для генерации PDF с данными из базы 
данных. Следуйте инструкциям по настройке и тестированию, чтобы 
убедиться в корректной работе функционала.
'''
# backend/my-bathhouse-backend/reports/api_views.py

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from .models import Report
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


# === 3. Генерация PDF (заглушка) ===
class GeneratePDFView(View):
    def get(self, request, *args, **kwargs):
        # Пока возвращаем заглушку
        return JsonResponse({'message': 'PDF генерация пока не реализована'}, status=200)


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
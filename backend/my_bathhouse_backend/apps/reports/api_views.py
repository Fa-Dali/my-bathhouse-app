# backend/my-bathhouse-backend/reports/views.py

from django.views import View
from django.http import HttpResponse, JsonResponse
from weasyprint import HTML
from .models import Report

# Проверка доступности сервера
class CheckServerView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponse("OK", status=200)

# Формирование PDF документа
class GeneratePDFView(View):
    def get(self, request, *args, **kwargs):
        # Получаем данные из GET-параметров или делаем дополнительную логику
        # Например, собираем данные из базы данных
        data = {...}  # замените на реальный источник данных:
        # ЧИТАЙ КОММЕНТ НИЖЕ, ПОСЛЕ СТРОКИ ============

        # Конструируем HTML-шаблон с данными
        html_template = """
        <html>
        <body>
            <!-- Ваша HTML-марка -->
        </body>
        </html>
        """.format(**data)

        # Генерируем PDF
        pdf = HTML(string=html_template).write_pdf()

        # Возврат PDF в качестве аттача
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="report.pdf"'
        response.write(pdf)
        return response

# представление для получения всех отчётов:
def get_reports(request):
    reports = Report.objects.all()
    data = [
        {
            'start_time': report.start_time,
            'end_time': report.end_time,
            'audience': report.audience,
            'rent': report.rent,
            'sales': report.sales,
            'spa': report.spa,
            'payment': report.payment,
            'admin_name': report.admin_name,
            'created_at': report.created_at,
        }
        for report in reports
    ]
    return JsonResponse(data, safe=False)

# представление для обработки отправки данных:
def create_report(request):
    if request.method == 'POST':
        admin_name = request.POST.get('admin_name')
        created_at = request.POST.get('created_at')
        # Остальные поля можно добавить аналогично

        report = Report(admin_name=admin_name, created_at=created_at)
        report.save()
        return HttpResponse("Отчёт успешно создан", status=201)
    return HttpResponse("Метод не поддерживается", status=405)

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
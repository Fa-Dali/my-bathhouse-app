# backend/my-bathhouse-backend/reports/views.py

# Реализация представлений для генерации PDF:
# Создаём класс для генерации PDF:

from django.http import HttpResponse
from weasyprint import HTML


class GeneratePDFView(View):
    def get(self, request, *args, **kwargs):
        # Получаем данные из GET-параметров или делаем дополнительную логику
        # Например, собираем данные из базы данных
        data = {...}  # замените на реальный источник данных

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
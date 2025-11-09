# backend/my-bathhouse-backend/reports/urls.py
# Реализация маршрутов для отчётов:

from django.urls import path
from .api_views import (GeneratePDFView,
                        SendReportEmailView,
                        CheckServerView,
                        get_reports,
                        create_report,
                        save_report,
                        get_report_by_date,
                        update_report,
                        test_email)

print("✅ reports/urls.py загружен! /send-report-email/ зарегистрирован")

urlpatterns = [
    # ПЕРЕДЕЛАТЬ маршрут для генерации документа PDF:
    path('generate-pdf/', GeneratePDFView.as_view(), name='generate_pdf'),

    # ПЕРЕДЕЛАТЬ маршрут для проверки доступности сервера
    path('check-server/', CheckServerView.as_view(), name='check_server'),

    # ПЕРЕДЕЛАТЬ маршрут для получения отчётов:
    path('list/', get_reports, name='get_reports'),  # GET /api/reports/list/

    # ПЕРЕДЕЛАТЬ маршрут для отправки данных на сервер
    path('create/', create_report, name='create_report'),  # POST /api/reports/create/

    #  сохранение отчета из фронтенда
    path('', save_report, name='save_report'),  # POST /api/reports/

    # ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ ТАБЛИЦЫ Еж-Отчет-Админ
    path('date/<str:date>/', get_report_by_date, name='get_report_by_date'),
    path('<int:id>/', update_report, name='update_report'),

    # ОТПРАВКА ПИСМА ОТЧЕТ НА ПОЧТУ АДМИНИСТРАЦИИ
    path('send-report-email/', SendReportEmailView.as_view(), name='send_report_email'),
    path('test-email/', test_email, name='test_email'),
]
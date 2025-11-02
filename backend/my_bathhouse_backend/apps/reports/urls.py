# backend/my-bathhouse-backend/reports/urls.py
# Реализация маршрутов для отчётов:

from django.urls import path
from .api_views import (GeneratePDFView,
                        CheckServerView,
                        get_reports,
                        create_report,
                        save_report)


urlpatterns = [
    # ПЕРЕДЕЛАТЬ маршрут для генерации документа PDF:
    path('generate-pdf/', GeneratePDFView.as_view(), name='generate_pdf'),

    # ПЕРЕДЕЛАТЬ маршрут для проверки доступности сервера
    path('check-server/', CheckServerView.as_view(), name='check_server'),

    # ПЕРЕДЕЛАТЬ маршрут для получения отчётов:
    path('reports/', get_reports, name='get_reports'),

    # ПЕРЕДЕЛАТЬ маршрут для отправки данных на сервер
    path('reports/create/', create_report, name='create_report'),

    #  сохранение отчета из фронтенда
    path('api/reports/', save_report, name='save_report'),
]
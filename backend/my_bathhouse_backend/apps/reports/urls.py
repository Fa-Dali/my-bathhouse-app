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
                        test_email,
						MasterReportStatsView,
                        mark_report_paid,
                        MasterReportView,
						get_monthly_stats,
						bulk_pay_reports,
						auto_pay_reports,
						get_user_payments)

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

    # ОБНОВЛЕНИЕ ОТЧЕТА ПО ID
    path('<int:id>/', update_report, name='update_report'),

    # ОТПРАВКА ПИСМА ОТЧЕТ НА ПОЧТУ АДМИНИСТРАЦИИ
    path('send-report-email/', SendReportEmailView.as_view(), name='send_report_email'),

    # ТЕСТОВЫЙ МЕТОД ДЛЯ ОТПРАВКИ ПИСЬМА
    path('test-email/', test_email, name='test_email'),

    # ОТЧЁТ ДЛЯ МАСТЕРА
    path('master-reports/', MasterReportView.as_view(), name='master_report'),

    # ОТЧЁТ ДЛЯ МАСТЕРА ПО ДАТЕ
    path('master-reports/date/<str:date>/', MasterReportView.as_view(), name='master_report_by_date'),

    # ОТМЕТКА ОТЧЕТА ОПЛАЧЕННЫМ
    path('master-reports/<int:report_id>/pay/', mark_report_paid, name='mark_report_paid'),

    # СТАТИСТИКА ДЛЯ МАСТЕРА
	path('master-reports/stats/', MasterReportStatsView.as_view(), name='get_master_stats'),

    # ОТЧЁТ ДЛЯ МАСТЕРА ПО ID
	path('master-reports/<int:id>/', MasterReportView.as_view(), name='master_report_detail'),

    # ЗАРПЛАТНЫЕ ВЕДОМОСТИ ДЛЯ АДМИНИСТРАЦИИ
	path('master-reports/stats/monthly/', get_monthly_stats, name='get_monthly_stats'),

    #
    path('master-reports/pay-bulk/', bulk_pay_reports, name='bulk_pay_reports'),

    #
    path('master-reports/pay/', auto_pay_reports, name='auto_pay_reports'),


    path('payments/', get_user_payments, name='get_user_payments'),

]

# backend/my-bathhouse-backend/reports/api_views.py

import logging
import os
import json

from datetime import datetime
from django.db.models import Sum
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.contrib.auth.decorators import login_required  # если нужна проверка авторизации
from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from weasyprint import HTML
from django.shortcuts import get_object_or_404

from .models import Report, MasterReport
from my_bathhouse_backend.apps.users.models import CustomUser
from decimal import Decimal
import yagmail


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes



logger = logging.getLogger(__name__)

# === 1. Сохранение отчёта админа===
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

            # Функция: дополняет список до 4 элементов
            def ensure_four(items):
                """Дополняет список до 4 элементов, пустые — с пустыми значениями"""
                while len(items) < 4:
                    items.append({})
                return items[:4]

            # Подготавливаем строки
            rows = []
            totals = {
                'total_rent': 0,
                'total_sales': 0,
                'total_spa': 0,
                'grand_total': 0,
                'total_masters_salary': 0
            }

            # 🔥 НОВОЕ: Подсчёт по методам оплаты
            payment_totals = {'Тер': Decimal('0'), 'НАЛ': Decimal('0'), 'Сайт': Decimal('0'), 'Ресеп': Decimal('0')}

            for row_data in report.data:
                rent = Decimal(row_data.get('rent', 0))
                sales = Decimal(row_data.get('sales', 0))
                spa = Decimal(row_data.get('spa', 0))
                total = rent + sales + spa

                # Накопление итогов
                totals['total_rent'] += rent
                totals['total_sales'] += sales
                totals['total_spa'] += spa
                totals['grand_total'] += total
                for m in row_data.get('masters', []):
                    salary = Decimal(m.get('salary', 0))
                    totals['total_masters_salary'] += salary

                # 🔥 НОВОЕ: Суммируем оплаты по методам
                for p in row_data.get('payments', []):
                    method = p.get('method', '').strip()
                    amount = Decimal(p.get('amount', 0))
                    if method in payment_totals and amount > 0:
                        payment_totals[method] += amount

                # Подготовка payments (всегда 4)
                payments = []
                for p in row_data.get('payments', []):
                    if p.get('amount') or p.get('method'):
                        payments.append({
                            'amount': format_num(p.get('amount', 0)),
                            'method': p.get('method', '').strip()
                        })
                payments = ensure_four(payments)

                # Подготовка masters (всегда 4)
                masters = []
                for m in row_data.get('masters', []):
                    masters.append({
                        'name': m.get('name', ''),
                        'salary': format_num(m.get('salary', 0))
                    })
                masters = ensure_four(masters)

                # Добавляем строку
                rows.append({
                    'start_time': row_data.get('start_time', ''),
                    'end_time': row_data.get('end_time', ''),
                    'audience': row_data.get('audience', ''),
                    'rent': format_num(rent),
                    'sales': format_num(sales),
                    'spa': format_num(spa),
                    'total': format_num(total),
                    'payments': payments,
                    'masters': masters
                })

            # Форматируем итоги
            totals = {k: format_num(v) for k, v in totals.items()}

            # 🔥 НОВОЕ: Подсчёт итогов для передачи в PDF
            total_payment = sum(payment_totals.values(), Decimal('0'))
            cash_to_hand = max(payment_totals.get('НАЛ', Decimal('0')) - Decimal('3100'), Decimal('0'))

            # 🔥 НОВОЕ: Форматируем для отображения
            payment_totals = {k: format_num(v) for k, v in payment_totals.items()}
            total_payment = format_num(total_payment)
            cash_to_hand = format_num(cash_to_hand)

            # Рендерим HTML
            html_string = render_to_string('report_pdf.html', {
                'admin_name': report.admin_name,
                'report_date': selected_date.strftime('%d.%m.%Y'),
                'rows': rows,
                'totals': totals,
                'generated_at': datetime.now().strftime('%d.%m.%Y %H:%M'),
                # 🔥 Передаём сводку в шаблон
                'payment_totals': payment_totals,
                'total_payment': total_payment,
                'cash_to_hand': cash_to_hand,
            })

            # Генерация PDF
            html = HTML(string=html_string)
            pdf = html.write_pdf()

            # Сохраняем
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

# === 7. Отправка отчета на почту администрации
@method_decorator(csrf_exempt, name='dispatch')
class SendReportEmailView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            date_str = data.get('date')

            if not date_str:
                logger.error("Дата не указана в запросе")
                return JsonResponse({'error': 'Дата не указана'}, status=400)

            # Парсим дату
            try:
                selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError as e:
                logger.error(f"Неверный формат даты: {date_str}, ошибка: {e}")
                return JsonResponse({'error': 'Неверный формат даты'}, status=400)

            formatted_date = selected_date.strftime('%d-%m-%Y')
            year = selected_date.year
            month = f"{selected_date.month:02d}"

            # Путь к PDF: media/reports/admin/2025/11/06-11-2025.pdf
            pdf_filename = f"{formatted_date}.pdf"
            pdf_path = os.path.join(
                settings.BASE_DIR,  # ← D:\...\backend
                'media',
                'reports',
                'admin',
                str(year),
                month,
                pdf_filename
            )

            print("🔍 Путь к PDF:", pdf_path)
            print("📁 Файл существует:", os.path.exists(pdf_path))

            if not os.path.exists(pdf_path):
                logger.error(f"PDF-файл не найден: {pdf_path}")
                return JsonResponse({'error': 'PDF-файл не найден'}, status=404)

            logger.info(f"PDF найден: {pdf_path}")

            # Получатели
            recipients = getattr(settings, 'REPORT_RECIPIENTS', [])
            if not recipients:
                logger.error("Нет получателей в REPORT_RECIPIENTS")
                return JsonResponse({'error': 'Нет получателей'}, status=500)

            # Отправка через yagmail
            yag = yagmail.SMTP(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

            sent_count = 0
            failed_count = 0

            for email in recipients:
                try:
                    yag.send(
                        to=email,
                        subject=f"Ежедневный отчёт бани — {selected_date.strftime('%d.%m.%Y')}",
                        contents="Добрый день!\n\nВо вложении — ежедневный отчёт бани.",
                        attachments=pdf_path
                    )
                    sent_count += 1
                    logger.info(f"✅ Успешно отправлено: {email}")
                except Exception as e:
                    failed_count += 1
                    logger.error(f"❌ Ошибка при отправке на {email}: {str(e)}")

            logger.info(f"Рассылка завершена: {sent_count} доставлено, {failed_count} ошибок")

            return JsonResponse({
                'success': True,
                'sent': sent_count,
                'failed': failed_count,
                'message': f'Отчёт отправлен на {sent_count} из {len(recipients)} адресов'
            })

        except Exception as e:
            logger.critical(f"Критическая ошибка в SendReportEmailView: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)


# ТЕСТ ДЛЯ ПИСЬМА
def test_email(request):
    import logging
    logger = logging.getLogger(__name__)
    try:
        msg = EmailMessage(
            subject="Тест SMTP",
            body="Если это письмо пришло — SMTP работает.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=["fadeev.music.studio@yandex.ru"]
        )
        msg.send()
        logger.info("✅ Тестовое письмо отправлено")
        return JsonResponse({"status": "success", "message": "Письмо отправлено!"})
    except Exception as e:
        logger.error(f"❌ Ошибка SMTP: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# =====================================================================

# Вручную добавим проверку авторизации
def login_required_json(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Требуется авторизация'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


@method_decorator(csrf_exempt, name='dispatch')
class MasterReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        date = self.kwargs.get('date')
        if not date:
            return Response({'error': 'Требуется параметр date в URL'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Неверный формат даты. Используйте YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        report = MasterReport.objects.filter(user=request.user, date=target_date).first()
        if not report:
            return Response({'detail': 'Отчёт не найден'}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'id': report.id,
            'user': report.user.id,
            'date': report.date.isoformat(),
            'data': report.data,
            'total_clients': float(report.total_clients),
            'total_salary': float(report.total_salary),
            'created_at': report.created_at.isoformat(),
            'updated_at': report.updated_at.isoformat(),
        }
        return Response(data)

    def post(self, request):
        date_str = request.data.get('date')
        rows = request.data.get('rows', [])
        total_clients = request.data.get('total_clients', 0)
        total_salary = request.data.get('total_salary', 0)

        if not date_str or not rows:
            return Response({'error': 'Поля date и rows обязательны'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Неверный формат даты'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            total_salary = Decimal(str(total_salary))
            total_clients = Decimal(str(total_clients))
        except:
            return Response({'error': 'Неверный формат чисел'}, status=status.HTTP_400_BAD_REQUEST)

        report, created = MasterReport.objects.update_or_create(
            user=request.user,
            date=target_date,
            defaults={
                'data': rows,
                'total_clients': total_clients,
                'total_salary': total_salary,
            }
        )

        response_data = {
            'success': True,
            'message': 'Отчёт сохранён',
            'data': {
                'id': report.id,
                'user': report.user.id,
                'date': report.date.isoformat(),
                'data': report.data,
                'total_clients': float(report.total_clients),
                'total_salary': float(report.total_salary),
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat(),
            }
        }
        return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

# ДЛЯ ОТМЕТКИ ОПЛАЧЕННЫХ ЗАРПЛАТ МАСТЕРАМ
@csrf_exempt
@require_http_methods(["POST"])
@login_required_json
def mark_report_paid(request, report_id):
    user = request.user

    # Проверка: только администратор
    if not user.roles.filter(code='admin').exists():
        return JsonResponse({'error': 'Доступ запрещён'}, status=403)

    # Проверка: только определённые пользователи
    allowed_usernames = ['Master_para', 'Fa-Dali']
    if user.username not in allowed_usernames:
        return JsonResponse({'error': 'Только Master_para и Fa-Dali могут подтверждать оплату'}, status=403)

    try:
        report = MasterReport.objects.get(id=report_id, user__isnull=False)
    except MasterReport.DoesNotExist:
        return JsonResponse({'error': 'Отчёт не найден'}, status=404)

    if report.paid:
        return JsonResponse({'error': 'Отчёт уже оплачен'}, status=400)

    report.paid = True
    report.paid_at = timezone.now()
    report.paid_by = user
    report.save()

    return JsonResponse({
        'success': True,
        'message': 'Отчёт помечен как оплаченный',
        'report_id': report.id,
        'paid_at': report.paid_at.isoformat(),
        'paid_by': user.username
    })


# API для статистики
class MasterReportStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({'error': 'Требуется user_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

        # Проверка: мастер может смотреть только себя, админ — всех
        if request.user != target_user and not request.user.roles.filter(code='admin').exists():
            return Response({'error': 'Доступ запрещён'}, status=status.HTTP_403_FORBIDDEN)

        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)

        # Неоплачено: все отчёты мастера, где paid = False
        unpaid = MasterReport.objects.filter(
            user=target_user,
            paid=False
        ).aggregate(total=Sum('total_salary'))['total'] or 0

        # Оплачено за месяц
        monthly = MasterReport.objects.filter(
            user=target_user,
            paid=True,
            date__gte=start_of_month
        ).aggregate(total=Sum('total_salary'))['total'] or 0

        # Оплачено за год
        yearly = MasterReport.objects.filter(
            user=target_user,
            paid=True,
            date__gte=start_of_year
        ).aggregate(total=Sum('total_salary'))['total'] or 0

        return Response({
            'unpaid': float(unpaid),
            'monthly': float(monthly),
            'yearly': float(yearly),
        })

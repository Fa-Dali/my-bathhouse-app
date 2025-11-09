# test_smtp.py

import yagmail
import os

# === Настройки ===
gmail_user = 'fa.daliastro@gmail.com'
app_password = 'rphihxdutppmxpxm'  # ← твой App Password

recipient = 'fadeev.music.studio@yandex.ru'
subject = 'Ежедневный отчёт бани'
body = 'Добрый день!\n\nВо вложении — отчёт за сегодня.'

# === Правильный путь к media (рядом с my_bathhouse_backend) ===
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # ← D:\...\my_bathhouse_backend
BASE_DIR = os.path.dirname(PROJECT_ROOT)  # ← D:\...\backend (на уровень выше!)

pdf_path = os.path.join(
    BASE_DIR,
    'media',
    'reports',
    'admin',
    '2025',
    '11',
    '06-11-2025.pdf'
)

# Проверь, существует ли файл
if not os.path.exists(pdf_path):
    print(f"❌ Файл не найден: {pdf_path}")
    print("Проверь, что файл существует по этому пути")
else:
    print(f"✅ Файл найден: {pdf_path}")

# === Отправка ===
try:
    yag = yagmail.SMTP(gmail_user, app_password)
    yag.send(
        to=recipient,
        subject=subject,
        contents=body,
        attachments=pdf_path
    )
    print("✅ Письмо успешно отправлено!")
except Exception as e:
    print(f"❌ Ошибка при отправке: {e}")
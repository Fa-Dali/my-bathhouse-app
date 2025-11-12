# check_users.py

import os
import django

# Установка настроек Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_bathhouse_backend.settings')

# Настройка Django
django.setup()

# Импорт модели
from my_bathhouse_backend.apps.users.models import CustomUser

print("🔍 Все пользователи в БД:")
for u in CustomUser.objects.all():
    roles = [r.code for r in u.roles.all()]
    print(f"ID: {u.id}, Username: {u.username}, Active: {u.is_active}, Roles: {roles}")

# Проверим Fa-Dali
user = CustomUser.objects.filter(username='Fa-Dali').first()
if user:
    print("\n✅ Найден Fa-Dali:")
    print(f"Active: {user.is_active}")
    print(f"Has usable password: {user.has_usable_password()}")
else:
    print("\n❌ Пользователь Fa-Dali не найден")

# Проверка аутентификации
from django.contrib.auth import authenticate

test_user = authenticate(username='Fa-Dali', password='fadaliastro')
if test_user:
    print("✅ Успешный вход с паролем 'fadaliastro'")
else:
    print("❌ Не удалось войти с паролем 'fadaliastro'")
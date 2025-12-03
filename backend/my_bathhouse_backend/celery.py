# my_bathhouse_backend/celery.py
import os
from celery import Celery

# Установи переменную окружения для Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_bathhouse_backend.settings')

app = Celery('my_bathhouse_backend')

# Загрузи настройки из Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически находи задачи в приложениях
app.autodiscover_tasks()

# my_bathhouse_backend/apps/report/apps.py

# backend/my_bathhouse_backend/apps/reports/apps.py

from django.apps import AppConfig

class ReportsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'my_bathhouse_backend.apps.reports'

    def ready(self):
        from . import models  # ✅ Относительный импорт — работает
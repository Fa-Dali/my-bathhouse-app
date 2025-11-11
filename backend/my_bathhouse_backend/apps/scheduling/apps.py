# http://localhost:8000/api/scheduling/availabilities/

from django.apps import AppConfig


class SchedulingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'my_bathhouse_backend.apps.scheduling'

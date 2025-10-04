# my_bathhouse_backend/apps/users/urls.py
'''
Настраивает маршруты для доступа к API, чтобы фронтенд мог отправлять данные.
'''
from django.urls import path
from .api_views import RegisterAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register_api'),
]
# my_bathhouse_backend/apps/users/urls.py
'''
Настраивает маршруты для доступа к API, чтобы фронтенд мог отправлять данные.
'''
from django.urls import path
from .api_views import RegisterAPI, LoginAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register_api'),
    path('login/', LoginAPI.as_view(), name='login_api'),
]
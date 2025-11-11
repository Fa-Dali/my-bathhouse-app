# my_bathhouse_backend/apps/users/urls.py
'''
Настраивает маршруты для доступа к API, чтобы фронтенд мог отправлять данные.
'''
from django.urls import path
from . import api_views
from .api_views import (UpdateAvatarAPI,
                        DeleteUserAPI,
                        get_csrf,
                        LoginAPI,
                        RefreshTokenAPI,
                        RegisterAPI,
                        UserListAPI,)

urlpatterns = [
    path('register', RegisterAPI.as_view(), name='register_api'),
    path('login', LoginAPI.as_view(), name='login_api'),
    path('get-csrf-token/', get_csrf, name='get_csrf_token'),

    # обновление токена в ( api_views.py ):
    path('refresh-token', RefreshTokenAPI.as_view(), name='refresh_token_api'),

    # чтение пользователей из БД:
    path('users/', UserListAPI.as_view(), name='user_list_api'),

    # удаление пользователей из БД:
    path('delete-user/<int:pk>/', DeleteUserAPI.as_view(), name='delete_user_api'),

    # изменение аватара в БД:
    path('update-avatar/<int:pk>/', UpdateAvatarAPI.as_view(), name='update_avatar_api'),

    path('users/<int:user_id>/roles/', api_views.update_user_roles, name='update_user_roles'),
]
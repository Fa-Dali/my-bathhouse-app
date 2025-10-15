"""
Конфигурация URL для проекта my_bathhouse_backend.

Список `urlpatterns` направляет URL-адреса к представлениям (views.py).
Для получения дополнительной информации смотри.:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Например:
Функции views.py
    1. Добавить импорт:  from my_bathhouse_backend import views
    2. Добавьте URL в urlpatterns:  path('', views.home, name='home')
Class-based (основной класс) views.py
    1. Добавить импорт:  from other_app.views import Home
    2. Добавьте URL в urlpatterns:  path('', Home.as_view(), name='home')
Включая другую конфигурацию URL
    1. Импортируйте функцию include(): from django.urls import include, path
    2. Добавьте URL в urlpatterns:  path('blog/', include('blog.urls'))
"""
# my_bathhouse_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import home          # ( !? откинул из кода : убрал эту строку)


urlpatterns = [
    # Администраторская панель Django
    path('admin/', admin.site.urls),
    # Включаем маршруты нашего приложения
    path('api/', include('my_bathhouse_backend.apps.users.urls')),
    # Главная страница
    path('', home, name='home'), # ( !? откинул из кода : убрал эту строку)
]

# Добавляем маршрут для обслуживания медиа файлов
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

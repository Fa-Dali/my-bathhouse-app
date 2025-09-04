"""
Настройка URL для проекта my_bathhouse_app.

Список `urlpatterns` направляет URL-адреса к представлениям. Для получения дополнительной информации смотрите:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Например:
Функциональные представления:
    1. Добавьте импорт:  from my_app import views
    2. Добавьте URL в urlpatterns:  path('', views.home, name='home')
Представления на основе классов:
    1. Добавьте импорт:  from other_app.views import Home
    2. Добавьте URL в urlpatterns:  path('', Home.as_view(), name='home')
Включение другого URLconf
    1. Импортируйте функцию include(): from django.urls import include, path
    2. Добавьте URL в urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('banya.urls')),  # Включаем маршруты приложения Banya
]

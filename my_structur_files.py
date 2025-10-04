'''
my-bathhouse-app/
├── backend/                # Серверная часть (Django)
│   ├── env/
│   │   ├── Include/
│   │   ├── Lib/
│   │   ├── Scripts/
│   │   └── pyvenv.cfg
│   │
│   ├── my-bathhouse-backend/             # Основной пакет Django-проекта
│   │   ├── apps/
│   │   │   ├── users/
│   │   │   │   ├── migrations/
│   │   │   │   │   └── __init.py
│   │   │   │   ├── __init.py
│   │   │   │   ├── admin.py
│   │   │   │   ├── apps.py
│   │   │   │   ├── models.py
│   │   │   │   ├── tests.py
│   │   │   │   └── viewv.py
│   │   │   │
│   │   │   ├── __init__.py
│   │   │   └── ...
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py     # Настройки Django
│   │   ├── urls.py         # Маршруты URL
│   │   └── wsgi.py         # WSGI конфигурация
│   │   ...
│   └── manage.py           # Утилита командной строки для управления проектом
│
├── frontend/              # Клиентская часть (Next.js + React)
│   ├── pages/              # Страницы фронтенда
│   │   ├── index.js        # Главная страница
│   │   ├── shop.js         # Страница магазина
│   │   └── cart.js         # Корзина покупок
│   ├── components/         # Реактивные компоненты
│   │   ├── Header.js       # Заголовок страницы
│   │   ├── ProductCard.js  # Карточка продукта
│   │   └── Footer.js       # Нижний колонтитул
│   ├── styles/             # CSS-файлы стилей
│   │   ├── global.css
│   │   └── theme.css
│   ├── public/             # Открытые статические файлы
│   │   ├── logo.png
│   │   └── favicon.ico
│   ├── next.config.js      # Конфигурационный файл Next.js
│   └── package.json        # Управление пакетами Node.js
├── media/                   # Сюда будут складываться медиа-файлы
   └── avatars/             # Каталог для аватаров
'''
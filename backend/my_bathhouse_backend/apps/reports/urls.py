# backend/my-bathhouse-backend/reports/urls.py
# Реализация маршрутов для отчётов:

from django.urls import path
from .views import GeneratePDFView

urlpatterns = [
    path('generate-pdf/', GeneratePDFView.as_view(), name='generate_pdf'),
]
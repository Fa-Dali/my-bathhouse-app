# my_bathhouse_backend/views.py
from django.http import HttpResponse

def home(request):
    return HttpResponse("Добро пожаловать на мой сайт бань!")
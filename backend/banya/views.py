from django.shortcuts import render

def index(request):
    return render(request, 'banya/index.html')  # Рендерим шаблон

def hello_world(request):
    return render(request, 'banya/hello.html')

def about_us(request):
    return render(request, 'banya/about.html')
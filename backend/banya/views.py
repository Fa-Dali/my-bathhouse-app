from django.http import HttpResponse

def index(request):
    response = HttpResponse()
    response.write("<h1>Это главная страница</h1>"
                   "<a href='/hello'>Перейти на страницу Hello</a><br>"
                   "<a href='/about'>Перейти на страницу About</a>")
    return response

def hello_world(request):
    return HttpResponse("<h1>Hello World!</h1>"
                        "<a href='/'>Назад на главную</a>")

def about_us(request):
    return HttpResponse("<h1 style='color: red;'>О нас</h1>"
                        "<a href='/'>Назад на главную</a>")
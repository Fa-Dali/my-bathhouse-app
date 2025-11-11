# backend/my_bathhouse_backend/apps/users/admin.py

from django.contrib import admin
from .models import CustomUser, Role

# Автоматически создай роли при миграции
def create_roles(sender, **kwargs):
    Role.objects.get_or_create(code='admin', defaults={'name': 'Администратор'})
    Role.objects.get_or_create(code='paramaster', defaults={'name': 'Пармастер'})
    Role.objects.get_or_create(code='masseur', defaults={'name': 'Массажист'})

from django.db.models.signals import post_migrate
post_migrate.connect(create_roles, sender=__name__)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'get_roles_display', 'email', 'phone']
    filter_horizontal = ['roles']

    def get_roles_display(self, obj):
        return ", ".join([r.name for r in obj.roles.all()])
    get_roles_display.short_description = 'Роли'
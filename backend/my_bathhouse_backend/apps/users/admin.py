# backend/my_bathhouse_backend/apps/users/admin.py

from django.contrib import admin
from .models import CustomUser, Role

# Автоматически создай роли при миграции
def create_roles(sender, **kwargs):
    admin_role, _ = Role.objects.get_or_create(code='admin', defaults={
        'name': 'Администратор'})
    paramaster_role, _ = Role.objects.get_or_create(code='paramaster', defaults={'name': 'Пармастер'})
    masseur_role, _ = Role.objects.get_or_create(code='masseur', defaults={'name': 'Массажист'})

    # Найдём или создадим Fa-Dali
    try:
        fa_dali = CustomUser.objects.get(username='Fa-Dali')
        if not fa_dali.roles.filter(code='admin').exists():
            fa_dali.roles.add(admin_role)
            print("Роль admin присвоена Fa-Dali")
    except CustomUser.DoesNotExist:
        pass  # Пусть создаётся через форму

from django.db.models.signals import post_migrate
post_migrate.connect(create_roles, sender=__name__)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'get_roles_display', 'email', 'phone_number']
    filter_horizontal = ['roles']

    def get_roles_display(self, obj):
        return ", ".join([r.name for r in obj.roles.all()])
    get_roles_display.short_description = 'Роли'
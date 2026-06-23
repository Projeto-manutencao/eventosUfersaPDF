from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .models import PerfilUsuario


class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    extra = 0


User = get_user_model()


try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'get_role', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active', 'perfil__role']
    inlines = [PerfilUsuarioInline]

    @admin.display(description='Role')
    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        return getattr(getattr(obj, 'perfil', None), 'role', 'usuario')

from django.conf import settings
from django.db import models


class PerfilUsuario(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Administrador'
        USUARIO = 'usuario', 'Usuario comum'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='perfil')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USUARIO)

    class Meta:
        verbose_name = 'Perfil de usuario'
        verbose_name_plural = 'Perfis de usuarios'

    def __str__(self):
        return f'{self.user.email or self.user.username} - {self.get_role_display()}'

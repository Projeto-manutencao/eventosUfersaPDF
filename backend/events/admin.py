from django.contrib import admin
from .models import Evento


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'data_inicio', 'local', 'organizador', 'capacidade', 'ativo', 'criado_em']
    list_filter = ['ativo', 'data_inicio']
    search_fields = ['titulo', 'descricao', 'local', 'organizador']
    readonly_fields = ['criado_em', 'atualizado_em']
    date_hierarchy = 'data_inicio'
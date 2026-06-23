from django.contrib import admin
from .models import Evento, SolicitacaoManutencao


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'data_inicio', 'local', 'organizador', 'capacidade', 'ativo', 'criado_em']
    list_filter = ['ativo', 'data_inicio']
    search_fields = ['titulo', 'descricao', 'local', 'organizador']
    readonly_fields = ['criado_em', 'atualizado_em']
    date_hierarchy = 'data_inicio'


@admin.register(SolicitacaoManutencao)
class SolicitacaoManutencaoAdmin(admin.ModelAdmin):
    list_display = ['protocolo', 'tipo', 'prioridade', 'status', 'titulo', 'email_contato', 'criado_em']
    list_filter = ['tipo', 'prioridade', 'status', 'criado_em']
    search_fields = ['protocolo', 'titulo', 'descricao', 'email_contato']
    readonly_fields = ['protocolo', 'criado_em', 'atualizado_em']
    date_hierarchy = 'criado_em'

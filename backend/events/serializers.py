from rest_framework import serializers
from .models import Evento, SolicitacaoManutencao

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ['id', 'criado_em', 'atualizado_em']


class SolicitacaoManutencaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitacaoManutencao
        fields = '__all__'
        read_only_fields = [
            'id',
            'protocolo',
            'status',
            'criado_em',
            'atualizado_em'
        ]


class AdminSolicitacaoManutencaoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = SolicitacaoManutencao
        fields = '__all__'
        read_only_fields = [
            'id',
            'protocolo',
            'criado_em',
            'atualizado_em',
            'tipo_display',
            'prioridade_display',
            'status_display',
        ]

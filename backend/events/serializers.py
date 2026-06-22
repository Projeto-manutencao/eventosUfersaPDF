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

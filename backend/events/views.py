from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Evento, SolicitacaoManutencao
from .serializers import EventoSerializer, SolicitacaoManutencaoSerializer


class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['ativo']
    search_fields = ['titulo', 'descricao', 'local', 'organizador']
    ordering_fields = ['data_inicio', 'criado_em']
    ordering = ['-data_inicio']


class SolicitacaoManutencaoViewSet(viewsets.ModelViewSet):
    queryset = SolicitacaoManutencao.objects.all()
    serializer_class = SolicitacaoManutencaoSerializer

    http_method_names = ['get', 'post', 'head', 'options']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        solicitacao = serializer.save()

        return Response(
            {
                "protocolo": solicitacao.protocolo,
                "mensagem": "Solicitação registrada com sucesso. Retornaremos em até 2 dias úteis."
            },
            status=status.HTTP_201_CREATED
        )

import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny  # <-- Nova importação adicionada
from django_filters.rest_framework import DjangoFilterBackend

# Importações unificadas e limpas
from .models import Evento, SolicitacaoManutencao
from .serializers import EventoSerializer, SolicitacaoManutencaoSerializer

logger = logging.getLogger(__name__)


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
    ordering = ['-data_inicio']  # Duplicação removida


class SolicitacaoManutencaoViewSet(viewsets.ModelViewSet):
    queryset = SolicitacaoManutencao.objects.all()
    serializer_class = SolicitacaoManutencaoSerializer
    
    permission_classes = [AllowAny]  # <-- Permissão pública adicionada aqui

    http_method_names = ['post', 'head', 'options']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        solicitacao = serializer.save()
        self._enviar_email_equipe(solicitacao)

        return Response(
            {
                "protocolo": solicitacao.protocolo,
                "mensagem": "Solicitação registrada com sucesso. Retornaremos em até 2 dias úteis."
            },
            status=status.HTTP_201_CREATED
        )

    def _enviar_email_equipe(self, solicitacao):
        destinatario = getattr(settings, 'MANUTENCAO_EMAIL_EQUIPE', '')
        if not destinatario:
            logger.warning('MANUTENCAO_EMAIL_EQUIPE nao configurado; e-mail nao enviado.')
            return

        assunto = f'Nova solicitação de manutenção - {solicitacao.protocolo}'
        mensagem = (
            f'Protocolo: {solicitacao.protocolo}\n'
            f'Tipo: {solicitacao.get_tipo_display()}\n'
            f'Prioridade: {solicitacao.get_prioridade_display()}\n'
            f'Status: {solicitacao.get_status_display()}\n'
            f'Título: {solicitacao.titulo}\n'
            f'E-mail de contato: {solicitacao.email_contato or "Não informado"}\n\n'
            f'Descrição:\n{solicitacao.descricao}\n'
        )

        try:
            send_mail(
                subject=assunto,
                message=mensagem,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[destinatario],
                fail_silently=False,
            )
        except Exception:
            logger.exception('Falha ao enviar e-mail da solicitacao %s.', solicitacao.protocolo)

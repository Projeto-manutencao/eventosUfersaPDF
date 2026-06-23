import logging

from django.conf import settings
from django.core.mail import send_mail
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Evento, SolicitacaoManutencao
from .permissions import AllowAnyReadAdminWrite, IsAdminUser
from .serializers import (
    AdminSolicitacaoManutencaoSerializer,
    EventoSerializer,
    SolicitacaoManutencaoSerializer,
)

logger = logging.getLogger(__name__)


class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [AllowAnyReadAdminWrite]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['ativo']
    search_fields = ['titulo', 'descricao', 'local', 'organizador']
    ordering_fields = ['data_inicio', 'criado_em']
    ordering = ['-data_inicio']


class SolicitacaoManutencaoViewSet(viewsets.ModelViewSet):
    queryset = SolicitacaoManutencao.objects.all()
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ['tipo', 'prioridade', 'status']
    search_fields = ['protocolo', 'titulo', 'descricao', 'email_contato']
    ordering_fields = ['criado_em', 'atualizado_em', 'prioridade', 'status']
    ordering = ['-criado_em']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return SolicitacaoManutencaoSerializer
        return AdminSolicitacaoManutencaoSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        solicitacao = serializer.save()
        self._enviar_email_equipe(solicitacao)

        return Response(
            {
                'protocolo': solicitacao.protocolo,
                'mensagem': 'Solicitação registrada com sucesso. Retornaremos em até 2 dias úteis.',
            },
            status=status.HTTP_201_CREATED,
        )

    def _enviar_email_equipe(self, solicitacao):
        destinatario = getattr(settings, 'MANUTENCAO_EMAIL_EQUIPE', '')
        if not destinatario:
            logger.warning('MANUTENCAO_EMAIL_EQUIPE não configurado; e-mail não enviado.')
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
            logger.exception('Falha ao enviar e-mail da solicitação %s.', solicitacao.protocolo)
            
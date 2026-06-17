from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Evento
from .serializers import EventoSerializer


class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['titulo', 'descricao', 'local', 'organizador']
    ordering_fields = ['data_inicio', 'criado_em']
    ordering = ['-data_inicio']
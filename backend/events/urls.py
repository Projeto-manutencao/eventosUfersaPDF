from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventoViewSet, SolicitacaoManutencaoViewSet

router = DefaultRouter()

router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'solicitacoes', SolicitacaoManutencaoViewSet, basename='solicitacoes')

urlpatterns = [
    path('', include(router.urls)),
]

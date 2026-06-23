from django.db import models


class Evento(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    local = models.CharField(max_length=200)
    organizador = models.CharField(max_length=200, blank=True)
    capacidade = models.PositiveIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'
        ordering = ['-data_inicio']

    def __str__(self):
        return self.titulo
class SolicitacaoManutencao(models.Model):

    TIPO_CHOICES = [
        ('bug', 'Bug / Erro'),
        ('melhoria', 'Melhoria / Nova funcionalidade'),
        ('duvida', 'Dúvida / Suporte'),
    ]

    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
    ]

    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('em_analise', 'Em Análise'),
        ('em_desenvolvimento', 'Em Desenvolvimento'),
        ('resolvida', 'Resolvida'),
        ('fechada', 'Fechada'),
    ]

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES
    )

    titulo = models.CharField(
        max_length=200
    )

    descricao = models.TextField()

    email_contato = models.EmailField(
        blank=True
    )

    prioridade = models.CharField(
        max_length=10,
        choices=PRIORIDADE_CHOICES,
        default='media'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='aberta'
    )

    protocolo = models.CharField(
        max_length=20,
        unique=True
    )

    criado_em = models.DateTimeField(
        auto_now_add=True
    )

    atualizado_em = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = 'Solicitação de Manutenção'
        verbose_name_plural = 'Solicitações de Manutenção'
        ordering = ['-criado_em']

    def __str__(self):
        return self.protocolo
    
    def save(self, *args, **kwargs):
        # 1. Verifica se o protocolo já existe (para não gerar um novo se você estiver apenas editando a solicitação)
        if not self.protocolo: 
            
            # 2. Pega a data e hora atual baseada nas configurações do seu settings.py
            from django.utils import timezone 
            hoje = timezone.now().strftime('%Y%m%d') # Formata para algo como '20260622'
            
            # 3. Conta quantas solicitações já foram criadas HOJE e soma 1 para ser o número do protocolo atual
            count = SolicitacaoManutencao.objects.filter(
                criado_em__date=timezone.now().date()
            ).count() + 1
            
            # 4. Monta a string do protocolo. Ex: SOL-20260622-001
            # O '03d' garante que o número terá sempre 3 dígitos (001, 002, 010, etc)
            self.protocolo = f'SOL-{hoje}-{count:03d}'
            
        # 5. Chama o método save() original do Django para efetivamente gravar no banco de dados
        super().save(*args, **kwargs)
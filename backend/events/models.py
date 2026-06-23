from django.db import models


class ProtocoloCounter(models.Model):
    data = models.DateField(unique=True)
    contador = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Contador de Protocolo'
        verbose_name_plural = 'Contadores de Protocolo'

    def __str__(self):
        return f'{self.data} - {self.contador}'


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
        if not self.protocolo:
            from django.utils import timezone
            from django.db import IntegrityError, transaction, connection
            
            max_tentativas = 10
            for _ in range(max_tentativas):
                hoje = timezone.now().date()
                hoje_str = hoje.strftime('%Y%m%d')
                
                with transaction.atomic():
                    # SQLite não suporta SELECT FOR UPDATE, usar abordagem alternativa
                    # Tentar incrementar atomicamente via UPDATE
                    with connection.cursor() as cursor:
                        cursor.execute(
                            """
                            INSERT INTO events_protocolocounter (data, contador)
                            VALUES (%s, 1)
                            ON CONFLICT(data) DO UPDATE SET contador = contador + 1
                            RETURNING contador
                            """,
                            [hoje]
                        )
                        row = cursor.fetchone()
                        contador = row[0] if row else 1
                    
                    self.protocolo = f'SOL-{hoje_str}-{contador:03d}'
                    
                    try:
                        super().save(*args, **kwargs)
                        return
                    except IntegrityError:
                        continue
            
            raise IntegrityError('Nao foi possivel gerar protocolo unico apos varias tentativas')
        else:
            super().save(*args, **kwargs)
## Descrição

<!-- Descreva o que este PR faz. Ex: Adiciona endpoint de inscrição em eventos -->

## Issue Relacionada

Closes #<!-- número da issue -->

## Tipo de Mudança

- [ ] Bug fix (correção que não quebra funcionalidade existente)
- [ ] Nova feature (funcionalidade que adiciona comportamento)
- [ ] Breaking change (correção/feature que muda comportamento existente)
- [ ] Docs / Refactor / Chore

## Como Testar

<!-- Passos para validar localmente -->
```bash
# Exemplo:
python manage.py test events.tests.test_inscricao
# ou manual:
curl -X POST http://localhost:8000/api/eventos/1/inscrever/ -H "Authorization: Bearer <token>"
```

## Checklist

- [ ] Código segue o style guide (black, flake8)
- [ ] Testes passam (`python manage.py test`)
- [ ] Migrações geradas se alterou models (`python manage.py makemigrations`)
- [ ] Documentação atualizada (README, docstrings, OpenAPI se aplicável)
- [ ] Variáveis de ambiente novas documentadas no `.env.example`
- [ ] Commits seguem Conventional Commits
- [ ] Branch nomeada corretamente (`feat/`, `fix/`, `docs/`, `refactor/`, `chore/`)

## Screenshots / Logs (se aplicável)

<!-- Cole prints do Postman, Swagger, logs de teste, etc. -->

---

**Para Revisores:**
- Verifique se atende aos critérios de aceite da issue
- Teste localmente se possível
- Aprove se tudo estiver OK
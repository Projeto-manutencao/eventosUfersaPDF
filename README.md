# Projeto Eventos UFERSA

Repositório central do sistema de eventos da UFERSA-PDF

## Tecnologias

- **Backend**: Django 5.0 + Django REST Framework
- **Banco de Dados**: SQLite (dev) / PostgreSQL - Neon/RDS (produção)
- **Deploy**: AWS Amplify + Gunicorn + WhiteNoise

## Pré-requisitos

- Python 3.12+
- pip / venv
- **Nenhum banco de dados local necessário** (usa SQLite)

## Setup Local (Zero Config)

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd eventosUfersaPDF/backend

# 2. Crie e ative o virtualenv
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Instale dependências
pip install -r requirements.txt

# 4. Configure variáveis de ambiente
cp .env.example .env
# Edite .env se necessário (opcional para dev)

# 5. Rode migrações (cria db.sqlite3 automaticamente)
python manage.py migrate

# 6. Crie superusuário (opcional)
python manage.py createsuperuser

# 7. Inicie o servidor
python manage.py runserver
```

A API estará em: `http://localhost:8000/api/`
Admin Django: `http://localhost:8000/admin/`

## Setup com Docker Compose (Opcional - Para Testar PostgreSQL Local)

```bash
cd backend
docker compose up --build
```

> **Nota**: O desenvolvimento padrão usa SQLite. O `docker-compose.yml` sobe PostgreSQL apenas se você quiser testar com o mesmo banco de produção localmente.

## Variáveis de Ambiente

| Variável | Dev (padrão) | Produção (Amplify) |
|----------|--------------|---------------------|
| `DJANGO_SECRET_KEY` | Gerada automaticamente | **Obrigatório** (gere um novo) |
| `DEBUG` | `True` | `False` |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | `seu-app.amplifyapp.com` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | `https://seu-frontend.com` |
| `CSRF_TRUSTED_ORIGINS` | `http://localhost:3000` | `https://seu-frontend.com` |
| `DATABASE_URL` | **Não usado** (usa SQLite) | `postgres://user:pass@host:5432/db?sslmode=require` |

> **Dica**: No Amplify, configure as variáveis no painel **Environment variables**. O `DATABASE_URL` vem do RDS/Neon.

## Estrutura do Projeto

```
backend/
├── manage.py
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── events_api/           # Configuração do projeto Django
│   ├── settings/
│   │   ├── base.py       # Configurações compartilhadas
│   │   ├── dev.py        # Desenvolvimento
│   │   └── prod.py       # Produção
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── events/               # App de eventos
    ├── models.py         # Evento, Inscricao
    ├── views.py          # ViewSets (CRUD)
    ├── serializers.py    # DRF Serializers
    ├── urls.py           # Rotas da API
    └── admin.py          # Admin do Django
```

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/eventos/` | Lista eventos (paginado, busca, ordenação) |
| POST | `/api/eventos/` | Cria evento |
| GET | `/api/eventos/{id}/` | Detalhe do evento |
| PUT/PATCH | `/api/eventos/{id}/` | Atualiza evento |
| DELETE | `/api/eventos/{id}/` | Remove evento |

**Query params úteis:**
- `?search=termo` - busca em titulo, descricao, local, organizador
- `?ativo=true` - filtra por ativo
- `?ordering=-data_inicio` - ordena (prefixo `-` = desc)
- `?page=2&page_size=10` - paginação

## Convenções de Commit

Este projeto adota [Conventional Commits](https://www.conventionalcommits.org/).

**Exemplos:**
```
feat: adiciona endpoint de inscrição em eventos
fix: corrige validação de data fim anterior à data início
docs: atualiza README com setup do Docker
refactor: extrai lógica de busca para service
chore: atualiza dependências do requirements.txt
```

## Fluxo de Trabalho da Equipe (Git & GitHub Issues)

### 1. Pegar uma Issue (Desenvolvedor)

```bash
# 1. Atualize a main
git checkout main
git pull origin main

# 2. Crie branch a partir da main
git checkout -b feat/nome-da-feature  # ou fix/, docs/, refactor/, chore/

# 3. Trabalhe na feature
# ... código ...

# 4. Commits pequenos e claros
git add .
git commit -m "feat: adiciona validação de capacidade no serializer"
```

### 2. Abrir Pull Request

- Push da branch: `git push origin feat/nome-da-feature`
- No GitHub: **Compare & pull request**
- **Title**: segue Conventional Commits (`feat: ...`)
- **Description**: 
  - `Closes #<número-da-issue>` (fecha automaticamente)
  - Resumo do que mudou
  - Como testar localmente
- **Reviewers**: adicione 1-2 colegas
- **Labels**: mantém as da issue

### 3. Code Review (Obrigatório)

- Mínimo **1 aprovação** para merge
- Resolva comentários (*request changes* → *comment resolved*)

### 4. Merge

- **Squash and merge** (histórico limpo)
- Delete branch após merge
- Issue fecha automaticamente

### Checklist Rápido (Cole no PR)

- [ ] Migrações geradas se mudou model (`makemigrations`)
- [ ] Documentação atualizada se mudou API
- [ ] `Closes #issue` na descrição

---

## Frontend (React + Vite)

### Setup Local

```bash
# 1. Entre na pasta do frontend
cd ../frontend  # a partir da raiz do repo

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env  # se existir, ou crie .env com:
# VITE_API_URL=http://localhost:8000/api

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará em: `http://localhost:5173/` (proxy `/api` → `http://localhost:8000/api`)

### Build de Produção

```bash
npm run build
# Gera pasta dist/ otimizada para deploy
```

### Variáveis de Ambiente (Frontend)

| Variável | Dev (padrão) | Produção (Amplify) |
|----------|--------------|---------------------|
| `VITE_API_URL` | `/api` (proxy Vite) | `https://seu-app.amplifyapp.com/api` |

### Estrutura do Frontend

```
frontend/
├── package.json
├── vite.config.js          # Proxy /api → localhost:8000
├── index.html
├── .env.example
├── src/
│   ├── main.jsx           # Entry point
│   ├── App.jsx            # Rotas + Layout principal
│   ├── pages/
│   │   ├── EventosPage.jsx    # CRUD de eventos (admin/user)
│   │   ├── SolicitacaoForm.jsx # Formulário /solicitar (público)
│   │   ├── LoginPage.jsx      # Página /login
│   │   └── SolicitacoesPage.jsx # Admin: gerenciar solicitações
│   ├── auth/
│   │   ├── AuthContext.jsx    # JWT + refresh automático
│   │   └── ProtectedRoute.jsx # Guardas de rota por role
│   └── services/
│       └── api.js            # Axios instance com interceptor JWT
└── public/
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor dev com HMR |
| `npm run build` | Build produção (`dist/`) |
| `npm run preview` | Preview do build local |
| `npm run lint` | ESLint |

---

### Branches Protegidas (Configure em Settings → Branches)

- `main`: **Require PR review**
- Ninguém faz push direto na `main`

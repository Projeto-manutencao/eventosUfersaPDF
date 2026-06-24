# Eventos UFERSA

Sistema web para divulgacao de eventos e registro de solicitacoes de manutencao/melhoria. A aplicacao possui uma area publica para consulta de eventos, cadastro/login de usuario comum para envio de solicitacoes e acesso administrativo para gerenciamento dos eventos e acompanhamento das solicitacoes.

## Funcionalidades

- Listagem publica de eventos.
- Busca, filtro por status e ordenacao de eventos.
- Cadastro e login de usuario comum.
- Login separado para administrador.
- CRUD de eventos restrito a administradores.
- Formulario de solicitacao de manutencao para usuarios autenticados.
- Painel administrativo para listar solicitacoes e atualizar status.
- Envio de e-mail para a equipe quando uma solicitacao e registrada.
- Admin Django para gerenciamento direto dos dados.

## Tecnologias

- Backend: Django 5, Django REST Framework e Simple JWT.
- Frontend: React, Vite e Axios.
- Banco de dados: SQLite.
- Deploy recomendado: EC2 com Gunicorn e Nginx.

## Como Executar Localmente

### Backend

```bash
cd backend
python -m venv venv
```

Ative o ambiente virtual:

```bash
# Linux/Mac
source venv/bin/activate

# Windows PowerShell
venv\Scripts\Activate.ps1
```

Instale as dependencias e prepare o banco:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

O backend ficara disponivel em:

- API: `http://localhost:8000/api/`
- Admin Django: `http://localhost:8000/admin/`

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend ficara disponivel em:

- Aplicacao: `http://localhost:5173/`

Durante o desenvolvimento, o Vite faz proxy de `/api` para `http://localhost:8000`.

## Fluxo de Acesso

### Visitante

- Acessa `/eventos`.
- Visualiza a lista de eventos sem login.
- Ao tentar solicitar manutencao, e direcionado para login/cadastro.

### Usuario Comum

- Acessa `/login`.
- Pode criar uma conta ou entrar com uma conta existente.
- Visualiza eventos.
- Pode enviar solicitacoes em `/solicitar`.
- Nao visualiza botoes administrativos.

### Administrador

- E criado via `python manage.py createsuperuser`.
- Acessa `/admin-login`.
- Pode criar, editar e excluir eventos.
- Pode acessar `/solicitacoes` para acompanhar solicitacoes de manutencao.
- Pode acessar o Django Admin em `/admin/`.

## Rotas Principais

| Rota | Acesso | Descricao |
|------|--------|-----------|
| `/eventos` | Publico | Lista de eventos |
| `/login` | Publico | Login/cadastro de usuario comum |
| `/admin-login` | Publico | Login de administrador |
| `/solicitar` | Usuario autenticado | Formulario de solicitacao |
| `/solicitacoes` | Administrador | Painel de solicitacoes |
| `/admin/` | Administrador | Admin Django |

## Endpoints Principais

| Metodo | Endpoint | Acesso | Descricao |
|--------|----------|--------|-----------|
| `GET` | `/api/eventos/` | Publico | Lista eventos |
| `POST` | `/api/eventos/` | Administrador | Cria evento |
| `PUT/PATCH` | `/api/eventos/{id}/` | Administrador | Atualiza evento |
| `DELETE` | `/api/eventos/{id}/` | Administrador | Remove evento |
| `POST` | `/api/auth/register/` | Publico | Cadastra usuario comum |
| `POST` | `/api/auth/login/` | Publico | Login de usuario comum |
| `POST` | `/api/auth/admin-login/` | Publico | Login de administrador |
| `POST` | `/api/auth/refresh/` | Publico | Renova token JWT |
| `GET` | `/api/auth/me/` | Autenticado | Dados do usuario logado |
| `POST` | `/api/solicitacoes/` | Autenticado | Cria solicitacao |
| `GET` | `/api/solicitacoes/` | Administrador | Lista solicitacoes |
| `PATCH` | `/api/solicitacoes/{id}/` | Administrador | Atualiza status da solicitacao |

## Variaveis de Ambiente

### Backend

Crie um arquivo `.env` dentro de `backend/` quando precisar sobrescrever valores padrao.

```env
DJANGO_SECRET_KEY=sua-chave-secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=sqlite:///db.sqlite3
MANUTENCAO_EMAIL_EQUIPE=suporte.eventosufersa@gmail.com
```

Em producao, use `DEBUG=False` e configure `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` e `CSRF_TRUSTED_ORIGINS` com o IP ou dominio da instancia.

### Frontend

Para producao, crie `frontend/.env.production`:

```env
VITE_API_URL=http://IP_DA_EC2/api
```

## Build

### Backend

```bash
cd backend
python manage.py check
python manage.py migrate --noinput
python manage.py collectstatic --noinput
```

### Frontend

```bash
cd frontend
npm run build
```

O build do frontend sera gerado em `frontend/dist/`.

## Estrutura do Projeto

```text
backend/
  accounts/        # Autenticacao, cadastro e perfis
  events/          # Eventos e solicitacoes
  events_api/      # Configuracoes Django
  manage.py
  requirements.txt

frontend/
  src/
    auth/          # Contexto de autenticacao e rotas protegidas
    pages/         # Telas da aplicacao
    services/      # Cliente Axios
  package.json
  vite.config.js
```

## Validacao Recomendada

Antes de publicar uma nova versao:

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run

cd ../frontend
npm run build
```

## Observacoes

- O SQLite e suficiente para a proposta atual e para um deploy simples em EC2.
- Para uso com maior volume de dados ou multiplas instancias, recomenda-se migrar para PostgreSQL.
- O administrador principal deve ser criado pelo comando `createsuperuser`.

# ADEGA GS - Sistema de Gestão e E-commerce

Sistema completo para gerenciamento de adega com painel administrativo, controle de estoque, ponto de venda (POS) e e-commerce integrado com pagamentos via Mercado Pago.

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Funcionalidades](#funcionalidades)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [API Endpoints](#api-endpoints)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Troubleshooting](#troubleshooting)

## 🏗️ Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Backend (Laravel 10)
- API RESTful
- Autenticação com Laravel Sanctum
- Gestão de produtos, categorias e estoque
- Sistema de pedidos e pagamentos
- Integração com Mercado Pago (em desenvolvimento)
- Controle de usuários e permissões

### Frontend (Angular 17)
- Interface de e-commerce moderna (inspirada em Zé Delivery)
- Sistema de carrinho de compras dinâmico
- Autenticação e gestão de perfil
- Checkout com múltiplas formas de pagamento
- Interface responsiva e intuitiva
- Painel administrativo (em desenvolvimento)

## 💻 Requisitos

### Backend
- **PHP**: 8.1 ou superior
- **Composer**: 2.x
- **MySQL**: 8.0+ ou **MariaDB**: 10.3+
- **Laravel**: 10.x
- **Extensões PHP**:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath

### Frontend
- **Node.js**: 18.x ou superior
- **NPM**: 9.x ou superior
- **Angular CLI**: 17.x
- **Navegador**: Chrome, Firefox, Edge ou Safari (versões recentes)

## 📦 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/adega.git
cd adega
```

### 2. Configuração do Backend

```bash
# Entre na pasta backend
cd backend

# Instale as dependências do Composer
composer install

# Copie o arquivo de configuração
cp .env.example .env

# Gere a chave da aplicação
php artisan key:generate

# Configure o banco de dados no arquivo .env
# Edite as seguintes variáveis:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=adega_gs
# DB_USERNAME=seu_usuario
# DB_PASSWORD=sua_senha

# Execute as migrations
php artisan migrate

# Execute os seeders para popular o banco
php artisan db:seed

# Limpe o cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 3. Configuração do Frontend

```bash
# Entre na pasta frontend (a partir da raiz do projeto)
cd frontend

# Instale as dependências do NPM
npm install

# Se necessário, instale o Angular CLI globalmente
npm install -g @angular/cli
```

## ⚙️ Configuração

### Backend (.env)

Edite o arquivo `backend/.env` com as seguintes configurações:

```env
APP_NAME="ADEGA GS"
APP_ENV=local
APP_KEY=base64:... (gerado automaticamente)
APP_DEBUG=true
APP_URL=http://localhost:8000

# Banco de Dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=adega_gs
DB_USERNAME=root
DB_PASSWORD=

# CORS (permitir requisições do frontend)
SANCTUM_STATEFUL_DOMAINS=localhost:4200
SESSION_DOMAIN=localhost

# Mercado Pago (adicione suas credenciais)
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
```

### Frontend (environment.ts)

O arquivo `frontend/src/environments/environment.ts` já está configurado:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## 🚀 Execução

### Iniciar o Backend

```bash
cd backend
php artisan serve
```

O servidor estará disponível em: `http://localhost:8000`

### Iniciar o Frontend

Em outro terminal:

```bash
cd frontend
ng serve
```

A aplicação estará disponível em: `http://localhost:4200`

## ✨ Funcionalidades

### Implementadas

#### Backend
- ✅ API RESTful completa
- ✅ Autenticação com Sanctum (registro, login, logout)
- ✅ CRUD de Produtos
- ✅ CRUD de Categorias
- ✅ Sistema de Pedidos
- ✅ Controle de Estoque
- ✅ Validações e tratamento de erros
- ✅ Middleware de autenticação
- ✅ Soft Deletes

#### Frontend
- ✅ Página inicial com produtos em destaque
- ✅ Listagem de produtos com filtros
- ✅ Sistema de busca
- ✅ Carrinho de compras lateral dinâmico
- ✅ Autenticação (login e registro)
- ✅ Página de checkout com formulário de entrega
- ✅ Seleção de forma de pagamento (PIX, Dinheiro, Cartão)
- ✅ Header responsivo estilo Zé Delivery
- ✅ Persistência do carrinho no localStorage
- ✅ Guards de autenticação
- ✅ Interceptor HTTP para tokens
- ✅ Feedback visual de ações

### Em Desenvolvimento
- 🔄 Integração com Mercado Pago
- 🔄 Painel Administrativo
- 🔄 Relatórios e Dashboard
- 🔄 Sistema de notificações
- 🔄 Acompanhamento de pedidos em tempo real
- 🔄 Impressão de notas

## 📁 Estrutura de Diretórios

```
adega/
├── backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/       # Controllers da API
│   │   │   └── Middleware/
│   │   └── Models/            # Models Eloquent
│   ├── database/
│   │   ├── migrations/        # Migrations do banco
│   │   ├── seeders/          # Seeders
│   │   └── factories/        # Factories
│   ├── routes/
│   │   └── api.php           # Rotas da API
│   └── storage/
│       └── app/
│           └── public/
│               └── images/    # Imagens dos produtos
│
├── frontend/                  # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/         # Módulo de autenticação
│   │   │   ├── checkout/     # Módulo de checkout
│   │   │   ├── core/         # Serviços, guards, interceptors
│   │   │   ├── home/         # Página inicial
│   │   │   ├── products/     # Listagem de produtos
│   │   │   └── shared/       # Componentes compartilhados
│   │   ├── assets/
│   │   │   └── images/       # Imagens estáticas
│   │   └── environments/     # Configurações de ambiente
│   └── angular.json
│
└── README.md
```

## 🔌 API Endpoints

### Rotas Públicas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/register` | Registrar novo usuário |
| POST | `/api/login` | Fazer login |
| GET | `/api/products` | Listar produtos |
| GET | `/api/products/{id}` | Detalhes do produto |
| GET | `/api/categories` | Listar categorias |
| GET | `/api/categories/{id}` | Detalhes da categoria |

### Rotas Protegidas (Requerem Autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/logout` | Fazer logout |
| GET | `/api/user` | Obter dados do usuário |
| GET | `/api/orders` | Listar pedidos do usuário |
| POST | `/api/orders` | Criar novo pedido |
| GET | `/api/orders/{id}` | Detalhes do pedido |
| PATCH | `/api/orders/{id}/status` | Atualizar status do pedido |

### Rotas Administrativas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/products` | Criar produto |
| PUT | `/api/products/{id}` | Atualizar produto |
| DELETE | `/api/products/{id}` | Deletar produto |
| POST | `/api/categories` | Criar categoria |
| PUT | `/api/categories/{id}` | Atualizar categoria |
| DELETE | `/api/categories/{id}` | Deletar categoria |

## 🛠️ Tecnologias Utilizadas

### Backend
- **Laravel 10** - Framework PHP
- **Laravel Sanctum** - Autenticação de API
- **MySQL** - Banco de dados
- **Eloquent ORM** - Mapeamento objeto-relacional
- **Laravel Validation** - Validação de dados

### Frontend
- **Angular 17** - Framework TypeScript
- **Angular Material** - Biblioteca de componentes UI
- **RxJS** - Programação reativa
- **TypeScript** - Superset JavaScript
- **SCSS** - Pré-processador CSS
- **HttpClient** - Cliente HTTP

## 🐛 Troubleshooting

### Problema: Erro 500 ao acessar produtos ou categorias

**Solução:**
```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Problema: Erro 404 nas rotas da API

**Solução:**
Verifique se o servidor Laravel está rodando em `http://localhost:8000`

### Problema: CORS Error no frontend

**Solução:**
Adicione no `backend/config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:4200'],
```

### Problema: Token não está sendo enviado nas requisições

**Solução:**
Verifique se o interceptor está registrado em `frontend/src/app/app.config.ts`

### Problema: Produtos não aparecem no frontend

**Solução:**
1. Verifique se o seeder foi executado: `php artisan db:seed`
2. Verifique se há dados no banco: acesse `http://localhost:8000/api/products`
3. Verifique o console do navegador para erros

### Problema: Imagens dos produtos não carregam

**Solução:**
1. Crie o link simbólico: `php artisan storage:link`
2. Coloque uma imagem padrão em: `backend/storage/app/public/images/no-image.jpg`

### Problema: Erro ao fazer login/logout

**Solução:**
1. Limpe o cache do navegador
2. Verifique se o token está sendo salvo no localStorage
3. Verifique se o Sanctum está configurado corretamente no `.env`

## 📝 Notas Importantes

1. **Banco de Dados**: Certifique-se de criar o banco de dados `adega_gs` antes de rodar as migrations
2. **Seeders**: Os seeders populam o banco com dados de exemplo (produtos, categorias, usuários)
3. **Imagens**: Coloque as imagens dos produtos em `backend/storage/app/public/images/`
4. **CORS**: O backend está configurado para aceitar requisições do frontend em `localhost:4200`
5. **Autenticação**: Use o Sanctum para autenticação de API (tokens Bearer)

## 📄 Licença

Este projeto é privado e de uso interno.

## 👥 Contribuidores

- Desenvolvedor Principal: [Seu Nome]

## 📞 Suporte

Para dúvidas ou problemas, entre em contato através do email: seu-email@example.com

---

**Última atualização**: Outubro 2024

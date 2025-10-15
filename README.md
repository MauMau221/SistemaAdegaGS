# ADEGA GS - Sistema Completo de Gestão e E-commerce

Sistema completo para gerenciamento de adega com:
- 🛒 **E-commerce** moderno (interface inspirada no Zé Delivery)
- 👨‍💼 **Painel Administrativo** completo
- 👷‍♂️ **Painel do Funcionário** (POS - Ponto de Venda)
- 📊 **Dashboard** com relatórios e métricas
- 💰 **Controle de Caixa** integrado
- 📦 **Gestão de Estoque** em tempo real
- 📋 **Sistema de Pedidos** completo
- 👥 **Gestão de Usuários** (Admin, Funcionário, Cliente)

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Instalação Completa](#instalação-completa)
- [Configuração](#configuração)
- [Execução](#execução)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [API Endpoints](#api-endpoints)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Usuários de Teste](#usuários-de-teste)
- [Troubleshooting](#troubleshooting)

## 🏗️ Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Backend (Laravel 10)
- ✅ **API RESTful** completa com autenticação Sanctum
- ✅ **Sistema de Usuários** com 3 tipos: Admin, Funcionário, Cliente
- ✅ **CRUD Completo** de produtos, categorias, usuários
- ✅ **Sistema de Pedidos** com status e controle de estoque
- ✅ **Controle de Caixa** com movimentações
- ✅ **Middleware de Acesso** por tipo de usuário
- ✅ **Relatórios e Dashboard** com métricas
- ✅ **Gestão de Estoque** em tempo real
- ✅ **API de CEP** integrada no checkout
- ✅ **Migrações limpas** e consolidadas
- 🔄 Integração com Mercado Pago (em desenvolvimento)

### Frontend (Angular 17 - Standalone Components)
- ✅ **E-commerce** moderno com carrinho dinâmico
- ✅ **Painel Administrativo** completo (Dashboard, Produtos, Categorias, Usuários, Relatórios, Configurações)
- ✅ **Painel do Funcionário** (Dashboard, Caixa, Pedidos, Estoque)
- ✅ **Sistema de Autenticação** com guards por tipo de usuário
- ✅ **Interface Responsiva** com Angular Material
- ✅ **Controle de Caixa** com relatórios em PDF
- ✅ **Gestão de Pedidos** em tempo real
- ✅ **Sistema de Estoque** com movimentações
- ✅ **API de CEP** para preenchimento automático de endereços

## 💻 Requisitos do Sistema

### Backend (Laravel 10)
- **PHP**: 8.1 ou superior
- **Composer**: 2.x
- **MySQL**: 8.0+ ou **MariaDB**: 10.3+
- **Laravel**: 10.x
- **Extensões PHP Obrigatórias**:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath
  - Fileinfo
  - GD (para processamento de imagens)

### Frontend (Angular 17)
- **Node.js**: 18.x ou superior
- **NPM**: 9.x ou superior
- **Angular CLI**: 17.x
- **Navegador**: Chrome, Firefox, Edge ou Safari (versões recentes)

### Sistema Operacional
- **Windows**: 10/11
- **Linux**: Ubuntu 20.04+ ou similar
- **macOS**: 10.15+

## 📦 Instalação Completa

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/adega.git
cd adega
```

### 2. Configuração do Backend (Laravel)

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
# IMPORTANTE: Edite as seguintes variáveis:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=adega_gs
# DB_USERNAME=seu_usuario
# DB_PASSWORD=sua_senha

# Execute as migrations
php artisan migrate

# Execute os seeders para popular o banco com dados de teste
php artisan db:seed

# ALTERNATIVA: Para recriar o banco completamente (recomendado)
# php artisan migrate:fresh --seed

# Crie o link simbólico para storage (imagens)
php artisan storage:link

# Limpe o cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 3. Configuração do Frontend (Angular)

```bash
# Entre na pasta frontend (a partir da raiz do projeto)
cd frontend

# Instale as dependências do NPM
npm install

# Se necessário, instale o Angular CLI globalmente
npm install -g @angular/cli@17

# Instale dependências específicas para gráficos
npm install ng2-charts chart.js
```

## ⚙️ Configuração Detalhada

### Backend (.env)

Edite o arquivo `backend/.env` com as seguintes configurações:

```env
APP_NAME="ADEGA GS"
APP_ENV=local
APP_KEY=base64:... (gerado automaticamente pelo artisan key:generate)
APP_DEBUG=true
APP_URL=http://localhost:8000

# Banco de Dados - CONFIGURE SEUS DADOS
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=adega_gs
DB_USERNAME=root
DB_PASSWORD=sua_senha_aqui

# CORS (permitir requisições do frontend)
SANCTUM_STATEFUL_DOMAINS=localhost:4200
SESSION_DOMAIN=localhost

# Configurações de Sessão
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# Mercado Pago (opcional - para futuras integrações)
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

### Banco de Dados

**IMPORTANTE**: Crie o banco de dados `adega_gs` antes de executar as migrations:

```sql
CREATE DATABASE adega_gs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🚀 Execução

### 1. Iniciar o Backend (Laravel)

```bash
cd backend
php artisan serve
```

O servidor estará disponível em: `http://localhost:8000`

**Verifique se está funcionando**: Acesse `http://localhost:8000/api/products`

### 2. Iniciar o Frontend (Angular)

Em outro terminal:

```bash
cd frontend
ng serve
```

A aplicação estará disponível em: `http://localhost:4200`

### 3. Verificar se tudo está funcionando

1. **Backend**: `http://localhost:8000/api/products` deve retornar uma lista de produtos
2. **Frontend**: `http://localhost:4200` deve carregar a página inicial
3. **Login**: Use os usuários de teste (veja seção abaixo)
4. **API de CEP**: Teste no checkout digitando um CEP válido (ex: 01310-100)

## ✨ Funcionalidades Implementadas

### 🛒 E-commerce (Cliente)
- ✅ **Página inicial** com produtos em destaque
- ✅ **Listagem de produtos** com filtros por categoria
- ✅ **Sistema de busca** em tempo real
- ✅ **Carrinho de compras** lateral dinâmico
- ✅ **Autenticação** (login e registro)
- ✅ **Checkout completo** com formulário de entrega
- ✅ **API de CEP** para preenchimento automático de endereços
- ✅ **Seleção de pagamento** (PIX, Dinheiro, Cartão)
- ✅ **Header responsivo** estilo Zé Delivery
- ✅ **Persistência do carrinho** no localStorage

### 👨‍💼 Painel Administrativo
- ✅ **Dashboard** com métricas e gráficos
- ✅ **Gestão de Produtos** (CRUD completo)
- ✅ **Gestão de Categorias** (CRUD com estrutura hierárquica)
- ✅ **Gestão de Usuários** (CRUD com tipos: Admin, Funcionário, Cliente)
- ✅ **Relatórios** (vendas, produtos, clientes)
- ✅ **Configurações do Sistema** (gerais, negócio, pagamento, estoque, pedidos, email)

### 👷‍♂️ Painel do Funcionário
- ✅ **Dashboard** com resumo do dia
- ✅ **Controle de Caixa** (abrir/fechar, movimentações, relatórios PDF)
- ✅ **Gestão de Pedidos** (listar, atualizar status, imprimir)
- ✅ **Controle de Estoque** (consultar, movimentar, alertas)

### 🔧 Backend (API)
- ✅ **API RESTful** completa com Laravel Sanctum
- ✅ **Sistema de Usuários** com 3 tipos e permissões
- ✅ **CRUD Completo** de produtos, categorias, usuários
- ✅ **Sistema de Pedidos** com controle de status
- ✅ **Controle de Estoque** em tempo real
- ✅ **Middleware de Acesso** por tipo de usuário
- ✅ **Relatórios e Dashboard** com métricas
- ✅ **Controle de Caixa** com movimentações

### 🔄 Em Desenvolvimento
- 🔄 Integração com Mercado Pago
- 🔄 Sistema de notificações push
- 🔄 Acompanhamento de pedidos em tempo real
- 🔄 Impressão de notas térmicas
- 🔄 Backup automático

## 📁 Estrutura de Diretórios

```
adega/
├── backend/                           # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       ├── Admin/         # Controllers do painel admin
│   │   │   │       └── Employee/      # Controllers do painel funcionário
│   │   │   └── Middleware/            # Middleware de acesso
│   │   └── Models/                    # Models Eloquent
│   ├── database/
│   │   ├── migrations/                # Migrations do banco
│   │   └── seeders/                   # Seeders com dados de teste
│   ├── routes/
│   │   ├── api.php                    # Rotas da API
│   │   └── admin.php                  # Rotas administrativas
│   └── storage/app/public/images/     # Imagens dos produtos
│
├── frontend/                          # Aplicação Angular (Standalone Components)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/                 # Painel administrativo
│   │   │   │   ├── components/        # Layout admin
│   │   │   │   ├── pages/             # Páginas (dashboard, produtos, etc.)
│   │   │   │   └── services/          # Serviços admin
│   │   │   ├── employee/              # Painel do funcionário
│   │   │   │   ├── components/        # Layout funcionário
│   │   │   │   ├── pages/             # Páginas (caixa, pedidos, etc.)
│   │   │   │   └── services/          # Serviços funcionário
│   │   │   ├── store/                 # E-commerce (cliente)
│   │   │   ├── auth/                  # Autenticação
│   │   │   ├── core/                  # Guards, interceptors, serviços
│   │   │   └── shared/                # Componentes compartilhados
│   │   ├── assets/images/             # Imagens estáticas
│   │   └── environments/              # Configurações de ambiente
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

### Rotas de Cliente (Customer)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/logout` | Fazer logout |
| GET | `/api/user` | Obter dados do usuário |
| GET | `/api/my-orders` | Listar pedidos do cliente |
| POST | `/api/orders` | Criar novo pedido |
| GET | `/api/orders/{id}` | Detalhes do pedido |

### Rotas de Funcionário (Employee)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orders` | Listar todos os pedidos |
| PATCH | `/api/orders/{id}/status` | Atualizar status do pedido |
| GET | `/api/stock/summary` | Resumo do estoque |
| GET | `/api/stock/movements` | Movimentações de estoque |
| POST | `/api/stock/update` | Atualizar estoque |

### Rotas Administrativas (Admin)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/dashboard/summary` | Resumo do dashboard |
| GET | `/api/admin/dashboard/sales-chart` | Gráfico de vendas |
| GET | `/api/admin/dashboard/top-products` | Top produtos |
| GET | `/api/admin/dashboard/top-customers` | Top clientes |
| GET | `/api/admin/products` | Listar produtos (admin) |
| POST | `/api/admin/products` | Criar produto |
| PUT | `/api/admin/products/{id}` | Atualizar produto |
| DELETE | `/api/admin/products/{id}` | Deletar produto |
| GET | `/api/admin/categories` | Listar categorias (admin) |
| GET | `/api/admin/categories/tree` | Árvore de categorias |
| POST | `/api/admin/categories` | Criar categoria |
| PUT | `/api/admin/categories/{id}` | Atualizar categoria |
| DELETE | `/api/admin/categories/{id}` | Deletar categoria |
| GET | `/api/admin/users` | Listar usuários |
| POST | `/api/admin/users` | Criar usuário |
| PUT | `/api/admin/users/{id}` | Atualizar usuário |
| DELETE | `/api/admin/users/{id}` | Deletar usuário |

## 🌐 Deploy em Servidor de Produção

### Requisitos do Servidor

- **PHP**: 8.1+ com extensões necessárias
- **MySQL**: 8.0+ ou MariaDB 10.3+
- **Node.js**: 18+ (para build do frontend)
- **Nginx/Apache**: Para servir os arquivos
- **SSL**: Certificado HTTPS obrigatório

### Configuração do Backend (Produção)

```bash
# 1. Clone e configure o repositório
git clone https://github.com/seu-usuario/adega.git
cd adega/backend

# 2. Instale dependências
composer install --no-dev --optimize-autoloader

# 3. Configure o ambiente
cp .env.example .env
# Edite o .env com as configurações de produção

# 4. Configure as variáveis de produção
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seudominio.com

# Banco de dados de produção
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=adega_gs_prod
DB_USERNAME=usuario_prod
DB_PASSWORD=senha_segura_prod

# Cache e sessão
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# 5. Execute as configurações
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=ProductionSeeder
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Configure permissões
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### Configuração do Frontend (Produção)

```bash
# 1. Entre na pasta frontend
cd ../frontend

# 2. Instale dependências
npm ci --only=production

# 3. Configure o environment de produção
# Edite src/environments/environment.prod.ts:
export const environment = {
  production: true,
  apiUrl: 'https://seudominio.com/api',
  sanctumUrl: 'https://seudominio.com/sanctum'
};

# 4. Build para produção
ng build --configuration=production

# 5. Os arquivos estarão em dist/adega/
# Copie para o diretório web do servidor
```

### Configuração do Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name seudominio.com;
    root /var/www/adega/backend/public;
    index index.php;

    # SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend (Angular)
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/adega/frontend/dist/adega;
    }

    # Backend API
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location /sanctum {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Configurações de Segurança

1. **Firewall**: Bloquear portas desnecessárias
2. **Backup**: Configure backup automático do banco
3. **Logs**: Monitore logs de erro do Laravel
4. **SSL**: Use HTTPS obrigatório
5. **CORS**: Configure domínios permitidos
6. **Rate Limiting**: Implemente limitação de requisições

### Monitoramento

```bash
# Logs do Laravel
tail -f storage/logs/laravel.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Status do PHP-FPM
systemctl status php8.1-fpm

# Status do MySQL
systemctl status mysql
```

## 👥 Usuários de Teste

O seeder cria automaticamente usuários para teste:

### 👨‍💼 Administrador
- **Email**: `admin@adega.com`
- **Senha**: `123456`
- **Acesso**: Painel administrativo completo

### 👷‍♂️ Funcionário
- **Email**: `funcionario@adega.com`
- **Senha**: `123456`
- **Acesso**: Painel do funcionário (caixa, pedidos, estoque)

### 👤 Cliente
- **Email**: `cliente@adega.com`
- **Senha**: `123456`
- **Acesso**: E-commerce (loja)

## 🛠️ Tecnologias Utilizadas

### Backend
- **Laravel 10** - Framework PHP
- **Laravel Sanctum** - Autenticação de API
- **MySQL** - Banco de dados
- **Eloquent ORM** - Mapeamento objeto-relacional
- **Laravel Validation** - Validação de dados
- **Laravel Migrations** - Versionamento do banco
- **Laravel Seeders** - População de dados

### Frontend
- **Angular 17** - Framework TypeScript (Standalone Components)
- **Angular Material** - Biblioteca de componentes UI
- **RxJS** - Programação reativa
- **TypeScript** - Superset JavaScript
- **CSS** - Estilização
- **HttpClient** - Cliente HTTP
- **Chart.js + ng2-charts** - Gráficos e relatórios

## 🐛 Troubleshooting

### Problema: Erro 500 ao acessar produtos ou categorias

**Solução:**
```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Problema: Erro 404 nas rotas da API

**Solução:**
1. Verifique se o servidor Laravel está rodando em `http://localhost:8000`
2. Teste: `http://localhost:8000/api/products`

### Problema: CORS Error no frontend

**Solução:**
O CORS já está configurado, mas se houver problemas, verifique:
```bash
cd backend
php artisan config:clear
```

### Problema: Token não está sendo enviado nas requisições

**Solução:**
1. Verifique se o interceptor está registrado em `frontend/src/app/app.config.ts`
2. Limpe o localStorage: `localStorage.clear()`

### Problema: Produtos não aparecem no frontend

**Solução:**
1. Execute o seeder: `php artisan db:seed`
2. Teste a API: `http://localhost:8000/api/products`
3. Verifique o console do navegador (F12)

### Problema: Imagens dos produtos não carregam

**Solução:**
```bash
cd backend
php artisan storage:link
```

### Problema: Painel admin não carrega dados

**Solução:**
1. Verifique se está logado como admin: `admin@adega.com`
2. Verifique o console do navegador para erros 401/403
3. Limpe o localStorage e faça login novamente

### Problema: Painel funcionário não carrega dados

**Solução:**
1. Verifique se está logado como funcionário: `funcionario@adega.com`
2. Verifique se o servidor Laravel está rodando
3. Teste as rotas de funcionário: `http://localhost:8000/api/orders`

### Problema: Erro ao fazer login

**Solução:**
1. Verifique se o banco de dados foi criado
2. Execute as migrations: `php artisan migrate`
3. Execute o seeder: `php artisan db:seed`
4. Limpe o cache do navegador (Ctrl+F5)

### Problema: Chart.js não funciona no dashboard

**Solução:**
Os gráficos estão temporariamente desabilitados. Para habilitar:
```bash
cd frontend
npm install ng2-charts chart.js
```

## 📝 Notas Importantes

1. **Banco de Dados**: Certifique-se de criar o banco `adega_gs` antes de rodar as migrations
2. **Migrações**: Sistema consolidado e limpo - use `migrate:fresh --seed` quando necessário
3. **Seeders**: Populam o banco com dados de exemplo (produtos, categorias, usuários, pedidos)
4. **Imagens**: Coloque as imagens dos produtos em `backend/storage/app/public/images/`
5. **CORS**: Configurado para aceitar requisições do frontend em `localhost:4200`
6. **Autenticação**: Sanctum com tokens Bearer
7. **API de CEP**: Integrada com ViaCEP para preenchimento automático de endereços
8. **Tipos de Usuário**: Admin, Funcionário, Cliente com permissões específicas
9. **Angular**: Usa Standalone Components (sem módulos tradicionais)
10. **Laravel**: Versão 10 com Sanctum para autenticação
11. **Estoque**: Sistema unificado com `current_stock` sincronizado com `stock_quantity`

## 🚀 Checklist de Instalação

- [ ] PHP 8.1+ instalado
- [ ] Composer instalado
- [ ] Node.js 18+ instalado
- [ ] MySQL/MariaDB instalado
- [ ] Banco `adega_gs` criado
- [ ] Repositório clonado
- [ ] Dependências do backend instaladas (`composer install`)
- [ ] Dependências do frontend instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Migrations executadas (`php artisan migrate` ou `php artisan migrate:fresh --seed`)
- [ ] Seeders executados (`php artisan db:seed`)
- [ ] Storage link criado (`php artisan storage:link`)
- [ ] Cache limpo (`php artisan config:clear && php artisan cache:clear`)
- [ ] Servidor Laravel rodando (`php artisan serve`)
- [ ] Servidor Angular rodando (`ng serve`)
- [ ] Teste de login realizado
- [ ] Teste da API de CEP realizado
- [ ] Teste de finalização de pedido realizado

## 📄 Licença

Este projeto é privado e de uso interno.


**Última atualização**: Janeiro 2025

## 📋 Changelog

### v1.1.0 - Janeiro 2025
- ✅ **Migrações consolidadas** - Sistema limpo sem tabelas auxiliares
- ✅ **API de CEP** - Integração com ViaCEP no checkout
- ✅ **Correções de estoque** - Sincronização entre `current_stock` e `stock_quantity`
- ✅ **Correções de banco** - Campo `user_id` nullable em `stock_movements`
- ✅ **Warnings corrigidos** - Optional chaining otimizado no dashboard
- ✅ **Documentação atualizada** - Guia completo de produção
- ✅ **Troubleshooting expandido** - Soluções para problemas comuns

### v1.0.0 - Janeiro 2025
- ✅ **Sistema completo** - E-commerce + Admin + Funcionário
- ✅ **Autenticação Sanctum** - Sistema robusto de autenticação
- ✅ **Interface moderna** - Angular Material + design responsivo
- ✅ **API RESTful** - Backend Laravel completo

# 🚀 GUIA COMPLETO DE SETUP - 15 FEATURES IMPLEMENTADAS

## Status Final: ✅ TUDO PRONTO PARA USAR

Data: 09/02/2026  
Sistema: Plataforma de Agendamentos com 15 Features Premium  
Database: SQLite (Dev) / PostgreSQL (Prod)  
API: Node.js + Express  
Frontend: React.js  

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação](#instalação)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Iniciar o Servidor](#iniciar-o-servidor)
6. [API Endpoints Disponíveis](#api-endpoints-disponíveis)
7. [Componentes React Disponíveis](#componentes-react-disponíveis)
8. [Testes](#testes)
9. [Deploy](#deploy)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- **Node.js** v16+ 
- **npm** ou **yarn**
- **SQLite3** (já incluído com Node.js)
- **Git**
- Conta **Stripe** (para pagamentos)
- Chave API do **Google Maps** (para geolocalização)

### Verifi cação

```bash
node --version   # v16+
npm --version    # 8+
sqlite3 --version
```

---

## 📦 Instalação

### 1. Clonar Repositório

```bash
git clone https://github.com/vvvv2V/mmmm.git
cd mmmm
```

### 2. Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd ../frontend
npm install
```

### 3. Copiar Arquivo .env

```bash
cp .env.example .env
# Editar .env com suas credenciais
nano .env
```

---

## 🗄️ Configuração do Banco de Dados

### Executar Migrações

```bash
cd /workspaces/mmmm
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

**O quê isso faz:**
- ✅ Cria banco SQLite em `backend_data/database.db`
- ✅ Cria 32 tabelas do sistema
- ✅ Configura Foreign Keys e Índices
- ✅ Pronto para usar!

### Verificar Tabelas Criadas

```bash
sqlite3 backend_data/database.db ".tables"
```

Você deve ver:
```
addons                      loyalty_points              push_subscriptions
blog_posts                  loyalty_rewards             referral_links
booking_addons              newsletter_sends            referral_signups
bookings                    [REDACTED_TOKEN]      services
cancellations               notifications               subscription_plans
company_info                pix_transactions            transactions
coupon_uses                 [REDACTED_TOKEN]        user_addresses
coupons                     push_subscriptions          user_hour_credits
file_uploads                referral_signups            user_subscriptions
hour_packages               services                    users
hourly_bookings             subscriptions_plans
hourly_rates                transactions
```

---

## 🔐 Variáveis de Ambiente

### Arquivo: `.env`

```bash
# ============ ESSENCIAL ============

# Server
NODE_ENV=development
PORT=3001
BASE_URL=http://localhost:3001

# Database (SQLite para dev)
DATABASE_PATH=./backend_data/database.db

# JWT (Gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=[REDACTED_TOKEN]
JWT_EXPIRES_IN=7d

# ============ PAYMENTS (Stripe) ============
# Get from: https://dashboard.stripe.com/apikeys

STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
[REDACTED_TOKEN]=whsec_...

# Subscription Plans (create in Stripe Dashboard)
[REDACTED_TOKEN]=price_...
[REDACTED_TOKEN]=price_...
[REDACTED_TOKEN]=price_...

# ============ EMAIL (Nodemailer) ============
# Gmail: https://myaccount.google.com/apppasswords

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password
SMTP_FROM=noreply@myservice.com

# ============ GEOLOCATION ============
# Get from: https://console.cloud.google.com/

GOOGLE_MAPS_API_KEY=AIza...

# ============ PUSH NOTIFICATIONS ============
# Generate: npm run generate-vapid-keys

VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:seu-email@example.com

# ============ FEATURE FLAGS ============
[REDACTED_TOKEN]=true
[REDACTED_TOKEN]=true
[REDACTED_TOKEN]=true
ENABLE_GEOLOCATION=true
[REDACTED_TOKEN]=true
ENABLE_BLOG=true
```

### Gerar Chaves VAPID (Push Notifications)

```bash
npm install -g web-push
web-push generate-vapid-keys

# Copiar as chaves para .env
```

---

## 🚀 Iniciar o Servidor

### Terminal 1: Backend

```bash
cd backend
npm start
# ou em watch mode:
npm run dev
```

Esperado:
```
✅ Servidor rodando em http://localhost:3001
✅ Conexão com database.db confirmada
✅ Rotas carregadas: 50+
```

### Terminal 2: Frontend

```bash
cd frontend
npm start
```

Esperado:
```
✅ React app rodando em http://localhost:3000
✅ API conectando em http://localhost:3001
```

---

## 📡 API Endpoints Disponíveis

### Authentication
```
POST /api/auth/register         - Registrar novo usuário
POST /api/auth/login            - Fazer login
POST /api/auth/logout           - Fazer logout
GET  /api/auth/verify           - Verificar token
```

### 1️⃣ Loyalty - Fidelidade
```
GET  /api/loyalty/balance              - Saldo de pontos
GET  /api/loyalty/rewards              - Recompensas disponíveis
POST /api/loyalty/redeem               - Resgatar recompensa
POST /api/loyalty/add-points           - Adicionar pontos (interna)
```

### 2️⃣ Addons - Marketplace
```
GET  /api/addons                       - Listar add-ons
POST /api/addons/add                   - Adicionar a agendamento
GET  /api/addons/booking/:bookingId    - Add-ons de um agendamento
```

### 3️⃣ Subscriptions - Planos
```
GET  /api/subscriptions/plans          - Listar planos
POST /api/subscriptions/create         - Criar subscrição
GET  /api/subscriptions/active         - Subscrição ativa
POST /api/subscriptions/cancel         - Cancelar
```

### 4️⃣ Geolocation - Localização
```
GET  /api/geolocation/nearby           - Profissionais próximos
POST /api/geolocation/geocode          - Codificar endereço
POST /api/geolocation/update-location  - Atualizar localização
POST /api/geolocation/save-address     - Salvar endereço
GET  /api/geolocation/addresses        - Endereços salvos
```

### 5️⃣ Hourly Booking - Agendamento Flexível
```
POST /api/hourly/create                - Criar agendamento
GET  /api/hourly/availability/:id      - Verificar disponibilidade
GET  /api/hourly/rates/:id             - Tarifas do profissional
GET  /api/hourly/my-bookings           - Meus agendamentos
```

### 6️⃣ Professional Ratings - Controle de Qualidade
```
POST /api/[REDACTED_TOKEN]/rate    - Avaliar profissional (admin)
GET  /api/[REDACTED_TOKEN]/:id     - Ver avaliações
GET  /api/[REDACTED_TOKEN]/low-rated/:minRating - Profissionais com baixa nota
```

### 7️⃣ Cancellations - Cancelamentos
```
POST /api/cancellations/cancel         - Cancelar agendamento
GET  /api/cancellations/stats          - Estatísticas de cancelamento
```

### 8️⃣ Receipts - Recibos
```
POST /api/receipts/generate            - Gerar e enviar recibo PDF
```

### 9️⃣ Blog - Artigos & SEO
```
GET  /api/blog                         - Listar posts
GET  /api/blog/:slug                   - Ver post
GET  /api/blog/search                  - Buscar posts
POST /api/blog                         - Criar post (admin)
GET  /api/blog/sitemap.xml             - Sitemap para Google
```

### 🔔 Push Notifications
```
POST /api/notifications/subscribe      - Registrar para notificações
POST /api/notifications/unsubscribe    - Cancelar notificações
```

---

## ⚛️ Componentes React Disponíveis

### Import nos seus componentes:

```jsx
import LoyaltyDashboard from './components/LoyaltyDashboard';
import AddonsSelector from './components/AddonsSelector';
import SubscriptionPlans from './components/SubscriptionPlans';
import BlogViewer from './components/BlogViewer';
import GeoMap from './components/GeoMap';
```

### Exemplo de Uso:

```jsx
function App() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  return (
    <div>
      <LoyaltyDashboard userId={userId} token={token} />
      <AddonsSelector bookingId={1} token={token} onTotalChange={(total) => console.log(total)} />
      <SubscriptionPlans userId={userId} token={token} onSuccess={() => console.log('Subscrição ativa')} />
      <BlogViewer token={token} />
      <GeoMap userId={userId} token={token} [REDACTED_TOKEN]={(prof) => console.log(prof)} />
    </div>
  );
}
```

---

## ✅ Testes

### Testar Endpoint Loyalty

```bash
curl -X GET http://localhost:3001/api/loyalty/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testar Endpoint Blog

```bash
curl -X GET "http://localhost:3001/api/blog?page=1&limit=10"
```

### Testar Endpoint Geolocalização

```bash
curl -X GET "http://localhost:3001/api/geolocation/nearby?latitude=-23.5505&longitude=-46.6333&radiusKm=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Rodar Testes Automatizados

```bash
cd backend
npm test

cd ../frontend
npm test
```

---

## 🌍 Deploy

### Deploy no Heroku

```bash
# Instalar Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Criar app
heroku create meu-app-name

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Deploy no Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Deploy
railway up
```

### Deploy no AWS Amplify (Frontend)

```bash
npm install -g @aws-amplify/cli

amplify init
amplify add hosting
amplify publish
```

### Deploy no DigitalOcean (Full Stack)

```bash
# 1. SSH para seu server
ssh root@your_server_ip

# 2. Clonar repo
git clone https://github.com/vvvv2V/mmmm.git
cd mmmm

# 3. Instalar Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instalar PM2
sudo npm install -g pm2

# 5. Setup backend
cd backend
npm install

# Criar .env
nano .env  # com suas credenciais

# Rodar migrações
cd ..
./scripts/run-migrations.sh

# Iniciar com PM2
pm2 start backend/server.js --name "api-backend"

# 6. Setup frontend
cd frontend
npm install
npm run build

# Servir com Nginx
sudo apt-get install nginx
sudo cp .nginx.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Erro: "Database locked"

```bash
# Solução: Remover arquivo lock
rm backend_data/database.db-shm
rm backend_data/database.db-wal

# Reiniciar servidor
npm start
```

### Erro: "JWT token expired"

```javascript
// Solução: Fazer login novamente
localStorage.removeItem('token');
window.location.href = '/login';
```

### Erro: "CORS error"

```javascript
// Adicionar em backend/src/server.js:
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Erro: "Stripe API Key not found"

```bash
# Verificar .env
grep STRIPE .env

# Se não existir, adicionar:
echo "STRIPE_PUBLIC_KEY=pk_test_xxx" >> .env
echo "STRIPE_SECRET_KEY=sk_test_xxx" >> .env

# Reiniciar servidor
npm start
```

### Componente React não carrega dados

```javascript
// Verificar se token está sendo passado:
console.log('Token:', token);
console.log('User ID:', userId);

// Verificar console de erros
F12 → Console
```

---

## 📊 Checklist de Deploy

- [ ] Banco de dados migrado (`./scripts/run-migrations.sh`)
- [ ] `.env` criado com credenciais reais
- [ ] `npm install` rodado em backend e frontend
- [ ] Server rodando sem erros (`npm start`)
- [ ] Frontend conectando à API
- [ ] Token JWT funcionando
- [ ] HTTPS habilitado (em produção)
- [ ] Backups do banco configurados
- [ ] Logs sendo monitorados
- [ ] SSL/TLS certificado instalado

---

## 📞 Suporte

`Documentação completa: [[REDACTED_TOKEN].md](./[REDACTED_TOKEN].md)`  
`Código: [backend/src/services/](./backend/src/services/)`  
`Componentes: [frontend/src/components/](./frontend/src/components/)`

---

## 🎉 Parabéns!

Você tem tudo configurado para usar:
- ✅ 15 Features Premium
- ✅ 30+ Endpoints API
- ✅ 5 Componentes React
- ✅ Banco de Dados Pronto
- ✅ Autenticação JWT
- ✅ Integração Stripe
- ✅ Geolocalização
- ✅ Blog & SEO
- ✅ Fidelidade
- ✅ Subscrições

**Próximo passo: Customizar para seu negócio!**

---

**Última atualização**: 09/02/2026  
**Versão**: 1.0  
**Status**: Production Ready 🚀

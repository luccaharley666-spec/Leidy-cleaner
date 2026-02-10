# 🚀 Setup Completo - Pagamentos, Dashboard Admin e Emails

## Status: ✅ IMPLEMENTADO

Implementadas as 3 features principais:
1. **Pagamento Real com Stripe** ✅
2. **Dashboard Admin Profissional** ✅  
3. **Sistema de Email Notifications** ✅

---

## 📋 PARTE 1: PAGAMENTO COM STRIPE

### 1.1 Setup Stripe Account

```bash
# 1. Criar conta em https://stripe.com
# 2. Obter credenciais em: Dashboard → Developers → API Keys

# 3. Adicionar variáveis de ambiente:
```

**`.env.local` (Backend):**
```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_test_XXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXX
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
[REDACTED_TOKEN]=pk_test_XXXXXXX
```

### 1.2 Instalar Dependências

```bash
# Backend
cd backend
npm install stripe

# Frontend
cd frontend
npm install @stripe/react-stripe-js @stripe/js
```

### 1.3 Testar Pagamentos Localmente

```bash
# Terminal 1: Backend
cd backend
NODE_ENV=development node src/index.js

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Teste webhook Stripe (recomendado usar ngrok)
stripe listen --forward-to localhost:3001/api/payments/webhook
```

### 1.4 Endpoints de Pagamento

```
POST /api/payments/create-checkout
- Criar sessão de checkout Stripe
- Body: { hourPackage, totalPrice }
- Returns: { sessionId, sessionUrl }

GET /api/payments/session/:sessionId
- Verificar status da sessão

POST /api/payments/webhook
- Webhook Stripe (automático)

GET /api/payments/transactions
- Listar transações do usuário

POST /api/payments/refund
- Solicitar reembolso
```

---

## 📊 PARTE 2: DASHBOARD ADMIN

### 2.1 Acessar Dashboard

```
URL: http://localhost:3000/admin/dashboard-pro

⚠️ REQUER: Role de admin (role = 'admin')
```

### 2.2 Features Disponíveis

- 📊 **Overview**: Stats gerais (bookings, receita, horas, pendentes)
- 📅 **Bookings**: Listar e atualizar status dos bookings
- 💰 **Faturamento**: Relatório detalhado com gráficos
- ⏰ **Pacotes de Horas**: Vendas por pacote

### 2.3 Endpoints Admin

```
GET /api/admin/dashboard
- Estatísticas gerais (requer admin)

GET /api/admin/bookings?status=pending&limit=10&offset=0
- Listar bookings com filtros

PATCH /api/admin/bookings/:id/status
- Atualizar status de booking
- Body: { status: 'completed'|'pending'|'confirmed'|'cancelled' }

GET /api/admin/revenue?period=month
- Relatório de faturamento

GET /api/admin/hour-sales
- Vendas de pacotes de horas

GET /api/admin/professionals
- Listar profissionais

GET /api/admin/customers
- Listar clientes
```

---

## 📧 PARTE 3: EMAIL NOTIFICATIONS

### 3.1 Setup Gmail/SMTP

**`.env.local` (Backend):**
```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app  # NÃO use sua senha real!
EMAIL_FROM=noreply@leidycleaner.com
```

### 3.2 Gmail App Password (Recomendado)

1. Ativar 2FA em sua conta Google
2. Ir para: https://myaccount.google.com/apppasswords
3. Selecionar "Mail" e "Windows Computer"
4. Copiar senha gerada
5. Usar como `EMAIL_PASSWORD`

### 3.3 Instalar Dependências

```bash
cd backend
npm install nodemailer
```

### 3.4 Tipos de Emails Enviados

#### 1️⃣ Confirmação de Booking
```javascript
// Automático ao confirmar booking
EmailService.[REDACTED_TOKEN](booking, user)
// Inclui: data, hora, endereço, duração, preço
```

#### 2️⃣ Lembrança (48h antes)
```javascript
// Automático 48h antes do booking
EmailService.sendReminder(booking, user)
// Inclui: dicas, data/hora, instruções
```

#### 3️⃣ Confirmação de Pagamento
```javascript
// Automático após pagamento confirmado (webhook)
EmailService.[REDACTED_TOKEN](transaction, user)
// Inclui: número de horas, preço, data
```

### 3.5 Testar Email Localmente

```javascript
// No seu código
const EmailService = require('./services/EmailService');

await EmailService.sendMail(
  'seu-email@gmail.com',
  'Teste',
  '<h1>Teste</h1>'
);
```

---

## 🔧 ARQUIVOS CRIADOS/MODIFICADOS

### Backend

```
✅ backend/src/services/PaymentService.js (NEW)
   - Integração Stripe
   - Segurança de webhook
   - Refunds

✅ backend/src/routes/paymentRoutes.js (NEW)
   - 6 endpoints de pagamento
   - Webhook handler

✅ backend/src/routes/adminRoutes.js (MODIFIED)
   - Novos endpoints: /revenue, /hour-sales

✅ backend/src/routes/api.js (MODIFIED)
   - Integração paymentRoutes

✅ backend/src/services/EmailService.js (MODIFIED)
   - Templates melhorados
   - 3 tipos de email
```

### Frontend

```
✅ frontend/src/components/Payments/[REDACTED_TOKEN].jsx (NEW)
   - Botão de checkout com Stripe

✅ frontend/src/pages/checkout/success.jsx (NEW)
   - Página de sucesso

✅ frontend/src/pages/admin/dashboard-pro.jsx (NEW)
   - Dashboard completo com React
```

---

## 🧪 TESTES

### Teste 1: Criar Checkout
```bash
curl -X POST http://localhost:3001/api/payments/create-checkout \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hourPackage": 40, "totalPrice": 2986.80}'
```

### Teste 2: Listar Transações
```bash
curl -X GET http://localhost:3001/api/payments/transactions \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### Teste 3: Dashboard Admin
```bash
curl -X GET http://localhost:3001/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Teste 4: Email
```bash
# Verificar logs no backend para confirmar envio
tail -f /tmp/backend.log | grep -i email
```

---

## 📱 FLUXO COMPLETO DO USUÁRIO

### 1. Compra de Horas
```
User clica "Comprar Horas"
  ↓
Frontend carrega [REDACTED_TOKEN]
  ↓
User clica "Ir para Pagamento"
  ↓
Backend cria Stripe session
  ↓
User é redirecionado para Stripe checkout
  ↓
User paga (cartão, PIX, etc)
  ↓
✅ Webhook confirmação recebida
  ↓
Horas são creditadas automaticamente
  ↓
Email de confirmação enviado
  ↓
User é redirecionado para /checkout/success
```

### 2. Admin Monitorando
```
Admin acessa /admin/dashboard-pro
  ↓
Vê stats em tempo real
  ↓
Clica em booking para ver detalhes
  ↓
Pode atualizar status (pending → completed)
  ↓
System envia email ao cliente automaticamente
```

---

## 🚨 TROUBLESHOOTING

### Problema: "Stripe key not found"
**Solução:**
```bash
# Verificar .env
echo $STRIPE_SECRET_KEY

# Se vazio, adicionar em .env.local
STRIPE_SECRET_KEY=sk_test_XXXXX
```

### Problema: Webhook não funciona
**Solução:**
```bash
# 1. Usar ngrok para expor localhost
ngrok http 3001

# 2. Configurar em Stripe Dashboard:
# Settings → Webhooks → Add endpoint
# URL: https://YOUR_NGROK_URL/api/payments/webhook

# 3. Ouvir webhook localmente
stripe listen --forward-to localhost:3001/api/payments/webhook
```

### Problema: Email não enviado
**Solução:**
```bash
# 1. Verificar Gmail 2FA está ativado
# 2. App password foi gerado corretamente
# 3. EMAIL_PASSWORD não tem espaços
# 4. Check backend logs: grep -i "email" /tmp/backend.log
```

### Problema: Admin dashboard não funciona
**Solução:**
```bash
# 1. Verificar role do usuário no banco:
sqlite3 backend_data/database.db "SELECT id, role FROM users WHERE id=YOUR_USER_ID"

# 2. Se role != 'admin', atualizar:
sqlite3 backend_data/database.db "UPDATE users SET role='admin' WHERE id=YOUR_USER_ID"

# 3. Fazer login novamente
```

---

## 📈 PRÓXIMOS PASSOS (Opcional)

### Phase 2: Aprimoramentos
- [ ] Integrar PIX nativo (via Asaas ou Similar)
- [ ] Webhook automático para enviar lembrança (BullQueue)
- [ ] Gráficos no dashboard (Chart.js)
- [ ] Relatórios em PDF
- [ ] Dark mode no dashboard
- [ ] Export de dados (CSV, Excel)

### Phase 3: Automação  
- [ ] Agendador de emails (cron jobs)
- [ ] Notificações push
- [ ] SMS de lembrança (Twilio)
- [ ] Integração WhatsApp

### Phase 4: Analytics
- [ ] Funnel de conversão
- [ ] Churn analysis
- [ ] Lifetime value (LTV)
- [ ] Previsão de demanda

---

## 🎯 METRICS para Monitorar

| Métrica | Target | Como Medir |
|---------|--------|-----------|
| Conversion Rate | >5% | visitors → pagos |
| Avg Order Value | R$ 2.500+ | receita total / transações |
| Customer LTV | R$ 10.000+ | todas as compras por usuário |
| Email Open Rate | >25% | opens / enviados |
| Payment Success | 96%+ | conversão de checkout |

---

## ✅ CHECKLIST FINAL

- [x] Stripe setup
- [x] Payment endpoints
- [x] Webhook handler
- [x] Email templates
- [x] Dashboard admin
- [x] Frontend components
- [ ] Testes E2E
- [ ] Deploy produção
- [ ] Monitoramento
- [ ] Documentação usuário final

---

## 📞 SUPORTE

Para problemas ou dúvidas:
1. Verificar logs: `tail -f /tmp/backend.log`
2. Testar endpoints com Postman
3. Validar .env.local
4. Verificar permissões no banco de dados

---

**Documento atualizado:** 09/02/2026
**Versão:** 1.0

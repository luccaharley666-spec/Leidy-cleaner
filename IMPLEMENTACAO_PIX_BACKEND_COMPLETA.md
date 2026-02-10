# 💚 Guia Completo de Implementação PIX - Backend

**Status**: ✅ BACKEND IMPLEMENTADO  
**Data**: Sessão Atual  
**Próximo**: Registrar webhook com banco

---

## 📋 O Que Foi Implementado

### 1. **PixPaymentService.js** (380 LOC)
Serviço de lógica de negócio para gerenciar pagamentos PIX

**Métodos Implementados**:
- `createPixPayment(bookingId, amount, userId)` - Criar novo QR Code PIX
- `generateQRCode(transactionId, amount, pixKey)` - Gerar imagem PNG em base64
- `generateBRCode(amount, pixKey, transactionId)` - Gerar string de código de barras
- `getPaymentStatus(transactionId)` - Obter status atual do pagamento
- `processWebhook(webhookBody, signature)` - Processar webhook do banco
- `validateSignature(body, signature, secret)` - Validar HMAC-SHA256
- `expirePayment(transactionId)` - Marcar pagamento como expirado
- `getUserPayments(userId)` - Histórico de pagamentos do usuário
- `[REDACTED_TOKEN](payment)` - Disparar notificações (email, SMS)

**Features**:
- ✅ Geração de IDs únicos com UUID v4
- ✅ Expiração automática em 10 minutos
- ✅ QR Code em base64 (PNG)
- ✅ BR Code numérico
- ✅ Validação HMAC-SHA256 de webhooks
- ✅ Armazenamento completo em banco de dados
- ✅ Tratamento robusto de erros

### 2. **[REDACTED_TOKEN].js** (140 LOC)
Controladores HTTP para endpoints

**Endpoints**:
- `POST /api/pix/create` - Criar pagamento
- `GET /api/pix/status/:transactionId` - Consultar status
- `POST /api/pix/webhooks` - Receber webhook do banco
- `POST /api/pix/expire/:transactionId` - Expirar pagamento
- `GET /api/pix/user/payments` - Histórico do usuário

**Features**:
- ✅ Validação de entrada
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Status HTTP apropriados
- ✅ Autenticação JWT em rotas privadas
- ✅ Webhook sem autenticação (validado por HMAC)

### 3. **pixRoutes.js** (80 LOC)
Router Express para rotas PIX

**Pattern**:
```javascript
const router = createPixRoutes(db);
// Retorna Express Router com todas as 5 rotas registradas
```

**Middleware**:
- `authenticateToken` - Verifica JWT (rotas privadas)
- `authorizeRole` - VerificaPermissões (se necessário)
- Sem middleware de autenticação para webhook

### 4. **Migration ao migrations.sql**
Atualização da tabela `payments` com campos PIX

**Campos Adicionados**:
- `transaction_id TEXT UNIQUE` - ID único da transação PIX
- `qr_code LONGTEXT` - Imagem QR Code em base64
- `br_code VARCHAR(255)` - String de código de barras PIX
- `pix_key VARCHAR(100)` - PIX key utilizada (CPF, email, etc)
- `webhook_response LONGTEXT` - Resposta bruta do webhook
- `confirmed_at DATETIME` - Quando o pagamento foi confirmado
- `expires_at DATETIME` - Quando o QR Code expira
- `user_id INTEGER` - ID do usuário que fez o pagamento
- `[REDACTED_TOKEN] DATETIME` - Timestamp de confirmação
- Status estendido: `waiting`, `received`, `confirmed`, `expired`, `processing`

**Índices Criados**:
- `[REDACTED_TOKEN]` - Busca rápida por transaction_id
- `[REDACTED_TOKEN]` - Busca rápida por usuário
- `[REDACTED_TOKEN]` - Busca rápida por agendamento
- `idx_payments_status` - Busca rápida por status
- `idx_payments_method` - Busca rápida por método
- `[REDACTED_TOKEN]` - Ordenação por data

### 5. **Integração com api.js**
Foram adicionadas as linhas:
```javascript
const createPixRoutes = require('./pixRoutes');
const pixRoutes = createPixRoutes(require('../db/sqlite').getDb());
router.use('/pix', pixRoutes);
```

---

## 🔌 Endpoints Implementados

### 1. **POST /api/pix/create**
Criar novo pagamento PIX com QR Code

**Request**:
```bash
POST /api/pix/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": 123,
  "amount": 150.00
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "[REDACTED_TOKEN]",
    "transactionId": "[REDACTED_TOKEN]",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "brCode": "00020126360014br.gov.bcb.pix0136...",
    "expiresAt": "2026-02-09T16:35:00.000Z",
    "amount": 150.00,
    "status": "waiting",
    "bookingId": 123
  }
}
```

---

### 2. **GET /api/pix/status/:transactionId**
Obter status do pagamento (para polling)

**Request**:
```bash
GET /api/pix/status/[REDACTED_TOKEN]
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "[REDACTED_TOKEN]",
    "bookingId": 123,
    "amount": 150.00,
    "status": "confirmed",
    "method": "pix",
    "createdAt": "2026-02-09T16:25:00.000Z",
    "confirmedAt": "2026-02-09T16:26:30.000Z",
    "expiresAt": "2026-02-09T16:35:00.000Z",
    "paidAt": "2026-02-09T16:26:30.000Z"
  }
}
```

**Estados Possíveis**:
- `waiting` - Aguardando pagamento
- `received` - PIX recebido pelo banco
- `processing` - Processando pagamento
- `confirmed` - Pagamento confirmado ✅
- `expired` - QR Code expirou
- `failed` - Falha no pagamento

---

### 3. **POST /api/pix/webhooks**
Receber webhook do banco (sem autenticação, validado por HMAC)

**Request** (do Banco):
```bash
POST /api/pix/webhooks
Content-Type: application/json
x-webhook-signature: {HMAC-SHA256}

{
  "id": "[REDACTED_TOKEN]",
  "transactionId": "[REDACTED_TOKEN]",
  "status": "confirmed",
  "amount": 150.00,
  "bankTransactionId": "BK123456789",
  "receivedAt": "2026-02-09T16:26:30.000Z"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Webhook recebido com sucesso"
}
```

**Fluxo**:
1. Banco envia webhook com assinatura HMAC-SHA256
2. Backend valida assinatura usando `[REDACTED_TOKEN]`
3. Atualiza status do pagamento em `payments` table
4. Se `status = confirmed`, atualiza `bookings.status → confirmed`
5. Dispara notificações (email, SMS)
6. Retorna 200 OK ao banco

---

### 4. **POST /api/pix/expire/:transactionId**
Expirar/cancelar um pagamento PIX

**Request**:
```bash
POST /api/pix/expire/[REDACTED_TOKEN]
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Pagamento expirado",
  "data": {
    "transactionId": "[REDACTED_TOKEN]"
  }
}
```

---

### 5. **GET /api/pix/user/payments**
Obter histórico de pagamentos do usuário

**Request**:
```bash
GET /api/pix/user/payments
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "transaction_id": "[REDACTED_TOKEN]",
      "booking_id": 123,
      "amount": 150.00,
      "status": "confirmed",
      "method": "pix",
      "service_type": "Limpeza Residencial",
      "scheduled_date": "2026-02-15T10:00:00.000Z",
      "address": "Rua das Flores, 123",
      "created_at": "2026-02-09T16:25:00.000Z",
      "confirmed_at": "2026-02-09T16:26:30.000Z"
    },
    {...}
  ]
}
```

---

## 🔐 Segurança - Configuração do Webhook

### Secret HMAC-SHA256
```
[REDACTED_TOKEN] = [REDACTED_TOKEN]
```

### Validação de Assinatura
```javascript
const crypto = require('crypto');

// No webhook, o banco envia:
// Header: x-webhook-signature = HMAC-SHA256(body, secret)

// Backend valida:
const secret = process.env.[REDACTED_TOKEN];
const hash = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(webhookBody))
  .digest('hex');

if (hash === receivedSignature) {
  // ✅ Webhook válido
  processPayment();
} else {
  // ❌ Webhook inválido
  return 401;
}
```

### Headers Esperados
```
Content-Type: application/json
x-webhook-signature: {hash HMAC-SHA256}
x-bank-timestamp: {ISO 8601 datetime}
```

---

## 📊 Fluxo de Dados Completo

```
1. FRONTEND (checkout.jsx)
   ↓
   POST /api/pix/create
   { bookingId: 123, amount: 150 }
   
2. BACKEND ([REDACTED_TOKEN])
   ↓
   - Gera transaction_id (UUID)
   - Gera QR Code (base64)
   - Gera BR Code (numérico)
   - Salva em payments table
   
3. FRONTEND (PixQRCodeCheckout)
   ↓
   - Exibe QR Code
   - Inicia polling a cada 5s
   
4. USUÁRIO
   ↓
   - Escaneia QR no app do banco
   - Confirma pagamento
   
5. BANCO
   ↓
   POST /api/pix/webhooks
   { status: 'confirmed', ... }
   
6. BACKEND (Webhook Handler)
   ↓
   - Valida HMAC
   - Atualiza status → confirmed
   - Atualiza booking
   - Envia email/SMS
   
7. FRONTEND (Polling)
   ↓
   - Detecta status = confirmed
   - Redireciona para /confirmacao
```

---

## 🧪 Como Testar

### 1. **Teste Manual com cURL**

**Criar Pagamento**:
```bash
curl -X POST http://localhost:3001/api/pix/create \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": 1, "amount": 150.00}'
```

**Consultar Status**:
```bash
curl -X GET http://localhost:3001/api/pix/status/TRANSACTION_ID \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Simular Webhook**:
```bash
#!/bin/bash
SECRET="[REDACTED_TOKEN]"
BODY='{"id":"TRANSACTION_ID","status":"confirmed","amount":150.00}'

SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d" " -f2)

curl -X POST http://localhost:3001/api/pix/webhooks \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "$BODY"
```

### 2. **Teste com Postman**

```
1. Usar coleção com os 5 endpoints
2. Variáveis:
   - {{token}} = Bearer token
   - {{transactionId}} = ID da transação
3. Testar cada endpoint
4. Simular webhook com assinatura HMAC
```

### 3. **Teste E2E Automatizado**

```javascript
// test/pix.e2e.test.js
describe('PIX Payment Flow', () => {
  it('should create payment and confirm via webhook', async () => {
    // 1. Criar pagamento
    const create = await request(app)
      .post('/api/pix/create')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookingId: 1, amount: 150 });
    
    expect(create.status).toBe(201);
    const { transactionId } = create.body.data;
    
    // 2. Consultar status (waiting)
    const statusWaiting = await request(app)
      .get(`/api/pix/status/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(statusWaiting.body.data.status).toBe('waiting');
    
    // 3. Simular webhook
    const webhook = await request(app)
      .post('/api/pix/webhooks')
      .set('x-webhook-signature', calculateHmac(body))
      .send({ id: transactionId, status: 'confirmed' });
    
    expect(webhook.status).toBe(200);
    
    // 4. Consultar status (confirmed)
    const statusConfirmed = await request(app)
      .get(`/api/pix/status/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(statusConfirmed.body.data.status).toBe('confirmed');
  });
});
```

---

## 🚀 Próximos Passos

### Hoje
- [ ] Registrar webhook com Banco Bradesco / BB / Itaú
  - URL: `https://seu-dominio.com/api/pix/webhooks`
  - Secret: `[REDACTED_TOKEN]`
  - Método: POST
  - Auth: HMAC-SHA256
  
### Teste
- [ ] Testar com simulador do banco
- [ ] Verificar recebimento de webhooks
- [ ] Testar fluxo completo (agendamento → pagamento → confirmação)

### Produção
- [ ] Migrar para PostgreSQL (melhor que SQLite)
- [ ] Implementar retry logic para webhooks
- [ ] Adicionar logging detalhado
- [ ] Configurar alertas para falhas

---

## 📚 Referências

**Arquivos Relacionados**:
- Backend: `/backend/src/services/PixPaymentService.js`
- Backend: `/backend/src/controllers/[REDACTED_TOKEN].js`
- Backend: `/backend/src/routes/pixRoutes.js`
- Frontend: `/frontend/src/components/Payment/PixQRCodeCheckout.jsx`
- Frontend: `/frontend/src/pages/checkout.jsx`
- Database: `/backend/src/db/migrations.sql`

**Documentação Complementar**:
- [[REDACTED_TOKEN].md](./[REDACTED_TOKEN].md) - Frontend
- [Guia PIX BC](https://www.bcb.gov.br/[REDACTED_TOKEN]/pix) - Documentação oficial

---

**Status**: 🟢 BACKEND PRONTO PARA REGISTRAR WEBHOOK

# 🏦 Guia de Integração Real PIX - Leidy Cleaner

## 1. Visão Geral da Integração

### Status Atual
- ✅ **Backend:** Código de PIX implementado em `[REDACTED_TOKEN].js` (140 LOC)
- ✅ **Frontend:** Componente `PixQRCodeCheckout.jsx` pronto (340 LOC)
- ❌ **Webhook:** Não registrado com banco / provedor de pagamento
- ❌ **Credentials:** Usando valores mock em `.env`

### Fluxo Implementado
```
Cliente → GET /api/payments/pix/create → QR Code → Pagamento via app bancário
         ↓                                            ↓
Banco transmite webhook → /api/payments/pix/webhook → Validação + Update DB
```

---

## 2. Integração com Banco Via Provedor PIX

### Opção 1: Usar Provedor (Recomendado)
Provedores como **Efi Gateways** (ExpertPay) ou **Braspag** já têm integração PIX pronta.

#### Passo 1: Escolher Provedor

**Efi Gateways (ExpertPay) - Recomendado**
- Fácil integração
- Webhook automático
- Dashboard completo
- https://www.efigateways.com.br/

**Alternativa: Asaas**
- Solução brasileira
- Suporta PIX, Boleto, Cartão
- https://www.asaas.com/

**Alternativa: Braspag (Natura)**
- Enterprise grade
- Integração complexa
- Para maior volume

---

### Passo 2: Criar Conta e Obter Credenciais

**Para Efi Gateways:**
1. Acessar https://www.efigateways.com.br/
2. Clicar em "Começar Agora" → Cadastro empresarial
3. Fornecer dados da empresa (Leidy Cleaner)
4. Aguardar aprovação (1-2 dias úteis)
5. Na dashboard, ir para "Integração" → "API Keys"
6. Copiar: `Client ID` e `Client Secret`

**Dados da Empresa para Cadastro:**
```
Razão Social: Leidy Cleaner Serviços de Limpeza
CNPJ: [Obter com responsável]
Email: admin@leidycleaner.com.br
Telefone: [Obter com responsável]
Endereço: [Endereço da empresa]
```

---

### Passo 3: Atualizar .env Backend

Depois de obter credenciais, atualizar `/backend/.env`:

```bash
# PIX via Provedor (Efi/ExpertPay)
PIX_PROVIDER=efi_gateways
PIX_CLIENT_ID=seu_client_id_aqui
PIX_CLIENT_SECRET=[REDACTED_TOKEN]
PIX_ACCOUNT_ID=seu_account_id_aqui

# Webhook - URL pública onde o banco vai enviar confirmações
PIX_WEBHOOK_URL=https://api.leidycleaner.com.br/api/payments/pix/webhook
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# PIX Direto (Banco) - Alternativa
PIX_DIRECT_KEY=seu_pix_key (cpf, cnpj, email ou aleatória)
PIX_RECEIVER_ORG_ID=seu_org_id_no_banco
```

---

## 3. Implementação Backend

### Arquivo: `/backend/src/controllers/[REDACTED_TOKEN].js`

**Status:** 95% pronto, faltam apenas credenciais de produção

**Endpoints Implementados:**

#### 1️⃣ POST `/api/payments/pix/create`
```javascript
// Cria cobrança PIX e retorna QR Code
Request Body:
{
  "booking_id": 3,
  "amount": 200.00,
  "description": "Limpeza Comercial - Agendamento #3"
}

Response:
{
  "success": true,
  "qr_code": "00020126500014br.gov.bcb.brcode...",
  "qr_code_url": "https://api...../qr-code.png",
  "transaction_id": "pix_abc123",
  "expires_at": "2026-02-15T14:30:00Z"
}
```

#### 2️⃣ GET `/api/payments/pix/status/:transaction_id`
```javascript
// Verificar status do pagamento
Response:
{
  "success": true,
  "transaction_id": "pix_abc123",
  "status": "completed", // pending | completed | expired
  "amount": 200.00,
  "paid_at": "2026-02-15T12:00:00Z"
}
```

#### 3️⃣ POST `/api/payments/pix/webhook`
```javascript
// Recebe confirmação do banco
// Headers: X-Webhook-Signature: seu_signature_hash

Request Body (Efi Gateways):
{
  "id": "evt_123",
  "event": "charge.paid",
  "data": {
    "id": "pix_abc123",
    "amount": 200.00,
    "status": "paid",
    "paid_at": "2026-02-15T12:00:00Z"
  }
}

// Backend:
// 1. Validar assinatura
// 2. Atualizar transaction status em BD
// 3. Marcar booking como pago
// 4. Gerar notificação ao cliente
// 5. Retornar 200 OK (IMPORTANTE!)
```

---

## 4. Implementação Frontend

### Arquivo: `/frontend/components/payment/PixQRCodeCheckout.jsx`

**Status:** Código pronto, aguardando backend conectar

**Fluxo Visual:**

```
┌─────────────────────────────────────┐
│  Resumo do Agendamento              │
│  Preço: R$ 200.00                   │
│  Data: 15/02/2026 às 09:00          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Selecionar Método de Pagamento     │
│  ☐ Cartão de Crédito                │
│  ☑ PIX                              │
│  ☐ Boleto                           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  QR Code PIX                        │
│                                     │
│   [████████████████████████]        │
│   [████████████████████████]        │
│   [████████████████████████]        │
│                                     │
│  ou copie: 00020126500014...        │
│                                     │
│  ⏱️ Expira em: 04:32                 │
│                                     │
│  [↺ Verificar Pagamento] [Cancelar] │
└─────────────────────────────────────┘
           ↓
    Usuário escaneia com app bancário
           ↓
   Confirma transferência PIX
           ↓
   Backend recebe webhook
           ↓
┌─────────────────────────────────────┐
│  ✅ Pagamento Confirmado!           │
│  Agendamento foi confirmado         │
│  [Ir para Dashboard]                │
└─────────────────────────────────────┘
```

---

## 5. Teste End-to-End Local

### Cenário 1: Teste com Mock (Desenvolvimento)

```bash
# 1. Criar cobrança
curl -X POST http://localhost:3001/api/payments/pix/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "booking_id": 3,
    "amount": 200.00,
    "description": "Limpeza Comercial"
  }'

# Resposta (QR Code de teste):
# {
#   "success": true,
#   "qr_code": "00020126580014br.gov.bcb.brcode...",
#   "transaction_id": "pix_test_123"
# }

# 2. Simular webhook de pagamento recebido
curl -X POST http://localhost:3001/api/payments/pix/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test_signature" \
  -d '{
    "id": "evt_123",
    "event": "charge.paid",
    "data": {
      "id": "pix_test_123",
      "amount": 200.00,
      "status": "paid"
    }
  }'

# 3. Verificar status da transação
curl http://localhost:3001/api/payments/pix/status/pix_test_123
```

### Cenário 2: Teste com Provedor Real

```bash
# Mesmo fluxo acima, mas com:
# 1. Credenciais reais (PIX_CLIENT_ID, etc.) no .env
# 2. URL do webhook público (não localhost)
# 3. Webhook registrado na dashboard do provedor
```

---

## 6. Registrar Webhook no Provedor

### Para Efi Gateways:

1. **Acessar Dashboard**
   - Login em https://dashboard.efigateways.com.br
   - Menu: "Webhooks" ou "Notificações"

2. **Adicionar Novo Webhook**
   - URL: `https://api.leidycleaner.com.br/api/payments/pix/webhook`
   - Eventos: `charge.paid`, `charge.expired`, `charge.refunded`
   - Método: `POST`
   - Content-Type: `application/json`

3. **Segurança**
   - Ativar "Assinatura de Webhook"
   - Copiar o `Webhook Secret`
   - Adicionar a `.env`: `[REDACTED_TOKEN]=seu_secret`

4. **Teste**
   - Dashboard oferece botão "Enviar Teste"
   - Verificar se backend recebeu (logs)
   - Validar assinatura

---

## 7. Variáveis de Ambiente Completas

Atualizar `/backend/.env`:

```bash
# ===== PIX CONFIGURATION =====
PIX_ENABLED=true
PIX_PROVIDER=efi_gateways  # ou 'async', 'asaas', 'braspag'

# Efi Gateways (ExpertPay)
PIX_CLIENT_ID=your_client_id_here
PIX_CLIENT_SECRET=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]
PIX_WEBHOOK_URL=https://api.leidycleaner.com.br/api/payments/pix/webhook

# PIX Direto (Banco)
PIX_KEY_CPF=null  # ou CPF do recebedor
PIX_KEY_CNPJ=null  # ou CNPJ da empresa
PIX_KEY_EMAIL=admin@leidycleaner.com.br
PIX_KEY_RANDOM=false  # Usar chave aleatória?

# Timers
PIX_EXPIRY_MINUTES=10  # Quanto tempo até expirar
[REDACTED_TOKEN]=30  # Segundos entre verificações
```

---

## 8. Monitoramento de Pagamentos

### Dashboard de Transações

```bash
# Ver todas as transações PIX
curl -H "Authorization: Bearer SEU_JWT_ADMIN" \
  http://localhost:3001/api/payments/list

# Filtrar por status
curl -H "Authorization: Bearer SEU_JWT_ADMIN" \
  "http://localhost:3001/api/payments/list?status=pending"

# Refazer cobrança expirada
curl -X POST http://localhost:3001/api/payments/pix/retry \
  -H "Authorization: Bearer SEU_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "pix_xyz"}'
```

---

## 9. Segurança - Checklist

- [ ] Validar assinatura do webhook em todas as requisições
- [ ] Usar HTTPS (não HTTP) em produção
- [ ] Armazenar credenciais apenas em `.env` (nunca em código)
- [ ] Implementar idempotência (mesma cobrança 2x?)
- [ ] Registrar todos os webhooks recebidos (auditoria)
- [ ] Implementar rate limiting no endpoint de webhook
- [ ] Validar amount/currency antes de atualizar BD
- [ ] Usar transações no DB (atomicity)
- [ ] Notify admins de webhooks falhados

---

## 10. Troubleshooting

| Problema | Solução |
|----------|---------|
| Webhook não recebido | Verificar URL pública, firewall, registrar no provedor |
| QR Code inválido | Validar credenciais, valores de amount |
| Assinatura inválida | Verificar [REDACTED_TOKEN] correto |
| Transação não atualizada | Checar logs de webhook, validações |
| Expiry muito curto | Aumentar `PIX_EXPIRY_MINUTES` |

---

## 11. Próximos Passos

1. **Semana 1:** Criar conta no provedor (1 dia)
2. **Semana 1:** Obter credenciais (2-3 dias)
3. **Semana 2:** Atualizar .env e testar (1 dia)
4. **Semana 2:** Registrar webhook (1 dia)
5. **Semana 2:** Teste end-to-end com valor pequeno (1 dia)
6. **Semana 3:** Deploy em produção

---

## 12. Contatos de Suporte

**Efi Gateways:**
- Docs: https://www.efigateways.com.br/docs/
- Email: suporte@efigateways.com.br
- Telefone: +55 47 3131-0000

**Stripe (Alternativa):**
- Já está configurado em `[REDACTED_TOKEN].js`
- Apenas precisa de credenciais reais

**Boleto:**
- Aguardando implementação de provedor

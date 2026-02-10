# 💳 Guia de Integração Stripe - Leidy Cleaner

## 1. Status Atual

- ✅ **Backend:** `[REDACTED_TOKEN].js` (159 LOC) implementado
- ✅ **Frontend:** `CheckoutForm.jsx` pronto com Stripe Elements
- ❌ **Credenciais:** Usando chaves de teste (pk_test_*, sk_test_*)
- ❌ **Webhook:** Não registrado com Stripe
- ❌ **Produção:** Não migrado para credenciais live

---

## 2. Diferenciar: Teste vs Produção

| Aspecto | Teste | Produção |
|---------|-------|----------|
| **Chave Pública** | `pk_test_...` | `pk_live_...` |
| **Chave Secreta** | `sk_test_...` | `sk_live_...` |
| **Cartões** | Números de teste | Cartões reais |
| **Processamento** | Simulado | Cargas reais |
| **Webhook** | Enviado localmente | Enviado por Stripe |

### Cartões de Teste

```
Sucesso:
  Número: 4242 4242 4242 4242
  Expiry: 12/25
  CVC: 123

Falha:
  Número: 4000 0000 0000 0002
  Expiry: 12/25
  CVC: 123

Requer 3D Secure:
  Número: 4000 0025 0000 3155
  Expiry: 12/25
  CVC: 123
```

---

## 3. Obter Credenciais da Stripe

### Passo 1: Criar Conta

1. Acessar https://dashboard.stripe.com/register
2. Preencher com dados da empresa:
   ```
   Email: admin@leidycleaner.com.br
   Senha: [senha segura]
   País: Brasil
   Tipo de conta: Pessoa Jurídica (CNPJ)
   ```

3. Confirmar email

### Passo 2: Completar Onboarding

1. Dashboard → Configurações → Conta
2. Preencher:
   - Informações da empresa (CNPJ, razão social)
   - Endereço
   - Pessoa responsável
   - Dados bancários (para recebimento)
   - Verificação de identidade

3. Aguardar aprovação (geralmente 2-3 dias úteis)

### Passo 3: Obter Chaves API

1. Dashboard → Desenvolvedores → Chaves API
2. Copiar chaves de **Teste** primeiro:
   ```
   Chave Pública Teste (pk_test_...): Use no frontend
   Chave Secreta Teste (sk_test_...): Use apenas no backend
   ```

3. Ativar "Modo de visualização" para ver chaves **Live**:
   ```
   Chave Pública Live (pk_live_...): Para produção (frontend)
   Chave Secreta Live (sk_live_...): Para produção (backend)
   ⚠️ NUNCA compartilhar a chave secreta!
   ```

---

## 4. Configurar Backend

### Arquivo: `/backend/.env`

Adicionar/atualizar:

```bash
# ===== STRIPE CONFIGURATION =====
STRIPE_ENABLED=true
STRIPE_MODE=test  # Alterar para 'live' em produção

# Chaves de Teste (Desenvolvimento)
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# Chaves de Produção (SÓ em produção!)
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# Webhook
[REDACTED_TOKEN]=[REDACTED_TOKEN]
STRIPE_WEBHOOK_URL=https://api.leidycleaner.com.br/api/payments/stripe/webhook

# Configurações
STRIPE_CURRENCY=BRL
STRIPE_COUNTRY=BR
```

### Arquivo: `/backend/src/controllers/[REDACTED_TOKEN].js`

Código já implementado. Endpoints disponíveis:

```javascript
POST /api/payments/stripe/create-session
  - Cria uma sessão de checkout Stripe
  - Retorna: URL para redirect

POST /api/payments/stripe/webhook
  - Recebe notificações de pagamento
  - Eventos: payment_intent.succeeded, charge.refunded

GET /api/payments/stripe/status/:session_id
  - Verifica status do pagamento
```

---

## 5. Configurar Frontend

### Arquivo: `/frontend/.env.local`

```bash
# Stripe Public Key (seguro expor no frontend)
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# API URL do backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Arquivo: `/frontend/components/payment/CheckoutForm.jsx`

Componente já implementado. Uso:

```jsx
import CheckoutForm from '@/components/payment/CheckoutForm';

export default function PaymentPage() {
  return (
    <div>
      <h1>Finalizar Pagamento</h1>
      <CheckoutForm 
        amount={200.00}
        bookingId={3}
        onSuccess={() => alert('Pago!')}
      />
    </div>
  );
}
```

---

## 6. Registrar Webhook

### Por que precisa de Webhook?

Stripe envia confirmações de pagamento para seu servidor via HTTP POST. Sem webhook, você não saberá quando um pagamento foi confirmado.

### Registrar em Desenvolvimento (Localshost)

1. Instalar Stripe CLI: https://stripe.com/docs/stripe-cli/install

2. No terminal:
   ```bash
   stripe login
   # Scannear QR code para autenticar
   
   # Fazer forwarding de eventos para localhost
   stripe listen --forward-to localhost:3001/api/payments/stripe/webhook
   ```

3. Copiar o webhook secret:
   ```
   [REDACTED_TOKEN]...
   ```

4. Adicionar a `.env`:
   ```bash
   [REDACTED_TOKEN]=[REDACTED_TOKEN]...
   ```

### Registrar em Produção

1. Dashboard → Desenvolvedores → Webhooks
2. Clicar em "Adicionar endpoint"
3. Preencher:
   - **URL:** `https://api.leidycleaner.com.br/api/payments/stripe/webhook`
   - **Eventos:** 
     - `payment_intent.succeeded`
     - `charge.refunded`
     - `customer.subscription.updated`

4. Copiar o webhook secret e adicionar a `.env`

---

## 7. Teste End-to-End

### Teste 1: Checkout Local

```bash
# 1. Backend rodando
cd /backend && npm start  # porta 3001

# 2. Frontend rodando
cd /frontend && npm run dev  # porta 3000

# 3. CLI forwarding (outro terminal)
stripe listen --forward-to localhost:3001/api/payments/stripe/webhook

# 4. Acessar em navegador
http://localhost:3000/checkout

# 5. Usar cartão de teste
#    4242 4242 4242 4242 | 12/25 | 123

# 6. Verificar logs
# Backend deve receber webhook com status 'succeeded'
# Frontend deve mostrar "Pagamento confirmado"
```

### Teste 2: API Via cURL

```bash
# 1. Buscar token JWT do admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@leidycleaner.com.br",
    "password": "AdminPassword123!@#"
  }'

# Copiar token da resposta

# 2. Criar session de checkout
curl -X POST http://localhost:3001/api/payments/stripe/create-session \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 3,
    "amount": 200.00,
    "currency": "BRL"
  }'

# Response:
# {
#   "session_id": "cs_test_...",
#   "checkout_url": "https://checkout.stripe.com/...",
#   "amount": 200.00
# }

# 3. Redirecionar para checkout_url no navegador
# 4. Completar pagamento com 4242 4242 4242 4242
# 5. Backend recebe webhook e atualiza DB
```

---

## 8. Implementação do Webhook

### Backend recebe:

```javascript
{
  "id": "evt_1A...",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1A...",
      "amount": 20000,  // em cents: 200.00 BRL
      "currency": "brl",
      "status": "succeeded",
      "metadata": {
        "booking_id": "3"
      }
    }
  }
}
```

### Backend processa:

1. **Valida assinatura** usando `[REDACTED_TOKEN]`
2. **Verifica booking_id** nos metadados
3. **Atualiza BD:**
   ```sql
   UPDATE transactions 
   SET status = 'completed', stripe_payment_id = 'pi_1A...'
   WHERE booking_id = 3;
   
   UPDATE bookings 
   SET payment_status = 'paid'
   WHERE id = 3;
   ```
4. **Notifica cliente** via email/SMS
5. **Retorna 200 OK** (importante!)

---

## 9. Migrar para Produção

### Checklist Pré-Deploy

- [ ] Contas de Stripe aprovada e em Good Standing
- [ ] Chaves live obtidas do Dashboard
- [ ] `.env` atualizado com:
  ```bash
  STRIPE_MODE=live
  [REDACTED_TOKEN]=pk_live_...
  [REDACTED_TOKEN]=sk_live_...
  ```
- [ ] Webhook registrado em Produção (URL pública)
- [ ] Webhook secret atualizado no `.env`
- [ ] HTTPS ativo (essencial!)
- [ ] Rate limiting configurado
- [ ] Logs de pagamento habilitados
- [ ] Testes com valor pequeno (R$ 0,01-1,00)
- [ ] Testes com reembolso

### Passo 1: Atualizar Environment

```bash
# Em /backend/.env (PRODUÇÃO)
STRIPE_MODE=live
[REDACTED_TOKEN]=pk_test_... # manter para fallback
[REDACTED_TOKEN]=sk_test_... # manter para testes
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]
```

### Passo 2: Registrar Webhook Real

```bash
# Dashboard Stripe → Desenvolvedores → Webhooks
# Adicionar: https://api.leidycleaner.com.br/api/payments/stripe/webhook
# Copiar novo webhook_secret
```

### Passo 3: Testar com Teste Pequeno

```bash
# 1. Deploy com STRIPE_MODE=live
# 2. Fazer pagamento de R$ 0.01 (cartão 4242...)
# 3. Verificar:
#    - Webhook recebido
#    - BD atualizado
#    - Notificação enviada
# 4. Dashboard Stripe mostra transação real
```

### Passo 4: Ativar para Clientes

Apenas depois de confirmar tudo acima.

---

## 10. Troubleshooting

| Problema | Solução |
|----------|---------|
| Webhook não recebido | Verificar HTTPS, firewall, registrar novamente |
| Cartão recusado | Usar cartões de teste corretos |
| Session inválida | Verificar expiração (24h) |
| Erro de chave | Confirmar modo (test vs live) no `.env` |
| 3D Secure bloqueado | Usar `4000 0025 0000 3155` para testar |

---

## 11. Logs e Monitoramento

### Verificar Transações

```bash
# Dashboard Stripe
https://dashboard.stripe.com/payments

# Ou via API
curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_...:
```

### Logs Backend

```bash
# Verificar logs de webhook
tail -f /backend/logs/webhook.log

# Ou no BD
SELECT * FROM transactions WHERE payment_method = 'stripe' ORDER BY created_at DESC;
```

---

## 12. Referências

- **Docs Stripe:** https://stripe.com/docs/payments
- **API Reference:** https://stripe.com/docs/api
- **Webhooks:** https://stripe.com/docs/webhooks
- **Test Cards:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

---

## 13. Checklist de Ativação

- [ ] Conta Stripe criada e aprovada
- [ ] Chaves obti das (test + live)
- [ ] Backend configurado com chaves test
- [ ] Frontend configurado com pk_test_
- [ ] Webhook local registrado (Stripe CLI)
- [ ] Teste de pagamento com cartão 4242...
- [ ] Webhook recebido e BD atualizado
- [ ] Chaves live obtidas
- [ ] Webhook live registrado
- [ ] `.env` migrado para live
- [ ] Teste com valor pequeno (R$ 0.01)
- [ ] Webhook live verificado
- [ ] Pronto para produção! 🎉

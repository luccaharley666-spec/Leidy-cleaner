# 🎯 Implementação PIX Real - Guia de Setup

## 📋 Resumo das Features Implementadas

### 1. **Dashboard Admin com Gráficos** ✅
- **Arquivo**: `/frontend/src/pages/admin-dashboard.jsx`
- **KPI Cards**: 
  - Receita Total (com % comparação)
  - Total de Agendamentos (com % comparação)
  - Avaliação Média (com estrelas)
  - Taxa de Conversão
- **Gráficos**:
  - Line Chart: Vendas vs Receita Mensal
  - Pie Chart: Distribuição de Serviços (Residencial, Comercial, Estofados, Vidros)
  - Bar Chart: Receita Mensal
- **Tabela**: Agendamentos Recentes com status filtrado por cores
- **Responsivo**: Totalmente adaptável para mobile
- **Filtro de Período**: Seletor para Semana/Mês/Ano

### 2. **Dark Mode Completo** ✅
- **Context**: `/frontend/src/context/ThemeContext.jsx` (já existente, mantido)
- **Componente Toggle**: Botão de alternância em LeidyHeader (desktop + mobile)
- **Persistência**: Tema salvo em localStorage
- **Responsive**: Detecta preferência de sistema automaticamente
- **Tailwind Integration**: Usa `dark:` classes nativamente
- **Cores**: Adaptadas para ambos os modos
  - Light: Verde/Branco
  - Dark: Cinza/Escuro com acentos amarelos

### 3. **PIX Real Confirmation** ✅
- **Webhook Real**: `/backend/src/services/PixWebhookService.js`
- **Controller**: `/backend/src/controllers/[REDACTED_TOKEN].js`
- **Rotas**: `/backend/src/routes/pixWebhook.routes.js`
- **Assinatura HMAC-SHA256**: Validação segura de webhooks
- **APIs Suportadas**:
  - Banco do Brasil
  - Bradesco
  - Itaú
  - Caixa
  - Outras (genéricas)

---

## 🔧 Setup PIX Real

### Passo 1: Configurar Variáveis de Ambiente

#### Backend `.env`:
```env
# PIX Configuration
PIX_KEY=seu-email@pix.com  # Sua chave PIX (email, telefone, CPF ou CNPJ)
PIX_BANK_API_URL=https://api.bank.com/v1  # URL da API do banco (se disponível)
PIX_BANK_API_KEY=sua-api-key-123  # Chave de acesso à API do banco
[REDACTED_TOKEN]=[REDACTED_TOKEN]  # Para assinar webhooks

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

#### Frontend `.env.local`:
```env
[REDACTED_TOKEN]=https://sua-api.com
[REDACTED_TOKEN]=true
```

### Passo 2: Criar Tabela PIX Transactions

```sql
CREATE TABLE IF NOT EXISTS pix_transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, paid, failed, expired
  order_id TEXT,
  br_code TEXT NOT NULL,
  bank_transaction_id TEXT,
  bank_name TEXT,
  sender_account TEXT,
  expires_at DATETIME,
  confirmed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES bookings(id)
);

CREATE INDEX idx_pix_order ON pix_transactions(order_id);
CREATE INDEX idx_pix_status ON pix_transactions(status);
```

### Passo 3: Registrar Webhook no Banco

#### Banco do Brasil (Open Banking):
```
1. Acessar: https://api.bb.com.br/webhooks
2. Registrar URL: https://sua-api.com/webhooks/pix
3. Evento: pix.transfer.in.received
4. Assinatura: HMAC-SHA256
5. Secret: [REDACTED_TOKEN]
```

#### Bradesco/Itaú (Via Ecosystem):
```
1. Portal de integrações do banco
2. Novo Webhook → Tipo: PIX Payment
3. URL: https://sua-api.com/webhooks/pix
4. Assinar com: [REDACTED_TOKEN] (HMAC-SHA256)
```

#### Para Testes Locais (via ngrok):
```bash
# Terminal 1: Rodar backend
npm run dev

# Terminal 2: Expor via ngrok
ngrok http 3001

# Copiar URL do ngrok e registrar no banco:
# https://xxxxx.ngrok.io/webhooks/pix
```

### Passo 4: Integração com Sistema de Pagamento

#### No PaymentController.js:
```javascript
// Ao gerar QR Code PIX
const { brCode, pixTransactionId } = await PixService.generateQRCode(
  amount,
  booking.id,
  `Limpeza - ${booking.service_type}`
);

// Retornar para frontend
res.json({
  success: true,
  brCode,
  pixTransactionId,
  expiresAt: new Date(Date.now() + 30 * 60 * 1000)
});
```

#### No Frontend (checkout-pix.jsx):
```jsx
import { useState, useEffect } from 'react';

export default function CheckoutPix({ bookingId, amount }) {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('pending');
  const [pixId, setPixId] = useState(null);

  useEffect(() => {
    // Gerar QR Code
    fetch('/api/payments/pix/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount })
    })
    .then(r => r.json())
    .then(data => {
      setQrCode(data.brCode);
      setPixId(data.pixTransactionId);
      // Iniciar polling do status
      pollPixStatus(data.pixTransactionId);
    });
  }, []);

  const pollPixStatus = (transactionId) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/webhooks/pix/status/${transactionId}`);
      const data = await res.json();
      
      if (data.status === 'paid') {
        setStatus('paid');
        clearInterval(interval);
        // Redirecionar para sucesso
        window.location.href = '/sucesso';
      }
    }, 3000); // Verificar a cada 3 segundos
  };

  return (
    <div>
      {qrCode && (
        <div>
          <h2>Escaneie o código QR com seu banco</h2>
          <img src={`data:image/png;base64,${qrCode}`} alt="PIX QR Code" />
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🛡️ Segurança

### Assinatura HMAC-SHA256
O webhook valida usando:
```javascript
const signature = HMAC-SHA256(
  JSON.stringify(webhookData),
  [REDACTED_TOKEN]
);
```

Comparação segura contra timing attacks:
```javascript
crypto.timingSafeEqual(
  Buffer.from(bankSignature, 'hex'),
  Buffer.from(computedSignature, 'hex')
)
```

### Endpoints de Segurança
- `POST /webhooks/pix` → Sem autenticação (banco chama)
- `GET /webhooks/pix/status/:id` → Sem autenticação (app consulta)
- `POST /webhooks/pix/confirm/:id` → Requer ADMIN
- `GET /webhooks/pix/expiring` → Requer ADMIN
- `POST /webhooks/pix/cleanup` → Requer ADMIN

---

## 📊 Monitoramento

### Verificar PIX Expirados:
```bash
curl -X GET 'http://localhost:3001/webhooks/pix/expiring?minutes=5' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

### Confirmar PIX Manualmente:
```bash
curl -X POST 'http://localhost:3001/webhooks/pix/confirm/uuid-123' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"bankTransactionId": "bank-tx-456"}'
```

### Limpar PIXs Expirados:
```bash
curl -X POST 'http://localhost:3001/webhooks/pix/cleanup' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

---

## 🧪 Testes

### Teste de Webhook (Local):
```javascript
// test-pix-webhook.js
const crypto = require('crypto');
const secret = 'seu-webhook-secret';

const webhookData = {
  pixTransactionId: 'uuid-123',
  amount: 150.00,
  bankTransactionId: 'bank-456',
  bankName: 'banco-do-brasil'
};

const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(webhookData))
  .digest('hex');

console.log('Signature:', signature);

// Enviar para: POST localhost:3001/webhooks/pix
// Headers: x-bank-signature, x-bank-timestamp
```

---

## 📋 Checklist de Implementação

- [x] Dashboard Admin com Recharts
- [x] Dark Mode com Context e Toggle
- [x] PixWebhookService com HMAC-SHA256
- [x] [REDACTED_TOKEN] com endpoints
- [x] Rotas PIX webhook integradas
- [ ] Integração com banco específico (escolher a implementação)
- [ ] Testes E2E para fluxo completo
- [ ] Deploy em produção com HTTPS
- [ ] Documentação de API para clientes

---

## 🚀 Próximos Passos

1. **Escolher Banco**: Integrar com seu banco específico
2. **Testar Localmente**: Usar ngrok para webhooks
3. **Certificados SSL**: Essencial em produção
4. **Monitoramento**: Adicionar alertas para falhas de PIX
5. **Analytics**: Rastrear taxa de sucesso de pagamentos

---

## 📞 Suporte

Para erros:
- Verificar `logger.error()` em `/backend/logs`
- Confirmar `[REDACTED_TOKEN]` é igual nos dois lados
- Validar que URL do webhook é acessível publicamente


# 🎯 Guia de Integração: Sistema de Pagamento em Horas

## Status: ✅ Pronto para Uso

Sistema completo de pacotes de horas implementado e testado.

---

## 📊 Estrutura de Preços (Validado)

### Tabela de Comparação
| Horas | Preço/Hora | Preço Base | Com Taxas | Preço Efetivo/Hora |
|-------|-----------|-----------|-----------|-------------------|
| 40h | R$40 | R$1.600 | **R$2.986,80** | R$74,67 |
| 60h | R$20 | R$1.200 | **R$2.247,60** | R$37,46 |
| 75h | R$20 | R$1.500 | **R$2.802,00** | R$37,36 |
| 100h | R$20 | R$2.000 | **R$3.738,40** | R$37,38 |
| 420h | R$20 | R$8.400 | **R$15.553,20** | R$37,03 |

**Insight**: Comprar 60h+ sai mais barato por hora porque o preço base é apenas 50% do que 40h.

---

## 🔌 Endpoints Disponíveis

### 1. Listar Pacotes (Público)
```bash
GET /api/pricing/hour-packages
```

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "hours": 40,
      "pricePerHour": 40,
      "totalPrice": 1600
    },
    {
      "hours": 60,
      "pricePerHour": 20,
      "totalPrice": 1200
    }
    // ... até 420h
  ]
}
```

---

### 2. Calcular Preço (Público)
```bash
POST /api/pricing/calculate-hours
Content-Type: application/json

{
  "hours": 75,
  "characteristics": {
    "environments": 3,
    "people": 2,
    "complexity": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "hours": 75,
  "finalPrice": 2802,
  "breakdown": {
    "basePrice": 1500,
    "serviceFee": 600,
    "postWorkFee": 420,
    "organizationFee": 252,
    "productFee": 30
  },
  "pricePerHour": 20
}
```

---

### 3. Sugerir Pacote (Público)
```bash
GET /api/pricing/suggest-package?hoursNeeded=75
```

**Response:**
```json
{
  "success": true,
  "hoursRequested": 75,
  "suggestedPackage": {
    "hours": 80,
    "pricePerHour": 20,
    "totalPrice": 1600
  }
}
```

---

### 4. Estimate de Booking (Autenticado)
```bash
POST /api/pricing/booking-estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "durationHours": 3,
  "useHourCredit": true
}
```

**Response:**
```json
{
  "success": true,
  "finalPrice": 623.4,
  "paidWithCredits": true,
  "breakdown": {
    "items": [
      {"label": "Preço Base", "value": 60, "type": "base"},
      {"label": "Taxa Serviço", "value": 24, "type": "waived", "waived": true},
      {"label": "Pós-Obra", "value": 16.8, "type": "fee"},
      {"label": "Organização", "value": 10.08, "type": "fee"},
      {"label": "Produto", "value": 30, "type": "fixed"}
    ],
    "total": 623.4
  }
}
```

---

### 5. Comprar Pacote (Autenticado)
```bash
POST /api/pricing/purchase-package
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageHours": 60
}
```

---

### 6. Obter Crédito do Usuário (Autenticado)
```bash
GET /api/pricing/user-hour-credit
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "creditInfo": {
    "hasCredit": true,
    "availableHours": 60,
    "totalHours": 120,
    "usedHours": 60
  }
}
```

---

## 🎨 Componentes Frontend

### HourCalculator
Calculadora interativa com slider (1-420h). Atualiza preço em tempo real.

**Props:**
```jsx
<HourCalculator 
  onCalculate={(result) => console.log(result)}
  userId={userId}
/>
```

**Uso:**
Manter em qualquer página que queira mostrar preços dinâmicos.

---

### HourCheckout
Página completa de compra com calculadora + resumo + checkout.

**Route:**
```jsx
<Route path="/checkout/hours" component={HourCheckout} />
```

---

## 💾 Database Schema (Migrations)

Executar SQL em `database/migrations/[REDACTED_TOKEN].sql`:

```sql
-- Tabela de pacotes
CREATE TABLE hour_packages (
  id INTEGER PRIMARY KEY,
  hours INTEGER UNIQUE,
  price_per_hour DECIMAL(10,2),
  total_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT 1
);

-- Tabela de crédito de usuário
CREATE TABLE user_hour_credits (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  total_hours DECIMAL(10,2) DEFAULT 0,
  used_hours DECIMAL(10,2) DEFAULT 0,
  available_hours DECIMAL(10,2) DEFAULT 0,
  last_purchase_date DATETIME,
  expiry_date DATETIME
);

-- Adicionar colunas em bookings
ALTER TABLE bookings ADD COLUMN hours_used DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN paid_with_credits BOOLEAN DEFAULT 0;
```

---

## 🧪 Testes Validados

```bash
✅ Listar 20 pacotes (40h-420h)
✅ Calcular 75h = R$2.802
✅ Sugerir 80h para pedido de 75h
✅ Comparar: 60h é mais barato que 40h por hora
✅ Preço/hora consistente (R$37,36-37,46 para 60h+)
```

---

## 🔄 Fluxo de Compra Completo

```
1. Cliente vê HourCalculator
   ↓
2. Seleciona 75h no slider
   ↓
3. Sistema calcula R$2.802 com breakdown
   ↓
4. Cliente clica "Sugerir Pacote" → 80h sugerido
   ↓
5. Cliente seleciona 80h
   ↓
6. Vai para HourCheckout
   ↓
7. Escolhe método pagamento (PIX/Stripe)
   ↓
8. Clica "Comprar Agora"
   ↓
9. ProcessaPayment via POST /api/payments/process
   ↓
10. Se sucesso → addUserHourCredit(userId, 80h)
   ↓
11. Usuário vê: "✅ Você adquiriu 80 horas"
   ↓
12. Em próxima reserva → pode usar GET /api/pricing/user-hour-credit
    → vê 80h disponíveis
   ↓
13. Faz booking com useHourCredit=true
    → desconto de 40% (taxa serviço waived)
```

---

## ⚙️ Configuração de Taxas

Se precisar customizar, editar arquivo:  
`automation/pricing-matrix.json`

```json
{
  "[REDACTED_TOKEN]": 40,
  "postWorkPercentage": 20,
  "[REDACTED_TOKEN]": 10,
  "productFee": 30,
  "minimumPrice": 0,
  "maximumDiscount": 0.3
}
```

---

## 🚀 Próximas Melhorias

- [ ] Webhook para notificar expiração de horas
- [ ] Dashboard de consumo de horas por usuário
- [ ] Reembolso parcial de horas não usadas
- [ ] Transferência de horas entre usuários (presente)
- [ ] Integração com relatórios de ROI por pacote

---

## 📝 Exemplos cURL

### Listar pacotes:
```bash
curl -s http://localhost:3001/api/pricing/hour-packages | jq .
```

### Calcular 50h:
```bash
curl -X POST http://localhost:3001/api/pricing/calculate-hours \
  -H "Content-Type: application/json" \
  -d '{"hours": 50}'
```

### Sugerir para 55h:
```bash
curl -s "http://localhost:3001/api/pricing/suggest-package?hoursNeeded=55"
```

---

**Status**: ✅ Pronto para produção  
**Data**: 2026-02-09  
**Versão**: 1.0.0

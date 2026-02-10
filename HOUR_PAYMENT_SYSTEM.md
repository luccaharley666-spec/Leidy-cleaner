# Sistema de Pagamento em Horas 💰

## Visão Geral

Sistema de pacotes de horas pré-pagas onde clientes compram horas e usam conforme necessário, com preços dinâmicos baseados em quantidade e múltiplas taxas.

## Estrutura de Preços

### Pacotes Disponíveis
- **40h** @ R$40/h = **R$1.600**
- **60h, 80h, 100h...** @ R$20/h (aumenta 20h em 20h até 420h)

### Taxas Aplicadas (sobre preço base)
1. **Taxa de Serviço**: 40% do preço base
2. **Pós-Obra**: 20% do subtotal (basePrice + serviceFee)
3. **Organização**: 10% do subtotal até agora
4. **Produto**: R$30 fixo (sem taxa adicional)

### Exemplo: 50 horas
```
Preço Base:        R$1.000 (50h × R$20/h)
Taxa Serviço:      +R$400 (40%)
Subtotal:          R$1.400
Pós-Obra:          +R$280 (20%)
Subtotal:          R$1.680
Organização:       +R$168 (10%)
Subtotal:          R$1.848
Produto:           +R$30
─────────────────────────
TOTAL:             R$1.878
```

## Endpoints da API

### GET `/api/pricing/hour-packages`
Lista todos os pacotes disponíveis.

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "hours": 40,
      "pricePerHour": 40,
      "totalPrice": 1600,
      "description": "40 horas de serviço"
    },
    ...
  ]
}
```

### POST `/api/pricing/calculate-hours`
Calcula preço final para uma determinada quantidade de horas.

**Body:**
```json
{
  "hours": 50,
  "characteristics": {
    "environments": 1,
    "people": 1,
    "complexity": "low"
  }
}
```

**Response:**
```json
{
  "success": true,
  "hours": 50,
  "breakdown": {
    "basePrice": 1000,
    "serviceFee": 400,
    "postWorkFee": 280,
    "organizationFee": 168,
    "productFee": 30
  },
  "finalPrice": 1878,
  "pricePerHour": 20,
  "creditInfo": {
    "hasCredit": false,
    "availableHours": 0
  }
}
```

### GET `/api/pricing/suggest-package?hoursNeeded=55`
Sugere automaticamente um pacote baseado em horas solicitadas.

**Response:**
```json
{
  "success": true,
  "hoursRequested": 55,
  "suggestedPackage": {
    "hours": 60,
    "pricePerHour": 20,
    "totalPrice": 1200
  }
}
```

### POST `/api/pricing/purchase-package` *(com autenticação)*
Compra um pacote de horas e adiciona crédito à conta.

**Body:**
```json
{
  "packageHours": 60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully purchased 60 hours",
  "package": { ... }
}
```

### GET `/api/pricing/user-hour-credit` *(com autenticação)*
Retorna informações de crédito de horas do usuário.

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

## Componentes Frontend

### `HourCalculator.jsx`
Calculadora interativa com:
- Slider para seleção de horas (1-420h)
- Visualização em tempo real de taxas e total
- Listagem de pacotes sugeridos
- Integração com crédito do usuário

### `HourCheckout.jsx`
Página de compra com:
- Calculadora embutida
- Resumo de crédito atual
- Seleção de método de pagamento (PIX/Stripe)
- Processamento de pagamento

## Schema do Banco

### `hour_packages`
```sql
CREATE TABLE hour_packages (
  id INTEGER PRIMARY KEY,
  hours INTEGER UNIQUE,
  price_per_hour DECIMAL(10,2),
  total_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT 1
);
```

### `user_hour_credits`
```sql
CREATE TABLE user_hour_credits (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  total_hours DECIMAL(10,2),
  used_hours DECIMAL(10,2),
  available_hours DECIMAL(10,2),
  last_purchase_date DATETIME,
  expiry_date DATETIME
);
```

### Alterações em `bookings`
```sql
ALTER TABLE bookings ADD COLUMN hours_used DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN paid_with_credits BOOLEAN DEFAULT 0;
```

## Fluxo de Compra

1. **Cliente vê calculadora** → Seleciona horas desejadas
2. **Sistema calcula preço** → Mostra breakdown de todas as taxas
3. **Cliente escolhe pacote** → Sugere próximo pacote se necessário
4. **Seleciona pagamento** → PIX ou Cartão
5. **Processa pagamento** → Integra com PaymentController
6. **Adiciona crédito** → Horas somadas a `user_hour_credits`
7. **Cliente usa horas** → Em booking posterior, consome do saldo

## Características Futuras

- [ ] Expiração de horas (365 dias por padrão)
- [ ] Desconto se usar crédito (não cobra taxa de serviço)
- [ ] Transferência de horas entre usuários
- [ ] Histórico de consumo de horas
- [ ] Alertas quando horas estão próxima de expirar
- [ ] Reembolso de horas não usadas (até 30 dias)

## Arquivo de Configuração

As taxas podem ser centralizadas em `automation/pricing-matrix.json`:

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

**Status**: ✅ Implementado e testado em desenvolvimento
**Última Atualização**: 2026-02-09

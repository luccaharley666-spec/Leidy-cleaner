# 🔌 API Reference - Todos os Endpoints

**Leidy Cleaner REST API**  
**Base URL:** `http://localhost:3001` or `https://api.leidycleaner.com.br`  
**Versão:** v1  
**Segurança:** JWT Bearer Token

---

## 📋 Índice Rápido

1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Serviços](#serviços)
4. [Agendamentos (Bookings)](#agendamentos)
5. [Preços](#preços)
6. [Transações](#transações)
7. [Avaliações](#avaliações)
8. [Notificações](#notificações)
9. [Chat](#chat)
10. [Admin](#admin)

---

## 🔐 Autenticação

Todos os endpoints protegidos requerem:
```
Authorization: Bearer {accessToken}
```

### POST /api/auth/login
Fazer login e obter tokens JWT

**Request:**
```json
{
  "email": "admin@leidycleaner.com.br",
  "password": "AdminPassword123!@#"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "user": {
    "id": 1,
    "email": "admin@leidycleaner.com.br",
    "name": "Admin",
    "role": "admin"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /api/auth/logout
Fazer logout (opcional, JWT é stateless)

### POST /api/auth/refresh
Renovar access token

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

---

## 👥 Usuários

### GET /api/users
Listar todos os usuários (Admin only)

**Response:** 200 OK
```json
{
  "success": true,
  "users": [...]
}
```

### GET /api/users/{id}
Obter detalhes de um usuário

**Response:** 200 OK
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@leidycleaner.com.br",
    "name": "Admin",
    "role": "admin",
    "phone": "5551999999999",
    "is_active": true
  }
}
```

### POST /api/users
Criar novo usuário (Admin only)

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "5551999999999",
  "password": "SecurePass123!@#",
  "role": "customer"
}
```

### PUT /api/users/{id}
Atualizar usuário

**Request:**
```json
{
  "name": "João Silva Updated",
  "phone": "5551988888888"
}
```

### DELETE /api/users/{id}
Deletar usuário (Admin only)

---

## 🧹 Serviços

### GET /api/services
Listar todos os serviços (Público)

**Response:** 200 OK
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "Limpeza Residencial Básica",
      "description": "Limpeza completa até 100m²",
      "base_price": 150.00,
      "duration_minutes": 120,
      "category": "residencial",
      "is_active": true
    }
  ]
}
```

### GET /api/services/{id}
Obter detalhes de um serviço

### POST /api/services
Criar novo serviço (Admin/Manager only)

**Request:**
```json
{
  "name": "Novo Serviço",
  "description": "Descrição",
  "base_price": 200.00,
  "duration_minutes": 120,
  "category": "residencial"
}
```

### PUT /api/services/{id}
Atualizar serviço

### DELETE /api/services/{id}
Deletar serviço

---

## 📅 Agendamentos

### GET /api/bookings
Listar agendamentos (filtrado por role)

**Query Params:**
- `status` (pending, confirmed, completed, cancelled)
- `user_id` (customer only)
- `date_from` (YYYY-MM-DD)
- `date_to` (YYYY-MM-DD)

**Response:** 200 OK
```json
{
  "success": true,
  "bookings": [
    {
      "id": 1,
      "user_id": 10,
      "service_id": 1,
      "booking_date": "2026-02-15T09:00:00Z",
      "address": "Rua A, 123",
      "status": "confirmed",
      "payment_status": "paid",
      "total_price": 150.00
    }
  ]
}
```

### POST /api/bookings
Criar novo agendamento

**Request:**
```json
{
  "service_id": 1,
  "booking_date": "2026-02-15T09:00:00Z",
  "address": "Rua A, 123",
  "metragem": 80,
  "notes": "Observações opcionais"
}
```

### GET /api/bookings/{id}
Obter detalhes de um agendamento

### PUT /api/bookings/{id}
Atualizar agendamento (antes de confirmar)

**Request:**
```json
{
  "booking_date": "2026-02-16T10:00:00Z",
  "address": "Novo endereço"
}
```

### DELETE /api/bookings/{id}
Cancelar agendamento

---

## 💰 Preços

### GET /api/pricing/hour-packages
Obter pacotes de horas (Public)

**Response:** 200 OK
```json
{
  "success": true,
  "packages": [
    {
      "hours": 40,
      "pricePerHour": 40,
      "totalPrice": 1600,
      "description": "40 horas de serviço"
    }
  ]
}
```

### POST /api/pricing/calculate-hours
Calcular preço para N horas (Public)

**Request:**
```json
{
  "hours": 60,
  "serviceType": "residential"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "hours": 60,
  "baseCost": 1200,
  "taxes": {
    "serviceTax": 480,
    "postWorkTax": 336,
    "orgTax": 201.6,
    "productFee": 30
  },
  "finalPrice": 2247.60
}
```

---

## 💳 Transações (Pagamentos)

### GET /api/transactions
Listar transações

**Query Params:**
- `status` (pending, completed, refunded)
- `payment_method` (pix, card, stripe)

### POST /api/transactions
Criar transação

**Request:**
```json
{
  "booking_id": 1,
  "amount": 150.00,
  "payment_method": "pix"
}
```

### GET /api/transactions/{id}
Obter detalhes de transação

### POST /api/transactions/{id}/refund
Reembolsar transação (Admin only)

---

## ⭐ Avaliações (Reviews)

### GET /api/reviews
Listar avaliações (Public)

**Query Params:**
- `service_id`
- `rating` (1-5)

### POST /api/reviews
Criar avaliação (Customer only, após booking completo)

**Request:**
```json
{
  "booking_id": 1,
  "rating": 5,
  "comment": "Excelente serviço!"
}
```

### GET /api/reviews/{id}
Obter detalhes de avaliação

### PUT /api/reviews/{id}
Editar avaliação (próprio customer)

### DELETE /api/reviews/{id}
Deletar avaliação (próprio customer ou admin)

---

## 🔔 Notificações

### GET /api/notifications
Listar notificações do usuário atual

**Query Params:**
- `is_read` (true/false)

### GET /api/notifications/{id}
Obter detalhes de notificação

### PUT /api/notifications/{id}/read
Marcar como lida

### DELETE /api/notifications/{id}
Deletar notificação

---

## 💬 Chat

### GET /api/chat/messages/{booking_id}
Listar mensagens de um agendamento

**Response:** 200 OK
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "user_id": 1,
      "message": "Olá, tudo bem?",
      "created_at": "2026-02-10T12:00:00Z",
      "user": {
        "name": "Admin"
      }
    }
  ]
}
```

### POST /api/chat/messages
Enviar mensagem (WebSocket para real-time)

**Request:**
```json
{
  "booking_id": 1,
  "message": "Olá, tudo bem?"
}
```

---

## 🔧 Admin

### GET /api/admin/dashboard
Dashboard administrativo

**Query Params:**
- `period` (week, month, year)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalRevenue": 5000.00,
      "totalBookings": 12,
      "averageRating": 4.5,
      "conversionRate": 3.2
    },
    "charts": {
      "salesData": [...],
      "serviceData": [...],
      "monthlyRevenue": [...]
    },
    "recentBookings": [...]
  }
}
```

### GET /api/admin/users
Listar todos os usuários com detalhes

### GET /api/admin/bookings
Listar todos os agendamentos

### GET /api/admin/transactions
Listar todas as transações

### POST /api/admin/reports/generate
Gerar relatório (PDF)

**Request:**
```json
{
  "type": "monthly",
  "month": "2026-02",
  "format": "pdf"
}
```

---

## 🏥 Health Check

### GET /api/health
Verificar status do sistema (Public)

**Response:** 200 OK
```json
{
  "status": "healthy" ou "degraded",
  "services": {
    "database": {"status": "healthy"},
    "cache": {"status": "healthy"},
    "system": {"status": "healthy"}
  }
}
```

---

## 🔗 WebSocket (Real-time)

### ws://localhost:3001/socket.io
Conexão WebSocket para chat em tempo real

**Eventos:**
- `message:new` - Nova mensagem
- `booking:updated` - Agendamento atualizado
- `notification:new` - Nova notificação

---

## ⏱️ Códigos de Status HTTP

| Status | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 204 | No Content - Deletado com sucesso |
| 400 | Bad Request - Requisição inválida |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito nos dados |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

---

## 🛡️ Rate Limiting

- **Login:** 5 tentativas por 15 minutos
- **Geral:** 100 requisições por 15 minutos
- **Header:** `[REDACTED_TOKEN]`

---

## 📝 Notas Importantes

1. **Autenticação:** JWT válido por 24h. Refresh token válido por 7 dias.
2. **Timezone:** Todos os timestamps em UTC (ISO 8601)
3. **Encoding:** UTF-8 para todos os dados
4. **CORS:** Configurado para localhost:3000 e frontend
5. **Paginação:** Use query params `page` e `limit` onde aplicável

---

**Documentado em:** 2026-02-10  
**Versão da API:** v1  
**Status:** ✅ Pronto para Integração

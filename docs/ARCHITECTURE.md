# 🏗️ Arquitetura do Projeto Vamos

## 📋 Estrutura Geral

```
vamos/
├── backend/              # Node.js + Express
│   ├── src/
│   │   ├── controllers/  # Lógica de requisição
│   │   ├── services/     # Lógica de negócio
│   │   ├── models/       # Estruturas de dados
│   │   ├── routes/       # Definição de endpoints
│   │   ├── middleware/   # Autenticação, validação, paginação
│   │   ├── utils/        # Funções auxiliares
│   │   ├── db/           # Camada de banco de dados
│   │   └── __tests__/    # Testes unitários
│   └── package.json
│
├── frontend/            # Next.js + React
│   ├── src/
│   │   ├── components/  # Componentes React reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── context/     # Context API
│   │   ├── styles/      # CSS/Tailwind
│   │   └── utils/       # Funções auxiliares
│   └── package.json
│
├── public/             # Frontend estático (HTML)
│   ├── index.html
│   ├── app-completo.js
│   └── admin-dashboard-new.html
│
├── database/           # Scripts de database
│   ├── schema.sql      # Schema inicial
│   ├── migrations/     # Migrations versionadas
│   └── [REDACTED_TOKEN].sql  # Índices para performance
│
└── docs/              # Documentação
```

## 🔄 Fluxo de Dados

### 1. Autenticação
```
POST /api/auth/login
  ↓ (credenciais)
AuthController.login()
  ↓ (valida)
JWT gerado (24h)
  ↓
Token retornado ao cliente
  ↓
Cliente armazena em localStorage
  ↓
Requisições futuras com: Authorization: Bearer {token}
```

### 2. Agendamento
```
POST /api/bookings (autenticado)
  ↓
BookingController.createBooking()
  ↓
BookingService.validateAndCreate()
  ↓ (calcula preço)
PricingService.calculatePrice()
  ↓
PaymentController.processPayment() (Stripe)
  ↓
DB: INSERT bookings + INSERT transactions
  ↓
EmailService.sendConfirmation()
  ↓
GET 200 com booking_id
```

### 3. Admin Dashboard
```
GET /api/admin/dashboard (admin only)
  ↓
AdminController.getDashboard()
  ↓
4 queries paralelas:
  - COUNT bookings, SUM revenue
  - Bookings por status
  - Top 5 clientes (com JOINs)
  - Taxa cancelamento
  ↓
Response em ~200ms (com índices)
```

## 🔐 Segurança - Camadas

### Middleware Chain
```
1. authenticateToken()      → Valida JWT
2. authorizeRole()          → Verifica admin/staff/customer
3. [REDACTED_TOKEN]()   → Sanitiza inputs
4. rateLimit()              → Rate limiting por IP
5. [REDACTED_TOKEN]()   → Parse limit/page
```

## 📊 Database Design

### Tabelas Principais

```sql
-- Usuários
users(id, email, password_hash, name, role, ...)

-- Agendamentos
bookings(id, user_id, service_id, booking_date, status, payment_status, total_price, ...)
  Índices: user_id, booking_date, status, payment_status

-- Serviços
services(id, name, category, base_price, ...)

-- Reviews
reviews(id, booking_id, user_id, rating, comment, ...)

-- Transações
transactions(id, booking_id, stripe_charge_id, amount, status, ...)

-- Dados Empresa
company_info(bank, account, pix, cnpj, ...)
```

## 🧪 Testes

### Estratégia

```
Backend:  30.58% coverage (982 tests)
Frontend: 0% coverage (EM DESENVOLVIMENTO)

Tipos de teste:
├── Unit     → Funções isoladas (services, utils)
├── Integration → Controllers ↔ Database
├── E2E      → Fluxos reais do usuário
└── Security → JWT, CSRF, SQL Injection, etc.
```

## ⚡ Performance

### Otimizações Implementadas

1. **Database**
   - Índices em colunas de busca frequente
   - JOINs ao invés de N+1 queries
   - ANALYZE para query optimization

2. **Backend**
   - Paginação de listas (limit 20-100)
   - Redis caching (configurable)
   - Query response time < 200ms

3. **Frontend**
   - Code splitting por rota
   - Lazy loading de imagens
   - Minificação de assets

## 🚀 Deployment

### Ambientes

```
Development:
  Frontend: http://localhost:3000 (Vite/Next.js dev server)
  Backend:  http://localhost:3001 (Node.js)
  Database: SQLite (local file)

Production:
  Frontend: Vercel (CDN global)
  Backend:  Railway (Node.js managed)
  Database: Supabase PostgreSQL (opcional upgrade)
```

## 📝 Padrões de Código

### Controller
```javascript
async createBooking(req, res) {
  try {
    // 1. Validar entrada
    const { errors } = [REDACTED_TOKEN](req.body);
    if (errors.length) return res.status(400).json({ errors });

    // 2. Delegar lógica para Service
    const booking = await bookingService.create(req.body);

    // 3. Retornar resposta
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Service
```javascript
async create(data) {
  // Validação
  validateInput(data);
  
  // Lógica de negócio
  const price = priceCalculator.calculate(data);
  
  // Database
  const booking = await db.insert('bookings', {
    ...data,
    total_price: price
  });
  
  return booking;
}
```

## 🔄 CI/CD Pipeline

```yaml
on: push to main
  ↓
1. Lint (ESLint, Prettier)
  ↓
2. Test (Jest - Backend + Frontend)
  ↓
3. Coverage (Codecov - min 30%)
  ↓
4. Build (Next.js frontend, Node.js backend)
  ↓
5. Deploy (Vercel + Railway)
  ↓
6. Smoke Tests (básico)
```

## ⚠️ Problemas Conhecidos

1. ❌ Frontend duplicado (4 versões) - Removido em limpeza
2. ❌ 22 vulnerabilidades npm - Reduzido para 10
3. ⚠️ 0% testes frontend - Em desenvolvimento
4. ⚠️ Redis não implementado - Configurado, não usado
5. ⚠️ Sem PWA/offline - Planejado para future release

## 📚 Documentação Relacionada

- [API.md](../docs/API.md) - Referência de endpoints
- [TESTING.md](../backend/TESTING.md) - Guia de testes
- [DEPLOYMENT.md](../docs/DEPLOYMENT.md) - Guia de deploy

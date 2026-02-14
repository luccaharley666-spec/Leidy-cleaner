# ⚠️ PROBLEMAS DE QUALIDADE E PERFORMANCE

**Data:** 14 de Fevereiro de 2026  
**Foco:** Problemas técnicos além de segurança  
**Total:** 12 problemas identificados  

---

## 🔴 PERFORMANCE CRÍTICA

### 1. **API Sem Paginação - Pode Retornar Milhares de Registros**

**Endpoints Afetados:**
- `GET /api/bookings` 
- `GET /api/services`
- `GET /api/users` (admin)
- `GET /api/payments`

**Problema:**
```javascript
// ❌ RUIM
app.get('/api/bookings', (req, res) => {
  const bookings = db.all('SELECT * FROM bookings');
  res.json(bookings);  // Pode retornar 10.000+ registros!
});
```

**Impacto:**
- Se DB tiver 50.000 bookings, retorna tudo
- Usa 500MB+ de memória
- Congela navegador no frontend
- Timeout no frontend/backend

**Solução:**
```javascript
// ✅ BOM
app.get('/api/bookings', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (parseInt(req.query.page) || 1 - 1) * limit;
  
  const bookings = db.all(
    'SELECT * FROM bookings LIMIT ? OFFSET ?',
    [limit, offset]
  );
  
  const total = db.get('SELECT COUNT(*) as count FROM bookings').count;
  
  res.json({ 
    data: bookings, 
    total, 
    page: Math.ceil(offset / limit) + 1,
    pageSize: limit
  });
});
```

---

### 2. **Database Sem Índices - Queries Lentes**

**Arquivo:** [`backend/src/db/migrations.sql`](backend/src/db/migrations.sql)

**Problema:**
```sql
-- ❌ Tabelas sem índices
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,  -- Sem índice!
  service_id INTEGER NOT NULL,  -- Sem índice!
  status TEXT,  -- Sem índice!
  created_at DATETIME,  -- Sem índice!
  -- Quando faz: SELECT * FROM bookings WHERE user_id = 5
  -- Tem que varrer TODA a tabela (full table scan)
);
```

**Impacto:**
- Query `SELECT * FROM bookings WHERE user_id = 5` varre 100.000+ linhas
- Cada query de admin dashboard leva 10+ segundos
- Servidor fica lento ao vivo

**Solução:**
```sql
-- ✅ BOM - Adicionar índices
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_date ON bookings(date DESC);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_users_email ON users(email);
```

---

### 3. **Frontend Faz 10+ Requests Sequenciais Em Vez De Paralelo**

**Exemplo:**
```javascript
// ❌ RUIM - uno a uno
const user = await fetch('/api/user').then(r => r.json());
const bookings = await fetch('/api/bookings').then(r => r.json());
const services = await fetch('/api/services').then(r => r.json());
const payments = await fetch('/api/payments').then(r => r.json());
// Total: 4 * 500ms = 2 segundos!
```

**Solução:**
```javascript
// ✅ BOM - Em paralelo
const [user, bookings, services, payments] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/bookings').then(r => r.json()),
  fetch('/api/services').then(r => r.json()),
  fetch('/api/payments').then(r => r.json()),
]);
// Total: max(500ms) = 500ms!
```

---

## 🟠 QUALIDADE DE CÓDIGO

### 4. **Falta Input Validation - SQL Injection Possível**

**Arquivo:**  [`backend/src/routes/bookingsRoutes.js`](backend/src/routes/bookingsRoutes.js)

**Problema:**
```javascript
// ❌ PERIGO - Sem validação
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  // Se status vem como:  "cancelled' OR '1'='1"
  // SQL fica: UPDATE bookings SET status = 'cancelled' OR '1'='1' WHERE id=5
  // Atualiza TODOS os bookings!
  
  db.run('UPDATE bookings SET status = ?, notes = ? WHERE id = ?', 
    [status, notes, id]);
});
```

**Impacto:**
- SQL injection exploração
- Alguém pode deletar/modificar dados de outros usuários
- Roubo de dados

**Solução:**
```javascript
// ✅ SEGURO - Com validação
import { z } from 'zod';

const BookingUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  notes: z.string().max(500).optional(),
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const validated = BookingUpdateSchema.parse(req.body);
    
    db.run('UPDATE bookings SET status = ?, notes = ? WHERE id = ?', 
      [validated.status, validated.notes, id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});
```

---

### 5. **Sem Rate Limiting Em Endpoints Sensíveis**

**Problema:**
```javascript
// ❌ SEM PROTEÇÃO
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Sem proteção! Alguém pode fazer:
  // for i in {1..10000}: curl -X POST /api/auth/login -d "email=admin@ex.com&password=..."
  // Brute force attack
  
  // Tenta 10.000 senhas por segundo
});
```

**Impacto:**
- Brute force de senhas
- DDoS possível
- Força bruta de 2FA

**Solução:**
```javascript
// ✅ BOM - Rate limiting
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,  // máx 5 tentativas
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  keyGenerator: (req) => req.body?.email || req.ip,
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  // ...
});

// E para endpoints de API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minuto
  max: 100,  // 100 requests por minuto
});

app.use('/api/', apiLimiter);
```

---

### 6. **Não Remove Dados em Soft Delete - Exposição de Info**

**Arquivo:** [`backend/src/routes/recurringBookingsRoutes.js`](backend/src/routes/recurringBookingsRoutes.js#L211)

```sql
-- ❌ RUIM - Soft delete
UPDATE recurring_bookings SET is_active = 0 WHERE id = 5;

-- Depois:
SELECT * FROM recurring_bookings WHERE is_active = 1;
-- Mas dados ainda estão lá!
-- Admin malicioso pode fazer:
SELECT * FROM recurring_bookings;  -- Vê tudo deletado
```

**Impacto:**
- Dados "deletados" ainda acessíveis
- Admin pode recuperar dados de clientes que deletaram conta
- LGPD compliance: direito ao esquecimento violado

**Solução:**
```sql
-- ✅ BOM - Hard delete para dados sensíveis
DELETE FROM recurring_bookings WHERE id = 5;

-- OU criptografar dados antes de soft delete
UPDATE users 
SET 
  phone = NULL,
  address = NULL,
  cpf_cnpj = NULL,
  -- Outros campos sensíveis
  is_active = 0 
WHERE id = 5;
```

---

### 7. **Sem Versioning de API - Quebra Compatibilidade**

**Problema:**
```javascript
// Versão 1
app.get('/api/bookings', ...);
// Retorna: { bookings: [...] }

// 6 meses depois, refatora:
// Versão 2
app.get('/api/bookings', ...);
// Retorna: { data: [...], pagination: {...} }

// ❌ Apps antigos quebram!
```

**Solução:**
```javascript
// ✅ BOM - Versionamento
app.get('/api/v1/bookings', ...);  // Versão 1
app.get('/api/v2/bookings', ...);  // Versão 2

// Clients continuam funcionando:
// Cliente v1 usa: GET /api/v1/bookings
// Cliente v2 usa: GET /api/v2/bookings
```

---

## 🟡 LOGGING E OBSERVABILIDADE

### 8. **Console.log() Em Produção - Pode Expor Dados**

**Exemplos Encontrados:**
```javascript
// ❌ RUIM
console.log('User data:', user);  // Se user tiver password, fica visível
console.log('Payment webhook:', webhook);  // Dados de pagamento em logs
console.log('Error:', error);  // Stack trace expõe código
```

**Impacto:**
- Logs em produção visíveis publicamente
- Dados sensíveis em Sentry/logs
- PII (Personally Identifiable Information) em logs

**Solução:**
```javascript
// ✅ BOM - Logger estruturado sem dados sensíveis
logger.info('User logged in', { userId: user.id }); // ID, não dados
logger.error('Payment failed', { 
  bookingId: booking.id,  // ID, não dados completos
  error: error.message 
});

// Sanitizar dados sensíveis
function sanitize(obj) {
  delete obj.password;
  delete obj.token;
  delete obj.creditCard;
  return obj;
}
```

---

### 9. **Sem Error Boundaries no React - Erro Branco**

**Frontend Problem:**
```javascript
// ❌ RUIM - Se component quebra, tela inteira branca
function Dashboard() {
  // Se `data` é undefined...
  return <div>{data.bookings.map(...)}</div>;  // TypeError!
}
// Screen fica branco, usuário não sabe o que fazer
```

**Solução:**
```javascript
// ✅ BOM - Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-message">
          <h2>Algo deu errado</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usar:
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

---

### 10. **Sem Validação de Schema no Request**

**Problema:**
```javascript
// ❌ RUIM - Aceita qualquer coisa
app.post('/api/bookings', (req, res) => {
  const { service_id, date, time } = req.body;
  
  // E se alguém mandar:
  // {
  //   service_id: "abc",  // String em vez de número
  //   date: "invalid",    // Não é data
  //   time: null,         // Null
  //   extra_field: "hack" // Campo não esperado
  // }
  
  db.run('INSERT INTO bookings (...) VALUES (...)', [service_id, date, time]);
  // Erro SQL ou comportamento inesperado
});
```

**Solução:**
```javascript
// ✅ BOM - Validar schema
import { z } from 'zod';

const BookingSchema = z.object({
  service_id: z.number().int().positive(),
  date: z.string().date(),  // YYYY-MM-DD
  time: z.string().regex(/^\d{2}:\d{2}$/),  // HH:MM
  address: z.string().min(5),
  phone: z.string().regex(/^\(?\d{2}\)?.*\d{4}-\d{4}$/),  // Telefone
});

app.post('/api/bookings', (req, res) => {
  try {
    const validated = BookingSchema.parse(req.body);
    
    db.run('INSERT INTO bookings (...) VALUES (...)', 
      [validated.service_id, validated.date, validated.time]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});
```

---

### 11. **Sem Swagger/OpenAPI - Difícil Usar API**

**Problema:**
- Ninguém sabe quais endpoints existem
- Qual é o request body esperado?
- Qual é o response format?
- Quais erros podem aparecer?

**Solução:**
```javascript
// ✅ BOM - Adicionar Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Leidy Cleaner API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3001/api' }],
  },
  apis: ['./routes/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Em cada rota:
/**
 * @openapi
 * /bookings:
 *   post:
 *     summary: Criar novo agendamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service_id, date, time]
 *             properties:
 *               service_id: { type: number }
 *               date: { type: string, format: date }
 *     responses:
 *       201: { description: Booking criado }
 *       422: { description: Validação falhou }
 */
```

---

## 🟡 TESTING

### 12. **Testes Podem Estar Incompletos - Coverage Baixa**

**Problema:**
- `npm test` pode passar mas com 20% coverage
- Casos edge não testados
- Refatoração quebra funcionalidade

**Solução:**
```bash
# ✅ BOM - Verificar coverage
npm test -- --coverage

# Esperado: > 60% coverage mínimo

# E2E tests para fluxos críticos:
npm run test:e2e
# Login → Booking → Payment → Confirmação
```

---

## 📊 RESUMO - PROBLEMAS ENCONTRADOS

| # | Problema | Tipo | Risco | Tempo Fix |
|---|----------|------|-------|-----------|
| 1 | Sem paginação | Performance | Alto | 1-2h |
| 2 | Sem índices DB | Performance | Alto | 1h |
| 3 | Requests sequencial | Performance | Médio | 30min |
| 4 | Sem input validation | Security | Crítico | 2-3h |
| 5 | Sem rate limiting | Security | Alto | 30min |
| 6 | Soft delete expõe dados | Compliance | Médio | 1h |
| 7 | Sem versionamento API | Quality | Médio | 2h |
| 8 | Console.log em prod | Security | Médio | 1h |
| 9 | Sem Error Boundaries | UX | Médio | 2h |
| 10 | Sem schema validation | Quality | Alto | 1-2h |
| 11 | Sem Swagger/API docs | Quality | Baixo | 2h |
| 12 | Testes incompletos | Quality | Médio | 3-4h |

**Total de esforço:** ~18-24 horas distribuídas

---

## ✅ CHECKLIST - O QUE FAZER

### 🔴 CRÍTICO - ANTES DE DEPLOY (4-5 horas)
- [ ] Adicionar paginação aos endpoints GET
- [ ] Criar índices no banco de dados
- [ ] Adicionar input validation com Zod
- [ ] Adicionar rate limiting

### 🟠 IMPORTANTE - SEMANA 1 (5-6 horas)
- [ ] Refatorar requests parallelo
- [ ] Remover console.log
- [ ] Implementar soft delete seguro
- [ ] Adicionar Error Boundaries

### 🟡 MELHORIAS - SEMANA 2 (5-6 horas)
- [ ] API versionamento (/v1, /v2)
- [ ] Swagger/OpenAPI docs
- [ ] Aumentar test coverage
- [ ] Adicionar E2E tests

---

**Documento:** ANÁLISE DE QUALIDADE E PERFORMANCE  
**Data:** 14 de Fevereiro de 2026  
**Total de Problemas:** 12  
**Tempo Total de Correção:** ~18-24 horas  

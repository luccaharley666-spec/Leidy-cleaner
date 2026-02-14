# 📋 PLANO DE CORREÇÃO - 12 PROBLEMAS DE QUALIDADE E PERFORMANCE

**Status:** 🔴 INICIANDO  
**Total de Problemas:** 12  
**Tempo Estimado:** ~18-24 horas distribuído  
**Prioridade:** CRÍTICOS (4) → IMPORTANTES (4) → MELHORIAS (4)  

---

## 🔴 CRÍTICOS - FAZER ANTES DO DEPLOY (4-5 horas)

### ✅ 1. Adicionar Paginação aos Endpoints GET
**Status:** ⏳ TODO  
**Tempo:** 1-2 horas  
**Impacto:** Alto (evita crash com muitos dados)  
**Arquivos:**
- `backend/src/routes/api.js` - GETs principais
- `backend/src/routes/adminRoutes.js` - Linha 59 (teams), 178 (services)
- `backend/src/routes/analyticsRoutes.js` - Endpoints de analytics

**Implementação:**
```javascript
// ANTES: Retorna todos
const teams = await db.all(`SELECT * FROM teams`);

// DEPOIS: Retorna paginado
const limit = Math.min(parseInt(req.query.limit) || 20, 100);
const page = parseInt(req.query.page) || 1;
const offset = (page - 1) * limit;
const teams = await db.all(
  `SELECT * FROM teams LIMIT ? OFFSET ?`,
  [limit, offset]
);
const total = await db.get(`SELECT COUNT(*) as count FROM teams`);
return { data: teams, total, page, pageSize: limit };
```

---

### ✅ 2. Criar Índices no Banco de Dados
**Status:** ⏳ TODO  
**Tempo:** 30 minutos  
**Impacto:** Alto (15-100x mais rápido em queries)  
**Arquivo:** `backend/src/db/migrations.sql`

**Índices Faltantes:**
```sql
-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Users (já tem email, role)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Payments (já tem vários, verificar se faltam)
CREATE INDEX IF NOT EXISTS idx_payments_confirmed_at ON payments(confirmed_at);

-- Recurring Bookings
CREATE INDEX IF NOT EXISTS idx_recurring_is_active ON recurring_bookings(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_service_id ON recurring_bookings(service_id);

-- Loyalty History (já tem user_id)
CREATE INDEX IF NOT EXISTS idx_loyalty_booking ON loyalty_history(booking_id);
```

---

### ✅ 3. Adicionar Input Validation com Zod
**Status:** ⏳ TODO  
**Tempo:** 2-3 horas  
**Impacto:** Alto (previne SQL injection + dados inválidos)  
**Arquivo:** `backend/src/utils/joiSchemas.js` (ou criar `zodSchemas.js`)

**O Que Validar:**
- POST /api/admin/teams
- POST /api/admin/services
- PUT /api/admin/teams/:id
- PUT /api/admin/services/:id
- POST /api/bookings (cliente)
- etc...

**Exemplo:**
```javascript
import { z } from 'zod';

const TeamSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  manager_id: z.number().int().positive(),
});

const ServiceSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.enum(['limpeza', 'organização', 'outro']),
  base_price: z.number().positive(),
  duration_minutes: z.number().int().min(15).max(480).optional(),
});
```

---

### ✅ 4. Adicionar Rate Limiting
**Status:** ⏳ TODO  
**Tempo:** 30 minutos  
**Impacto:** Alto (previne brute force + DDoS)  
**Arquivo:** `backend/src/middleware/rateLimited.js` (já existe, expandir)

**O Que Limitar:**
- POST /api/auth/login - 5 tentativas por 15min
- POST /api/bookings - 20 por min para user
- POST /api/payments - 10 por min para user
- GET /api/* - 100 por min geral

---

## 🟠 IMPORTANTES - SEMANA 1 (5-6 horas)

### ✅ 5. Paralelizar Requests no Frontend
**Status:** ⏳ TODO  
**Tempo:** 1 hora  
**Impacto:** Médio (2s → 500ms)  
**Arquivo:** Frontend pages que fazem fetch sequencial

---

### ✅ 6. Remover console.log() de Produção
**Status:** ⏳ TODO  
**Tempo:** 1-2 horas  
**Impacto:** Médio (segurança)  
**Buscar:** `console.log` + `console.error` sem logger

---

### ✅ 7. Implementar Soft Delete Seguro
**Status:** ⏳ TODO  
**Tempo:** 1-2 horas  
**Impacto:** Médio (LGPD compliance)  
**Arquivo:** `backend/src/routes/recurringBookingsRoutes.js` linha 211

---

### ✅ 8. Adicionar Error Boundaries React
**Status:** ⏳ TODO  
**Tempo:** 1-2 horas  
**Impacto:** Médio (UX melhorada)  
**Arquivo:** Frontend components principais

---

## 🟡 MELHORIAS - SEMANA 2 (5-6 horas)

### ✅ 9. API Versionamento
**Status:** ⏳ TODO  
**Tempo:** 2 horas  
**Impacto:** Baixo (preparação para futuro)

---

### ✅ 10. Swagger/OpenAPI Docs
**Status:** ⏳ TODO  
**Tempo:** 2 horas  
**Impacto:** Baixo (documentação)

---

### ✅ 11. Aumentar Test Coverage
**Status:** ⏳ TODO  
**Tempo:** 3-4 horas  
**Impacto:** Médio (qualidade)

---

### ✅ 12. Adicionar E2E Tests
**Status:** ⏳ TODO  
**Tempo:** 3-4 horas  
**Impacto:** Médio (confiabilidade)

---

## 🎯 SEQUÊNCIA RECOMENDADA

### HOJE (30 min):
1. ✅ 2. Índices DB (30 min)

### HOJE (1-2 horas):
2. ✅ 1. Paginação (1-2h)

### HOJE (2-3 horas):
3. ✅ 3. Input Validation (2-3h)

### AMANHÃ (30 min):
4. ✅ 4. Rate Limiting (30 min)

### DEPOIS:
5. Paralelizar requests (1h)
6. console.log cleanup (1-2h)
7. Soft delete (1-2h)
8. Error Boundaries (1-2h)
9. API versionamento (2h)
10. Swagger (2h)
11. Tests (3-4h)
12. E2E (3-4h)

---

## ✅ CHECKLIST FINAL

Antes de fazer deploy para produção:
- [ ] Paginação implementada
- [ ] Índices criados
- [ ] Input validation em todos endpoints
- [ ] Rate limiting ativo
- [ ] npm test passa
- [ ] Sem console.log em prod
- [ ] Error handling completo

---

**Arquivo criado em:** 14/02/2026 às 14:30  
**Status:** 🔴 AGUARDANDO EXECUÇÃO  

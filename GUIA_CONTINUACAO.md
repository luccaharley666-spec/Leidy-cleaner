# 🎯 Guia Rápido - Continuação do Desenvolvimento

## TL;DR - Status Atual

✅ **Plataforma funcional** - Core flows validados  
✅ **74% testes passando** - 57/77 testes OK  
✅ **Deploy dockerizado** - Pronto para staging  
⏳ **20 testes falhando** - Maioria em staffing (não críticos)

---

## 🚀 Start Quick

```bash
cd /workspaces/voltamos

# Iniciar tudo
docker-compose -f docker-compose.dev.yml up -d

# Verificar saúde
docker-compose -f docker-compose.dev.yml logs backend | grep "Backend running"

# Testar
curl http://localhost:3001/health
```

---

## 🔨 Tarefas Prioritárias

### 1. ⏳ Corrigir Testes de Staffing (20 testes)

**Localização**: `backend/src/__tests__/integration/api.integration.test.ts` (linhas 490-855)

**Problema**: Token de staff não está sendo gerado corretamente

**To-Do**:
```typescript
// 1. Criar função helper para gerar staff users
async function createStaffUser() {
  const staffRes = await request(app)
    .post('/api/v1/auth/register')
    .send({...});
  
  // 2. Elevar para staff role
  const { query } = require('../../utils/database');
  await query('UPDATE users SET role = $1 WHERE email = $2', ['staff', email]);
  
  // 3. Re-login para obter token com role correto
  const loginRes = await request(app).post('/api/v1/auth/login')...
  
  return loginRes.body.data.tokens.accessToken;
}
```

**Estimado**: 1-2 horas

---

### 2. 💳 Stripe Integration Real (Opcional)

**Localização**: `backend/src/controllers/PaymentController.ts`

**Current**: Fallback mode (marca como paid automaticamente)

**To-Do**:
```bash
# 1. Obter Stripe keys
export STRIPE_SECRET_KEY="sk_test_xxx"
export STRIPE_PUBLISHABLE_KEY="pk_test_xxx"

# 2. Implementar webhook listener
# 3. Testar checkout fluxo

# 4. Frontend: Adicionar Stripe checkout element
```

**Estimado**: 2-3 horas

---

### 3. 📱 Frontend E2E Tests (Playwright)

**Setup**:
```bash
cd frontend
npm install @playwright/test --save-dev
npx playwright install
```

**Test Básico**:
```typescript
// tests/booking.spec.ts
import { test, expect } from '@playwright/test';

test('Como usuário novo, fazer uma booking', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Preencher register
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'Test123!');
  await page.click('button:has-text("Registrar")');
  
  // Aguardar redirect
  await page.waitForURL('**/dashboard');
  
  // Criar booking...
});
```

**Estimado**: 3-4 horas

---

## 📊 Métricas & Monitoramento

### Backend Health Check

```bash
# Status geral
curl http://localhost:3001/health | jq .

# Com mais detalhes (quando implementado)
curl http://localhost:3001/metrics | jq .

# Logs
docker-compose -f docker-compose.dev.yml logs -f backend --tail 50
```

### Database Queries

```bash
# Conectar ao postgres
docker-compose -f docker-compose.dev.yml exec postgres psql -U vammos -d vammos_dev

# Comandos úteis
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bookings;
SELECT id, email, role FROM users LIMIT 5;
```

---

## 🐛 Debug Tips

### Backend Debug Mode

```bash
# Rebuild com verbose logging
cd backend
NODE_ENV=debug npm run dev

# Ou via Docker
docker-compose -f docker-compose.dev.yml up backend
# E depois:
docker logs voltamos_backend -f
```

### Database Issues

```bash
# Reset database (limpar tudo)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres

# Aguardar postgres iniciar
sleep 10

# Rerun migrations
docker-compose -f docker-compose.dev.yml up -d backend
```

### Test Debugging

```bash
# Run specific test
cd backend
npm test -- --testNamePattern="Admin stats"

# Run with verbose output
npm test -- --verbose

# Debug mode (interactive)
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📚 Estrutura de Código

```
backend/
├── src/
│   ├── controllers/        # RequestHandlers
│   ├── services/           # Business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, error handling
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Helpers (JWT, DB, logger)
│   ├── db/                 # Migrations, seed
│   └── __tests__/          # Test files
├── dist/                   # Compiled JS (git-ignored)
├── package.json
├── tsconfig.json
└── jest.config.js

frontend/
├── src/
│   ├── app/                # Next.js pages
│   ├── components/         # Reusable React components
│   ├── contexts/           # React contexts (auth, user, etc)
│   ├── services/           # API clients
│   └── utils/              # Helpers
├── tests/                  # Playwright E2E tests (future)
├── public/                 # Static assets
└── package.json
```

---

## 🔐 Segurança - Checklist

- [ ] JWT secret não no .env público (usar secrets manager)
- [ ] CORS configurado (apenas origins autorizados)
- [ ] Rate limiting ativo
- [ ] Password hashing (bcrypt) validado
- [ ] SQL injection prevention (Joi validation)
- [ ] HTTPS/TLS em produção
- [ ] Audit logs para operações sensíveis

---

## 📦 Deployment Checklist

### Pre-Staging
- [x] Core features testadas
- [x] Database migrations OK
- [x] Docker images buildadas
- [ ] Environment vars documentadas
- [ ] Performance baseline estabelecida

### Pre-Production
- [ ] 90%+ test coverage
- [ ] Security audit
- [ ] Load testing (min 1000 concurrent users)
- [ ] Rollback plan
- [ ] Monitoring/alertas configurados
- [ ] Backup strategy
- [ ] Disaster recovery tested

---

## 🆘 Troubleshooting

### Backend não inicia

```bash
# 1. Verificar se port 3001 está em uso
lsof -i :3001

# 2. Verificar postgres conecta
docker-compose -f docker-compose.dev.yml logs postgres

# 3. Limpar e reiniciar
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d backend
```

### Testes falhando

```bash
# 1. Clear node modules cache
rm -rf backend/node_modules backend/package-lock.json
npm install

# 2. Rebuild TypeScript
npm run build

# 3. Reset test DB
npm run test:db:reset  # (se existir script)
```

### Frontend não carrega

```bash
# 1. Limpar cache Next.js
rm -rf frontend/.next
npm run build

# 2. Verificar se API está acessível
curl http://localhost:3001/api/v1/services
```

---

## 📖 Referências Rápidas

### Adicionar Novo Endpoint

**1. Criar route handler**:
```typescript
// src/controllers/MyController.ts
export default class MyController {
  static async getMe(req: Request, res: Response) {
    try {
      const data = await MyService.getData();
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
```

**2. Registrar rota**:
```typescript
// src/routes/my.ts
import MyController from '../controllers/MyController';
router.get('/me', authenticateToken, MyController.getMe);
```

**3. Registrar no main**:
```typescript
// src/main.ts
import myRoutes from './routes/my';
app.use('/api/v1/my', myRoutes);
```

**4. Testar**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/v1/my/me
```

---

### Adicionar Nova Migration

```bash
# 1. Criar arquivo
touch backend/migrations/XYZ_descrição.sql

# 2. Escrever SQL
cat > backend/migrations/011_add_field.sql << 'EOF'
ALTER TABLE bookings ADD COLUMN custom_field VARCHAR(255);
EOF

# 3. Reexecute (automatic on next docker up)
docker-compose -f docker-compose.dev.yml restart backend
```

---

## 📞 Contatos & Links

- **Status**: [STATUS_DEPLOY.md](STATUS_DEPLOY.md)
- **Relatório Completo**: [RELATORIO_FINAL_TESTES.md](RELATORIO_FINAL_TESTES.md)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)

---

**Última Atualização**: 2026-02-19 06:35 UTC  
**Versão**: v0.1.0 (MVP)  
**Status**: 🟡 Em Refinamento

---

## ⭐ Quick Commands Reference

```bash
# Start everything
docker-compose -f docker-compose.dev.yml up -d

# Stop everything
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run backend tests
cd backend && npm test

# Run with watch
cd backend && npm run test:watch

# Build only (no start)
docker-compose -f docker-compose.dev.yml build

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Execute command in backend
docker-compose -f docker-compose.dev.yml exec backend npm run build

# Database shell
docker-compose -f docker-compose.dev.yml exec postgres psql -U vammos -d vammos_dev

# Fresh start (clean slate)
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d
```

✅ **Ready to go!** Happy coding! 🚀

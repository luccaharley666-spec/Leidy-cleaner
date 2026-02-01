# 🗺️ ROADMAP TÉCNICO - VAMOS PROJECT

**Status:** Análise Completa  
**Próximas Fases:** 3-4 semanas até produção segura  
**Data:** Fevereiro 2026

---

## FASE 0: EMERGÊNCIA (Semana 1) ⚠️

### Issues Críticas de Segurança

```
TEMPO TOTAL: 6-8 horas | PRIORIDADE: 🔴 URGENT
```

- [ ] **SEC-001:** Fix JWT hardcoded secrets (15 min)
  ```javascript
  // backend/src/middleware/auth.js
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set');
  }
  ```

- [ ] **SEC-002:** Fix Socket.io CORS wildcard (15 min)
  ```javascript
  // backend/src/index.js
  cors: { 
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
  }
  ```

- [ ] **SEC-003:** Add Chat message validation (45 min)
  ```javascript
  // backend/src/services/ChatService.js
  const MAX_MSG_LENGTH = 1000;
  if (!message || message.length > MAX_MSG_LENGTH) {
    throw new Error('Message invalid');
  }
  ```

- [ ] **SEC-004:** Replace console.log → logger (30 min)
  - Search: `console\.log|console\.error`
  - Replace: `logger.debug|logger.error`

- [ ] **SEC-005:** Add .env validation (1 hora)
  ```javascript
  // backend/src/config/env.js
  const schema = z.object({
    JWT_SECRET: z.string().min(32),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['dev', 'prod']),
  });
  
  const config = schema.parse(process.env);
  module.exports = config;
  ```

- [ ] **CODE-001:** Centralize DB helpers (2 horas)
  ```javascript
  // backend/src/utils/db-helpers.js
  module.exports = {
    getDb,
    runAsync,
    getAsync,
    allAsync,
  };
  ```

- [ ] **PERF-004:** Remove bcryptjs (5 min)
  ```bash
  npm uninstall bcryptjs
  # Keep only: bcrypt ^6.0.0
  ```

- [ ] **Setup:** Add .prettierrc (5 min)
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

---

## FASE 1: HARDENING (Semana 2-3) 🛡️

### 20-30 horas | Segurança + Testes + CI/CD

#### A. Rate Limiting Granular (SEC-005) [4 horas]
```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas por 15 min
  keyGenerator: (req) => req.body.email,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 req por minuto por IP
});

const chatLimiter = rateLimit({
  windowMs: 1000,
  max: 1, // 1 msg por segundo
});

module.exports = { loginLimiter, apiLimiter, chatLimiter };
```

Aplicar:
```javascript
router.post('/auth/login', loginLimiter, AuthController.login);
app.use('/api/', apiLimiter);
router.on('send-message', chatLimiter);
```

#### B. Input Validation com Zod (CODE-005) [6 horas]
```javascript
// backend/src/schemas/booking.js
const { z } = require('zod');

const CreateBookingSchema = z.object({
  userId: z.number().positive(),
  serviceId: z.number().positive(),
  date: z.string().datetime(),
  address: z.string().min(5).max(255),
  phone: z.string().regex(/^\d{11}$/),
  notes: z.string().max(500).optional(),
});

module.exports = { CreateBookingSchema };
```

Aplicar em todos controllers:
```javascript
router.post('/bookings', (req, res) => {
  const data = CreateBookingSchema.parse(req.body);
  // ... rest of logic
});
```

#### C. Structured Logging (OPS-005) [4 horas]
```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usar em toda parte:
logger.info('User logged in', { userId: 123, timestamp: new Date() });
logger.error('Payment failed', { bookingId: 456, error: err.message });
```

#### D. GitHub Actions CI/CD (4 horas)
```yaml
# .github/workflows/ci.yml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm test
      - run: cd backend && npm run build
      
      - name: Deploy to Railway
        if: github.ref == 'refs/heads/main'
        run: |
          npm install -g railway
          railway up
```

#### E. CSRF Protection (SEC-006) [4 horas]
```javascript
// backend/src/middleware/csrf.js
const csurf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csurf({ cookie: false }));

// GET /csrf-token retorna token
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Validar em POST/PUT/DELETE
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  next(err);
});
```

---

## FASE 2: OBSERVABILIDADE (Semana 4) 📊

### 20-25 horas | Monitoring + Performance

#### A. Database Indexes [2 horas]
```sql
-- database/migrations/002_indexes.sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

#### B. Query Optimization [4 horas]
```javascript
// backend/src/controllers/StaffController.js
// ANTES: 5 queries
async getDashboard(req, res) {
  const earnings = await db.query('SELECT ...');
  const monthly = await db.query('SELECT ...');
  const upcoming = await db.query('SELECT ...');
  const reviews = await db.query('SELECT ...');
  const streak = await db.query('SELECT ...');
}

// DEPOIS: 1 query
async getDashboard(req, res) {
  const result = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM bookings...) as total_completed,
      (SELECT SUM(...)) as earnings,
      (SELECT AVG(...)) as avg_rating,
      ...
  `);
}
```

#### C. APM Integration [6 horas]

**Sentry for Error Tracking:**
```javascript
// backend/src/index.js
const Sentry = require('@sentry/node');

Sentry.init({ 
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Datadog for Metrics:**
```javascript
const StatsD = require('node-dogstatsd').StatsD;
const dogstatsd = new StatsD();

// Track booking creation
dogstatsd.increment('booking.created', 1, { service: 'api' });

// Track API latency
const start = Date.now();
// ... endpoint logic
dogstatsd.histogram('api.latency_ms', Date.now() - start);
```

#### D. Caching with Redis [6 horas]
```javascript
// backend/src/services/CacheService.js
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

class CacheService {
  async get(key) {
    return JSON.parse(await client.get(key));
  }

  async set(key, value, ttl = 3600) {
    await client.setEx(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(keys);
  }
}
```

Usar em queries frequentes:
```javascript
// bookings/staff/:id/dashboard
const cacheKey = `staff:${staffId}:dashboard`;
let dashboard = await CacheService.get(cacheKey);

if (!dashboard) {
  dashboard = await db.query(...);
  await CacheService.set(cacheKey, dashboard, 1800); // 30 min
}

return res.json(dashboard);
```

---

## FASE 3: ESCALABILIDADE (Mês 2) 📈

### 30-40 horas | TypeScript + Testes + Docs

#### A. TypeScript Migration [15 horas]

1. **Setup TypeScript:**
   ```bash
   npm install typescript ts-node @types/node @types/express
   npx tsc --init
   ```

2. **Backend Type System:**
   ```typescript
   // backend/src/types/index.ts
   export interface User {
     id: number;
     email: string;
     name: string;
     role: 'admin' | 'staff' | 'customer';
     createdAt: Date;
   }

   export interface Booking {
     id: number;
     userId: number;
     date: Date;
     status: 'pending' | 'confirmed' | 'completed';
     finalPrice: number;
   }
   ```

3. **Convert Controllers Gradually:**
   ```typescript
   // backend/src/controllers/AuthController.ts
   import { Request, Response } from 'express';
   import { CreateUserDTO } from '../dtos/user.dto';

   export class AuthController {
     async register(req: Request<{}, {}, CreateUserDTO>, res: Response): Promise<void> {
       // ...
     }
   }
   ```

#### B. E2E Tests [10 horas]

```javascript
// frontend/cypress/e2e/booking.cy.js
describe('Booking Flow', () => {
  it('should create booking successfully', () => {
    cy.visit('http://localhost:3000');
    cy.contains('button', 'Login').click();
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('button', 'Entrar').click();
    
    cy.contains('button', 'Novo Agendamento').click();
    cy.get('input[name="date"]').type('2026-02-15');
    cy.contains('button', 'Agendar').click();
    
    cy.contains('Agendamento realizado').should('be.visible');
  });

  it('should show error with invalid date', () => {
    // ... test invalid date
  });
});
```

#### C. API Documentation [8 horas]

```yaml
# docs/openapi.yaml
openapi: 3.0.0
info:
  title: Vamos API
  version: 1.0.0

paths:
  /bookings:
    post:
      summary: Create booking
      security:
        - BearerAuth: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBookingRequest'
      responses:
        '201':
          description: Booking created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Booking'
```

Install Swagger UI:
```bash
npm install swagger-ui-express swagger-jsdoc
```

#### D. Database Versioning [4 horas]

```javascript
// backend/src/db/migrations.js
const migrations = [
  {
    version: '001',
    name: 'initial_schema.sql',
    up: async (db) => { /* run migrations */ },
    down: async (db) => { /* rollback */ },
  },
  {
    version: '002',
    name: 'add_indexes.sql',
    up: async (db) => { /* add indexes */ },
    down: async (db) => { /* drop indexes */ },
  },
];
```

---

## FASE 4: PRODUÇÃO (Mês 2-3) 🚀

### 20-25 horas | Deployment + Backup + Scaling

#### A. Database Backup Strategy [3 horas]

```bash
# scripts/backup-db.sh
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/database_$DATE.sql"

# Supabase automatic backups
# Manual backup if using self-hosted
pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" s3://vamos-backups/

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

Schedule with cron:
```bash
0 2 * * * /app/scripts/backup-db.sh
```

#### B. Multi-Environment Config [4 horas]

```javascript
// backend/src/config/index.js
const environments = {
  development: {
    database: 'sqlite://./backend_data/database.sqlite',
    redis: 'redis://localhost:6379',
    logLevel: 'debug',
    apiUrl: 'http://localhost:3001',
  },
  staging: {
    database: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL,
    logLevel: 'info',
    apiUrl: 'https://staging-api.vamos.com',
  },
  production: {
    database: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL,
    logLevel: 'warn',
    apiUrl: 'https://api.vamos.com',
  },
};

module.exports = environments[process.env.NODE_ENV || 'development'];
```

#### C. Zero-Downtime Deployment [5 horas]

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    image: vamos-backend:${VERSION}
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health']
      interval: 10s
      timeout: 5s
      retries: 3
```

Blue-Green Deploy:
```bash
# scripts/deploy.sh
VERSION=$(date +%Y%m%d_%H%M%S)

# Build new version (GREEN)
docker build -t vamos-backend:$VERSION .

# Run health checks on GREEN
docker run --health-start-period=30s vamos-backend:$VERSION

# Switch traffic from BLUE to GREEN
docker service update --image vamos-backend:$VERSION vamos_backend

# Keep BLUE running 1 hour for rollback
```

#### D. Horizontal Scaling [5 horas]

```javascript
// backend/src/index.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  console.log(`Master process ${process.pid} starting ${numCPUs} workers`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart
  });
} else {
  const app = require('./app');
  app.listen(3001);
}
```

Load balancer config:
```nginx
# nginx.conf
upstream backend {
  server backend-1:3001;
  server backend-2:3001;
  server backend-3:3001;
}

server {
  listen 80;
  location /api {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

---

## 📊 TIMELINE SUMMARY

```
FASE 0 (Week 1)     ████ 6-8h     Critical Security Fixes
FASE 1 (Week 2-3)   ████████ 20-30h Security + CI/CD
FASE 2 (Week 4)     ███████ 20-25h Monitoring + Perf
FASE 3 (Month 2)    ████████ 30-40h TypeScript + Tests
FASE 4 (Month 2-3)  ███████ 20-25h Production Ready
                    ─────────────────────────────
                    📊 TOTAL: 96-128 hours
                    👥 Team: 2-3 developers
                    📅 Duration: 6-8 weeks
```

---

## ✅ DÉFINITION OF DONE

Project is **production-ready** when:

- [ ] All critical security issues fixed (SEC-001 to SEC-008)
- [ ] Rate limiting granular implementado
- [ ] Logging estruturado com JSON
- [ ] Database indexação completa
- [ ] API documentation com Swagger
- [ ] E2E tests para critical paths
- [ ] CI/CD pipeline com GitHub Actions
- [ ] APM (Sentry + Datadog) integrado
- [ ] Backup strategy implementado
- [ ] 70%+ test coverage
- [ ] Zero console.log em código
- [ ] Nenhuma hardcoded secret
- [ ] Docker multi-stage otimizado
- [ ] Load balancer + scaling strategy

---

## 🎯 SUCCESS METRICS

| Métrica | Current | Target | Deadline |
|---------|---------|--------|----------|
| Security Score | 5/10 | 8/10 | Semana 3 |
| Test Coverage | <10% | 70% | Mês 2 |
| API Response Time | ?ms | <200ms p95 | Mês 2 |
| Uptime | 99% | 99.9% | Mês 3 |
| Bug Rate | High | <1% | Mês 2 |
| Deployment Time | Manual | <5min | Semana 3 |

---

**Generated:** 01/02/2026  
**Next Review:** 08/02/2026 (after Phase 0)

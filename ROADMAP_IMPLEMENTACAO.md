# 🚀 ROADMAP TÉCNICO + QUICK WINS

## 🎯 QUICK WINS (Implementar Hoje - 2-3 horas)

### 1. JWT Secrets em Vault (30 min)
```bash
# Gerar secrets fortes
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Atualizar .env.production (em vault/secrets manager)
# Nunca commitar .env.production no git
```

### 2. Socket.io CORS Whitelist (20 min)
```javascript
// backend/src/index.js
const io = socketIO(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || [
      'https://seu-dominio.com',
      'https://app.seu-dominio.com'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});
```

### 3. Chat XSS Prevention (40 min)
```bash
npm install sanitize-html --save

# backend/src/services/ChatService.js
const sanitizeHtml = require('sanitize-html');

async sendMessage(message) {
  const clean = sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {}
  });
  // Store clean message
  return this.saveMessage(clean);
}
```

### 4. HTTPS + HSTS (30 min)
```javascript
// backend/src/index.js
const helmet = require('helmet');

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      res.redirect(`https://${req.get('host')}${req.url}`);
    }
    next();
  });
}

// Add security headers
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

### 5. CSRF Protection (30 min)
```bash
npm install csurf --save

# backend/src/middleware/csrf.js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

module.exports = [
  cookieParser(),
  csrf({ cookie: true })
];

# Use in routes:
app.use('/api', csrfMiddleware);
```

### 6. CPF Validation (25 min)
```bash
npm install cpf-cnpj --save

# backend/src/middleware/validation.js
const { CPF, CNPJ } = require('cpf-cnpj');

function validateCPF(cpf) {
  if (!CPF.isValid(cpf)) {
    throw new Error('Invalid CPF format');
  }
}

function validateCNPJ(cnpj) {
  if (!CNPJ.isValid(cnpj)) {
    throw new Error('Invalid CNPJ format');
  }
}
```

### 7. PII Masking in Logs (25 min)
```javascript
// backend/src/utils/logger.js
const maskSensitive = (str) => {
  if (!str) return str;
  // CPF: 123.456.789-09 → 123.***-09
  str = str.replace(/(\d{3})\.\d{3}\.\d{3}(\d{2})/g, '$1.***.***-$2');
  // Email: user@example.com → u***@example.com
  str = str.replace(/([a-zA-Z0-9])[a-zA-Z0-9]*@/g, '$1***@');
  return str;
};

const loggerFormat = format.printf(({ level, message, timestamp }) => {
  const masked = maskSensitive(message);
  return `${timestamp} [${level}] ${masked}`;
});
```

### 8. Rate Limiting por Rota (25 min)
```javascript
// backend/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Auth endpoints: 5 attempts/min
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

// API endpoints: 30 requests/min
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  skip: (req) => req.path === '/health' // Skip health checks
});

// Use: app.use('/api/auth', authLimiter);
```

---

## 📊 PHASE 1: Database Performance (12-16 hours)

### Week 1: Database Optimization

```sql
-- 1. Add indices (15 min)
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);

-- 2. Add foreign key constraints (10 min)
ALTER TABLE bookings ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES users(id);

-- 3. Query analysis (20 min)
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = 1;

-- 4. Fix N+1 queries with JOIN (1-2 hours)
-- Before:
-- SELECT * FROM bookings;
-- For each booking: SELECT * FROM users WHERE id = ?;

-- After:
SELECT b.*, u.name, u.email 
FROM bookings b 
JOIN users u ON b.user_id = u.id
WHERE b.user_id = ? 
ORDER BY b.created_at DESC
LIMIT 20 OFFSET 0;
```

### Week 2: Caching Layer (Redis)

```bash
npm install redis --save

# backend/src/utils/cache.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

async function getOrSet(key, ttl, fetchFn) {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await client.setEx(key, ttl, JSON.stringify(data));
  return data;
}

// Usage:
const stats = await getOrSet('reviews:stats', 3600, () => 
  ReviewController.getStats()
);
```

### Week 3: Backup Strategy

```bash
# Daily backup script
# backend/scripts/backup.sh

#!/bin/bash
BACKUP_DIR="/backups/db_backups"
DB_FILE="/workspaces/vamos/backend/backend_data/limpeza.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_FILE "$BACKUP_DIR/limpeza_$TIMESTAMP.db"

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR/limpeza_$TIMESTAMP.db" s3://my-bucket/backups/

echo "Backup completed: $TIMESTAMP"
```

---

## 🧪 PHASE 2: Testing & CI/CD (20-24 hours)

### Week 1: GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm run test -- --coverage

      - name: Security scan (Snyk)
        run: npx snyk test

      - name: SAST (SonarQube)
        uses: SonarSource/sonarcloud-github-action@master

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Week 2-3: E2E Tests (Cypress)

```bash
npm install cypress --save-dev

# cypress/e2e/booking.cy.js
describe('Booking Flow', () => {
  it('should create booking', () => {
    cy.visit('/agendar');
    cy.get('input[name="date"]').type('2026-02-15');
    cy.get('button').contains('Agendar').click();
    cy.contains('Agendamento confirmado').should('be.visible');
  });
});
```

---

## 🔐 PHASE 3: Security Hardening (16-20 hours)

### Checklist de Segurança

```javascript
// ✅ Implementar tudo abaixo

// 1. Helmet security headers
app.use(helmet());

// 2. CORS restritivo
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true
}));

// 3. Rate limit
app.use(rateLimit({ windowMs: 60*1000, max: 30 }));

// 4. CSRF protection
app.use(csrf());

// 5. Input validation
app.use(validateInput);

// 6. SQL injection prevention (parameterized queries)
// Already using sqlite3 params

// 7. Authentication
app.use(authMiddleware);

// 8. Authorization
app.use(checkPermissions);

// 9. Encryption for sensitive data
// Use bcrypt for passwords, encrypt PII

// 10. Audit logging
app.use(auditLogger);
```

---

## 📈 PHASE 4: TypeScript Migration (30-40 hours)

### Step-by-Step Migration

```typescript
// Step 1: Setup TypeScript
npm install typescript @types/node @types/express --save-dev

// Step 2: Create tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

// Step 3: Migrate incrementally
// utils/ → services/ → middleware/ → controllers/

// Step 4: Update package.json scripts
"build": "tsc",
"start": "node dist/index.js",
"dev": "ts-node src/index.js"
```

---

## 🎯 Success Metrics

| Métrica | Antes | Depois | Target |
|---------|-------|--------|--------|
| Security Score | 2/10 | 7/10 | 9/10 |
| Performance (P95) | 2s | 200ms | <100ms |
| Uptime | 95% | 99.5% | 99.99% |
| Test Coverage | <10% | 40% | 70% |
| Deploy Time | manual | 15min | 5min |
| MTTR (Mean Time to Recover) | 4hours | 30min | <5min |

---

## 💡 Implementação Sugerida

**Semana 1:** Quick wins (2-3 horas) + Security Critical (12-16 horas)  
**Semana 2-3:** Performance (12-16 horas)  
**Semana 4-5:** Testing & CI/CD (20-24 horas)  
**Semana 6-8:** TypeScript (30-40 horas)  

**Total:** ~100 horas = 2-3 meses

**Quer começar agora?** Vou implementar os quick wins! ⚡

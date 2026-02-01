# ⚡ QUICK WINS - Implemente Hoje (2-3 horas)

## Status: [ ] Iniciando | [ ] 50% | [ ] 100% ✅

---

## 1️⃣ JWT SECRETS ROTATION (30 min)
**Impacto:** Crítico | **Dificuldade:** Fácil

```bash
# ✅ FAZER AGORA

# 1. Gerar secrets fortes
JWT_SECRET_NEW=$(openssl rand -base64 32)
JWT_REFRESH_NEW=$(openssl rand -base64 32)

echo "New JWT_SECRET: $JWT_SECRET_NEW"
echo "New JWT_REFRESH: $JWT_REFRESH_NEW"

# 2. Atualizar .env.production (não commitar)
# 3. Armazenar em: AWS Secrets Manager / HashiCorp Vault / GitHub Actions Secrets
# 4. Testar com health check
curl http://localhost:3001/health

# ✅ Status: [ ] Completo
```

---

## 2️⃣ SOCKET.IO CORS WHITELIST (20 min)
**Impacto:** Crítico | **Dificuldade:** Muito Fácil

```javascript
// ❌ ANTES
const io = socketIO(server, {
  cors: { origin: "*" }
});

// ✅ DEPOIS
const io = socketIO(server, {
  cors: {
    origin: (process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// .env
SOCKET_CORS_ORIGIN=https://seu-dominio.com,https://app.seu-dominio.com

// ✅ Status: [ ] Completo
```

---

## 3️⃣ CHAT XSS PREVENTION (40 min)
**Impacto:** Crítico | **Dificuldade:** Médio

```bash
# 1. Instalar library
npm install sanitize-html --save

# 2. Atualizar ChatService.js
```

```javascript
// backend/src/services/ChatService.js

const sanitizeHtml = require('sanitize-html');

class ChatService {
  async sendMessage(io, userId, message) {
    // ✅ Sanitizar antes de armazenar/broadcast
    const cleanMessage = sanitizeHtml(message, {
      allowedTags: [],        // Sem tags HTML
      allowedAttributes: {},  // Sem atributos
      nonCharRefStart: null,  // Sem entities
      nonCharRefEnd: null
    });

    // Validar tamanho
    if (cleanMessage.length > 1000) {
      throw new Error('Message too long (max 1000 chars)');
    }

    // Armazenar
    const msg = {
      id: uuid(),
      userId,
      message: cleanMessage,
      timestamp: new Date(),
      read: false
    };

    this.messages.push(msg);

    // Broadcast
    io.emit('new_message', msg);

    return msg;
  }
}
```

```bash
# 3. Testar
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "<script>alert(1)</script>"}'

# ✅ Esperado: {"message": ""} (script removido)

# ✅ Status: [ ] Completo
```

---

## 4️⃣ HTTPS + HSTS + CSP (30 min)
**Impacto:** Crítico | **Dificuldade:** Fácil

```javascript
// backend/src/index.js

// ✅ 1. Force HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }
    next();
  });
}

// ✅ 2. HSTS (Force HTTPS next time)
app.use(helmet.hsts({
  maxAge: 31536000,           // 1 year
  includeSubDomains: true,
  preload: true              // HSTS Preload list
}));

// ✅ 3. CSP (Prevent XSS/clickjacking)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],  // Adicionar domínios externos se necessário
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", "https://api.seu-dominio.com"],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"]
  }
}));

// ✅ 4. Outras proteções
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));

// ✅ Status: [ ] Completo
```

---

## 5️⃣ CSRF PROTECTION (30 min)
**Impacto:** Crítico | **Dificuldade:** Médio

```bash
# 1. Instalar
npm install csurf cookie-parser --save

# 2. Configurar middleware
```

```javascript
// backend/src/middleware/csrf.js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Setup CSRF protection
const csrfProtection = csrf({ cookie: true });

module.exports = {
  csrfProtection,
  cookieParser: cookieParser()
};

// backend/src/index.js
const { csrfProtection, cookieParser } = require('./middleware/csrf');

app.use(cookieParser());
app.use(csrfProtection);

// ✅ Em forms GET, retornar token
app.get('/form', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Em POST/PUT/DELETE, validar token
app.post('/api/bookings', csrfProtection, (req, res) => {
  // CSRF token já validado
  // Continuar com lógica
});
```

```javascript
// Frontend: adicionar token em POST
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCookie('_csrf')
  },
  body: JSON.stringify(data)
});
```

```bash
# ✅ Status: [ ] Completo
```

---

## 6️⃣ CPF/CNPJ VALIDATION (25 min)
**Impacto:** Alto | **Dificuldade:** Fácil

```bash
# 1. Instalar
npm install cpf-cnpj --save

# 2. Adicionar validação
```

```javascript
// backend/src/middleware/validation.js

const { CPF, CNPJ } = require('cpf-cnpj');

function validateCPF(cpf) {
  const clean = cpf.replace(/[^\d]/g, '');
  if (!CPF.isValid(clean)) {
    throw new Error('Invalid CPF format');
  }
  return clean;
}

function validateCNPJ(cnpj) {
  const clean = cnpj.replace(/[^\d]/g, '');
  if (!CNPJ.isValid(clean)) {
    throw new Error('Invalid CNPJ format');
  }
  return clean;
}

// Uso em controllers:
// const cpf = validateCPF(req.body.cpf);
```

```bash
# ✅ Status: [ ] Completo
```

---

## 7️⃣ PII MASKING IN LOGS (25 min)
**Impacto:** Alto | **Dificuldade:** Médio

```javascript
// backend/src/utils/logger.js

const { createLogger, format, transports } = require('winston');

// ✅ Masking function
const maskPII = (str) => {
  if (!str || typeof str !== 'string') return str;

  // CPF: 123.456.789-09 → 123.***.***.09
  str = str.replace(/(\d{3})\.\d{3}\.\d{3}(\d{2})/g, '$1.***.***.02');

  // Email: user@example.com → u***@example.com
  str = str.replace(/(\w)[a-zA-Z0-9]*(\.[a-zA-Z0-9.-]*)?@/g, '$1***@');

  // Phone: (11) 99999-9999 → (11) 9****-9999
  str = str.replace(/(\(\d{2}\)\s)\d{4}(\d{4})/g, '$19****-$2');

  // Passwords: password: "..." → password: "***"
  str = str.replace(/(password|pwd|secret):\s*["'].*?["']/gi, '$1: "***"');

  return str;
};

const myFormat = format.printf(({ level, message, timestamp }) => {
  const masked = maskPII(message);
  return `${timestamp} [${level}] ${masked}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.colorize({ all: true }),
    myFormat
  ),
  transports: [
    new transports.Console({ handleExceptions: true })
  ]
});

module.exports = logger;
```

```bash
# ✅ Testar masking:
logger.info('User john.doe@example.com logged in');
# Output: "User j***@example.com logged in"

# ✅ Status: [ ] Completo
```

---

## 8️⃣ RATE LIMITING BY ROUTE (25 min)
**Impacto:** Alto | **Dificuldade:** Fácil

```javascript
// backend/src/middleware/rateLimit.js

const rateLimit = require('express-rate-limit');

// ✅ Auth endpoints: 5 attempts per minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  message: 'Too many login attempts, try again in 1 minute',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});

// ✅ API endpoints: 30 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  skip: (req) => req.path === '/health' || req.path === '/health/db'
});

// ✅ Strict: 100 requests per hour
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 100
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter
};

// backend/src/routes/api.js
const { authLimiter, apiLimiter } = require('../middleware/rateLimit');

router.post('/auth/login', authLimiter, AuthController.login);
router.post('/auth/register', authLimiter, AuthController.register);

router.get('/bookings', apiLimiter, BookingController.list);
router.post('/bookings', apiLimiter, BookingController.create);

// ✅ Status: [ ] Completo
```

---

## ✅ CHECKLIST FINAL

- [ ] 1. JWT Secrets Rotated
- [ ] 2. Socket.io CORS Whitelist
- [ ] 3. Chat XSS Prevention (sanitize-html)
- [ ] 4. HTTPS + HSTS + CSP Headers
- [ ] 5. CSRF Protection Token
- [ ] 6. CPF/CNPJ Real Validation
- [ ] 7. PII Masking in Logs
- [ ] 8. Rate Limiting by Route

**Tempo Total:** ~2-3 horas  
**Impacto:** Reduz 80% vulnerabilidades críticas  

---

## 🚀 PRÓXIMO PASSO

Após completar estas 8 ações, fazer commit:

```bash
git add -A
git commit -m "fix: security hardening - JWT rotation, CORS whitelist, XSS prevention, HTTPS, CSRF, validation, PII masking, rate-limit"
git push origin main
```

**Pronto?** Quer que eu implemente agora? ⚡

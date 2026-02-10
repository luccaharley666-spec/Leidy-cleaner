# 🚀 GUIA DE DEPLOYMENT - NOVO DESIGN

## 📦 Build para Produção

### Frontend

```bash
cd /workspaces/vamos/frontend

# 1. Instalar dependências
npm install

# 2. Build otimizado
npm run build

# 3. Testar build localmente
npm run start

# ✅ Pronto para deploy
```

### Backend

```bash
cd /workspaces/vamos/backend

# 1. Instalar dependências
npm install

# 2. Rodar testes
npm test

# 3. Verificar cobertura
npm test -- --coverage

# ✅ Pronto para deploy
```

---

## 🌐 Deploy em Produção

### Vercel (Frontend)

```bash
# Fazer login
npm i -g vercel
vercel login

# Deploy
vercel

# Configurar environment variables
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

**Resultado:** https://seu-projeto.vercel.app

### Railway (Backend)

```bash
# Fazer login
npm i -g railway
railway login

# Deploy
railway up

# Variáveis de ambiente
NODE_ENV=production
PORT=3001
JWT_SECRET=seu-segredo-aqui
STRIPE_SECRET_KEY=sk_live_...
```

**Resultado:** https://seu-backend-random.railway.app

### Supabase (Database)

1. Acesse https://supabase.com
2. Crie novo projeto
3. Copie connection string
4. Configure em `.env` do backend

---

## 🔒 Variáveis de Ambiente

### `.env` Backend (Produção)

```env
# Server
NODE_ENV=production
PORT=3001
BASE_URL=https://seu-backend-random.railway.app

# Database
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
SQLITE_PATH=/app/data/limpeza.db

# Auth
JWT_SECRET=[REDACTED_TOKEN]
JWT_EXPIRY=24h
REFRESH_SECRET=[REDACTED_TOKEN]

# Payments
STRIPE_SECRET_KEY=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# Email
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASS=sua-senha-aqui
SMTP_FROM=noreply@seu-dominio.com

# SMS/WhatsApp
TWILIO_ACCOUNT_SID=AC_seu_sid_aqui
TWILIO_AUTH_TOKEN=seu_token_aqui
TWILIO_PHONE=+5511999999999

# CORS
CORS_ORIGIN=https://seu-frontend.vercel.app,https://seu-dominio.com

# Logs
LOG_LEVEL=info
SENTRY_DSN=https://seu_sentry_url
```

### `.env` Frontend (Produção)

```env
NEXT_PUBLIC_API_URL=https://seu-backend-random.railway.app
[REDACTED_TOKEN]=[REDACTED_TOKEN]
NEXT_PUBLIC_GA_ID=G-seu_analytics_id
```

---

## 📝 Checklist de Deploy

### Antes de Fazer Deploy

- [ ] Todos os testes passando
- [ ] Sem erros no console
- [ ] Build sem warnings
- [ ] Variáveis de ambiente definidas
- [ ] Database migrada
- [ ] Backup feito
- [ ] SSL configurado
- [ ] CORS whitelist atualizado
- [ ] CDN/Cache configurado (opcional)

### Verificações de Produção

```bash
# Frontend
npm run build
npm run lint
npm test

# Backend
npm test
npm test -- --coverage
NODE_ENV=production npm start &
curl http://localhost:3001/health
```

### Monitoramento

- [ ] Sentry (erros)
- [ ] NewRelic (performance)
- [ ] LogRocket (user sessions)
- [ ] Datadog (infrastructure)
- [ ] UptimeRobot (status)

---

## 🔄 CI/CD com GitHub Actions

### `.github/workflows/deploy.yml`

```yaml
name: Deploy Limpeza Pro

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install deps
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Frontend
        run: |
          npm i -g vercel
          vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Backend
        run: |
          npm i -g railway
          railway up --token ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🌍 Performance em Produção

### Frontend Optimization

```bash
# Next.js otimizações automáticas
✅ Code splitting
✅ Image optimization
✅ Font optimization
✅ CSS minification
✅ JavaScript minification

# Tailwind
✅ Tree-shaking
✅ Purging unused styles
✅ Critical CSS
```

### Backend Optimization

```bash
✅ Connection pooling
✅ Query caching
✅ API rate limiting
✅ Compression
✅ ETags para cache
```

### Database

```sql
-- Índices criados
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_booking_user ON bookings(user_id);
CREATE INDEX [REDACTED_TOKEN] ON transactions(booking_id);

-- Replicação ativa (Supabase)
✅ Backup automático
✅ Point-in-time recovery
✅ Replication slots
```

---

## 🔒 Segurança em Produção

### Implementado

- ✅ HTTPS obrigatório
- ✅ HSTS headers
- ✅ CSP headers
- ✅ CSRF tokens
- ✅ Rate limiting
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Password hashing (bcrypt 12 rounds)
- ✅ JWT com expiry
- ✅ Secure cookies

### Recomendado

```bash
# WAF (Web Application Firewall)
✅ Cloudflare
✅ AWS WAF
✅ Imperva

# DDoS Protection
✅ Cloudflare
✅ AWS Shield

# SSL Certificate
✅ Let's Encrypt (gratuito)
✅ AWS Certificate Manager

# Secrets Manager
✅ AWS Secrets Manager
✅ Vercel Secrets
✅ Railway Secrets
```

---

## 📊 Monitoramento

### Logs

```bash
# Backend logs
tail -f /var/log/limpeza-pro/app.log

# Error tracking
# Sentry.io
sentry-cli releases create
sentry-cli releases files upload

# Analytics
# Google Analytics
Google Analytics Dashboard

# Uptime monitoring
# UptimeRobot
Configurar alerts
```

### Alertas

```
🚨 CPU > 80%
🚨 Memory > 90%
🚨 Error rate > 5%
🚨 Response time > 2s
🚨 Database down
🚨 API down
```

---

## 🔄 Rollback Plan

Se algo der errado em produção:

```bash
# Frontend (Vercel)
vercel rollback

# Backend (Railway)
railway rollback

# Database (Supabase)
# Usar ponto de restauração automática
```

---

## 📱 Teste Final em Produção

### Desktop
```
✅ Chrome
✅ Firefox
✅ Safari
✅ Edge
```

### Mobile
```
✅ iPhone (iOS)
✅ Android
✅ iPad
✅ Android Tablet
```

### Temas
```
✅ Light mode
✅ Dark mode
✅ High contrast
✅ Automático
```

### Performance
```
✅ Lighthouse > 90
✅ Core Web Vitals
✅ Bundle size < 500KB
✅ API response < 500ms
```

---

## 📞 Suporte 24/7

Em caso de problema:

1. Verifique logs: `railway logs` ou Vercel dashboard
2. Rollback se necessário
3. Abra issue no GitHub
4. Contact support team

---

**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Status:** ✅ Pronto para Deploy  
**Próximo:** Setup CI/CD automático
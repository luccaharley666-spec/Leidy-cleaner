# 🚀 Export Completo - Sistema Pronto para Importação

**Versão:** PROD SECURE (v3)  
**Data de Criação:** 10 de Fevereiro de 2026  
**Status:** ✅ Seguro para Exportação e Deploy  

---

## 📦 O Que Está Incluído

### ✅ Backend
- **Código-fonte:** Node.js/Express completo
- **Dependências:** `package.json` e `package-lock.json` (vulnerabilidades remediadas)
- **Serviços:** JWT auth, filas de email, WebSocket chat, integração PIX/Stripe
- **BD:** Configurado para SQLite (local) ou PostgreSQL (produção)

### ✅ Frontend
- **Código-fonte:** Next.js React app completo
- **Arquivos estáticos:** /public prontos
- **Configurações:** next.config.js, tailwind.config.js, tsconfig.json
- **OBS:** Construa com `npm run build` no seu ambiente

### ✅ Infraestrutura
- **Docker Compose:** `docker-compose.prod.yml` para orquestração
- **NGINX:** Configuração reversa proxy em `nginx/default.conf`
- **PM2:** Config de process manager em `deploy/pm2.config.js`
- **Scripts:** Migrações, seed, health checks em `scripts/`

### ✅ Documentação
- **SECURITY_FIXES.md:** Relatório de vulnerabilidades remediadas (17 → 7)
- **DEPLOYMENT_GUIDE.md:** Passos completos para deploy
- **Variáveis:** `.env.example` com todos os necessários

### ✅ Banco de Dados
- **Backup:** CSV exports em `/tmp/export_sql/` (separado deste ZIP)
- **Schema:** `schema_sqlite.sql` e `import_postgres.sql`
- **Dados:** Exemplo com usuários, bookings, pagamentos, chat

---

## 🔐 Mudanças de Segurança

### Vulnerabilidades Corrigidas
```
Antes: 17 vulnerabilidades (2 críticas, 11 high, 4 low)
Depois: 7 vulnerabilidades (0 críticas, 5 high, 2 low)

Redução: 59% ✅
Críticas eliminadas: 100% ✅
```

### Dependências Removidas
- ✅ `bull-board` (dashboard vulnerável)
- ✅ `@bull-board/api` e `@bull-board/express`
- ✅ `newrelic` (vulnerabilidades build-time)

### Dependências Atualizadas
- ✅ `axios` → versão segura (SSRF/CSRF fixes)
- ✅ Todas as dependências críticas auditadas

---

## 🚀 Como Usar Este Export

### 1️⃣ Extrair Pacote
```bash
unzip [REDACTED_TOKEN].zip
cd export_prod
```

### 2️⃣ Instalar Dependências
```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
npm install
npm run build
cd ..
```

### 3️⃣ Configurar Variáveis (CRÍTICO!)
```bash
# Copiar template
cp .env.example .env.production

# Editar com seus valores:
# - JWT_SECRET (gerar com: openssl rand -hex 32)
# - [REDACTED_TOKEN]
# - PIX_WEBHOOK_URL (seu domínio)
# - DATABASE_URL (Postgres recomendado)
# - REDIS_URL (opcional, para filas)
```

### 4️⃣ Importar Banco de Dados

#### Opção A: SQLite (desenvolvimento/teste)
```bash
# Banco já incluído em backend/backend_data/database.sqlite
# Ou restore do backup:
sqlite3 backend/backend_data/database.sqlite < scripts/schema_sqlite.sql
```

#### Opção B: PostgreSQL (produção recomendada)
```bash
# Criar DB
createdb seu_banco_producao

# Importar schema e dados
psql seu_banco_producao < scripts/import_postgres.sql

# Ou usar CSV para migrações customizadas:
python3 scripts/sqlite_to_postgres.py <source.db> <output_dir>
```

### 5️⃣ Deploy com Docker Compose
```bash
# Produção
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose -f docker-compose.prod.yml logs -f backend frontend
```

### 6️⃣ Ou Deploy com PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar com config
pm2 start deploy/pm2.config.js

# Monitorar
pm2 monit
```

### 7️⃣ Testar Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Auth (substitua credenciais)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha"}'

# Pricing
curl http://localhost:3001/api/pricing/default
```

---

## 📋 Checklist Pré-Deploy

- [ ] Extraído e instalado dependências (`npm install`)
- [ ] Frontend construído (`npm run build`)
- [ ] Variáveis de ambiente configuradas (`.env.production`)
- [ ] BD importada (SQLite ou PostgreSQL)
- [ ] JWT_SECRET gerado e definido (nunca commitar)
- [ ] [REDACTED_TOKEN] configurada
- [ ] PIX webhook registrado
- [ ] REDIS_URL (se usar filas persistentes)
- [ ] Azure/AWS/Heroku credenciais (se aplicável)
- [ ] Testes de health check passando
- [ ] HTTPS/SSL configurado (Let's Encrypt)

---

## 🔧 Variáveis de Ambiente Essenciais

```env
# JWT
JWT_SECRET=<[REDACTED_TOKEN]>
JWT_EXPIRATION=24h
[REDACTED_TOKEN]=7d

# Banco de Dados
DATABASE_URL=sqlite://./backend_data/database.sqlite
# OU para Postgres:
# DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (opcional)
REDIS_URL=redis://127.0.0.1:6379

# Pagamentos
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]

[REDACTED_TOKEN]=seu_webhook_secret
PIX_WEBHOOK_URL=https://seu-dominio.com/api/webhooks/pix

# Email
SMTP_HOST=smtp.seu-provider.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=senha_app

# Frontend
NEXT_PUBLIC_API_URL=https://seu-dominio.com/api
NEXT_PUBLIC_WS_URL=wss://seu-dominio.com

# Monitoramento (opcional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## 📊 Estrutura do Projeto

```
export_prod/
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── index.js           # Entry point
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── services/          # Serviços (auth, email, pagamentos)
│   │   ├── middleware/        # JWT, CORS, rate-limit, CSRF
│   │   ├── models/            # Schemas de dados
│   │   └── utils/             # Helpers, logger, queue
│   ├── backend_data/          # DB SQLite (vazio, você importa)
│   └── package.json           # Dependências (vulnerabilidades remediadas)
│
├── frontend_src/              # React/Next.js
│   ├── pages/                 # Rotas
│   ├── components/            # Componentes React
│   ├── styles/                # Tailwind CSS
│   └── hooks/                 # Custom hooks
├── frontend_public/           # Assets estáticos
│
├── nginx/                     # Configuração reverse proxy
├── deploy/                    # PM2 config
├── scripts/                   # Utilities (BD migrations, etc)
│
├── docker-compose.prod.yml    # Orquestra containers
├── .env.example               # Template de variáveis
├── SECURITY_FIXES.md          # Relatório de remediação
└── DEPLOYMENT_GUIDE.md        # Este documento
```

---

## 🆘 Troubleshooting

### "Port 3001 already in use"
```bash
# Matar processo anterior
kill -9 $(lsof -t -i:3001)
# Ou usar outra porta
PORT=3002 npm start
```

### "Cannot find module 'axios'"
```bash
cd backend
npm install axios
```

### "Database locked"
```bash
# SQLite problema (reinicie backend)
pkill -f "node src/index.js"
sleep 2
npm start
```

### "Stripe key not found"
```bash
# Verificar variáveis
echo $[REDACTED_TOKEN]
# Ou em .env.production
grep STRIPE .env.production
```

### "CORS error no frontend"
```bash
# Verificar NEXT_PUBLIC_API_URL
grep NEXT_PUBLIC_API_URL .env.production
# Deve apontar para http://localhost:3001 (dev) ou https://seu-dominio.com/api (prod)
```

---

## ✅ Próximas Ações Recomendadas

1. **Segurança:**
   - [ ] Gerar novo JWT_SECRET (`openssl rand -hex 32`)
   - [ ] Rotacionar chaves Stripe/PIX
   - [ ] Configurar firewall do servidor
   - [ ] Ativar HTTPS com Let's Encrypt

2. **Performance:**
   - [ ] Configurar Redis para sessões e fila
   - [ ] Ativar nginx caching para static assets
   - [ ] Compressão gzip em produção
   - [ ] CDN para media/imagens

3. **Observabilidade:**
   - [ ] Conectar Sentry para error tracking
   - [ ] Setup Prometheus + Grafana para métricas
   - [ ] Logging centralizado (CloudWatch, Datadog)
   - [ ] Alertas para downtimes

4. **Testes:**
   - [ ] Fluxo de teste: login → criar booking → pagamento
   - [ ] Teste de carga (k6, JMeter)
   - [ ] Backup automático do BD
   - [ ] Plano de disaster recovery

---

## 📞 Suporte

Para dúvidas ou issues:
- Verificar `SECURITY_FIXES.md` para detalhes de vulnerabilidades
- Consultar `DEPLOYMENT_GUIDE.md` para deploy completo
- Revisar logs: `docker-compose logs -f backend`
- Testar endpoints: `curl http://localhost:3001/api/health`

---

**Criado em:** 2026-02-10  
**Versão:** PROD SECURE (v3)  
**Status:** ✅ PRONTO PARA EXPORTAÇÃO


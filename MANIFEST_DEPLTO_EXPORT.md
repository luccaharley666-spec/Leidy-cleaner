# 📦 MANIFEST DE DEPLOY - LISTA DO QUE LEVAR

> **Checklist: exatamente o que deve ir para outro servidor**

---

## 🎯 RESUMO: O QUE TRANSFERIR

```
✅ CÓDIGO (Fundamental)
├─ /backend/               (API completa)
├─ /frontend/              (React app)
├─ docker-compose.prod.yml (produção)
└─ .env.production.example (template)

✅ DOCUMENTAÇÃO (Importante)
├─ Tudo em /docs/          (se existir)
├─ PRONTO_PARA_DEPLOY.md
├─ README.md
└─ SECURITY_FIXES.md

❌ NÃO TRANSFERIR
├─ /node_modules/          (npm install depois)
├─ /.git/                  (clone novo)
├─ .env.production         (⚠️ SEGURO - criar novo)
├─ /test-results/          (não precisa)
└─ logfiles                (não precisa)
```

---

## 📋 CHECKLIST DETALHADO

### 1. CÓDIGO FONTE

#### /backend/
```
✅ backend/src/
   ├─ controllers/         (lógica endpoints)
   ├─ routes/              (endpoints)
   ├─ services/            (Email, Payment, etc)
   ├─ models/              (schemas BD)
   ├─ middleware/          (auth, errors, etc)
   └─ utils/               (priceCalculator, etc)

✅ backend/tests/
   └─ (testes unitários)

✅ backend/package.json
   └─ (dependências + scripts)

✅ backend/package-lock.json
   └─ (versões exatas)

✅ Dockerfile.backend
   └─ (build backend)

✅ backend/.env.example
   └─ (template variáveis)
```

#### /frontend/
```
✅ frontend/src/
   ├─ pages/               (Home, Dashboard, etc)
   ├─ components/          (React components)
   ├─ hooks/               (custom hooks)
   ├─ services/            (API client)
   ├─ styles/              (CSS)
   ├─ utils/               (helpers)
   └─ App.tsx

✅ frontend/public/
   └─ (assets, favicon, etc)

✅ frontend/package.json
   └─ (dependências)

✅ frontend/vite.config.ts
   └─ (webpack config)

✅ frontend/tsconfig.json
   └─ (TypeScript config)

✅ Dockerfile.frontend
   └─ (build frontend)

✅ frontend/.env.example
   └─ (template variáveis)
```

#### Root
```
✅ docker-compose.yml
   └─ (desenvolvimento)

✅ docker-compose.prod.yml
   └─ (PRODUÇÃO - importante!)

✅ .gitignore
   └─ (o que não commitar)

✅ package.json (raiz)
   └─ (se existir - scripts globais)

✅ README.md
   └─ (instruções principais)

❌ .env.production
   └─ (NÃO - criar novo no servidor)

❌ node_modules/
   └─ (NÃO - npm install gera)
```

---

### 2. DOCUMENTAÇÃO ESSENCIAL

#### Negócio (Compartilhar com sócios/investors)
```
✅ PITCH_EXECUTIVO_LIMPEZA.md
✅ SISTEMA_COMPLETO_v2_COM_MODULO12.md
✅ ADMINISTRACAO_COMPLETA_SISTEMA.md
✅ MODULO_12_INTEGRACAO_CONTABIL.md
```

#### Operação (Para seu time)
```
✅ PRONTO_PARA_DEPLOY.md
✅ GUIA_DEPLOY_SIMPLES_HEROKU.md
✅ CHECKLIST_FINAL_VALIDACAO.md
✅ TLDR_RESUMO_EXECUTIVO.md
```

#### Técnica (Para developers)
```
✅ API_REFERENCE_COMPLETA.md
✅ PRODUCTION_SETUP_GUIDE.md
✅ SECURITY_FIXES.md
✅ MONITORING_AND_CI_CD.md
✅ TESTING_GUIDE.md
```

#### Referência Rápida
```
✅ 00_INDICE_CONSOLIDADO_LEIA_PRIMEIRO.md
✅ README.md
```

---

### 3. CONFIGURAÇÕES

#### Integração Stripe
```
✅ STRIPE_SECRET_KEY (live key)
   └─ De: dashboard.stripe.com → API keys

✅ STRIPE_PUBLISHABLE_KEY (público - no frontend)
   └─ De: dashboard.stripe.com → API keys

✅ Webhook secret
   └─ De: dashboard.stripe.com → Webhooks
```

#### PIX Integration
```
✅ PIX_WEBHOOK_SECRET
   └─ De: seu banco / geradora PIX

✅ PIX_MERCHANT_ID
   └─ De correlação de credencial
```

#### Autenticação
```
✅ JWT_SECRET (64+ caracteres aleatório)
   └─ Use: openssl rand -base64 64

✅ JWT_EXPIRY (24h recomendado)
   └─ Var: JWT_EXPIRY=24h
```

#### Email
```
✅ EMAIL_USER (seu email)
✅ EMAIL_PASSWORD (senha app, não senha gmail)
✅ EMAIL_PROVIDER (gmail, outlook, etc)
```

#### Banco de Dados
```
✅ DATABASE_URL
   └─ postgresql://user:pass@host:5432/dbname
   └─ Em Heroku: auto-gerado
   └─ Em AWS RDS: seu RDS endpoint

✅ Database name
✅ Database user
✅ Database password
```

#### AWS (para uploads fotos)
```
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ AWS_REGION
✅ AWS_S3_BUCKET
```

#### Twilio (SMS/WhatsApp)
```
✅ TWILIO_ACCOUNT_SID
✅ TWILIO_AUTH_TOKEN
✅ TWILIO_PHONE_NUMBER
```

#### SEFAZ (Fiscal)
```
✅ SEFAZ_CERTIFICATE_PATH
✅ SEFAZ_CERTIFICATE_PASSWORD
✅ SEFAZ_ENVIRONMENT (homolog ou produção)
```

---

## 📦 OPÇÃO 1: ZIP PORTÁVEL

### Criar arquivo para transferência

```bash
# No seu computador (raiz do projeto):
zip -r limpeza-deploy.zip . \
  -x "*/node_modules/*" \
  "*.git/*" \
  ".env.production" \
  "*/test-results/*" \
  "*/.vscode/*" \
  "*.log" \
  "*.pem" \
  "backend_data/*" \
  "frontend_dev_log"

# Resultado: limpeza-deploy.zip (~50MB)
```

### Transferir para novo servidor

```bash
# SCP (seguro)
scp limpeza-deploy.zip user@novo-servidor:/home/user/

# Ou FTP se preferir
```

### No novo servidor

```bash
cd /home/user/
unzip limpeza-deploy.zip
cd limpeza

# Instalar dependências
cd backend && npm install
cd ../frontend && npm install
cd ..

# Criar .env.production
cp .env.production.example .env.production
nano .env.production  # Editar valores reais
```

---

## 📦 OPÇÃO 2: GIT CLONE (Moderno)

### Setup novo Git remote

```bash
# Se ainda não tem no GitHub:
git remote add origin https://github.com/seu-user/limpeza.git
git push -u origin main

# No novo servidor:
git clone https://github.com/seu-user/limpeza.git
cd limpeza
npm install  # em ambas /backend e /frontend
```

---

## 📦 OPÇÃO 3: DOCKER (Recomendado Prod)

### Build images

```bash
# Build backend
docker build -f Dockerfile.backend -t seu-user/limpeza-backend:v1.0 .

# Build frontend
docker build -f Dockerfile.frontend -t seu-user/limpeza-frontend:v1.0 .

# Tag para registry (Docker Hub example)
docker tag seu-user/limpeza-backend:v1.0 seu-user/limpeza-backend:latest
docker tag seu-user/limpeza-frontend:v1.0 seu-user/limpeza-frontend:latest

# Push
docker push seu-user/limpeza-backend:latest
docker push seu-user/limpeza-frontend:latest
```

### No novo servidor (pull + run)

```bash
docker pull seu-user/limpeza-backend:latest
docker pull seu-user/limpeza-frontend:latest

docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 VALORES QUE NÃO DEVEM IR NO ZIP/GIT

```
❌ .env.production (contém senhas!)
❌ *.key (certificados privados)
❌ *.pem (chaves SSH)
❌ credentials.json (Firebase)
❌ Certificado SEFAZ (.p12)

✅ .env.production.example
   └─ Pode ir (é template)
```

---

## ✅ CHECKLIST: ANTES DE TRANSFERIR

```
CÓDIGO:
[ ] /backend/ completo
[ ] /frontend/ completo
[ ] docker-compose.prod.yml presente
[ ] Sem node_modules (será instalado depois)
[ ] Sem .env.production real
[ ] .env.*.example presentes

DOCUMENTAÇÃO:
[ ] README.md
[ ] PRONTO_PARA_DEPLOY.md
[ ] GUIA_DEPLOY_SIMPLES_HEROKU.md
[ ] API_REFERENCE_COMPLETA.md
[ ] SECURITY_FIXES.md

TESTES:
[ ] npm test (70/70 passing)
[ ] npm run build (sem erros)
[ ] Nenhum console.log em código prod

SEGURANÇA:
[ ] Sem credenciais em Git
[ ] .gitignore protege .env*
[ ] Certificados não commitados
[ ] Secrets em variáveis ambientes

SE TUDO OK:
└─ Pronto para transferência ✅
```

---

## 🚀 TAMANHO FINAL (Aproximado)

```
Sem node_modules:
├─ Backend code:        ~2 MB
├─ Frontend code:       ~3 MB
├─ Documentação:        ~5 MB
├─ Docker files:        ~0.5 MB
└─ Outros:              ~1 MB
   = TOTAL: ~11 MB (compactado: ~3 MB em ZIP)

Node_modules (NICHT gira):
├─ Backend:             ~350 MB
├─ Frontend:            ~250 MB
└─ TOTAL: ~600 MB
   (npm install gera depois, não precisa transferir)
```

---

## 📝 EXEMPLO: TRANSFERÊNCIA COMPLETA

### Cenário: Mover de seu PC para AWS EC2

```bash
# 1. No PC
cd /workspaces/acabamos
zip -r limpeza-deploy.zip . \
  -x "*/node_modules/*" "*.git/*" ".env.production"

# 2. Transferir
scp -i sua-chave.pem limpeza-deploy.zip ec2-user@ec2-xx-xxx.compute.amazonaws.com:/home/ec2-user/

# 3. No EC2
ssh -i sua-chave.pem ec2-user@ec2-xx-xxx.compute.amazonaws.com
cd /home/ec2-user
unzip limpeza-deploy.zip
cd limpeza

# 4. Instalar
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 5. Configurar
cp .env.production.example .env.production
nano .env.production  # Editar com valores reais

# 6. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 7. Verificar
docker ps
curl http://localhost:3000/api/health

# ✅ PRONTO!
```

---

## 🎯 RESUMO FINAL

```
O QUE TRANSFERIR:
✅ /backend/
✅ /frontend/
✅ docker-compose.prod.yml
✅ Dockerfile.backend
✅ Dockerfile.frontend
✅ .env.*.example
✅ *.md (documentação)

O QUE CRIAR NO NOVO LUGAR:
✅ .env.production (com valores reais)
✅ npm install (baixa dependências)
✅ Base de dados (PostgreSQL)
✅ Certificados SSL

O QUE NÃO TRANSFERIR:
❌ node_modules/
❌ .git/
❌ .env.production (real)
❌ test-results/
❌ Certificados privados
```

**Seu projeto está pronto para sair! 📦🚀**


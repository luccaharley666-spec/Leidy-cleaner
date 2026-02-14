# 📊 EXEMPLO PRÁTICO: DEPLOY COM SEU DOMÍNIO

**Se você já tem um domínio, use este exemplo para guiar o setup**

---

## 🎯 CENÁRIO

Suponhamos que você tem:

```
Domínio: limpezapro.com.br
Provedor: Namecheap
Servidor: seu-servidor.com (IP: 123.45.67.89)
Email: admin@limpezapro.com.br
```

---

## ✅ PASSO 1: RÁPIDO (Usar Script)

**No seu servidor:**

```bash
cd /workspaces/avan-o

# Rodar script automático
bash setup-dominio.sh limpezapro.com.br admin@limpezapro.com.br
```

**Output esperado:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 CONFIGURADOR AUTOMÁTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Domínio: limpezapro.com.br
Email: admin@limpezapro.com.br

JWT_SECRET=a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2
SESSION_SECRET=q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8
WEBHOOK_SECRET_PIX=g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4

✅ .env.production criado
✅ Secrets gerados
✅ Nginx config criado em /tmp/nginx-limpezapro.com.br.conf
```

---

## 🔧 PASSO 2: DNS NO NAMECHEAP (ou seu provedor)

### 2.1 - Login no Namecheap

1. Acesse https://www.namecheap.com/
2. Dashboard → Domain List
3. Clique em "Manage" ao lado de `limpezapro.com.br`

### 2.2 - Configurar DNS

**Aba: Advanced DNS → Add New Record**

**Registro 1 - A Record (Principal):**
```
Type:    A Record
Host:    @
Value:   123.45.67.89        (seu IP do servidor)
TTL:     3600
```

**Registro 2 - A Record (www):**
```
Type:    A Record
Host:    www
Value:   123.45.67.89        (mesmo IP)
TTL:     3600
```

**Registro 3 - A Record (API):**
```
Type:    A Record
Host:    api
Value:   123.45.67.89        (mesmo IP)
TTL:     3600
```

**Registro 4 - MX (Email):**
```
Type:    MX Record
Host:    @
Value:   mail.limpezapro.com.br
Priority: 10
TTL:     3600
```

**Resultado esperado:**

```
Host:    @           →  123.45.67.89 (A)
Host:    www         →  123.45.67.89 (A)
Host:    api         →  123.45.67.89 (A)
Host:    @           →  mail.limpezapro.com.br (MX)
```

### 2.3 - Verificar Propagação

```bash
# Verificar se DNS propagou (pode levar 5-30 min)
dig limpezapro.com.br
nslookup limpezapro.com.br
ping limpezapro.com.br
```

Esperado: Responde com seu IP 123.45.67.89

---

## 🔒 PASSO 3: CERTIFICADO SSL

**No seu servidor:**

```bash
# 1. Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. Gerar certificado para todos os subdomínios
sudo certbot certonly --nginx \
  -d limpezapro.com.br \
  -d www.limpezapro.com.br \
  -d api.limpezapro.com.br \
  -m admin@limpezapro.com.br

# 3. Responder às perguntas
Follow the prompts
  - Agree to terms (Y)
  - Share email (Y)
```

**Arquivos gerados:**
```
/etc/letsencrypt/live/limpezapro.com.br/
├── privkey.pem       (sua chave privada - SEGURO!)
├── fullchain.pem     (seu certificado)
└── chain.pem
```

**Verificar:**
```bash
ls -la /etc/letsencrypt/live/limpezapro.com.br/
```

---

## ⚙️ PASSO 4: NGINX

**No seu servidor:**

```bash
# 1. Usar arquivo gerado pelo script (ou criar novo)
sudo cp /tmp/nginx-limpezapro.com.br.conf /etc/nginx/sites-available/limpezapro.com.br

# 2. Criar symlink
sudo ln -s /etc/nginx/sites-available/limpezapro.com.br /etc/nginx/sites-enabled/

# 3. Testar configuração
sudo nginx -t

# Output esperado:
# nginx: configuration file test is successful
# nginx: test successful

# 4. Recarregar Nginx
sudo systemctl reload nginx

# 5. Verificar status
sudo systemctl status nginx
```

Nginx agora está:
- ✅ Redirecionando HTTP → HTTPS
- ✅ Servindo Frontend na porta 3001
- ✅ Servindo Backend na porta 3000
- ✅ Com certificado SSL válido

---

## 📝 PASSO 5: ARQUIVOS .env

**Editar .env.production:**

```bash
nano .env.production
```

**Valores mínimos para funcionar:**

```dotenv
# ========== AMBIENTE ==========
NODE_ENV=production
PORT=3001
DOMAIN=limpezapro.com.br
BASE_URL=https://limpezapro.com.br
NEXT_PUBLIC_API_URL=https://api.limpezapro.com.br

# ========== AUTENTICAÇÃO ==========
JWT_SECRET=a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2
SESSION_SECRET=q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8

# ========== PIX ==========
WEBHOOK_SECRET_PIX=g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4
PIX_WEBHOOK_URL=https://api.limpezapro.com.br/api/webhooks/pix

# ========== BANCO DE DADOS ==========
DATABASE_URL=sqlite://./backend_data/database.sqlite

# ========== EMAIL (Google) ==========
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@limpezapro.com.br
SMTP_PASS=sua-app-password-google
EMAIL_FROM=noreply@limpezapro.com.br

# ========== STRIPE (teste por enquanto) ==========
STRIPE_SECRET_KEY=sk_test_51NzQ...
STRIPE_PUBLIC_KEY=pk_test_51NzQ...

# ========== PIX PROVIDER (Asaas exemplo) ==========
PIX_PROVIDER_KEY=sk_live_asaas_xxxx
PIX_PROVIDER_SECRET=asaas_secret_xxxx
```

**Salvar:** `Ctrl+X` → `Y` → Enter

---

## 🐳 PASSO 6: DEPLOY COM DOCKER

**Criar docker-compose.prod.yml:**

```bash
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    command: sh -c "cd backend && npm install && npm start"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NEXT_PUBLIC_API_URL: https://api.limpezapro.com.br
      NODE_ENV: production
    ports:
      - "3001:3001"
    command: sh -c "cd frontend && npm install && npm run build && npm start"
    restart: unless-stopped
    depends_on:
      - backend

networks:
  default:
    name: leidy-network
EOF
```

**Rodar:**

```bash
# Build e start
docker-compose -f docker-compose.prod.yml up -d

# Verificar
docker-compose -f docker-compose.prod.yml ps

# Output esperado:
# CONTAINER ID   IMAGE         COMMAND     STATUS
# abc123...      node:20-a...  npm start   Up 2 minutes (healthy)
# def456...      node:20-a...  npm start   Up 1 minute
```

---

## ✅ PASSO 7: TESTAR TUDO

### 7.1 - Verificar conectividade

```bash
# Frontend está respondendo?
curl https://limpezapro.com.br -I
# HTTP/2 200

# Backend está respondendo?
curl https://api.limpezapro.com.br/health
# {"status":"ok"}

# Redirecionamento HTTP → HTTPS?
curl -L http://limpezapro.com.br -I | head -5
# HTTP/1.1 301 Moved Permanently
# Location: https://limpezapro.com.br
```

### 7.2 - Testar SSL

```bash
# Certificado válido?
openssl s_client -connect limpezapro.com.br:443 -servername limpezapro.com.br | grep "Verify return code"
# Verify return code: 0 (ok)

# Via site online
https://www.ssllabs.com/ssltest/analyze.html?d=limpezapro.com.br
# Esperar resultado (A ou A+)
```

### 7.3 - Testar Aplicação

```bash
# 1. Abrir browser
https://limpezapro.com.br

# 2. Deve mostrar homepage
# 3. Criar conta teste
# 4. Fazer agendamento teste
# 5. Ir para checkout (teste de pagamento)
```

### 7.4 - Testar Logs

```bash
# Backend logs
docker logs -f $(docker ps -q -f "service=backend")

# Frontend logs
docker logs -f $(docker ps -q -f "service=frontend")

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 STATUS ESPERADO

```
✅ Domain: limpezapro.com.br
✅ SSL/TLS: Valid (Let's Encrypt)
✅ Frontend: https://limpezapro.com.br (porta 3001)
✅ Backend: https://api.limpezapro.com.br (porta 3000)
✅ DNS: Propagated (A records correct)
✅ Docker: Both services running
✅ HTTPS: All connections encrypted
✅ Database: SQLite connected (ou PostgreSQL)
```

---

## 🔄 AUTO-RENEW SSL

```bash
# Agendar renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verificar
sudo systemctl list-timers certbot.timer

# Output esperado:
# NEXT                       LEFT     LAST      PASSED
# Thu 2026-02-15 00:00:00    23h left -         -
```

---

## 📋 CHECKLIST FINAL

```
DNS:
[ ] A record (@) → seu IP
[ ] A record (www) → seu IP
[ ] A record (api) → seu IP
[ ] DNS propagado (dig/nslookup)

SSL:
[ ] Certificado gerado com Certbot
[ ] /etc/letsencrypt/live/limpezapro.com.br/ existe
[ ] Auto-renew agendado

Nginx:
[ ] Config em /etc/nginx/sites-available/
[ ] Symlink em /etc/nginx/sites-enabled/
[ ] nginx -t OK
[ ] systemctl reload ok

Docker:
[ ] Backend container rodando
[ ] Frontend container rodando
[ ] Ambos com restart: unless-stopped

Testes:
[ ] curl https://limpezapro.com.br OK
[ ] curl https://api.limpezapro.com.br/health OK
[ ] SSL Labs A+ score
[ ] Homepage carrega
[ ] Agendamento funciona
```

---

## 🆘 PROBLEMAS COMUNS

**DNS não resolve:**
```bash
# Aguardar propagação (5-30 min)
# Verificar no Namecheap se A records estão OK
# Limpar cache: nslookup -type=a limpezapro.com.br 8.8.8.8
```

**SSL error - Certificado não encontrado:**
```bash
# Certbot foi executado?
sudo certbot certificates | grep limpezapro

# Se não existe:
sudo certbot certonly --nginx -d limpezapro.com.br
```

**Nginx 502 Bad Gateway:**
```bash
# Backend não está rodando?
docker ps | grep backend

# Se não:
docker-compose -f docker-compose.prod.yml restart backend

# Check logs:
docker logs backend
```

**Domínio lento:**
```bash
# Database muito grande?
sqlite3 backend/backend_data/database.sqlite ".tables"
sqlite3 backend/backend_data/database.sqlite ".schema"

# Se SQLite muito grande, migrar para PostgreSQL
```

---

## 📞 PRÓXIMOS PASSOS

**Depois de tudo funcionando:**

1. [ ] Obter Stripe keys (sk_live e pk_live)
2. [ ] Registrar webhook Stripe
3. [ ] Obter PIX credentials (Asaas/PagBank/etc)
4. [ ] Registrar webhook PIX no banco
5. [ ] Gerar Google App Password para email
6. [ ] Configurar Twilio (SMS/WhatsApp)
7. [ ] Ativar backup automático
8. [ ] Configurar monitoramento (opcional)

---

**Qual é seu domínio exato? Me passa que faço as configs específicas! 🚀**

# 🚀 GUIA DE DEPLOY COM SEU DOMÍNIO

**Se você já tem um domínio, siga este guia passo a passo**

---

## 📋 PASSO 1: INFORMAÇÕES DO DOMÍNIO

Preencha aqui:

```
🌐 Seu Domínio: ____________________
📧 Email do Domínio: ____________________  
🔐 Provedor: ____________________
   (ex: GoDaddy, Namecheap, Hostinger, etc)
```

---

## 🔧 PASSO 2: CONFIGURAR DNS

### 2.1 - Acessar Painel de Controle do Provedor

Login em:
- GoDaddy → DNS Settings
- Namecheap → Advanced DNS
- Hostinger → DNS Zone
- (seu provedor) → DNS Management

### 2.2 - Adicionar Registros DNS

**A - Apontar para seu servidor:**

```
Type:    A
Name:    @
Value:   [IP do seu servidor]
TTL:     3600
```

**CNAME - Para www:**

```
Type:    CNAME
Name:    www
Value:   seu-dominio.com
TTL:     3600
```

**MX - Para Email:**

```
Type:    MX
Name:    @
Value:   mail.seu-dominio.com
Priority: 10
TTL:     3600
```

---

## 🔒 PASSO 3: CONFIGURAR SSL (HTTPS)

### Opção A: LET'S ENCRYPT (Recomendado - GRÁTIS)

Se você usa **Nginx** ou **Apache**:

```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com

# Auto-renew (automático)
sudo systemctl enable certbot.timer
```

**Arquivos gerados:**
```
/etc/letsencrypt/live/seu-dominio.com/
├── privkey.pem        ← Sua chave privada
├── fullchain.pem      ← Seu certificado
└── chain.pem          ← Certificado raiz
```

### Opção B: Seu Provedor

Alguns provedores oferecem SSL gratuito ou pago (Namecheap, GoDaddy, etc). Ative via painel.

---

## 🌍 PASSO 4: CONFIGURAR NGINX

**Criar arquivo de configuração:**

```bash
sudo nano /etc/nginx/sites-available/seu-dominio.com
```

**Colar este conteúdo:**

```nginx
# Redirecionar HTTP → HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend (Next.js na porta 3001)
server {
    listen 443 ssl http2;
    server_name www.seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Backend (Express na porta 3000)
server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Ativar:**

```bash
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ⚙️ PASSO 5: CONFIGURAR .env.production

```bash
# Copiar template
cp .env.production.example .env.production

# Editar com seu domínio
nano .env.production
```

**Valores essenciais:**

```dotenv
# Ambiente
NODE_ENV=production
DOMAIN=seu-dominio.com
BASE_URL=https://seu-dominio.com
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com

# Por enquanto, deixe estes como teste até ter credentials reais:
JWT_SECRET=seu-secret-gerado-com-openssl-rand
SESSION_SECRET=outro-secret-gerado
WEBHOOK_SECRET_PIX=terceiro-secret-gerado

# Stripe (você preenche depois)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx

# Email (configure com Google App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=seu-app-password-google

# PIX (do seu provedor)
PIX_PROVIDER_KEY=xxxxxx
PIX_PROVIDER_SECRET=xxxxxx

# Banco de dados
DATABASE_URL=sqlite://./backend_data/database.sqlite
```

---

## 🐳 PASSO 6: DEPLOY COM DOCKER

**Criar docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  backend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    command: >
      sh -c "cd backend && npm install && npm start"
    restart: always

  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3001:3001"
    command: >
      sh -c "cd frontend && npm install && npm run build && npm start"
    environment:
      NEXT_PUBLIC_API_URL: https://api.seu-dominio.com
    restart: always
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/nginx/sites-available/seu-dominio.com:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    restart: always
    depends_on:
      - backend
      - frontend
```

**Rodar:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 PASSO 7: TESTEAR TUDO

### 7.1 - Verificar se está rodando:

```bash
# Frontend está ok?
curl https://seu-dominio.com
# Resposta: HTML da página

# Backend está ok?
curl https://api.seu-dominio.com/health
# Resposta: {"status":"ok"}
```

### 7.2 - Testar SSL:

```bash
# Certificado válido?
openssl s_client -connect seu-dominio.com:443

# Via site:
https://www.ssllabs.com/ssltest/analyze.html?d=seu-dominio.com
```

### 7.3 - Testar fluxo completo:

1. Acesse: https://seu-dominio.com
2. Crie uma conta
3. Faça um agendamento
4. Teste o checkout (pagamento fake por enquanto)
5. Verifique email de confirmação

---

## 📊 PASSO 8: MONITORING

**Logs do Backend:**
```bash
docker logs -f container-backend
```

**Logs do Frontend:**
```bash
docker logs -f container-frontend
```

**Logs do Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ CHECKLIST PRÉ-PRODUÇÃO

```
DNS ✓
[ ] Registros A/CNAME apontam corretamente
[ ] DNS propagado (usar nslookup seu-dominio.com)

SSL ✓
[ ] Certificado Let's Encrypt gerado
[ ] Nginx configurado com SSL
[ ] HTTPS funciona (sem avisos)

Aplicação ✓
[ ] Frontend buildado e rodando
[ ] Backend online e respondendo
[ ] Reverso proxy funciona

Segurança ✓
[ ] JWT_SECRET alterado
[ ] SESSION_SECRET alterado
[ ] WEBHOOK_SECRET_PIX alterado
[ ] Firewall configurado (ufw)
[ ] Fail2ban ativo (proteção contra brute force)

Banco de Dados ✓
[ ] SQLite migrado para PostgreSQL (opcional mas recomendado)
[ ] Backup automático configurado

Emails ✓
[ ] Google App Password gerado
[ ] SMTP testado
[ ] Emails de confirmação funcionando

Pagamentos ✓
[ ] Stripe configurado (ou fake por enquanto)
[ ] Webhook registrado
[ ] PIX estruturado (aguardando provedor)

Monitoramento ✓
[ ] Logs configurados
[ ] Alertas setup
[ ] Métricas coletadas (opcional: Prometheus)
```

---

## 🆘 TROUBLESHOOTING

**Domínio não resolve:**
```bash
# Verificar propagação
dig seu-dominio.com
nslookup seu-dominio.com

# Aguardar 24-48 horas após mudança DNS
```

**HTTPS com erro SSL:**
```bash
# Renovar certificado
sudo certbot renew --dry-run

# Forçar renovação
sudo certbot renew --force-renewal
```

**Nginx dá erro 502:**
```bash
# Backend não está rodando?
docker ps | grep backend

# Reiniciar
docker-compose restart backend
```

**Porta 80/443 em uso:**
```bash
# Verificar o que está usando
sudo lsof -i :80
sudo lsof -i :443

# Matar processo
sudo kill -9 PID
```

---

## 📞 PRÓXIMAS AÇÕES

1. **Hoje:**
   - [ ] Me diz qual é seu domínio
   - [ ] Configure DNS seguindo o Passo 2
   - [ ] Configure SSL seguindo o Passo 3
   - [ ] Configure Nginx seguindo o Passo 4

2. **Amanhã:**
   - [ ] Preencha .env.production
   - [ ] Faça deploy
   - [ ] Teste fluxo completo

3. **Próxima semana:**
   - [ ] Gere credentials reais (Stripe, PIX, etc)
   - [ ] Configure emails reais
   - [ ] Ative 2FA no admin
   - [ ] Backup automático

---

**Qual é seu domínio? Me passa que configuro o resto para você! 🚀**

# 🚀 DEPLOY NO ORION HOST - GUIA COMPLETO

**Status:** ✅ Sistema 100% pronto para Orion Host  
**Data:** 14 de Fevereiro de 2026  
**Versão:** Production Ready  

---

## 📋 SUMÁRIO

1. [Servidor Recomendado](#servidor-recomendado)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Preparar Domínio](#passo-1-preparar-domínio)
4. [Passo 2: Configurar SSH e Acesso](#passo-2-configurar-ssh-e-acesso)
5. [Passo 3: Preparar Variáveis de Ambiente](#passo-3-preparar-variáveis-de-ambiente)
6. [Passo 4: Deploy Backend](#passo-4-deploy-backend)
7. [Passo 5: Deploy Frontend](#passo-5-deploy-frontend)
8. [Passo 6: SSL/TLS Certificate](#passo-6-ssltls-certificate)
9. [Passo 7: Configurar Nginx Reverso](#passo-7-configurar-nginx-reverso)
10. [Validação e Testes](#validação-e-testes)
11. [Troubleshooting](#troubleshooting)

---

## 🖥️ Servidor Recomendado

**Orion Host - Plano Recomendado:**
- **Tipo:** VPS ou Cloud (não shared hosting)
- **RAM:** Mínimo 2GB, ideal 4GB+
- **CPU:** 2 cores
- **Disco:** 50GB+ (SSD)
- **Bandwidth:** Ilimitado
- **SO:** Ubuntu 20.04 LTS ou superior
- **Node.js:** 20.x LTS (via NVM ou apt)

### Por que não shared hosting?
- Node.js não roda bem em shared hosting
- Orion Host exige gerenciador de app específico
- VPS oferece controle total

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter:

```bash
# Verificar pré-requisitos no seu servidor Orion Host
which node          # Node.js v20+
which npm           # npm v10+
which git           # Git versão controle
which sqlite3       # SQLite3
which curl          # Para testes HTTP
```

Se algum comando acima falhar, veja a seção [Instalação de Dependências](#instalação-de-dependências).

---

## 🌐 Passo 1: Preparar Domínio

### 1.1 Adicionar Domínio no Painel Orion Host

1. Acesse: https://cpanel.orionhost.com.br/
2. Vá para **Addon Domains** ou **Domínios Adicionais**
3. Adicione:
   - `seu-dominio.com.br`
   - `www.seu-dominio.com.br`
   - `api.seu-dominio.com.br`

### 1.2 Configurar DNS (no seu registrador)

Adicione estes registros DNS:

```
TIPO    | HOST           | VALOR
--------|----------------|------------------
A       | @              | IP_DO_SEU_SERVIDOR
A       | www            | IP_DO_SEU_SERVIDOR
A       | api            | IP_DO_SEU_SERVIDOR
CNAME   | www            | seu-dominio.com.br
```

**Encontrar seu IP do servidor:**
```bash
# No servidor Orion Host
hostname -I
# Ou via cPanel: Home > Server Status > IP Address
```

### 1.3 Aguardar Propagação

```bash
# Verificar propagação de DNS (espere 5-30 minutos)
nslookup seu-dominio.com.br
dig seu-dominio.com.br
```

✅ Quando retornar seu IP, DNS está propagado.

---

## 🔑 Passo 2: Configurar SSH e Acesso

### 2.1 Conectar via SSH

```bash
# No seu computador local
ssh usuario@seu-dominio.com.br
# ou
ssh usuario@IP_DO_SERVIDOR

# Aceitar fingerprint quando solicitado (digite: yes)
```

### 2.2 Gerar Chaves SSH (opcional, mais seguro)

```bash
# No seu computador
ssh-keygen -t ed25519 -C "seu-email@seu-dominio.com.br"
# Salve em: ~/.ssh/id_ed25519

# Adicionar chave pública ao servidor
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@seu-dominio.com.br

# Agora conecta sem senha
ssh usuario@seu-dominio.com.br
```

### 2.3 Criar Diretório de Projeto

```bash
# No servidor (após conectar via SSH)
cd ~
mkdir -p /home/usuario/projetos/seu-dominio
cd /home/usuario/projetos/seu-dominio

# Clone o repositório (ou faça upload dos arquivos)
git clone https://github.com/seu-usuario/seu-repo.git .
# ou unzip seu-arquivo.zip

pwd  # Anote este caminho
```

---

## 🔧 Passo 3: Preparar Variáveis de Ambiente

### 3.1 Copiar e Personalizar .env

```bash
# No servidor
cd /home/usuario/projetos/seu-dominio

# Copiar template
cp .env.orionhost .env.production

# Editar com seus valores
nano .env.production
```

**Valores que VOCÊ precisa alterar:**

```env
# 1. Substitua seu-dominio.com
YOUR_DOMAIN.COM => seu-dominio.com.br
YOUR_EMAIL => admin@seu-dominio.com.br

# 2. Gere secrets seguros (execute no terminal):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Cole os 3 valores gerados em:
JWT_SECRET=<valor-1>
SESSION_SECRET=<valor-2>
WEBHOOK_SECRET_PIX=<valor-3>

# 3. Dados de email (SMTP)
SMTP_HOST=mail.seu-dominio.com.br
SMTP_USER=seu-email@seu-dominio.com.br
SMTP_PASS=sua_senha

# 4. Dados de pagamento (opcional inicialmente)
STRIPE_PUBLIC_KEY=pk_live_...    # https://stripe.com/dashboard
STRIPE_SECRET_KEY=sk_live_...

PIX_PROVIDER=asaas
PIX_PROVIDER_KEY=seu_token         # https://asaas.com/api
PIX_PROVIDER_SECRET=seu_client_id
```

### 3.2 Salvar e Confirmar

```bash
# Verificar arquivo (Ctrl+O para salvar, Ctrl+X para sair)
cat .env.production | head -20

# Proteger arquivo (apenas proprietário lê)
chmod 600 .env.production
```

---

## 🔌 Passo 4: Deploy Backend

### 4.1 Instalar Dependências Backend

```bash
# No servidor
cd /home/usuario/projetos/seu-dominio/backend

# Instalar packages
npm install

# Tempo típico: 2-5 minutos
```

### 4.2 Rodar Migrações de Banco de Dados

```bash
# No servidor
cd /home/usuario/projetos/seu-dominio

# SQLite já vem com migrate automática
npm run migrate:backend
# ou manual:
sqlite3 backend_data/database.sqlite < backend/src/db/migrations.sql
```

### 4.3 Testar Backend Localmente

```bash
# No servidor
cd backend

# Rodar servidor de teste (Ctrl+C para parar)
npm run dev
# ou em background:
nohup npm start > backend.log 2>&1 &

# Testar endpoint (em novo terminal)
curl -X GET http://localhost:3000/api/health
# Resposta esperada: {"status":"ok"}
```

✅ Se retornar `{"status":"ok"}`, backend está funcionando!

---

## 🎨 Passo 5: Deploy Frontend

### 5.1 Build Frontend

```bash
# No servidor
cd /home/usuario/projetos/seu-dominio/frontend

# Instalar dependências
npm install

# Build (gera arquivo otimizado)
npm run build

# Tempo típico: 3-10 minutos
```

### 5.2 Testar Frontend Localmente

```bash
# No servidor
npm run start
# ou em background:
nohup npm start > frontend.log 2>&1 &

# Testar (em novo terminal)
curl -X GET http://localhost:3001/
# Resposta esperada: HTML da página
```

✅ Se receber HTML, frontend está funcionando!

---

## 🔒 Passo 6: SSL/TLS Certificate

### 6.1 Instalar Certbot (Let's Encrypt)

```bash
# No servidor
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# Verificar instalação
certbot --version
```

### 6.2 Gerar Certificado SSL

```bash
# No servidor
sudo certbot certonly --standalone \
  -d seu-dominio.com.br \
  -d www.seu-dominio.com.br \
  -d api.seu-dominio.com.br \
  -m admin@seu-dominio.com.br \
  --agree-tos --non-interactive

# Certificado salvo em: /etc/letsencrypt/live/seu-dominio.com.br/
```

### 6.3 Auto-renovar Certificado

```bash
# No servidor
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Testar renovação (opcional)
sudo certbot renew --dry-run
```

✅ Certificado renovará automaticamente!

---

## 🔄 Passo 7: Configurar Nginx Reverso

### 7.1 Instalar Nginx

```bash
# No servidor
sudo apt-get install nginx -y

# Iniciar serviço
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.2 Criar Arquivo de Configuração

```bash
# No servidor
sudo nano /etc/nginx/sites-available/seu-dominio.com.br
```

**Cole este conteúdo (substitua `seu-dominio.com.br`):**

```nginx
# Frontend - www.seu-dominio.com.br
server {
    listen 80;
    listen [::]:80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

# Frontend - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;
    
    # Segurança SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend proxy
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Compressão
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_min_length 1000;
}

# Backend - api.seu-dominio.com.br HTTP
server {
    listen 80;
    listen [::]:80;
    server_name api.seu-dominio.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

# Backend - api.seu-dominio.com.br HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.seu-dominio.com.br;
    
    # Certificados SSL (mesmo domínio pai)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;
    
    # Segurança SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Headers de segurança + CORS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
    
    # Backend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Permitir WebSockets
        proxy_buffering off;
    }
    
    # Compressão
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    gzip_min_length 1000;
}
```

### 7.3 Ativar Configuração

```bash
# No servidor
sudo ln -s /etc/nginx/sites-available/seu-dominio.com.br /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remover default

# Testar sintaxe
sudo nginx -t
# Resposta esperada: "test is successful"

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🚀 Passo 8: Iniciar Serviços em Background

### 8.1 Criar Systemd Services (recomendado)

**Backend Service:**

```bash
# No servidor
sudo nano /etc/systemd/system/seu-dominio-backend.service
```

Cole:

```ini
[Unit]
Description=Backend API - seu-dominio.com.br
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/home/seu-usuario/projetos/seu-dominio/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Frontend Service:**

```bash
# No servidor
sudo nano /etc/systemd/system/seu-dominio-frontend.service
```

Cole:

```ini
[Unit]
Description=Frontend Web - seu-dominio.com.br
After=network.target seu-dominio-backend.service

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/home/seu-usuario/projetos/seu-dominio/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 8.2 Ativar Services

```bash
# No servidor
sudo systemctl daemon-reload
sudo systemctl enable seu-dominio-backend.service
sudo systemctl enable seu-dominio-frontend.service

# Iniciar
sudo systemctl start seu-dominio-backend.service
sudo systemctl start seu-dominio-frontend.service

# Verificar status
sudo systemctl status seu-dominio-backend.service
sudo systemctl status seu-dominio-frontend.service
```

---

## ✅ Validação e Testes

### 9.1 Testar URLs

```bash
# Frontend (público)
curl -I https://seu-dominio.com.br/
# Esperado: HTTP/2 200

# API Backend
curl -I https://api.seu-dominio.com.br/api/health
# Esperado: HTTP/2 200 com {"status":"ok"}

curl https://api.seu-dominio.com.br/api/health | jq .
```

### 9.2 Testar no Navegador

1. Abra: https://seu-dominio.com.br
2. Verifique:
   - ✅ Página carrega (não há erro 502/503)
   - ✅ Assets carregam (_next/*, /images/*)
   - ✅ Cadeado SSL aparece (HTTPS)
   - ✅ Tema verde está aplicado

### 9.3 Testar Login

1. Vá para: https://seu-dominio.com.br/login
2. Tente login com:
   - **Email:** admin@seu-dominio.com.br
   - **Senha:** (admin_password gerada em migrations.sql)
3. Verifique:
   - ✅ Entra no dashboard
   - ✅ API responses funcionam (abra DevTools → Network)

### 9.4 Monitorar Logs

```bash
# Ver logs do backend em tempo real
sudo journalctl -u seu-dominio-backend.service -f

# Ver logs do frontend em tempo real
sudo journalctl -u seu-dominio-frontend.service -f

# Ver logs de 10 minutos atrás
sudo journalctl -u seu-dominio-backend.service --since "10 min ago"
```

---

## 🔧 Troubleshooting

### Erro: "Connection refused" (502)

**Causa:** Backend não está rodando

```bash
# Verificar status
sudo systemctl status seu-dominio-backend.service

# Iniciar se parado
sudo systemctl start seu-dominio-backend.service

# Ver logs
sudo journalctl -u seu-dominio-backend.service -n 20
```

### Erro: "SSL certificate problem"

**Causa:** Certificado expirou ou caminho incorreto

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Verificar data de expiração
sudo certbot certificates
```

### Erro: "Cannot POST /api/..."

**Causa:** Backend não foi iniciado com sucesso

```bash
# Verificar porta 3000 está ouvindo
sudo netstat -tlnp | grep 3000

# Se não aparece, iniciar backend
cd /home/seu-usuario/projetos/seu-dominio/backend
npm start
```

### Site muito lento

**Solução:** Ativar compressão e cache

```bash
# Verificar compressão Nginx (já está ativada no config)
curl -I -H "Accept-Encoding: gzip" https://seu-dominio.com.br/ | grep -i "Content-Encoding"
# Esperado: Content-Encoding: gzip
```

### Verificar Uso de Recursos

```bash
# CPU/Memória
top

# Espaço em disco
df -h

# Processos Node
ps aux | grep node
```

---

## 📊 Monitoramento Contínuo

### 9.5 Uptime Monitoring (opcional)

Recomendado: UptimeRobot (grátis até 50 checks)

1. Acesse: https://uptimerobot.com/
2. Crie 2 monitores:
   - Frontend: `https://seu-dominio.com.br`
   - Backend: `https://api.seu-dominio.com.br/api/health`
3. Alertas por email se cair

### 9.6 Backup Automático

```bash
# Criar script de backup
nano ~/backup.sh
```

Cole:

```bash
#!/bin/bash
BACKUP_DIR=/home/seu-usuario/backups
mkdir -p $BACKUP_DIR

# Backup database
cp /home/seu-usuario/projetos/seu-dominio/backend_data/database.sqlite \
   $BACKUP_DIR/database-$(date +%Y%m%d-%H%M%S).sqlite

# Manter últimos 7 backups
find $BACKUP_DIR -name "database-*.sqlite" -mtime +7 -delete

echo "Backup realizado: $(date)"
```

Ativar cron:

```bash
chmod +x ~/backup.sh
crontab -e

# Adicionar linha (backup diário 2AM):
0 2 * * * /home/seu-usuario/backup.sh
```

---

## 🎉 Pronto!

Seu site está rodando em:

- 🌐 **Frontend:** `https://seu-dominio.com.br`
- 🔌 **Backend API:** `https://api.seu-dominio.com.br/api`

### Comandos Úteis Futuros

```bash
# Parar serviços
sudo systemctl stop seu-dominio-backend.service
sudo systemctl stop seu-dominio-frontend.service

# Reiniciar
sudo systemctl restart seu-dominio-backend.service
sudo systemctl restart seu-dominio-frontend.service

# Desabilitar (no boot)
sudo systemctl disable seu-dominio-backend.service
sudo systemctl disable seu-dominio-frontend.service

# Ver status geral
sudo systemctl status seu-dominio-*.service
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique logs:** `sudo journalctl -u seu-dominio-backend.service -f`
2. **Teste conectividade:** `curl -v https://seu-dominio.com.br`
3. **Verifique DNS:** `dig seu-dominio.com.br`
4. **Reinicie tudo:** `sudo systemctl restart seu-dominio-* && sudo systemctl reload nginx`

---

**Status:** ✅ Sistema 100% pronto  
**Última atualização:** 14 de Fevereiro de 2026  
**Versão:** 1.0 Production

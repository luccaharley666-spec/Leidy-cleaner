# 🎯 PRÉ-REQUISITOS ORION HOST - O QUE VOCÊ PRECISA ANTES DE IMPORTAR OS CÓDIGOS

**Data:** 14 de Fevereiro de 2026  
**Status:** Guia completo de pré-requisitos  

---

## 📋 CHECKLIST - O QUE JÁ DEVE ESTAR PRONTO

### ✅ O QUE VOCÊ JÁ TEM

- [x] Domínio registrado (seu-dominio.com.br)
- [x] Conta ativa no Orion Host
- [x] Acesso ao cPanel Orion Host
- [x] Email de administrador

### ⚠️ O QUE VOCÊ PRECISA FAZER AGORA

Leia os próximos passos...

---

## 🖥️ 1. TIPO DE PLANO ORION HOST RECOMENDADO

### ❌ NÃO USE: Shared Hosting

```
Problemas com Shared Hosting:
❌ Node.js não roda bem
❌ Sem acesso SSH adequado
❌ Sem autonomia em gerenciador de processos
❌ Limite de recursos compartilhados
❌ Não suporta systemd services
```

### ✅ USE: VPS ou Cloud Orion Host

```
Vantagens do VPS/Cloud:
✅ Node.js roda perfeitamente
✅ SSH full access
✅ Controle total do servidor
✅ Recursos garantidos
✅ Suporta systemd
✅ Recomendado: 2GB RAM, 2 cores, 50GB SSD
```

**Ação:** Se tem shared hosting, upgrade para VPS/Cloud !

---

## 🔑 2. ACESSOS E CREDENCIAIS QUE VOCÊ PRECISA

### 2.1 Acesso SSH

```
🔍 Onde encontrar:

  1. Acesse: https://cpanel.seudominio.com.br/
  2. Vá para: "SSH Access" ou "SSH Keys"
  3. Copie:
     - Hostname: seu-dominio.com.br
     - Username: seu_usuario
     - Password: sua_senha_ssh
     - Port: 22 (padrão)
```

**Teste SSH no seu computador:**

```bash
ssh seu_usuario@seu-dominio.com.br
# ou
ssh seu_usuario@IP_DO_SERVIDOR
```

Se conectar com sucesso → ✅ SSH está pronto!

### 2.2 Acesso ao banco de dados (se usar)

```
Para SQLite (o que usamos):
✅ Não precisa de credenciais separadas
✅ Roda localmente no servidor

Para PostgreSQL (opcional futura):
- Host: seu-dominio.com.br
- Port: 5432
- User: seu_usuario_db
- Password: sua_senha_db
```

---

## 📦 3. DEPENDÊNCIAS QUE PRECISA INSTALAR NO SERVIDOR

### Após conectar via SSH, instale:

#### 3.1 Node.js (CRÍTICO!)

```bash
# Verificar se já tem
node -v
npm -v

# Se NÃO tiver, instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar shell
source ~/.bashrc

# Instalar Node 20 LTS
nvm install 20
nvm use 20

# Verificar
node -v          # Esperado: v20.x.x
npm -v           # Esperado: v10.x.x
```

#### 3.2 Git (para clonar repositório)

```bash
# Verificar
git --version

# Se não tiver, instalar
sudo apt-get update
sudo apt-get install git -y
```

#### 3.3 SQLite3 (para banco de dados)

```bash
# Verificar
sqlite3 --version

# Se não tiver, instalar
sudo apt-get install sqlite3 -y
```

#### 3.4 Nginx (servidor reverso)

```bash
# Instalar
sudo apt-get install nginx -y

# Iniciar
sudo systemctl start nginx
sudo systemctl enable nginx

# Testar
curl -I http://localhost
# Esperado: HTTP/1.1 200 OK
```

#### 3.5 Certbot (SSL gratuito via Let's Encrypt)

```bash
# Instalar
sudo apt-get install certbot python3-certbot-nginx -y

# Verificar
certbot --version
```

---

## 🔗 4. CONFIGURAR DOMÍNIOS NO CPANEL

### Passo 1: Adicionar Domínio Principal

```
1. Acesse cPanel: https://cpanel.seudominio.com.br/
2. Vá para: "Addon Domains" ou "Domínios Adicionais"
3. Clique em: "Add Domain"
4. Preencha:
   Domain: seu-dominio.com.br
   Subdomain: www
   Document Root: /home/seu_usuario/public_html
5. Clique: "Add Domain"
```

### Passo 2: Adicionar Subdomínio para API

```
1. No mesmo lugar, clique em: "Add Subdomain"
2. Preencha:
   Subdomain: api
   Domain: seu-dominio.com.br
   Document Root: /home/seu_usuario/api_root
3. Clique: "Add Subdomain"
```

**Resultado esperado:**
```
✅ seu-dominio.com.br          (Frontend)
✅ www.seu-dominio.com.br      (Frontend)
✅ api.seu-dominio.com.br      (Backend)
```

---

## 📥 5. IMPORTAR/CLONAR OS CÓDIGOS

### Opção 1: Via Git (Recomendado)

```bash
# Conectar via SSH
ssh seu_usuario@seu-dominio.com.br

# Criar diretório
mkdir -p ~/projetos/meu-site
cd ~/projetos/meu-site

# Clonar repositório
git clone https://github.com/seu-usuario/seu-repo.git .

# Verificar arquivos
ls -la
# Esperado: backend/, frontend/, package.json, etc
```

### Opção 2: Via FTP/Upload

```bash
# No seu computador, baixe o repositório como ZIP
# Acesse: https://github.com/seu-usuario/seu-repo
# Clique: "Code" → "Download ZIP"

# Faça upload via FTP para:
# /home/seu_usuario/projetos/meu-site/

# No servidor, descompacte
cd ~/projetos/meu-site
unzip seu-repo-main.zip
rm seu-repo-main.zip

# Verificar
ls -la
```

---

## 🔐 6. CONFIGURAR VARIÁVEIS DE AMBIENTE

### Criar arquivo .env.production

```bash
# No servidor
cd ~/projetos/meu-site
cp .env.orionhost .env.production
nano .env.production
```

### Valores que VOCÊ DEVE PERSONALIZAR

```env
# 1. DOMÍNIO E EMAIL (OBRIGATÓRIO)
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com.br/api
API_BASE_URL=https://api.seu-dominio.com.br/api
SITE_URL=https://seu-dominio.com.br
COMPANY_EMAIL=admin@seu-dominio.com.br

# 2. SECRETS (JÁ GERADOS, MAS PODE GERAR NOVOS)
# Node: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=seu_secret_aqui
SESSION_SECRET=seu_session_secret
WEBHOOK_SECRET_PIX=seu_webhook_secret

# 3. EMAIL SMTP (OPCIONAL INICIALMENTE)
# Você pode configurar depois
SMTP_HOST=mail.seu-dominio.com.br
SMTP_USER=seu-email@seu-dominio.com.br
SMTP_PASS=sua_senha_app

# 4. PAGAMENTO (OPCIONAL INICIALMENTE)
# Ative depois que registrar nas plataformas
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**Salvar:** Ctrl+O → Enter → Ctrl+X

**Proteger arquivo:**
```bash
chmod 600 .env.production
```

---

## 🚀 7. INSTALAR DEPENDÊNCIAS E BUILD

### 7.1 Backend

```bash
cd ~/projetos/meu-site/backend

# Instalar packages
npm install
# Tempo: 2-5 minutos

# Testar se instalou
npm run test
```

### 7.2 Frontend

```bash
cd ~/projetos/meu-site/frontend

# Instalar packages
npm install
# Tempo: 2-5 minutos

# Build para produção
npm run build
# Tempo: 5-10 minutos

# Verificar se buildou
ls -la .next/
# Esperado: pasta .next/ com arquivos
```

---

## 💾 8. PREPARAR BANCO DE DADOS

### Criar diretório de dados

```bash
cd ~/projetos/meu-site
mkdir -p backend_data
chmod 755 backend_data
```

### Criar banco de dados com migrações

```bash
# No servidor
sqlite3 backend_data/database.sqlite < backend/src/db/migrations.sql

# Testar
sqlite3 backend_data/database.sqlite ".tables"
# Esperado: users, services, bookings, payments, etc
```

---

## 🔒 9. GERAR CERTIFICADO SSL

### Via Certbot (automático)

```bash
# No servidor (com sudo)
sudo certbot certonly --standalone \
  -d seu-dominio.com.br \
  -d www.seu-dominio.com.br \
  -d api.seu-dominio.com.br \
  -m admin@seu-dominio.com.br \
  --agree-tos \
  --non-interactive

# Certificado gerado em:
# /etc/letsencrypt/live/seu-dominio.com.br/
```

### Renovação automática

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🌐 10. CONFIGURAR NGINX REVERSO

### Arquivo de configuração

```bash
# Criar arquivo
sudo nano /etc/nginx/sites-available/seu-dominio.com.br
```

### Cole este conteúdo (substitua seu-dominio.com.br):

```nginx
# Frontend
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com.br;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

### Ativar configuração

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/seu-dominio.com.br /etc/nginx/sites-enabled/

# Remover default
sudo rm -f /etc/nginx/sites-enabled/default

# Testar sintaxe
sudo nginx -t
# Esperado: "test is successful"

# Recarregar
sudo systemctl reload nginx
```

---

## ▶️ 11. INICIAR SERVIÇOS

### Opção 1: Criar Systemd Services (Recomendado)

**Backend Service:**

```bash
sudo nano /etc/systemd/system/seu-dominio-backend.service
```

Cole:

```ini
[Unit]
Description=Backend - seu-dominio.com.br
After=network.target

[Service]
Type=simple
User=seu_usuario
WorkingDirectory=/home/seu_usuario/projetos/meu-site/backend
Environment="NODE_ENV=production"
ExecStart=/home/seu_usuario/.nvm/versions/node/v20.x.x/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Frontend Service:**

```bash
sudo nano /etc/systemd/system/seu-dominio-frontend.service
```

Cole:

```ini
[Unit]
Description=Frontend - seu-dominio.com.br
After=network.target seu-dominio-backend.service

[Service]
Type=simple
User=seu_usuario
WorkingDirectory=/home/seu_usuario/projetos/meu-site/frontend
Environment="NODE_ENV=production"
ExecStart=/home/seu_usuario/.nvm/versions/node/v20.x.x/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Ativar services

```bash
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

## ✅ 12. VALIDAR TUDO

### Testar URLs

```bash
# Frontend
curl -I https://seu-dominio.com.br
# Esperado: HTTP/2 200

# Backend
curl https://api.seu-dominio.com.br/api/health | jq .
# Esperado: {"status":"ok"}
```

### Testar no navegador

1. Abra: `https://seu-dominio.com.br`
2. Verifique:
   - ✅ Página carrega sem erro 502/503
   - ✅ Tema verde aparece
   - ✅ Cadeado SSL está verde
   - ✅ Componentes carregam

3. Tente fazer login: `https://seu-dominio.com.br/login`

---

## 🔍 13. TROUBLESHOOTING COMUM

### Erro 502 (Bad Gateway)

**Causa:** Backend não está rodando

```bash
# Verificar
sudo systemctl status seu-dominio-backend.service

# Reiniciar
sudo systemctl restart seu-dominio-backend.service

# Ver logs
sudo journalctl -u seu-dominio-backend.service -f
```

### Erro 503 (Service Unavailable)

**Causa:** Frontend não está rodando

```bash
# Verificar
sudo systemctl status seu-dominio-frontend.service

# Reiniciar
sudo systemctl restart seu-dominio-frontend.service
```

### SSL Certificate Problem

**Causa:** Certificado expirou ou está com problema

```bash
# Renovar
sudo certbot renew --force-renewal

# Verificar data
sudo certbot certificates
```

### Muito lento

**Causa:** Falta de recursos

```bash
# Ver uso de memória
free -m

# Ver processadores
top

# Limpar cache (cliente side)
Ctrl+Shift+Delete no navegador
```

---

## 📊 RESUMO - O QUE VOCÊ PRECISA

| Item | Necessário | Onde Conseguir |
|------|-----------|-----------------|
| **Domínio** | ✅ JÁ TEM | seu-dominio.com.br |
| **VPS/Cloud Orion** | ✅ FAÇA UPGRADE | Painel Orion Host |
| **SSH Access** | ✅ VERIFICAR | cPanel Orion Host |
| **Node.js 20** | ✅ INSTALAR | `nvm install 20` |
| **Git** | ✅ INSTALAR | `sudo apt-get install git` |
| **SQLite3** | ✅ INSTALAR | `sudo apt-get install sqlite3` |
| **Nginx** | ✅ INSTALAR | `sudo apt-get install nginx` |
| **Certbot** | ✅ INSTALAR | `sudo apt-get install certbot` |
| **Códigos** | ✅ CLONAR | `git clone [url]` |
| **.env.production** | ✅ CRIAR | Copiar de .env.orionhost |
| **Build frontend** | ✅ FAZER | `npm run build` |
| **SSL Certificate** | ✅ GERAR | `certbot certonly --standalone` |
| **Nginx Config** | ✅ CRIAR | Arquivo de configuração |
| **Systemd Services** | ✅ CRIAR | Services para backend/frontend |

---

## ⏱️ TEMPO TOTAL

| Etapa | Tempo |
|-------|-------|
| Verificar acesso SSH | 5 min |
| Instalar dependências | 10 min |
| Clonar repositório | 2 min |
| Instalar packages | 10 min |
| Build frontend | 5 min |
| Criar banco de dados | 2 min |
| Gerar SSL | 3 min |
| Configurar Nginx | 5 min |
| Criar systemd services | 3 min |
| **TOTAL** | **~45 min** |

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Verifique se tem VPS/Cloud
2. ✅ Teste acesso SSH
3. ✅ Use o script automático:
   ```bash
   bash deploy-orionhost-automated.sh seu-dominio.com.br admin@seu-dominio.com.br
   ```
4. ✅ Ou siga o guia DEPLOY_ORION_HOST_COMPLETO.md
5. ✅ Teste URLs após deploy

---

**Status:** ✅ Pré-requisitos documentados  
**Última atualização:** 14 de Fevereiro de 2026  
**Versão:** 1.0  

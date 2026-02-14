#!/bin/bash

# 🚀 SCRIPT DE CONFIGURAÇÃO RÁPIDA DE DOMÍNIO
# Use: bash setup-dominio.sh seu-dominio.com

set -e

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

if [ -z "$DOMAIN" ]; then
    echo "❌ Uso: bash setup-dominio.sh seu-dominio.com [email]"
    echo ""
    echo "Exemplos:"
    echo "  bash setup-dominio.sh limpezapro.com.br"
    echo "  bash setup-dominio.sh cleaners.com.br admin@cleaners.com.br"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 CONFIGURADOR AUTOMÁTICO DE DOMÍNIO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Domínio: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# PASSO 1: Criar arquivo .env.production
echo "📄 Passo 1: Criando .env.production..."
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    
    # Substituir domínio
    sed -i "s|seu-dominio.com|$DOMAIN|g" .env.production
    sed -i "s|your-email@example.com|$EMAIL|g" .env.production
    
    echo "✅ .env.production criado com domínio: $DOMAIN"
else
    echo "⚠️  .env.production já existe (não sobrescrevendo)"
fi

echo ""

# PASSO 2: Gerar secrets
echo "🔐 Passo 2: Gerando secrets seguros..."

JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)

echo "✅ Secrets gerados!"
echo ""
echo "Copie estes valores para .env.production:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "WEBHOOK_SECRET_PIX=$WEBHOOK_SECRET"
echo ""

# PASSO 3: Criar arquivo Nginx
echo "⚙️  Passo 3: Criando configuração Nginx..."

NGINX_CONFIG="/tmp/nginx-$DOMAIN.conf"

cat > "$NGINX_CONFIG" << 'EOF'
# Redirecionar HTTP → HTTPS
server {
    listen 80;
    server_name DOMAIN www.DOMAIN;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend (Next.js na porta 3001)
server {
    listen 443 ssl http2;
    server_name www.DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
    
    # Segurança
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
    server_name api.DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
    
    # Segurança
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
EOF

# Substituir DOMAIN no arquivo
sed -i "s|DOMAIN|$DOMAIN|g" "$NGINX_CONFIG"

echo "✅ Arquivo Nginx criado: $NGINX_CONFIG"
echo ""
echo "Para instalar em produção:"
echo "  sudo cp $NGINX_CONFIG /etc/nginx/sites-available/$DOMAIN"
echo "  sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "  sudo nginx -t"
echo "  sudo systemctl reload nginx"
echo ""

# PASSO 4: Instruções SSL
echo "🔒 Passo 4: Configurar SSL (Let's Encrypt)..."
echo ""
echo "Execute estes comandos no seu servidor:"
echo ""
echo "  # Instalar Certbot"
echo "  sudo apt update && sudo apt install certbot python3-certbot-nginx"
echo ""
echo "  # Gerar certificado"
echo "  sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -m $EMAIL"
echo ""
echo "  # Auto-renew"
echo "  sudo systemctl enable certbot.timer"
echo ""

# PASSO 5: Testar
echo "✅ Teste depois de fazer o deploy:"
echo ""
echo "  # Frontend"
echo "  curl https://$DOMAIN"
echo ""
echo "  # Backend"
echo "  curl https://api.$DOMAIN/health"
echo ""
echo "  # Verificar SSL"
echo "  openssl s_client -connect $DOMAIN:443"
echo ""

# PASSO 6: Checklist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PRÓXIMAS AÇÕES (em ordem):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Atualizar .env.production com os secrets acima"
echo ""
echo "2️⃣  No seu painel de DNS (GoDaddy/Namecheap/etc):"
echo "    • Adicione registro A: @ → [IP do servidor]"
echo "    • Adicione CNAME: www → $DOMAIN"
echo ""
echo "3️⃣  No seu servidor, execute:"
echo "    sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -m $EMAIL"
echo ""
echo "4️⃣  Copiar arquivo Nginx:"
echo "    sudo cp $NGINX_CONFIG /etc/nginx/sites-available/$DOMAIN"
echo "    sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "    sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "5️⃣  Deploy aplicação:"
echo "    docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "6️⃣  Testar:"
echo "    curl https://www.$DOMAIN"
echo "    curl https://api.$DOMAIN/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Pronto! Seu domínio $DOMAIN está configurado!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

#!/bin/bash

# 🚀 DEPLOYMENT AUTOMÁTICO - ORION HOST
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Script automático para deploy completo em Orion Host
# 
# Uso: bash deploy-orionhost.sh seu-dominio.com.br admin@seu-dominio.com.br
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# ═══════════════════════════════════════════
# CORES E FORMATAÇÃO
# ═══════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ═══════════════════════════════════════════
# FUNÇÕES
# ═══════════════════════════════════════════

header() {
    echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}\n"
}

step() {
    echo -e "${CYAN}→ $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

confirm() {
    local prompt="$1"
    local response
    echo -e "${YELLOW}$prompt (s/n)${NC}"
    read -r response
    [[ "$response" == "s" ]] || [[ "$response" == "S" ]]
}

# ═══════════════════════════════════════════
# VALIDAÇÃO INICIAL
# ═══════════════════════════════════════════

header "🚀 DEPLOYMENT ORION HOST - VALIDAÇÃO INICIAL"

if [ $# -lt 2 ]; then
    error "Argumento faltando!"
    echo ""
    echo "Uso: bash deploy-orionhost.sh SEU_DOMINIO SEU_EMAIL"
    echo ""
    echo "Exemplo:"
    echo "  bash deploy-orionhost.sh seu-dominio.com.br admin@seu-dominio.com.br"
    exit 1
fi

DOMAIN="$1"
EMAIL="$2"
PROJECT_DIR="$(pwd)"

step "Domínio: $DOMAIN"
step "Email: $EMAIL"
step "Diretório: $PROJECT_DIR"
echo ""

# Validar estrutura
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    error "arquivo package.json não encontrado em $PROJECT_DIR"
    exit 1
fi

if [ ! -d "$PROJECT_DIR/backend" ] || [ ! -d "$PROJECT_DIR/frontend" ]; then
    error "diretórios backend/ ou frontend/ não encontrados"
    exit 1
fi

success "Estrutura validada"

# ═══════════════════════════════════════════
# VERIFICAR PRÉ-REQUISITOS
# ═══════════════════════════════════════════

header "✅ VERIFICANDO PRÉ-REQUISITOS"

check_command() {
    if command -v "$1" &> /dev/null; then
        success "$1 encontrado"
        return 0
    else
        warning "$1 NÃO ENCONTRADO"
        return 1
    fi
}

check_command "node"
check_command "npm"
check_command "git"
check_command "sqlite3"

NODE_VERSION=$(node -v)
step "Versão Node: $NODE_VERSION"

# ═══════════════════════════════════════════
# GERAR SECRETS
# ═══════════════════════════════════════════

header "🔐 GERANDO SECRETS SEGUROS"

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
WEBHOOK_SECRET_PIX=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

step "JWT_SECRET: ${JWT_SECRET:0:16}..."
step "SESSION_SECRET: ${SESSION_SECRET:0:16}..."
step "WEBHOOK_SECRET_PIX: ${WEBHOOK_SECRET_PIX:0:16}..."

success "3 secrets gerados com sucesso"

# ═══════════════════════════════════════════
# PREPARAR ARQUIVO .env
# ═══════════════════════════════════════════

header "📝 PREPARANDO ARQUIVO .env.production"

if [ -f "$PROJECT_DIR/.env.orionhost" ]; then
    step "Encontrado .env.orionhost - usando como template"
    cp "$PROJECT_DIR/.env.orionhost" "$PROJECT_DIR/.env.production"
else
    warning ".env.orionhost não encontrado - criando .env.production básico"
    cat > "$PROJECT_DIR/.env.production" << EOF
NEXT_PUBLIC_API_URL=https://api.${DOMAIN}/api
API_BASE_URL=https://api.${DOMAIN}/api
NEXT_PUBLIC_WS_URL=wss://api.${DOMAIN}
SITE_URL=https://${DOMAIN}

COMPANY_NAME=Sua Empresa
COMPANY_EMAIL=${EMAIL}
COMPANY_PHONE=+55 11 99999-9999
SUPPORT_EMAIL=${EMAIL}

NODE_ENV=production
DATABASE_URL=sqlite:./backend_data/database.sqlite
EOF
fi

# Substituir placeholders no arquivo
sed -i "s/YOUR_DOMAIN.COM/${DOMAIN}/g" "$PROJECT_DIR/.env.production"
sed -i "s/YOUR_EMAIL/${EMAIL}/g" "$PROJECT_DIR/.env.production"
sed -i "s/GERAR_COM_COMANDO_ACIMA_32_CHARS/${JWT_SECRET}/g" "$PROJECT_DIR/.env.production" | head -1
sed -i "s/SESSION_SECRET=GERAR_COM_COMANDO_ACIMA_32_CHARS/SESSION_SECRET=${SESSION_SECRET}/g" "$PROJECT_DIR/.env.production"
sed -i "s/WEBHOOK_SECRET_PIX=GERAR_COM_COMANDO_ACIMA_32_CHARS/WEBHOOK_SECRET_PIX=${WEBHOOK_SECRET_PIX}/g" "$PROJECT_DIR/.env.production"

# Proteger arquivo
chmod 600 "$PROJECT_DIR/.env.production"

success ".env.production criado e protegido"
step "Lembre-se de atualizar as credenciais de email e pagamento no arquivo:"
echo -e "  ${CYAN}nano $PROJECT_DIR/.env.production${NC}"

# ═══════════════════════════════════════════
# INSTALAR DEPENDÊNCIAS
# ═══════════════════════════════════════════

header "📦 INSTALANDO DEPENDÊNCIAS"

if confirm "Instalar dependências do backend?"; then
    step "Instalando backend..."
    cd "$PROJECT_DIR/backend"
    npm install
    success "Backend instalado"
fi

if confirm "Instalar dependências do frontend?"; then
    step "Instalando frontend..."
    cd "$PROJECT_DIR/frontend"
    npm install
    success "Frontend instalado"
fi

cd "$PROJECT_DIR"

# ═══════════════════════════════════════════
# BANCO DE DADOS
# ═══════════════════════════════════════════

header "🗄️  CONFIGURANDO BANCO DE DADOS"

if [ ! -f "$PROJECT_DIR/backend_data/database.sqlite" ]; then
    step "Criando banco de dados..."
    mkdir -p "$PROJECT_DIR/backend_data"
    
    if [ -f "$PROJECT_DIR/backend/src/db/migrations.sql" ]; then
        sqlite3 "$PROJECT_DIR/backend_data/database.sqlite" < "$PROJECT_DIR/backend/src/db/migrations.sql"
        success "Banco de dados criado"
    else
        warning "migrations.sql não encontrado - banco será criado na primeira execução"
    fi
else
    warning "Banco de dados já existe - pulando criação"
fi

chmod 644 "$PROJECT_DIR/backend_data/database.sqlite"

# ═══════════════════════════════════════════
# BUILD FRONTEND
# ═══════════════════════════════════════════

header "🎨 BUILD DO FRONTEND"

if confirm "Fazer build do frontend?"; then
    step "Buildando frontend (pode levar 5-10 minutos)..."
    cd "$PROJECT_DIR/frontend"
    
    export NODE_ENV=production
    export NEXT_PUBLIC_API_URL="https://api.${DOMAIN}/api"
    
    npm run build
    
    success "Frontend buildado com sucesso"
fi

cd "$PROJECT_DIR"

# ═══════════════════════════════════════════
# CRIAR SYSTEMD SERVICES (se root/sudo)
# ═══════════════════════════════════════════

if [ "$EUID" -eq 0 ]; then
    header "🔧 CRIANDO SYSTEMD SERVICES"
    
    CURRENT_USER="${SUDO_USER:$USER}"
    
    step "Criando service backend..."
    cat > "/etc/systemd/system/${DOMAIN}-backend.service" << EOF
[Unit]
Description=Backend API - ${DOMAIN}
After=network.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${PROJECT_DIR}/backend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=$(which npm) start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    step "Criando service frontend..."
    cat > "/etc/systemd/system/${DOMAIN}-frontend.service" << EOF
[Unit]
Description=Frontend Web - ${DOMAIN}
After=network.target ${DOMAIN}-backend.service

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${PROJECT_DIR}/frontend
Environment="NODE_ENV=production"
Environment="PORT=3001"
ExecStart=$(which npm) start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "${DOMAIN}-backend.service"
    systemctl enable "${DOMAIN}-frontend.service"
    
    success "Services criados e habilitados"
    echo ""
    echo "Para iniciar:"
    echo -e "  ${CYAN}sudo systemctl start ${DOMAIN}-backend.service${NC}"
    echo -e "  ${CYAN}sudo systemctl start ${DOMAIN}-frontend.service${NC}"
else
    warning "Você não é root - services não foram criados"
    echo ""
    echo "Para criar services depois, execute:"
    echo -e "  ${CYAN}sudo bash deploy-orionhost.sh $DOMAIN $EMAIL${NC}"
fi

# ═══════════════════════════════════════════
# CONFIGURAR NGINX (se root/sudo)
# ═══════════════════════════════════════════

if [ "$EUID" -eq 0 ]; then
    header "🌐 CONFIGURANDO NGINX"
    
    if command -v nginx &> /dev/null; then
        step "Nginx já está instalado"
    else
        if confirm "Instalar Nginx?"; then
            apt-get update
            apt-get install -y nginx
            systemctl start nginx
            systemctl enable nginx
            success "Nginx instalado"
        fi
    fi
    
    # Criar configuração Nginx
    NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"
    
    if [ ! -f "$NGINX_CONFIG" ]; then
        step "Criando configuração Nginx..."
        
        cat > "$NGINX_CONFIG" << 'NGINX_TEMPLATE'
# Frontend
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
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
    
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/json;
}

# Backend API
server {
    listen 80;
    listen [::]:80;
    server_name api.DOMAIN_PLACEHOLDER;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.DOMAIN_PLACEHOLDER;
    
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
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
        proxy_buffering off;
    }
    
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/json;
}
NGINX_TEMPLATE
        
        # Substituir placeholder
        sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$NGINX_CONFIG"
        
        # Ativar site
        ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/${DOMAIN}"
        rm -f "/etc/nginx/sites-enabled/default"
        
        # Testar e recarregar
        nginx -t && systemctl reload nginx
        
        success "Nginx configurado"
    else
        warning "Configuração Nginx já existe em $NGINX_CONFIG"
    fi
fi

# ═══════════════════════════════════════════
# SSL CERTIFICATE
# ═══════════════════════════════════════════

if [ "$EUID" -eq 0 ]; then
    header "🔒 CERTIFICADO SSL/TLS"
    
    if command -v certbot &> /dev/null; then
        step "Certbot já está instalado"
    else
        if confirm "Instalar Certbot (Let's Encrypt)?"; then
            apt-get install -y certbot python3-certbot-nginx
            success "Certbot instalado"
        fi
    fi
    
    if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
        if confirm "Gerar certificado SSL para ${DOMAIN}?"; then
            step "Gerando certificado (pode levar 1-2 minutos)..."
            
            certbot certonly --nginx \
                -d "${DOMAIN}" \
                -d "www.${DOMAIN}" \
                -d "api.${DOMAIN}" \
                -m "${EMAIL}" \
                --agree-tos \
                --non-interactive \
                --expand
            
            systemctl enable certbot.timer
            systemctl start certbot.timer
            
            success "Certificado gerado com sucesso"
        fi
    else
        warning "Certificado SSL já existe para $DOMAIN"
    fi
fi

# ═══════════════════════════════════════════
# RESUMO FINAL
# ═══════════════════════════════════════════

header "🎉 DEPLOYMENT PREPARADO!"

echo -e "${GREEN}✅ Todas as preparações foram concluídas!${NC}"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  ATUALIZAR CREDENCIAIS"
echo -e "   ${CYAN}Edite: $PROJECT_DIR/.env.production${NC}"
echo "   Adicione suas credenciais de:"
echo "   - Email (SMTP_HOST, SMTP_USER, SMTP_PASS)"
echo "   - Stripe (STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY)"
echo "   - PIX (PIX_PROVIDER_KEY, PIX_PROVIDER_SECRET)"
echo ""

if [ "$EUID" -eq 0 ]; then
    echo "2️⃣  INICIAR SERVIÇOS"
    echo -e "   ${CYAN}sudo systemctl start ${DOMAIN}-backend.service${NC}"
    echo -e "   ${CYAN}sudo systemctl start ${DOMAIN}-frontend.service${NC}"
    echo ""
    echo "3️⃣  VERIFICAR STATUS"
    echo -e "   ${CYAN}sudo systemctl status ${DOMAIN}-backend.service${NC}"
    echo -e "   ${CYAN}sudo systemctl status ${DOMAIN}-frontend.service${NC}"
    echo ""
    echo "4️⃣  VER LOGS"
    echo -e "   ${CYAN}sudo journalctl -u ${DOMAIN}-backend.service -f${NC}"
    echo -e "   ${CYAN}sudo journalctl -u ${DOMAIN}-frontend.service -f${NC}"
else
    echo "2️⃣  INICIAR SERVIÇOS (manual)"
    echo -e "   ${CYAN}cd $PROJECT_DIR/backend && npm start${NC}"
    echo -e "   ${CYAN}cd $PROJECT_DIR/frontend && npm start${NC}"
    echo ""
    echo "3️⃣  OU CRIAR SYSTEMD SERVICES (com sudo)"
    echo -e "   ${CYAN}sudo bash deploy-orionhost.sh $DOMAIN $EMAIL${NC}"
fi

echo ""
echo "5️⃣  ACESSAR SITE"
echo -e "   ${CYAN}https://${DOMAIN}${NC}"
echo -e "   ${CYAN}https://api.${DOMAIN}/api/health${NC}"
echo ""
echo "📚 DOCUMENTAÇÃO COMPLETA:"
echo -e "   ${CYAN}$PROJECT_DIR/DEPLOY_ORION_HOST_COMPLETO.md${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Sistema pronto para Orion Host!"
echo "═══════════════════════════════════════════════════════════════"
echo ""

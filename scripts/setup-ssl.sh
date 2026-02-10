#!/bin/bash

# ============================================================
# 🔒 SSL/HTTPS Setup with Let's Encrypt & Certbot
# ============================================================
# Configura certificados SSL auto-renováveis via Let's Encrypt
# Uso: ./scripts/setup-ssl.sh <domain> <email>
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parameters
DOMAIN="${1:-seu-dominio.com}"
EMAIL="${2:-admin@seu-dominio.com}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

log() {
  echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
  exit 1
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

header() {
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════${NC}"
}

echo ""
header "🔒 SSL/HTTPS Setup com Let's Encrypt"
echo ""

# Validation
if [ "$DOMAIN" = "seu-dominio.com" ]; then
  error "Por favor especifique seu domínio: ./setup-ssl.sh seu-dominio.com admin@seu-dominio.com"
fi

# Check if domain is accessible
log "🔍 Verificando acessibilidade do domínio..."
if ! dig +short "$DOMAIN" | grep -q '\.'; then
  warn "Domínio $DOMAIN não resolveu. Verificar DNS."
else
  log "✅ Domínio acessível"
fi
echo ""

# Install certbot if not exists
if ! command -v certbot &> /dev/null; then
  log "📦 Instalando Certbot..."
  apt-get update
  apt-get install -y certbot [REDACTED_TOKEN]
  log "✅ Certbot instalado"
else
  log "✅ Certbot já instalado"
fi
echo ""

# Create certificate
log "🔐 Gerando certificado SSL..."
certbot certonly \
  --standalone \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -m "$EMAIL" \
  --agree-tos \
  --non-interactive \
  --[REDACTED_TOKEN] http \
  || error "Erro ao gerar certificado"
log "✅ Certificado criado em: $CERT_DIR"
echo ""

# Verify certificate
log "✅ Verificando certificado..."
openssl x509 -in "$CERT_DIR/fullchain.pem" -text -noout | grep -E "(Subject|Not Before|Not After)"
echo ""

# Update .env.production
log "📝 Atualizando .env.production..."
if [ -f ".env.production" ]; then
  sed -i "s|SSL_CERT_PATH=.*|SSL_CERT_PATH=$CERT_DIR/fullchain.pem|" .env.production
  sed -i "s|SSL_KEY_PATH=.*|SSL_KEY_PATH=$CERT_DIR/privkey.pem|" .env.production
  log "✅ .env.production atualizado"
else
  warn ".env.production não encontrado"
fi
echo ""

# Setup auto-renewal
log "⚙️  Configurando renovação automática..."
certbot renew --dry-run > /dev/null 2>&1 && log "✅ Renovação automática configurada" || warn "Erro na renovação automática"
echo ""

# Create NGINX config snippet
log "📝 Criando snippet NGINX para SSL..."
mkdir -p /etc/letsencrypt/renewal-hooks/post

cat > /etc/letsencrypt/renewal-hooks/post/nginx.sh << 'NGINX_HOOK'
#!/bin/bash
systemctl reload nginx
NGINX_HOOK

chmod +x /etc/letsencrypt/renewal-hooks/post/nginx.sh
log "✅ Hook NGINX criado"
echo ""

# Security headers
log "🔒 Recomendações de segurança:"
echo "  1. HSTS: Adicionar 'add_header [REDACTED_TOKEN] \"max-age=31536000; includeSubDomains\" always;'"
echo "  2. CSP: add_header [REDACTED_TOKEN] \"default-src 'self'; script-src 'self' 'unsafe-inline';\""
echo "  3. X-Frame-Options: add_header X-Frame-Options \"SAMEORIGIN\";"
echo "  4. [REDACTED_TOKEN]: add_header [REDACTED_TOKEN] \"nosniff\";"
echo ""

# Final summary
header "✅ Setup SSL Concluído!"
echo ""
echo "📋 Resumo:"
echo "  Domínio: $DOMAIN"
echo "  Certificado: $CERT_DIR/fullchain.pem"
echo "  Chave privada: $CERT_DIR/privkey.pem"
echo "  Renovação automática: Ativada (certbot)"
echo ""
echo "🧪 Testar certificado:"
echo "  curl https://$DOMAIN"
echo ""
echo "📊 Verificar SSL:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "🔄 Renovar manualmente:"
echo "  certbot renew --force-renewal"
echo ""

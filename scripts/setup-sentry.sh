#!/bin/bash

# ============================================================
# 🔔 Sentry Error Tracking Setup
# ============================================================
# Configura integração do Sentry para error tracking
# Pré-requisito: Ter conta em https://sentry.io
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
  exit 1
}

header() {
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════${NC}"
}

echo ""
header "🔔 Sentry Integration Setup"
echo ""

# Get Sentry DSN
SENTRY_DSN="${1:-}"

if [ -z "$SENTRY_DSN" ]; then
  echo -e "${YELLOW}Digite seu Sentry DSN (obter em https://sentry.io/settings/YOUR_ORG/projects/):${NC}"
  read -p "DSN: " SENTRY_DSN
fi

if [[ ! "$SENTRY_DSN" =~ ^https://[a-zA-Z0-9]+@sentry.io/[0-9]+$ ]]; then
  error "DSN inválida. Formato esperado: https://key@sentry.io/project_id"
fi

log "✅ Sentry DSN válida"
echo ""

# Update .env.production
log "📝 Atualizando .env.production..."
if [ ! -f ".env.production" ]; then
  cp .env.example .env.production
  log "ℹ️  Arquivo .env.production criado"
fi

# Update Sentry DSN
sed -i "s|SENTRY_DSN=.*|SENTRY_DSN=$SENTRY_DSN|" .env.production
sed -i "s|SENTRY_ENVIRONMENT=.*|SENTRY_ENVIRONMENT=production|" .env.production
sed -i "s|[REDACTED_TOKEN]=.*|[REDACTED_TOKEN]=0.1|" .env.production

log "✅ .env.production atualizado"
echo ""

# Check backend Sentry integration
log "🔍 Verificando integração Sentry no backend..."
if grep -q "@sentry/node" backend/package.json; then
  log "✅ @sentry/node já instalado"
else
  log "📦 Instalando @sentry/node..."
  cd backend
  npm install @sentry/node
  cd ..
  log "✅ Instalado"
fi
echo ""

# Display setup summary
header "✅ Setup Sentry Concluído!"
echo ""
echo "📋 Resumo:"
echo "  DSN: ${SENTRY_DSN:0:40}..."
echo "  Backend: Sentry integrado"
echo "  Environment: production"
echo "  Sample Rate: 10%"
echo ""
echo "🔗 Links úteis:"
echo "  Dashboard: https://sentry.io/select_organization/"
echo "  Documentação: https://docs.sentry.io/product/performance/"
echo "  Node.js: https://docs.sentry.io/platforms/node/"
echo ""
echo "⚙️  Configuracoes recomendadas:"
echo "  1. Ativar [REDACTED_TOKEN] para performance monitoring"
echo "  2. Configurar alertas para erros críticos"
echo "  3. Integrar com Slack/PagerDuty para notificações"
echo "  4. Setup Source Maps para stack traces melhores"
echo "  5. Configurar release tracking para comparar erros entre versões"
echo ""

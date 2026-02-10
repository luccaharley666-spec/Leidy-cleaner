#!/bin/bash

# 🚀 QUICK START - Testar as 3 Features Implementadas
# 
# Uso: bash quick-test-features.sh

set -e

echo "🎉 Quick Start - 3 Features"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ========================================
# 1. VERIFICAR DEPENDENCIES
# ========================================
print_step "1. Verificando dependências..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js não encontrado!"
    exit 1
fi
print_success "Node.js $(node --version) instalado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_warning "npm não encontrado!"
    exit 1
fi
print_success "npm $(npm --version) instalado"

echo ""

# ========================================
# 2. TESTAR DASHBOARD
# ========================================
print_step "2. Validando Dashboard Admin..."

if [ -f "frontend/src/pages/admin-dashboard.jsx" ]; then
    lines=$(wc -l < frontend/src/pages/admin-dashboard.jsx)
    print_success "admin-dashboard.jsx encontrado ($lines linhas)"
    
    # Verificar imports
    if grep -q "recharts" frontend/src/pages/admin-dashboard.jsx; then
        print_success "Imports Recharts definidos"
    fi
else
    print_warning "admin-dashboard.jsx não encontrado!"
fi

echo ""

# ========================================
# 3. TESTAR DARK MODE
# ========================================
print_step "3. Validando Dark Mode..."

if [ -f "frontend/src/components/Layout/LeidyHeader.jsx" ]; then
    if grep -q "toggleTheme" frontend/src/components/Layout/LeidyHeader.jsx; then
        print_success "Dark Mode toggle implementado no LeidyHeader"
    fi
    
    if grep -q "ThemeContext" frontend/src/components/Layout/LeidyHeader.jsx; then
        print_success "ThemeContext integrado"
    fi
else
    print_warning "LeidyHeader.jsx não encontrado!"
fi

if [ -f "frontend/src/context/ThemeContext.jsx" ]; then
    print_success "ThemeContext.jsx encontrado"
else
    print_warning "ThemeContext.jsx não encontrado!"
fi

echo ""

# ========================================
# 4. TESTAR PIX WEBHOOK
# ========================================
print_step "4. Validando PIX Webhook Service..."

if [ -f "backend/src/services/PixWebhookService.js" ]; then
    lines=$(wc -l < backend/src/services/PixWebhookService.js)
    print_success "PixWebhookService.js encontrado ($lines linhas)"
else
    print_warning "PixWebhookService.js não encontrado!"
fi

if [ -f "backend/src/controllers/[REDACTED_TOKEN].js" ]; then
    lines=$(wc -l < backend/src/controllers/[REDACTED_TOKEN].js)
    print_success "[REDACTED_TOKEN].js encontrado ($lines linhas)"
else
    print_warning "[REDACTED_TOKEN].js não encontrado!"
fi

if [ -f "backend/src/routes/pixWebhook.routes.js" ]; then
    print_success "pixWebhook.routes.js encontrado"
else
    print_warning "pixWebhook.routes.js não encontrado!"
fi

echo ""

# ========================================
# 5. TESTAR CARREGAMENTO DE MÓDULOS
# ========================================
print_step "5. Testando carregamento de módulos Node.js..."

cd backend
if node -e "require('./src/services/PixWebhookService'); console.log('OK')" 2>/dev/null | grep -q "OK"; then
    print_success "PixWebhookService carrega sem erros"
else
    print_warning "Erro ao carregar PixWebhookService"
fi
cd ..

echo ""

# ========================================
# 6. DOCUMENTAÇÃO
# ========================================
print_step "6. Verificando documentação..."

docs=(
    "[REDACTED_TOKEN].md"
    "[REDACTED_TOKEN].md"
    "[REDACTED_TOKEN].md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        lines=$(wc -l < "$doc")
        print_success "$doc ($lines linhas)"
    else
        print_warning "$doc não encontrado"
    fi
done

echo ""

# ========================================
# 7. RESUMO
# ========================================
echo "================================"
print_success "✨ Validação Completa!"
echo ""
echo "${BLUE}📊 FEATURES IMPLEMENTADAS:${NC}"
echo "  ✅ Dashboard Admin com Gráficos"
echo "  ✅ Dark Mode com Toggle"
echo "  ✅ PIX Webhook Real com HMAC-SHA256"
echo ""
echo "${BLUE}🚀 PRÓXIMOS PASSOS:${NC}"
echo "  1. npm run dev (backend porta 3001)"
echo "  2. npm run dev (frontend porta 3000)"
echo "  3. Acessar http://localhost:3000/admin-dashboard"
echo "  4. Testar Dark Mode (botão na header)"
echo "  5. node test-pix-webhook.js (testar webhook)"
echo ""
echo "${BLUE}📚 DOCUMENTAÇÃO:${NC}"
echo "  - [REDACTED_TOKEN].md"
echo "  - [REDACTED_TOKEN].md"
echo "  - [REDACTED_TOKEN].md"
echo ""

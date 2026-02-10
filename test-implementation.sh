#!/bin/bash

# Test script para validar todas as implementações nova de 2FA, PIX, PWA, Blog, etc.

set -e

echo "🧪 INICIANDO TESTES DE IMPLEMENTAÇÃO"
echo "===================================="

PASS=0
FAIL=0

# Cor de output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_file() {
  local file=$1
  local desc=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $desc"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗${NC} $desc (Arquivo não encontrado: $file)"
    ((FAIL++))
    return 1
  fi
}

test_exists() {
  local pattern=$1
  local file=$2
  local desc=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $desc"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗${NC} $desc"
    ((FAIL++))
    return 1
  fi
}

echo ""
echo "📂 VALIDANDO ARQUIVOS CRIADOS"
echo "-----------------------------"

# 2FA
test_file "backend/src/middleware/twoFactorAuth.js" "2FA Middleware (TOTP)"
test_file "backend/src/routes/twoFactorRoutes.js" "2FA Routes"

# PIX & Referral
test_file "backend/src/services/PixService.js" "PIX Service"
test_file "backend/src/services/CouponService.js" "Coupon Service"
test_file "backend/src/services/ReferralService.js" "Referral Service"
test_file "backend/src/services/[REDACTED_TOKEN].js" "Slot Recommendation Service"

# Admin & Blog
test_file "backend/src/routes/adminRoutes.js" "Admin Dashboard Routes"
test_file "backend/src/routes/blogRoutes.js" "Blog Routes"

# PWA
test_file "public/manifest.json" "PWA Manifest"
test_file "public/service-worker.js" "Service Worker"
test_file "public/offline.html" "Offline Fallback Page"

# Database
test_file "database/migrations/[REDACTED_TOKEN].sql" "Database Migration"

# Legal
test_file "public/termos-servico.html" "Terms of Service"
test_file "public/[REDACTED_TOKEN].html" "Privacy Policy (LGPD)"

echo ""
echo "🔍 VALIDANDO CONTEÚDO"
echo "--------------------"

# 2FA validations
test_exists "speakeasy" "backend/src/middleware/twoFactorAuth.js" "2FA usa TOTP (speakeasy)"
test_exists "generateBackupCodes" "backend/src/middleware/twoFactorAuth.js" "2FA backup codes"
test_exists "POST /api/auth/2fa/setup" "backend/src/routes/twoFactorRoutes.js" "2FA setup endpoint"
test_exists "POST /api/auth/2fa/confirm" "backend/src/routes/twoFactorRoutes.js" "2FA confirm endpoint"

# PIX validations
test_exists "generateQRCode" "backend/src/services/PixService.js" "PIX QR code generation"
test_exists "verifyPayment" "backend/src/services/PixService.js" "PIX verification"
test_exists "confirmPayment" "backend/src/services/PixService.js" "PIX payment confirmation"
test_exists "pix_transactions" "database/migrations/[REDACTED_TOKEN].sql" "PIX table na DB"

# Coupon validations
test_exists "validateCoupon" "backend/src/services/CouponService.js" "Coupon validation"
test_exists "applyCoupon" "backend/src/services/CouponService.js" "Coupon application"
test_exists "coupons" "database/migrations/[REDACTED_TOKEN].sql" "Coupon table"

# Referral validations
test_exists "[REDACTED_TOKEN]" "backend/src/services/ReferralService.js" "Referral link generation"
test_exists "[REDACTED_TOKEN]" "backend/src/services/ReferralService.js" "Referral signup"
test_exists "[REDACTED_TOKEN]" "backend/src/services/ReferralService.js" "Referral reward"

# Slot Recommendation
test_exists "recommendSlots" "backend/src/services/[REDACTED_TOKEN].js" "Slot recommendation"
test_exists "[REDACTED_TOKEN]" "backend/src/services/[REDACTED_TOKEN].js" "Complementary services"

# Admin validations
test_exists "POST /api/admin/teams" "backend/src/routes/adminRoutes.js" "Admin teams CRUD"
test_exists "POST /api/admin/services" "backend/src/routes/adminRoutes.js" "Admin services CRUD"
test_exists "GET /api/admin/dashboard" "backend/src/routes/adminRoutes.js" "Admin dashboard KPIs"

# Blog validations
test_exists "GET /api/blog" "backend/src/routes/blogRoutes.js" "Blog list endpoint"
test_exists "POST /api/blog" "backend/src/routes/blogRoutes.js" "Blog create endpoint"
test_exists "blog_posts" "database/migrations/[REDACTED_TOKEN].sql" "Blog table"

# PWA validations
test_exists "\"display\": \"standalone\"" "public/manifest.json" "PWA standalone mode"
test_exists "Service Worker" "public/service-worker.js" "Service Worker caching"
test_exists "offline" "public/offline.html" "Offline page handling"

# API integration
test_exists "twoFactorRoutes" "backend/src/routes/api.js" "2FA routes registered"
test_exists "adminRoutes" "backend/src/routes/api.js" "Admin routes registered"
test_exists "blogRoutes" "backend/src/routes/api.js" "Blog routes registered"

# Legal compliance
test_exists "LGPD" "public/[REDACTED_TOKEN].html" "LGPD compliance mentioned"
test_exists "24h full" "public/termos-servico.html" "Refund policy documented"

echo ""
echo "🔐 VERIFICANDO SEGURANÇA"
echo "----------------------"

test_exists "bcrypt" "backend/src/middleware/twoFactorAuth.js" "2FA password verification com bcrypt"
test_exists "authenticateToken" "backend/src/routes/adminRoutes.js" "Admin routes protegidas"
test_exists "requireRole.*admin" "backend/src/routes/adminRoutes.js" "Admin routes verificam role"

echo ""
echo "📊 DEPENDÊNCIAS"
echo "---------------"

# Check dependencies
if grep -q "speakeasy" backend/package.json 2>/dev/null; then
  echo -e "${YELLOW}⚠${NC}  speakeasy não está em package.json (instalar: npm install speakeasy)"
else
  echo -e "${YELLOW}⚠${NC}  speakeasy não está em package.json (instalar: npm install speakeasy)"
fi

if grep -q "brcode" backend/package.json 2>/dev/null; then
  echo -e "${GREEN}✓${NC} brcode está em package.json (PIX BR format)"
else
  echo -e "${YELLOW}ℹ${NC}  brcode não em package.json (opcional para PIX produção)"
fi

echo ""
echo "📈 ESTATÍSTICAS"
echo "---------------"

TOTAL=$((PASS + FAIL))
echo "Total de testes: $TOTAL"
echo -e "Passes: ${GREEN}$PASS${NC}"
echo -e "Falhas: ${RED}$FAIL${NC}"

if [ $FAIL -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ TODOS OS TESTES PASSARAM!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. npm install speakeasy brcode (backend)"
  echo "2. npm run db:migrate (aplicar migrations)"
  echo "3. Adicionar index.html: <link rel=\"manifest\" href=\"/manifest.json\">"
  echo "4. Adicionar index.html: <script>navigator.serviceWorker.register('/service-worker.js')</script>"
  echo "5. Testar PWA: Chrome DevTools → Application → Manifest"
  exit 0
else
  echo ""
  echo -e "${RED}✗ Alguns testes falharam${NC}"
  exit 1
fi

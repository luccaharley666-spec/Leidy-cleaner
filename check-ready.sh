#!/bin/bash

# 📊 VERIFICAÇÃO DE STATUS & READINESS - LIMPEZA PRO
# Mostra se está pronto para deploy

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║                ✅ STATUS DE IMPLEMENTAÇÃO - LIMPEZA PRO                    ║"
echo "║                                                                            ║"
echo "║                          (9 de Fevereiro, 2026)                           ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# CORES
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1. BACKEND - IMPLEMENTAÇÃO E TESTES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

cd backend

# Verificar se dependencies estão instaladas
if [ -d "node_modules" ]; then
  echo -e "   ${GREEN}✅${NC} Dependências instaladas"
else
  echo -e "   ${RED}❌${NC} Dependências faltando - npm install"
fi

# Verificar migrations
if [ -d "src/db/migrations" ]; then
  MIGRATION_COUNT=$(ls -1 src/db/migrations/*.sql 2>/dev/null | wc -l)
  echo -e "   ${GREEN}✅${NC} Migrations: $MIGRATION_COUNT arquivos SQL"
fi

# Verificar Services
SERVICES=(
  "PixService"
  "[REDACTED_TOKEN]"
  "NotificationService"
  "EmailQueueService"
  "[REDACTED_TOKEN]"
)

echo -e "   ${GREEN}✅${NC} Services implementados:"
for service in "${SERVICES[@]}"; do
  if [ -f "src/services/${service}.js" ]; then
    echo -e "      • ${GREEN}✓${NC} $service"
  else
    echo -e "      • ${RED}✗${NC} $service (faltando)"
  fi
done

# Verificar Routes
ROUTES=(
  "payment"
  "notifications"
  "bookings"
  "users"
)

echo -e "   ${GREEN}✅${NC} Routes implementadas:"
for route in "${ROUTES[@]}"; do
  if grep -q "'/api/${route}" src/routes/*.js 2>/dev/null; then
    echo -e "      • ${GREEN}✓${NC} /api/${route}"
  fi
done

# Verificar Database
if [ -f "../backend_data/database.db" ]; then
  SIZE=$(du -h ../backend_data/database.db | cut -f1)
  echo -e "   ${GREEN}✅${NC} Database: SQLite ($SIZE)"
else
  echo -e "   ${YELLOW}⚠️ ${NC} Database não inicializado (será criado em runtime)"
fi

# Verificar Testes
TEST_COUNT=$(find src -name "*.test.js" -o -name "*.spec.js" 2>/dev/null | wc -l)
echo -e "   ${GREEN}✅${NC} Testes: $TEST_COUNT arquivos de teste"

# Verificar .env
if [ -f ".env" ]; then
  echo -e "   ${GREEN}✅${NC} .env configurado"
else
  echo -e "   ${YELLOW}⚠️ ${NC} .env não encontrado (copie de .env.example)"
fi

echo ""
cd ..

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2. FRONTEND - BUILD E CONFIGURAÇÃO${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

cd frontend

# Verificar se dependencies estão instaladas
if [ -d "node_modules" ]; then
  echo -e "   ${GREEN}✅${NC} Dependências instaladas"
  REACT_VERSION=$(grep '"react":' package.json | cut -d'"' -f4)
  NEXT_VERSION=$(grep '"next":' package.json | cut -d'"' -f4)
  echo -e "      • React: $REACT_VERSION"
  echo -e "      • Next.js: $NEXT_VERSION"
else
  echo -e "   ${RED}❌${NC} Dependências faltando - npm install"
fi

# Verificar componentes principais
COMPONENTS=(
  "pages/index"
  "pages/bookings"
  "pages/payments"
  "pages/dashboard"
  "components/Header"
  "components/Footer"
)

echo -e "   ${GREEN}✅${NC} Componentes principais:"
for component in "${COMPONENTS[@]}"; do
  if find . -name "${component}*" -type f 2>/dev/null | grep -q .; then
    echo -e "      • ${GREEN}✓${NC} $component"
  fi
done

# Verificar build
if [ -d ".next" ]; then
  echo -e "   ${GREEN}✅${NC} Build Next.js: .next/ (pronta para produção)"
else
  echo -e "   ${YELLOW}⚠️ ${NC} Build não realizado (execute: npm run build)"
fi

# Verificar .env
if [ -f ".env.local" ]; then
  echo -e "   ${GREEN}✅${NC} .env.local configurado"
else
  echo -e "   ${YELLOW}⚠️ ${NC} .env.local não encontrado (requer: REACT_APP_API_URL)"
fi

echo ""
cd ..

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3. DOCUMENTAÇÃO & DEPLOYMENT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

DOCS=(
  "DEPLOYMENT_READY.md"
  "backend/TESTING_STRATEGY.md"
  "TODO_ITEMS.md"
  "[REDACTED_TOKEN].md"
  ".env.example"
  "docker-compose.yml"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    SIZE=$(wc -l < "$doc" 2>/dev/null | tr -d ' ')
    echo -e "   ${GREEN}✅${NC} $doc ($SIZE linhas)"
  else
    echo -e "   ${RED}❌${NC} $doc (faltando)"
  fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4. VERIFICAÇÃO FINAL DE PRONTO PARA DEPLOY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

STATUS_OK=0

# Backend node_modules
if [ -d "backend/node_modules" ]; then
  echo -e "   ${GREEN}✅${NC} Backend dependencies"
  ((STATUS_OK++))
else
  echo -e "   ${RED}❌${NC} Backend dependencies (execute: cd backend && npm install)"
fi

# Frontend node_modules
if [ -d "frontend/node_modules" ]; then
  echo -e "   ${GREEN}✅${NC} Frontend dependencies"
  ((STATUS_OK++))
else
  echo -e "   ${RED}❌${NC} Frontend dependencies (execute: cd frontend && npm install)"
fi

# Database migrations
if [ -d "database/migrations" ]; then
  echo -e "   ${GREEN}✅${NC} Database migrations estrutura"
  ((STATUS_OK++))
fi

# Services implementados
if [ -f "backend/src/services/PixService.js" ] && [ -f "backend/src/services/[REDACTED_TOKEN].js" ]; then
  echo -e "   ${GREEN}✅${NC} Serviços de pagamento (PIX)"
  ((STATUS_OK++))
fi

if [ -f "backend/src/services/NotificationService.js" ]; then
  echo -e "   ${GREEN}✅${NC} Serviço de notificações (SMS/WhatsApp/Email)"
  ((STATUS_OK++))
fi

# Frontend build
if [ -d "frontend/.next" ]; then
  echo -e "   ${GREEN}✅${NC} Frontend build otimizado"
  ((STATUS_OK++))
else
  echo -e "   ${YELLOW}⚠️ ${NC} Frontend build (execute: cd frontend && npm run build)"
fi

# Documentation
if [ -f "DEPLOYMENT_READY.md" ]; then
  echo -e "   ${GREEN}✅${NC} Documentação de deploy"
  ((STATUS_OK++))
fi

# Git status
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  COMMIT=$(git rev-parse --short HEAD 2>/dev/null)
  echo -e "   ${GREEN}✅${NC} Git (branch: $BRANCH, commit: $COMMIT)"
  ((STATUS_OK++))
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                   RESUMO DE PRONTIDÃO${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $STATUS_OK -ge 8 ]; then
  echo -e "${GREEN}✅ PRONTO PARA DEPLOY${NC}"
  echo ""
  echo "   Status: 8/8 verificações"
  echo ""
  echo -e "${YELLOW}Próximos passos:${NC}"
  echo ""
  echo "   1️⃣  Backend (terminal 1):"
  echo "      $ cd backend"
  echo "      $ npm start"
  echo ""
  echo "   2️⃣  Frontend (terminal 2):"
  echo "      $ cd frontend"
  echo "      $ npm start"
  echo ""
  echo "   3️⃣  Acesse no browser:"
  echo "      $ open http://localhost:3001"
  echo ""
  echo "   4️⃣  Deploy em produção:"
  echo "      $ bash deploy.sh  # Ou seu provider (Vercel, Heroku, etc)"
  echo ""
else
  echo -e "${YELLOW}⚠️  QUASE PRONTO${NC}"
  echo ""
  echo "   Status: $STATUS_OK/8 verificações"
  echo ""
  echo -e "${YELLOW}Faltando:${NC}"
  echo "   • Instalar dependências (backend/frontend)"
  echo "   • Build frontend (npm run build)"
  echo "   • Configurar variáveis de ambiente"
  echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📚 Para mais informações:"
echo "   • DEPLOYMENT_READY.md - Guia completo de deploy"
echo "   • backend/TESTING_STRATEGY.md - Estratégia de testes"
echo "   • [REDACTED_TOKEN].md - Status técnico completo"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"

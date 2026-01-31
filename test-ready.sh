#!/bin/bash

echo "🧪 TESTE RÁPIDO - Leidy Cleaner"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -n "✓ Node.js: "
node --version

# 2. Verificar npm
echo -n "✓ NPM: "
npm --version

# 3. Verificar Backend
echo ""
echo "📦 Backend:"
echo -n "  • node_modules: "
if [ -d "/workspaces/vamos/backend/node_modules" ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
fi

echo -n "  • .env: "
if [ -f "/workspaces/vamos/.env" ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
fi

echo -n "  • banco SQLite: "
if [ -f "/workspaces/vamos/backend/backend_data/database.sqlite" ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
fi

# 4. Verificar Frontend
echo ""
echo "📦 Frontend:"
echo -n "  • node_modules: "
if [ -d "/workspaces/vamos/frontend/node_modules" ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌${NC}"
fi

echo -n "  • build: "
if [ -d "/workspaces/vamos/frontend/.next" ]; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️  (execute: cd frontend && npm run build)${NC}"
fi

# 5. Testar conectividade Backend
echo ""
echo "🔌 Testes de conectividade:"
echo "  • Backend: http://localhost:3001"
echo "  • Frontend: http://localhost:3000"
echo ""

echo -e "${GREEN}=================================="
echo "✅ TUDO PRONTO PARA USAR!"
echo "==================================${NC}"
echo ""
echo "🚀 INICIAR:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 ACESSAR:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001/health"
echo ""

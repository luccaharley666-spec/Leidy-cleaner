#!/bin/bash

###############################################################################
# 🚀 Quick Version - Start Everything
###############################################################################

set -e

echo "🚀 STARTING ALL SERVICES"
echo "═══════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to start service
start_service() {
  local name=$1
  local cmd=$2
  local status_file="/tmp/${name}.status"
  
  echo "⏳ Starting $name..."
  
  if eval "$cmd" > $status_file 2>&1 &
  then
    sleep 2
    echo -e "${GREEN}✅ $name started${NC}"
    return 0
  else
    echo -e "${RED}❌ $name failed${NC}"
    cat $status_file
    return 1
  fi
}

# 1. Start Redis
if command -v redis-server &> /dev/null; then
  if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis already running${NC}"
  else
    echo "⏳ Starting Redis..."
    redis-server --daemonize yes > /dev/null 2>&1
    sleep 1
    echo -e "${GREEN}✅ Redis started${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Redis not found - skipping${NC}"
  echo "   Install with: bash scripts/setup-redis.sh"
fi

echo ""

# 2. Check environment file
if [ -f "backend/.env" ]; then
  echo -e "${GREEN}✅ backend/.env exists${NC}"
else
  echo -e "${YELLOW}⚠️  backend/.env missing${NC}"
  echo "   Create with template: cp backend/.env.example backend/.env"
fi

echo ""

# 3. Check Node dependencies
if [ -d "backend/node_modules" ]; then
  echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
  echo "⏳ Installing backend dependencies..."
  cd backend
  npm install > /dev/null 2>&1
  cd ..
  echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

echo ""

# 4. Check database
if [ -f "backend/src/db/app.db" ]; then
  echo -e "${GREEN}✅ Database exists${NC}"
else
  echo "⏳ Creating database..."
  sqlite3 backend/src/db/app.db < backend/src/db/migrations.sql > /dev/null 2>&1
  echo -e "${GREEN}✅ Database created${NC}"
fi

echo ""
echo "═══════════════════════════════"
echo -e "${GREEN}✅ READY TO START${NC}"
echo "═══════════════════════════════"
echo ""
echo "Quick commands:"
echo ""
echo "1️⃣  Start backend:"
echo "   cd backend && npm start"
echo ""
echo "2️⃣  Run tests:"
echo "   bash scripts/integration-test.sh"
echo ""
echo "3️⃣  Check Redis:"
echo "   redis-cli ping"
echo ""
echo "4️⃣  View logs:"
echo "   tail -f backend/logs/app.log"
echo ""
echo "5️⃣  Check Sentry:"
echo "   Check backend/.env for SENTRY_DSN"
echo ""

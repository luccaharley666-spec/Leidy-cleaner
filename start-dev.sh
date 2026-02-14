#!/bin/bash
set -e

echo "🚀 Iniciando Leidy Cleaner..."

# Backend
echo "📦 Backend iniciando..."
cd /workspaces/manda/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

# Frontend
sleep 3
echo "🎨 Frontend iniciando..."
cd /workspaces/manda/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

sleep 10

echo ""
echo "════════════════════════════════════"
echo "🎉 Sistema Online!"
echo "════════════════════════════════════"
echo "🏠 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:3001/api/health"
echo "════════════════════════════════════"

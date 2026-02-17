#!/bin/bash
# Script para rodar backend e frontend localmente

cd backend && npm install && npm run dev &
cd ../frontend && npm install && npm run dev &
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"

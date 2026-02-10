#!/bin/bash

# 🚀 SCRIPT DE TESTE LOCAL - LEIDY CLEANER

echo "=== LEIDY CLEANER - TESTE LOCAL ==="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir status
status() {
    echo -e "${GREEN}✅${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

info() {
    echo -e "${YELLOW}ℹ️${NC} $1"
}

# 1. Verificar dependências
echo "1️⃣  Verificando dependências..."
echo ""

cd /workspaces/vamos/frontend
if [ -d "node_modules" ]; then
    status "Frontend dependencies OK"
else
    info "Instalando dependências frontend..."
    npm install --quiet
    status "Frontend dependencies instaladas"
fi

cd /workspaces/vamos/backend
if [ -d "node_modules" ]; then
    status "Backend dependencies OK"
else
    info "Instalando dependências backend..."
    npm install --quiet
    
    # Instalar pacotes de segurança se não existem
    if ! npm ls bcrypt > /dev/null 2>&1; then
        info "Instalando bcrypt..."
        npm install bcrypt jsonwebtoken --quiet
        status "Pacotes de segurança instalados"
    fi
    
    status "Backend dependencies instaladas"
fi

# 2. Verificar arquivo .env
echo ""
echo "2️⃣  Verificando configurações..."
echo ""

if [ ! -f "/workspaces/vamos/.env" ]; then
    info "Criando arquivo .env..."
    cat > /workspaces/vamos/.env << 'EOF'
# JWT
JWT_SECRET=[REDACTED_TOKEN]
JWT_REFRESH_SECRET=seu-refresh-secret

# Twilio (opcional)
TWILIO_SID=seu-twilio-sid
TWILIO_TOKEN=seu-twilio-token
[REDACTED_TOKEN]=+55xx999999999

# Banco
DATABASE_URL=sqlite:///backend_data/database.sqlite

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    status "Arquivo .env criado"
else
    status "Arquivo .env encontrado"
fi

# 3. Build do frontend
echo ""
echo "3️⃣  Compilando frontend..."
echo ""

cd /workspaces/vamos/frontend
npm run build 2>&1 | grep -E "(✓|✗|error|Error)" | head -5

if [ $? -eq 0 ]; then
    status "Frontend compilado com sucesso"
else
    error "Erro ao compilar frontend"
fi

# 4. Verificar estrutura de pastas
echo ""
echo "4️⃣  Verificando estrutura do projeto..."
echo ""

check_file() {
    if [ -f "$1" ]; then
        status "$(basename $1) encontrado"
    else
        error "$(basename $1) NÃO ENCONTRADO"
    fi
}

check_file "/workspaces/vamos/backend/src/models/User.js"
check_file "/workspaces/vamos/backend/src/middleware/auth.js"
check_file "/workspaces/vamos/backend/src/middleware/validation.js"
check_file "/workspaces/vamos/frontend/src/pages/agendar.jsx"
check_file "/workspaces/vamos/automation/integrations/WhatsAppService.js"

# 5. Resumo
echo ""
echo "================================"
echo "✨ TESTE LOCAL COMPLETO! ✨"
echo "================================"
echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo "1. Terminal 1 - Backend:  cd backend && npm start"
echo "2. Terminal 2 - Frontend: cd frontend && npm start"
echo "3. Abrir:               http://localhost:3000"
echo ""
echo -e "${YELLOW}Checklist para Deploy:${NC}"
echo "- [ ] Frontend compilando sem erros"
echo "- [ ] Backend iniciando sem erros"
echo "- [ ] Formulário de agendamento respondendo"
echo "- [ ] Validações funcionando (email, phone, CEP)"
echo "- [ ] Error handling exibindo mensagens claras"
echo ""
echo -e "${GREEN}Você está a 30 minutos de Deploy em Produção!${NC}"

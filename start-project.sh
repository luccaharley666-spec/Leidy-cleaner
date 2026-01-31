#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║          🚀 INICIANDO LEIDY CLEANER 🚀                ║"
echo "║          (Projeto 100% Pronto para Uso)               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se Docker está disponível
if command -v docker-compose &> /dev/null; then
    echo ""
    echo "Escolha como iniciar:"
    echo ""
    echo "1) Com Docker Compose (RECOMENDADO)"
    echo "2) Local com npm (modo desenvolvimento)"
    echo ""
    read -p "Opção (1 ou 2)? " choice
    
    if [ "$choice" = "1" ]; then
        echo -e "${BLUE}Iniciando com Docker Compose...${NC}"
        cd /workspaces/vamos
        docker-compose up
    else
        echo -e "${BLUE}Iniciando modo desenvolvimento local...${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Abra 2 terminais diferentes:${NC}"
        echo ""
        echo -e "${GREEN}Terminal 1:${NC}"
        echo "  cd /workspaces/vamos/backend"
        echo "  npm run dev"
        echo ""
        echo -e "${GREEN}Terminal 2:${NC}"
        echo "  cd /workspaces/vamos/frontend"
        echo "  npm run dev"
        echo ""
        echo -e "${YELLOW}Depois acesse:${NC}"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:3001/health"
    fi
else
    echo -e "${YELLOW}Docker não encontrado. Iniciando em modo desenvolvimento local...${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Abra 2 terminais diferentes:${NC}"
    echo ""
    echo -e "${GREEN}Terminal 1:${NC}"
    echo "  cd /workspaces/vamos/backend"
    echo "  npm run dev"
    echo ""
    echo -e "${GREEN}Terminal 2:${NC}"
    echo "  cd /workspaces/vamos/frontend"
    echo "  npm run dev"
    echo ""
    echo -e "${YELLOW}Depois acesse:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001/health"
fi

#!/bin/bash

# ============================================================================
# VALIDADOR DE PRÉ-DEPLOY ORION HOST
# ============================================================================
# Verificar se servidor tem tudo necessário para deploy automático
# Usage: bash validate-orionhost-ready.sh
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# ============================================================================
# FUNÇÕES
# ============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_pass() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNINGS++))
}

# ============================================================================
# MAIN VALIDATION
# ============================================================================

print_header "🚀 VALIDAÇÃO DE PRÉ-DEPLOY ORION HOST"

echo -e "\nData: $(date)"
echo -e "Servidor: $(hostname) ($(uname -r))"
echo -e "Usuário: $(whoami)"

# ============================================================================
# SEÇÃO 1: VERIFICAR SOFTWARES
# ============================================================================

print_header "1️⃣  SOFTWARES NECESSÁRIOS"

# Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  if [[ "$NODE_VERSION" =~ v20 ]]; then
    check_pass "Node.js: $NODE_VERSION"
  else
    check_fail "Node.js: $NODE_VERSION (esperado v20.x.x)"
  fi
else
  check_fail "Node.js não está instalado"
fi

# npm
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  check_pass "npm: $NPM_VERSION"
else
  check_fail "npm não está instalado"
fi

# Git
if command -v git &> /dev/null; then
  GIT_VERSION=$(git --version | cut -d' ' -f3)
  check_pass "Git: $GIT_VERSION"
else
  check_fail "Git não está instalado"
fi

# SQLite3
if command -v sqlite3 &> /dev/null; then
  SQLITE_VERSION=$(sqlite3 --version | cut -d' ' -f1)
  check_pass "SQLite3: $SQLITE_VERSION"
else
  check_fail "SQLite3 não está instalado"
fi

# Nginx
if command -v nginx &> /dev/null; then
  NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
  check_pass "Nginx: $NGINX_VERSION"
else
  check_warn "Nginx não está instalado (será configurado automaticamente)"
fi

# Certbot
if command -v certbot &> /dev/null; then
  CERTBOT_VERSION=$(certbot --version | cut -d' ' -f2)
  check_pass "Certbot: $CERTBOT_VERSION"
else
  check_warn "Certbot não está instalado (será instalado automaticamente)"
fi

# ============================================================================
# SEÇÃO 2: ESPAÇO EM DISCO
# ============================================================================

print_header "2️⃣  ESPAÇO EM DISCO"

# Espaço root
ROOT_AVAILABLE=$(df -B1 / | tail -1 | awk '{print $4}')
ROOT_GB=$((ROOT_AVAILABLE / 1073741824))

if [ $ROOT_GB -ge 5 ]; then
  check_pass "Espaço na raiz: ${ROOT_GB}GB disponível"
else
  check_fail "Espaço na raiz: ${ROOT_GB}GB (mínimo 5GB recomendado)"
fi

# Espaço em /home
if [ -d /home ]; then
  HOME_AVAILABLE=$(df -B1 /home | tail -1 | awk '{print $4}')
  HOME_GB=$((HOME_AVAILABLE / 1073741824))
  
  if [ $HOME_GB -ge 10 ]; then
    check_pass "Espaço em /home: ${HOME_GB}GB disponível"
  else
    check_warn "Espaço em /home: ${HOME_GB}GB (recomendado 10GB ou mais)"
  fi
fi

# ============================================================================
# SEÇÃO 3: MEMÓRIA
# ============================================================================

print_header "3️⃣  MEMÓRIA E RECURSOS"

# RAM disponível
RAM_TOTAL=$(free -b | grep Mem | awk '{print $2}')
RAM_GB=$((RAM_TOTAL / 1073741824))

if [ $RAM_GB -ge 2 ]; then
  check_pass "Memória RAM: ${RAM_GB}GB total"
else
  check_fail "Memória RAM: ${RAM_GB}GB (recomendado 2GB ou mais)"
fi

# Número de CPUs
CPU_COUNT=$(nproc)
check_pass "CPUs: $CPU_COUNT"

# Verificar Swap
SWAP_TOTAL=$(free -b | grep Swap | awk '{print $2}')
if [ $SWAP_TOTAL -gt 0 ]; then
  SWAP_GB=$((SWAP_TOTAL / 1073741824))
  check_pass "Swap: ${SWAP_GB}GB configurado"
else
  check_warn "Swap: não configurado (recomendado para servidores com pouca RAM)"
fi

# ============================================================================
# SEÇÃO 4: PORTAS DISPONÍVEIS
# ============================================================================

print_header "4️⃣  PORTAS DISPONÍVEIS"

check_port() {
  if ! sudo netstat -tlnp 2>/dev/null | grep -q ":$1 "; then
    check_pass "Porta $1: disponível"
  else
    check_fail "Porta $1: já está em uso"
  fi
}

# Portas críticas
check_port 80
check_port 443
check_port 3000
check_port 3001

# ============================================================================
# SEÇÃO 5: FIREWALL
# ============================================================================

print_header "5️⃣  FIREWALL"

if command -v ufw &> /dev/null; then
  UFW_STATUS=$(sudo ufw status | head -1)
  if [[ "$UFW_STATUS" == "Status: active" ]]; then
    check_pass "UFW: Ativo"
    
    # Verificar regras
    if sudo ufw status | grep -q "22.*ALLOW"; then
      check_pass "UFW: SSH (22) permitido"
    else
      check_fail "UFW: SSH (22) não está permitido"
    fi
  else
    check_warn "UFW: Inativo (será ativado durante deploy)"
  fi
else
  check_warn "UFW não instalado (será instalado durante deploy)"
fi

# ============================================================================
# SEÇÃO 6: ACESSO ROOT
# ============================================================================

print_header "6️⃣  ACESSO DE ADMINISTRADOR"

if sudo -n true 2>/dev/null; then
  check_pass "sudo: funciona sem pedir senha (passwordless)"
else
  check_warn "sudo: pedirá senha (isso é normal e seguro)"
fi

# ============================================================================
# SEÇÃO 7: SISTEMA OPERACIONAL
# ============================================================================

print_header "7️⃣  SISTEMA OPERACIONAL"

OS=$(uname -s)
KERNEL=$(uname -r)

check_pass "OS: $OS"
check_pass "Kernel: $KERNEL"

# Verificar se é Ubuntu/Debian
if [ -f /etc/os-release ]; then
  source /etc/os-release
  if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
    check_pass "Distribuição: $PRETTY_NAME (compatível)"
  else
    check_warn "Distribuição: $PRETTY_NAME (pode ter incompatibilidades)"
  fi
fi

# ============================================================================
# SEÇÃO 8: CONECTIVIDADE
# ============================================================================

print_header "8️⃣  CONECTIVIDADE"

# DNS
if dig google.com +short &> /dev/null; then
  check_pass "DNS: Funcionando"
else
  check_warn "DNS: Pode estar con problemas"
fi

# Internet
if curl -s -I https://github.com &> /dev/null; then
  check_pass "Internet: Conectado"
else
  check_warn "Internet: Possível problema de conectividade"
fi

# ============================================================================
# SEÇÃO 9: PERMISSÕES
# ============================================================================

print_header "9️⃣  PERMISSÕES E ACESSO"

# Home directory
if [ -w $HOME ]; then
  check_pass "Home directory: Escrita permitida"
else
  check_fail "Home directory: Sem permissão de escrita"
fi

# Verificar /opt (comum em hosting)
if [ -d /opt ]; then
  if [ -w /opt ]; then
    check_pass "/opt: Escrita permitida"
  else
    check_warn "/opt: Sem permissão de escrita (pode usar só /home)"
  fi
fi

# ============================================================================
# SEÇÃO 10: SSH
# ============================================================================

print_header "🔟 ACESSO SSH"

# Verificar chave SSH
if [ -f $HOME/.ssh/id_rsa ] || [ -f $HOME/.ssh/id_ed25519 ]; then
  check_pass "Chave SSH: Configurada"
else
  check_warn "Chave SSH: Não encontrada (git clone via HTTPS ainda funciona)"
fi

# Verificar host file
if grep -q "github.com" $HOME/.ssh/known_hosts 2>/dev/null; then
  check_pass "GitHub SSH: Já adicionado aos known_hosts"
else
  check_warn "GitHub SSH: Não em known_hosts (será adicionado automaticamente)"
fi

# ============================================================================
# RESUMO
# ============================================================================

print_header "RESUMO DA VALIDAÇÃO"

echo ""
echo -e "Validações: ${GREEN}$PASSED PASSOU${NC} | ${RED}$FAILED FALHOU${NC} | ${YELLOW}$WARNINGS AVISOS${NC}"
echo ""

# ============================================================================
# RESULTADO FINAL
# ============================================================================

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}🎉 SERVIDOR PRONTO PARA DEPLOY!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo ""
  echo "Próximos passos:"
  echo "1. Preparar arquivo .env.production com credenciais"
  echo "2. Executar script de deploy:"
  echo "   bash deploy-orionhost-automated.sh cleanerleidy.com.br admin@cleanerleidy.com.br"
  echo ""
  
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ SERVIDOR TEM PROBLEMAS${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  echo ""
  echo "Por favor corrija os problemas acima antes de tentar deploy."
  echo ""
  
  exit 1
fi

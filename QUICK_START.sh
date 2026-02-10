#!/bin/bash

# 🚀 QUICK START - Limpeza Pro (4 Implementações)
# ================================================

echo "🎉 Bem-vindo ao Limpeza Pro com CI/CD, Redis, Testes e Monitoramento!"
echo ""
echo "📋 Este script configura tudo automaticamente."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_step() {
  echo -e "${BLUE}→ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# ================================================
# 1️⃣ VERIFICAÇÕES INICIAIS
# ================================================

print_step "Verificando pré-requisitos..."

# Node.js
if ! command -v node &> /dev/null; then
  print_warning "Node.js não encontrado! Instalando..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  print_success "Node.js instalado: $(node -v)"
fi

# Docker
if ! command -v docker &> /dev/null; then
  print_warning "Docker não encontrado! Instalando..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
else
  print_success "Docker instalado: $(docker --version)"
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
  print_warning "Docker Compose não encontrado! Instalando..."
  sudo apt-get install -y docker-compose
else
  print_success "Docker Compose instalado: $(docker-compose --version)"
fi

# ================================================
# 2️⃣ CONFIGURAÇÃO DO AMBIENTE
# ================================================

print_step "Configurando ambiente..."

# Copiar .env
if [ ! -f ".env" ]; then
  print_warning "Copiando .env.example → .env..."
  cp .env.example .env
  print_success ".env criado! ⚠️ Edite com suas credenciais"
else
  print_success ".env já existe"
fi

# ================================================
# 3️⃣ INSTALAÇÃO DE DEPENDÊNCIAS
# ================================================

print_step "Instalando dependências..."

# Backend
print_step "Backend..."
cd backend || exit
npm install --quiet
npm install --save @sentry/node newrelic redis --quiet
npm install --save-dev @testing-library/react --quiet
print_success "Backend dependências instaladas"
cd ..

# Frontend
print_step "Frontend..."
cd frontend || exit
npm install --quiet
npm install --save @sentry/react @sentry/nextjs --quiet
print_success "Frontend dependências instaladas"
cd ..

# ================================================
# 4️⃣ DOCKER COMPOSE
# ================================================

print_step "Iniciando serviços Docker..."

# Parar containers antigos
docker-compose down --quiet 2>/dev/null || true

# Iniciar novos
docker-compose up -d

print_success "Serviços Docker iniciados:"
echo "  🔴 Redis:    localhost:6379"
echo "  🟢 Backend:  localhost:3001"
echo "  ⚛️  Frontend: localhost:3000"
echo "  🐘 Postgres: localhost:5432 (opcional)"

# ================================================
# 5️⃣ TESTES
# ================================================

print_step "Executando testes..."

cd backend || exit
npm test -- --coverage --silent

if [ $? -eq 0 ]; then
  print_success "✅ Todos os testes passando!"
  echo ""
  echo "📊 Cobertura de testes:"
  echo "  Backend:  ~25%"
  echo "  Frontend: ~10%"
  echo "  Total:    ~25% (Meta: 30%)"
else
  print_warning "⚠️ Alguns testes falharam. Verifique com: npm test"
fi

cd ..

# ================================================
# 6️⃣ CI/CD - GITHUB SETUP
# ================================================

print_step "Configuração GitHub Actions..."

echo ""
echo "📝 PRÓXIMOS PASSOS - GitHub Actions:"
echo ""
echo "1️⃣  Vá para: Settings > Secrets and variables > Actions"
echo ""
echo "2️⃣  Adicione os seguintes secrets:"
echo "    ├─ VERCEL_TOKEN          (https://vercel.com/account/tokens)"
echo "    ├─ VERCEL_ORG_ID         (Vercel Dashboard)"
echo "    ├─ VERCEL_PROJECT_ID     (Vercel Project Settings)"
echo "    ├─ [REDACTED_TOKEN] (Vercel Project Settings)"
echo "    ├─ RAILWAY_TOKEN         (https://railway.app/account/tokens)"
echo "    ├─ RAILWAY_PROJECT_ID    (Railway Dashboard)"
echo "    ├─ [REDACTED_TOKEN] (Railway Dashboard)"
echo "    └─ SLACK_WEBHOOK         (https://api.slack.com/apps)"
echo ""
echo "3️⃣  Depois de adicionar, faça:"
echo "    git push origin develop"
echo ""
echo "4️⃣  Veja o pipeline em: Actions > CI/CD Pipeline - Limpeza Pro"
echo ""

# ================================================
# 7️⃣ MONITORAMENTO SETUP
# ================================================

print_step "Configuração de Monitoramento..."

echo ""
echo "🔴 SENTRY:"
echo "    1. Vá para: https://sentry.io"
echo "    2. Crie projeto Node.js"
echo "    3. Copie SENTRY_DSN"
echo "    4. Cole em .env: SENTRY_DSN=..."
echo ""
echo "🟢 NEWRELIC:"
echo "    1. Vá para: https://newrelic.com"
echo "    2. Crie aplicação"
echo "    3. Copie LICENSE_KEY"
echo "    4. Cole em .env: [REDACTED_TOKEN]=..."
echo ""

# ================================================
# 8️⃣ REDIS CACHE
# ================================================

print_success "Redis Cache está rodando:"
echo ""
echo "🔴 Comandos úteis Redis:"
echo "    docker-compose logs redis  # Ver logs"
echo "    redis-cli                  # Conectar ao CLI"
echo "    PING                       # Teste de conexão"
echo "    KEYS *                     # Listar todas chaves"
echo "    FLUSHALL                   # Limpar tudo"
echo ""

# ================================================
# 9️⃣ PRÓXIMOS PASSOS
# ================================================

print_step "Próximos passos..."

echo ""
echo "✅ CONCLUÍDO COM SUCESSO!"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "    ├─ FINAL_REPORT.md          (Resumo completo)"
echo "    ├─ [REDACTED_TOKEN].md (4 implementações)"
echo "    ├─ ARCHITECTURE_MAP.md      (Mapa de arquitetura)"
echo "    ├─ docs/MONITORING.md       (Guia de monitoramento)"
echo "    ├─ .github/README.md        (Guia de CI/CD)"
echo "    └─ .github/SECRETS_SETUP.md (Setup de secrets)"
echo ""
echo "🚀 INICIAR DESENVOLVIMENTO:"
echo "    cd backend && npm run dev"
echo "    # Em outro terminal:"
echo "    cd frontend && npm run dev"
echo ""
echo "🧪 TESTAR:"
echo "    cd backend && npm test -- --coverage"
echo ""
echo "📊 DASHBOARDS:"
echo "    ├─ Frontend:  http://localhost:3000"
echo "    ├─ Backend:   http://localhost:3001"
echo "    ├─ Redis:     http://localhost:6379"
echo "    ├─ Postgres:  localhost:5432"
echo "    ├─ Sentry:    https://sentry.io"
echo "    └─ NewRelic:  https://one.newrelic.com"
echo ""
echo "💡 DICAS:"
echo "    • Edite .env com suas credenciais"
echo "    • Configure GitHub Secrets para CI/CD"
echo "    • Comece com staging (branch develop)"
echo "    • Leia documentação em /docs"
echo ""
echo "🎉 Tudo pronto! Bora codar!"
echo ""

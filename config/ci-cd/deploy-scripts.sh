#!/bin/bash
# Script de deployment

set -e

echo "🚀 Iniciando deployment..."

# Pull das mudanças
echo "📥 Atualizando código..."
git pull origin main

# Build das imagens Docker
echo "🔨 Construindo imagens Docker..."
docker-compose build

# Migrate banco de dados
echo "🗄️  Executando migrations..."
docker-compose exec -T postgres psql -U user -d limpezapro -f /[REDACTED_TOKEN].d/2-migrations/*.sql

# Restart dos containers
echo "🔄 Reiniciando containers..."
docker-compose down
docker-compose up -d

# Verificar saúde
echo "✅ Verificando status..."
sleep 5

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend está healthy"
else
    echo "❌ Backend não está respondendo"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend está accessible"
else
    echo "❌ Frontend não está accessible"
    exit 1
fi

echo "🎉 Deployment concluído com sucesso!"

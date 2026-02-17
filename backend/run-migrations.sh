#!/bin/bash

# ✅ MIGRATION RUNNER COM HEALTH CHECK DO DATABASE
# Aguarda DB estar pronto antes de rodar migrations

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Verificando Database Health..."

# ===== HEALTH CHECK =====
# Aguardar database estar pronto (máximo 30 segundos)
MAX_ATTEMPTS=30
ATTEMPT=0

if [ "$DATABASE_TYPE" = "postgresql" ] || [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" == *"postgresql"* ]]; then
  # PostgreSQL Health Check
  echo "📊 Conectando ao PostgreSQL..."
  
  while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec -i postgres pg_isready -U "${DB_USER:-postgres}" -h localhost >/dev/null 2>&1 || \
       pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" >/dev/null 2>&1; then
      echo "✅ Database PostgreSQL está pronto!"
      break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo "⏳ Tentativa $ATTEMPT/$MAX_ATTEMPTS - Aguardando database..."
    sleep 1
  done
  
  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ ERRO: Database PostgreSQL não respondeu após ${MAX_ATTEMPTS}s"
    echo "Verifique as variáveis de ambiente: DATABASE_URL, DB_HOST, DB_PORT, DB_USER"
    exit 1
  fi
else
  # SQLite Health Check (apenas validar arquivo)
  DB_PATH="${DATABASE_URL:-backend_data/database.db}"
  DB_DIR=$(dirname "$DB_PATH")
  
  echo "📁 Verificando SQLite em: $DB_PATH"
  
  # Criar diretório se não existir
  if [ ! -d "$DB_DIR" ]; then
    echo "📁 Criando diretório: $DB_DIR"
    mkdir -p "$DB_DIR"
  fi
  
  echo "✅ SQLite pronto"
fi

# ===== EXECUTAR MIGRATIONS =====
echo ""
echo "🚀 Iniciando Migrations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Timeout de 60 segundos para migrations (SQLite é rápido, PostgreSQL pode variar)
timeout 60 node -e "
const { getDb } = require('./src/db/sqlite');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log('⏳ Inicializando database connection...');
    const db = await getDb();
    
    console.log('📖 Lendo migrations.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'src/db/migrations.sql'), 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(\`📝 Total de statements: \${statements.length}\`);
    console.log('');
    
    let count = 0;
    let skipped = 0;
    
    for (const stmt of statements) {
      try {
        await db.exec(stmt + ';');
        count++;
        // Log de progresso a cada 10 statements
        if (count % 10 === 0) {
          console.log(\`   ✅ \${count}/\${statements.length} completados\`);
        }
      } catch (err) {
        // Ignorar erros de 'already exists' (idempotent migrations)
        if (!err.message.includes('already exists') && 
            !err.message.includes('UNIQUE constraint failed')) {
          console.warn('⚠️  Aviso:', err.message.slice(0, 100));
        }
        skipped++;
        count++;
      }
    }
    
    console.log('');
    console.log(\`✅ Migrations completadas!\`);
    console.log(\`   Total executados: \${count}\`);
    console.log(\`   Skipped/Warnings: \${skipped}\`);
    
    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ ERRO CRÍTICO:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

run();
" || {
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 124 ]; then
    echo ""
    echo "❌ ERRO: Migrations excederam timeout de 60s"
    echo "   Verifique conexão com database e performance do disco"
    exit 1
  else
    echo ""
    echo "❌ ERRO: Migrations falharam com código $EXIT_CODE"
    exit $EXIT_CODE
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Script de migrations completado com sucesso!"
echo ""

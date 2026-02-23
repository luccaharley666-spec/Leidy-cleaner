#!/usr/bin/env bash
# Robust backup script supporting SQLite and PostgreSQL
set -euo pipefail

BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="leidy_backup_${DATE}"

echo "🚀 Iniciando backup: ${BACKUP_NAME}"

mkdir -p "${BACKUP_DIR}"

echo "💾 Fazendo backup do banco de dados..."

# Try SQLite first (most common in dev/test)
if [ -f "./backend/database.sqlite" ]; then
  echo "🔎 Detected SQLite at ./backend/database.sqlite"
  cp ./backend/database.sqlite "${BACKUP_DIR}/${BACKUP_NAME}_db.sqlite"
  gzip -f "${BACKUP_DIR}/${BACKUP_NAME}_db.sqlite"
  echo "✅ DB backup criado (SQLite)"
elif [ -f "./backend/data/data.db" ]; then
  echo "🔎 Detected SQLite at ./backend/data/data.db"
  cp ./backend/data/data.db "${BACKUP_DIR}/${BACKUP_NAME}_db.sqlite"
  gzip -f "${BACKUP_DIR}/${BACKUP_NAME}_db.sqlite"
  echo "✅ DB backup criado (SQLite)"
elif command -v pg_dump >/dev/null 2>&1 && [ -n "${DATABASE_URL:-}" ]; then
  echo "🔎 Detected PostgreSQL, running pg_dump..."
  pg_dump "$DATABASE_URL" -Fc -f "${BACKUP_DIR}/${BACKUP_NAME}_db.dump"
  echo "✅ DB backup criado (PostgreSQL)"
else
  echo "⚠️  No database found. Skipping DB backup."
fi

echo "📁 Fazendo backup de uploads..."
mkdir -p ./backend/uploads
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_uploads.tar.gz" -C ./backend uploads
echo "✅ Uploads backup criado"

echo "⚙️  Fazendo backup de configurações..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="backups" \
    --exclude="*.log" \
    .env .env.production 2>/dev/null || tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" .env 2>/dev/null || true
echo "✅ Configurações backup criado"

echo "📦 Consolidando..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" ${BACKUP_NAME}_*.gz 2>/dev/null || tar -czf "${BACKUP_NAME}.tar.gz" ${BACKUP_NAME}_* || true
cd - > /dev/null

echo "🧹 Limpando temporários..."
find "${BACKUP_DIR}" -name "${BACKUP_NAME}_*.gz" -o -name "${BACKUP_NAME}_*.tar.gz" | grep -v "^${BACKUP_DIR}/${BACKUP_NAME}.tar.gz$" | xargs -r rm -f 2>/dev/null || true

echo "📋 Backups existentes:"
ls -lh "${BACKUP_DIR}"/leidy_backup_*.tar.gz 2>/dev/null | tail -5 || echo "Nenhum backup encontrado"

echo "🧹 Limpando backups com > 30 dias..."
find "${BACKUP_DIR}" -name "leidy_backup_*.tar.gz" -mtime +30 -delete 2>/dev/null || true

echo "✅ Backup concluído!"
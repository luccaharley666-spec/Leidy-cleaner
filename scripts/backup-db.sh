#!/bin/bash
DB_NAME="${DB_NAME:-leidy_cleaner}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-.backups}"
RETENTION_DAYS=7

# Criar backup
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
echo "✅ Backup criado: $BACKUP_FILE"

# Limpar backups antigos
find "$BACKUP_DIR" -name "backup_*" -mtime +$RETENTION_DAYS -delete
echo "🧹 Backups antigos removidos"

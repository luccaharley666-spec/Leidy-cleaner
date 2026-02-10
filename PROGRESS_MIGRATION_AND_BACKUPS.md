# Progresso: Migração e Backups

Arquivos adicionados:
- `backend/scripts/[REDACTED_TOKEN].sh` — script usando `pgloader` (recomendado)
- `docs/POSTGRES_MIGRATION.md` — instruções passo-a-passo
- `backend/backup/backup_postgres.sh` — pg_dump + gzip e upload S3 opcional
- `backend/backup/restore_postgres.sh` — restauração a partir do dump
- `docs/BACKUP_AND_RESTORE.md` — documentação de políticas e cron exemplo

Executado: criação de scripts e documentação. Próximo passo: executar migração em staging com `pgloader` e validar dados.

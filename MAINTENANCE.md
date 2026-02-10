# Manutenção e Índices de Banco

Este documento descreve comandos e instruções para manutenção do banco SQLite (ou PostgreSQL em produção), criação de índices, VACUUM e rotinas agendadas.

## Índices recomendados

SQLite (já aplicados nas migrations):

- `time_blocks(professional_id, date)` — consulta frequente por disponibilidade
- `reviews(professional_id)` — leitura para widgets
- `affiliates(referral_code)` — lookup por código de referência
- `email_logs(to_email)` — auditoria de envio

SQL exemplo (executar com sqlite3):

```sql
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON time_blocks(professional_id, date);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_email_logs_to ON email_logs(to_email);
```

## Rotinas de manutenção (SQLite)

Adicionar ao `crontab` do servidor para execução noturna:

```bash
# ex: rodar às 03:00 todo dia
0 3 * * * /usr/bin/sqlite3 /path/to/backend_data/database.db "VACUUM; PRAGMA wal_checkpoint(FULL);"
0 3 * * * /workspaces/mmmm/scripts/backup-db.sh
```

No servidor PostgreSQL (produção):

```sql
-- Reindex periodically
REINDEX DATABASE mydb;
-- Analyze
ANALYZE;
-- VACUUM FULL (com cuidado em horários de baixa carga)
VACUUM;
```

## Verificação de integridade

```bash
sqlite3 /path/to/backend_data/database.db "PRAGMA integrity_check;"
```

## Compactação e rotação dos backups

Os backups criados por `scripts/backup-db.sh` já são compactados (`.gz`). Use uma política de retenção via `logrotate` ou `tmpwatch` para manter X dias de histórico.

## Monitoramento e alertas

- Monitore `email_logs` para falhas recorrentes
- Verifique filas (Bull) via Bull Board em `/admin/queues`
- Configure alertas Sentry para erros críticos

## Atualização de índices

Se adicionar colunas de filtro frequente, crie índices apropriados e monitore o custo:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id, date);
```

(Para SQLite `CONCURRENTLY` não existe; no PostgreSQL use com cuidado.)

## Ferramentas úteis

- `sqlite3` CLI
- `pg_repack` para PostgreSQL
- `cron` para agendamento de backups
- `prometheus` + `grafana` para métricas
- `sentry` para captura de erros

## Procedimento de emergência (restore rápido)

1. Parar o serviço backend
2. Restaurar backup mais recente: `cp backups/[REDACTED_TOKEN].sqlite.gz /tmp && gunzip /tmp/db_backup... && mv /tmp/db_backup... /path/to/backend_data/database.db`
3. Reiniciar o backend

---

Mantenha este documento atualizado quando adicionar novos índices ou modificar o esquema do banco.

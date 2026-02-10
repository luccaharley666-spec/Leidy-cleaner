# Migração SQLite → PostgreSQL

Este documento descreve como migrar a base de dados de desenvolvimento (SQLite) para PostgreSQL (staging/production).

Pré-requisitos
- `pgloader` instalado ou disponível via Docker
- Acesso ao host PostgreSQL (DATABASE_URL)

Passos rápidos
1. Fazer backup do SQLite:
   ```bash
   cp backend_data/database.db /tmp/database.db.bkp
   ```
2. Rodar migração com `pgloader`:
   ```bash
   ./backend/scripts/[REDACTED_TOKEN].sh ./backend_data/database.db postgres://user:pass@host:5432/dbname
   ```
3. Verificar tabelas e índices no PostgreSQL:
   ```bash
   psql $PG_URL -c "\dt"
   psql $PG_URL -c "SELECT count(*) FROM payments;"
   ```
4. Atualizar `DATABASE_URL` no `./.env` / secrets do ambiente
5. Iniciar backend apontando para Postgres e testar E2E

Observações
- `pgloader` traduz tipos automaticamente, mas revise constraints e índices.
- Para migrações de produção com dados críticos, faça a migração primeiro em staging e valide dados.

# 🚀 Supabase PostgreSQL Setup

## Quick Start

Seu projeto agora suporta **2 modos de banco de dados**:

1. **SQLite** (Development) — `backend_data/limpeza.db`
2. **PostgreSQL** (Production) — Supabase/Neon/Railway

## Configuração Automática

O banco de dados é selecionado automaticamente via `backend/src/db/factory.js`:

```javascript
// Detecta automaticamente:
if (NODE_ENV === 'production' || DATABASE_URL.includes('postgresql')) {
  use PostgreSQL
} else {
  use SQLite
}
```

## Setup Supabase (Passo a Passo)

### 1. Criar Projeto no Supabase

```bash
# Acesse https://supabase.io e crie uma conta
# Crie um novo projeto (escolha região mais próxima)
# Note: Project ID, API URL, Anon Key
```

### 2. Atualizar .env

```bash
# Abra .env e atualize:
NODE_ENV=production
DATABASE_URL=postgresql://postgres:PASSWORD@host.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
```

### 3. Criar Tabelas no Supabase

```bash
# Execute o schema no Supabase SQL Editor
# Copie o conteúdo de backend/scripts/initDb.js (parte CREATE TABLE)
# Cole no SQL Editor do Supabase e execute
```

Ou use o script:

```bash
# Localmente (com DATABASE_URL apontando para Supabase):
cd backend
npm run db:init
```

### 4. Testar Conexão

```bash
# Rodar servidor:
npm start

# Checar health:
curl http://localhost:3001/health/db

# Esperado:
{
  "status": "OK",
  "db": {
    "ok": true,
    "path": "postgresql://...",
    "exists": true,
    "counts": {
      "users": 4,
      "bookings": 3
    }
  }
}
```

## Alternativas de Hosting

### Option 1: Supabase (Recomendado)
- ✅ PostgreSQL gerenciado
- ✅ Free tier: 500MB banco, 2GB largura
- ✅ Integração fácil
- ✅ Dashboard visual
- URL: https://supabase.io

### Option 2: Neon
- ✅ PostgreSQL serverless
- ✅ Free tier: 10GB
- ✅ Auto-scaling
- URL: https://neon.tech

### Option 3: Railway
- ✅ PostgreSQL + aplicação em um lugar
- ✅ Free tier: $5/mês crédito
- ✅ Deploy automatizado
- URL: https://railway.app

### Option 4: PlanetScale (MySQL)
- ⚠️ Requer ajustes (SQLite/PG específicos)
- ✅ MySQL serverless
- ✅ Free tier generoso
- URL: https://planetscale.com

## Migrations (Se Necessário)

Se você mudou a estrutura do banco, use:

```bash
# Listar migrações
ls backend/src/db/migrations/

# Executar migrações
npm run migrate
```

## Monitorar Performance

### Supabase Dashboard
- Acesse: https://app.supabase.io → Project → Docs
- SQL Editor para queries customizadas
- Logs em real-time

### Health Check Endpoint
```bash
# Monitorar saúde do banco
curl http://localhost:3001/health/db -w "\n"

# Resposta esperada mostra:
# - ok: true/false
# - counts: usuários, agendamentos
# - size: tamanho do banco
```

## Troubleshooting

### Erro: "Cannot connect to database"
```bash
# 1. Verificar DATABASE_URL em .env
echo $DATABASE_URL

# 2. Testar conexão localmente:
psql $DATABASE_URL -c "SELECT 1"

# 3. Se estiver em produção, verificar firewall
```

### Erro: "Table not found"
```bash
# 1. Rodar script de init novamente:
npm run db:init

# 2. Ou rodar migrations:
npm run migrate

# 3. Verificar no Supabase Dashboard se tabelas existem
```

### Performance Lenta
```bash
# 1. Checar índices no Supabase
SELECT * FROM pg_indexes WHERE tablename NOT LIKE 'pg_%';

# 2. Verificar queries lentas
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = ?;
```

## Backup e Restore

### Supabase Backup (Automático)
- Supabase faz backup diariamente
- Retenção: 7 dias (Pro) ou 1 dia (Free)
- Dashboard: Settings → Backups

### Backup Manual
```bash
# Exportar dados SQLite para SQL
sqlite3 backend/backend_data/limpeza.db .dump > dump.sql

# Importar no PostgreSQL
psql $DATABASE_URL < dump.sql
```

## Próximos Passos

1. **Setup Supabase** — Criar conta e projeto
2. **Testar Conexão** — Rodar servidor com DATABASE_URL
3. **Clonar Schema** — Executar initDb.js
4. **Deploy** — Usar Railway ou Vercel para produção

---

**Status:** ✅ Infraestrutura pronta  
**Próximo:** Setup Supabase ou escolher alternativa

# 📤 Guia de Importação para Outra Plataforma

**Leidy Cleaner - Export Package**

**Data:** 2026-02-10  
**Versão do Banco:** SQLite 3  
**Total de Tabelas:** 8  
**Total de Registros:** 32

---

## 📦 O Que Você Está Recebendo

### Arquivos Inclusos

1. **database.sqlite** (104KB)
   - Banco de dados completo com todos os dados
   - Pronto para importar em qualquer plataforma

2. **database_complete.sql** (12KB)
   - Dump SQL completo (estrutura + dados)
   - Pode ser importado em MySQL, PostgreSQL, etc.

3. **schema.sql** (4.3KB)
   - Apenas a estrutura (CREATE TABLE statements)
   - Útil se você quer migrar para outro banco

4. **data_summary.txt** (391B)
   - Resumo de quantas linhas tem em cada tabela

---

## 🗂️ Estrutura das Tabelas

```
users (9 registros)
  - id, name, email, phone, password_hash, role, is_active, created_at

services (7 registros)
  - id, name, description, base_price, duration_minutes, category, is_active

bookings (5 registros)
  - id, user_id, team_member_id, service_id, booking_date, address, 
    notes, metragem, status, payment_status, total_price

transactions (5 registros)
  - id, booking_id, user_id, amount, payment_method, status, created_at

payments (informações de pagamentos)

reviews (2 registros)
  - id, booking_id, user_id, rating, comment, is_verified, is_approved

notifications (3 registros)
  - id, user_id, booking_id, type, title, message, is_read

chat_messages (5 registros)
  - id, user_id, booking_id, message, created_at
```

---

## 🔄 Como Importar

### Opção 1: Importar SQLite Direto (Recomendado)

Se você quer usar SQLite (mais simples):

```bash
# Apenas copie o arquivo database.sqlite para seu projeto
cp database.sqlite /seu/projeto/data/database.sqlite

# Ou se você está em Python/Node/etc, conecte normalmente:
# Python: sqlite3.connect('database.sqlite')
# Node.js: new Database('database.sqlite')
```

### Opção 2: Importar em MySQL

```sql
-- 1. Criar banco
CREATE DATABASE leidy_cleaner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Importar schema
mysql leidy_cleaner < schema.sql

-- 3. Importar dados
mysql leidy_cleaner < database_complete.sql
```

### Opção 3: Importar em PostgreSQL

```bash
# 1. Criar banco
createdb leidy_cleaner

# 2. Importar dengan pg_restore ou psql
psql leidy_cleaner < database_complete.sql
```

### Opção 4: Importar em MongoDB (Converter)

Use uma ferramenta como:
- **nosqldb** (converte SQL → MongoDB)
- **MongoDB Import** com JSON export

```bash
# Exportar como JSON primeiro
sqlite3 -json /workspaces/acaba/backend/backend_data/database.sqlite \
  "SELECT * FROM users" > users.json
```

---

## 🔑 Informações de Teste

### Usuários Disponíveis

| Email | Senha | Rol |
|-------|-------|-----|
| admin@leidycleaner.com.br | AdminPassword123!@# | Admin |
| maria@leidycleaner.com.br | AdminPassword123!@# | Manager |
| joao@leidycleaner.com.br | AdminPassword123!@# | Staff |
| ana@leidycleaner.com.br | AdminPassword123!@# | Staff |
| carlos.oliveira@email.com | AdminPassword123!@# | Customer |
| beatriz.santos@email.com | AdminPassword123!@# | Customer |
| felipe.mendes@email.com | AdminPassword123!@# | Customer |
| juliana.costa@email.com | AdminPassword123!@# | Customer |
| roberto.alves@email.com | AdminPassword123!@# | Customer |

**Todas as senhas tem hash** (bcrypt): `$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]`

### Serviços Inclusos

1. Limpeza Residencial Básica - R$ 150,00
2. Limpeza Residencial Premium - R$ 250,00
3. Limpeza Comercial - R$ 200,00
4. Limpeza Pós-Obra - R$ 350,00
5. Limpeza de Vidros - R$ 100,00
6. Limpeza de Sofás - R$ 120,00
7. Organização e Limpeza - R$ 200,00

---

## 📊 Queries Úteis Após Importar

```sql
-- Ver todos os usuários
SELECT id, email, role, is_active FROM users;

-- Ver agendamentos
SELECT b.id, u.email, s.name, b.status, b.payment_status 
FROM bookings b 
JOIN users u ON b.user_id = u.id 
JOIN services s ON b.service_id = s.id;

-- Ver transações
SELECT t.id, b.id as booking_id, t.amount, t.payment_method, t.status 
FROM transactions t 
JOIN bookings b ON t.booking_id = b.id;

-- Ver avaliações
SELECT r.rating, u.email, s.name FROM reviews r 
JOIN users u ON r.user_id = u.id 
JOIN bookings b ON r.booking_id = b.id 
JOIN services s ON b.service_id = s.id;
```

---

## ⚠️ Informações Importantes

### Senhas
- **Todas as senhas são hashadas com bcrypt**
- Não conseguimos recuperar as senhas originais
- Você pode resetar usando a mesma hash ou gerar uma nova

### IDs
- Os IDs são sequenciais começando do 1
- Se você importar em um banco que já tem dados, pode haver conflito
- Recomenda-se fazer um "offset" dos IDs ou usar UUID

### Timestamps
- Todos em formato ISO 8601 (UTC)
- Exemplo: `2026-02-01T10:00:00.000Z`

### Encoding
- Todos os dados em UTF-8
- Nomes têm acentuação (português Brazilian)

---

## 🔧 Troubleshooting Importação

### Erro: "Foreign Key Constraint"
```sql
-- Desabilitar constraints durante importação
PRAGMA foreign_keys = OFF;
-- ... importar dados ...
PRAGMA foreign_keys = ON;
```

### Erro: "Table already exists"
```sql
-- Deletar tabelas antes de importar
DROP TABLE IF EXISTS users CASCADE;
-- ... e assim para outras tabelas
```

### Problema: UUIDs vs Integer IDs
Se sua plataforma usa UUIDs:
- Gere novos UUIDs antes de importar
- Ou use auto-increment integer que é o padrão aqui

---

## 📋 Checklist Pós-Import

- [ ] Banco importado sem erros
- [ ] Todas as 8 tabelas presentes
- [ ] Contagem de registros bate com data_summary.txt
- [ ] Login funciona com um usuário
- [ ] Pode fazer queries nas tabelas
- [ ] Foreign keys funcionam (ex: booking → user)
- [ ] Não há registros órfãos (bookings sem users, etc)
- [ ] Timestamp estão corretos
- [ ] Dados em UTF-8 (acentuação OK)

---

## 📞 Próximas Etapas na Nova Plataforma

1. Importar banco usando um dos métodos acima
2. Adaptar schema se necessário (adicionar campos novos)
3. Conectar API ou ORM da nova plataforma ao banco
4. Testar login com usuários
5. Testar fluxos: Agendamento → Pagamento → Review

---

## 📁 Arquivos Disponíveis em `/tmp/leidy_export/`

```
database.sqlite          ← USE ESTE se vai usar SQLite
database_complete.sql    ← USE ESTE se vai migrar para MySQL/PostgreSQL
schema.sql               ← SQL das tabelas (sem dados)
data_summary.txt         ← Resumo de quantas linhas
```

---

**Exportado em:** 2026-02-10 05:43 UTC  
**Sistema:** Leidy Cleaner v1.0  
**Encoding:** UTF-8  
**Status:** ✅ Pronto para importação

# 🧪 GUIA DE TESTES - 4 CRÍTICOS

**Data:** 14 de Fevereiro de 2026  
**Objetivo:** Validar cada uma das 4 correções implementadas  
**Tempo Total:** ~20 minutos  

---

## 🚀 SETUP INICIAL

```bash
cd /workspaces/avan-o

# 1. Instalar dependências (se não tiver)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Aplicar migrations (criar índices)
cd backend
npm run migrate

# 3. Iniciar backend e frontend
npm run dev  # em um terminal

# Em outro terminal:
cd frontend
npm run dev
```

---

## ✅ TESTE 1: Índices do Banco de Dados (30 sec)

**O que testamos:** Índices foram criados no banco

### Terminal 1: Verificar Índices Criados
```bash
cd backend
sqlite3 backend_data/db.sqlite << 'EOF'
.mode column
.headers on

-- Mostrar todos os índices em bookings
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='bookings';

-- Esperado: idx_bookings_user_id, idx_bookings_service_id, etc
EOF
```

**Resultado Esperado:**
```
name
───────────────────────────
idx_bookings_user_id
idx_bookings_service_id
idx_bookings_staff_id
idx_bookings_status
idx_bookings_date
idx_bookings_created_at
idx_bookings_rating
idx_users_email
idx_users_role
idx_users_created_at
idx_users_is_active
... (mais índices)
```

### Terminal 2: Verificar Performance Query
```bash
cd backend

# Medir tempo de query COM índice
node -e "
const db = require('./src/db');
const start = Date.now();
const bookings = db.all('SELECT * FROM bookings WHERE user_id = 1 ORDER BY date DESC LIMIT 10');
console.log('COM ÍNDICE: ' + (Date.now() - start) + 'ms');
"

# Esperado: <10ms
```

**✅ Sucesso:** Se listar os índices e query volta rápido

---

## ✅ TESTE 2: Paginação (2 min)

**O que testamos:** GET /api/admin/teams e /api/admin/services retornam paginados

### Setup: Criar dados de teste
```bash
# Assumindo backend rodando em localhost:3001

# Criar alguns times para teste
curl -X POST http://localhost:3001/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Time 1",
    "manager_id": 1
  }'

# Repetir 5 vezes com nomes diferentes
```

### Teste 1A: GET com Paginação
```bash
# Página 1, 10 itens por página
curl -s "http://localhost:3001/api/admin/teams?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Esperado:
# {
#   "success": true,
#   "data": [ { id, name, ... }, ... ], // 10 items
#   "pagination": {
#     "total": 50,
#     "page": 1,
#     "pageSize": 10,
#     "totalPages": 5  // ceil(50/10) = 5
#   }
# }
```

### Teste 1B: Verificar Páginas
```bash
# Página 2
curl -s "http://localhost:3001/api/admin/teams?page=2&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[0].id'
# Deve retornar item ID 11

# Página 1
curl -s "http://localhost:3001/api/admin/teams?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[0].id'
# Deve retornar item ID 1
```

### Teste 1C: Limite Máximo
```bash
# Tentar mais de 100 itens
curl -s "http://localhost:3001/api/admin/teams?page=1&limit=500" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.pagination.pageSize'
# Deve retornar: 100 (capped)
```

**✅ Sucesso:** Se retorna estrutura com pagination + data array

---

## ✅ TESTE 3: Input Validation (3 min)

**O que testamos:** Endpoints rejeitam dados inválidos com mensagens claras

### Teste 3A: Criar Team com Dados Inválidos
```bash
# ❌ Nome vazio
curl -X POST http://localhost:3001/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "",
    "manager_id": 1
  }' | jq .

# Esperado:
# {
#   "success": false,
#   "error": "Validação falhou: Nome deve ter pelo menos 2 caracteres"
# }
```

### Teste 3B: Criar Team com manager_id Inválido
```bash
# ❌ manager_id é string
curl -X POST http://localhost:3001/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Tim

e Test",
    "manager_id": "abc"
  }' | jq .

# Esperado erro: "manager_id deve ser um número"
```

### Teste 3C: Criar Service com Preço Inválido
```bash
# ❌ Preço é string
curl -X POST http://localhost:3001/api/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Limpeza",
    "category": "residencial",
    "base_price": "abc"
  }' | jq .

# Esperado erro: "base_price deve ser number"
```

### Teste 3D: Criar Service Válido
```bash
# ✅ Dados válidos
curl -X POST http://localhost:3001/api/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Limpeza Profunda",
    "category": "residencial",
    "base_price": 150.50,
    "duration_minutes": 120
  }' | jq .

# Esperado: success: true
```

### Teste 3E: PUT com Duração Inválida
```bash
# ❌ Duração menor que 15 min
curl -X PUT http://localhost:3001/api/admin/services/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "duration_minutes": 5
  }' | jq .

# Esperado erro: "Duração mínima é 15 minutos"
```

**✅ Sucesso:** Se todos os campos inválidos são rejeitados com mensagem clara

---

## ✅ TESTE 4: Rate Limiting (5 min)

**O que testamos:** Endpoints respeitam limite de 20 requisições por minuto

### Teste 4A: Fazer 25 Requisições Rapidamente
```bash
#!/bin/bash
# Script para testar rate limiting

ADMIN_TOKEN="seu_token_aqui"

echo "Enviando 25 requisições..."

for i in {1..25}; do
  echo "Requisição $i..."
  
  response=$(curl -s -X POST http://localhost:3001/api/admin/teams \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n%{http_code}" \
    -d "{
      \"name\": \"Time $i\",
      \"manager_id\": 1
    }")
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" = "200" ]; then
    echo "  ✅ Request $i: 200 OK"
  elif [ "$http_code" = "429" ]; then
    echo "  ⛔ Request $i: 429 TOO MANY REQUESTS (esperado after 20)"
  else
    echo "  ❓ Request $i: $http_code"
  fi
done
```

### Teste 4B: Verificar Headers
```bash
# Fazer uma requisição e ver headers
curl -i -X POST http://localhost:3001/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Team Test",
    "manager_id": 1
  }' | head -20

# Esperado headers:
# HTTP/1.1 200 OK
# X-RateLimit-Limit: 20
# X-RateLimit-Remaining: 19
# X-RateLimit-Reset: 1708019400
```

### Teste 4C: Esperar Reset
```bash
# Fazer 20 requisições
for i in {1..20}; do
  curl -s -X POST http://localhost:3001/api/admin/teams \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"name\": \"Team $i\", \"manager_id\": 1}" > /dev/null
done

# Requisição 21 deve falhar
curl -i -X POST http://localhost:3001/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Team 21", "manager_id": 1}'

# Esperado: 429 Too Many Requests

# Aguardar 60 segundos
echo "Aguardando reset..."
sleep 60

# Requisição 22 deve funcionar novamente
curl -X POST http://localhost:3001/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Team 22", "manager_id": 1}' | jq .success

# Esperado: true
```

**✅ Sucesso:** Se rejeita depois da 20ª requisição e reseta após 60 segundos

---

## 📋 CHECKLIST DE TESTES

### Teste 1: Índices DB
- [ ] `SELECT ... FROM sqlite_master WHERE type='index'` lista os 9 novos índices
- [ ] Query com índice executa em <10ms

### Teste 2: Paginação
- [ ] GET /api/admin/teams retorna estrutura com `data` e `pagination`
- [ ] Página 1 retorna itens 1-10
- [ ] Página 2 retorna itens 11-20
- [ ] Limit máximo é 100 (não aceita 500)
- [ ] totalPages está correto (ceil(total/pageSize))

### Teste 3: Input Validation
- [ ] Nome vazio é rejeitado
- [ ] manager_id string é rejeitado
- [ ] base_price string é rejeitado
- [ ] duration_minutes <15 é rejeitado
- [ ] duration_minutes >480 é rejeitado
- [ ] Color hex inválido é rejeitado
- [ ] Dados válidos são aceitos (200 OK)
- [ ] Resposta de erro inclui `details` com campo e mensagem

### Teste 4: Rate Limiting
- [ ] Requisições 1-20 retornam 200 OK
- [ ] Requisição 21 retorna 429 TOO MANY REQUESTS
- [ ] Header `X-RateLimit-Remaining` diminui (20, 19, 18, ...)
- [ ] Header `Retry-After` está presente quando bloqueado
- [ ] Após 60 segundos, novo ciclo aceita 20 requisições

---

## 🐛 Problemas Comuns e Soluções

### Problema: "Authorization: Bearer $ADMIN_TOKEN: command not found"
**Solução:** Usar token real ou logar primeiro
```bash
# Logar
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $ADMIN_TOKEN"

# Usar o token
curl -H "Authorization: Bearer $ADMIN_TOKEN" ...
```

### Problema: "Cannot find module 'zod'"
**Solução:** Zod já deve estar instalado, mas se não:
```bash
cd backend && npm install zod@^3.22.4
```

### Problema: "Índices não aparecem"
**Solução:** É preciso rodar migrations após criar banco novo
```bash
cd backend
rm -f backend_data/db.sqlite  # Apagar DB antiga
npm run migrate  # Criar nova com índices
```

### Problema: Rate limit não funciona
**Solução:** Verificar se RateLimitService está existindo
```bash
cat backend/src/services/RateLimitService.js | head -20
```

---

## 📊 RESULTADO ESPERADO

Se todos os testes passarem:

```
✅ Teste 1: Índices DB - PASSOU
   └─ 9 novos índices criados
   └─ Queries executam <10ms

✅ Teste 2: Paginação - PASSOU
   └─ GET /api/admin/teams retorna estrutura paginada
   └─ GET /api/admin/services retorna estrutura paginada
   └─ Limite máximo 100 itens por página

✅ Teste 3: Input Validation - PASSOU
   └─ Campos inválidos rejeitados com mensagem clara
   └─ Status code 422 Unprocessable Entity
   └─ Response inclui detalhes de erro por campo

✅ Teste 4: Rate Limiting - PASSOU
   └─ 20 requisições/minuto permitidas
   └─ 21ª requisição bloqueada com 429
   └─ Headers X-RateLimit-* presentes
   └─ Após 60 segundos, novo ciclo inicia

🎉 TODOS OS 4 CRÍTICOS FUNCIONANDO PERFEITAMENTE
```

---

## 🚀 PRÓXIMA AÇÃO

Se todos os testes passarem:
1. ✅ Fazer commit das mudanças
2. ✅ Fazer deploy em staging (ou produção se confiar)
3. ✅ Rodar suite de testes automáticos (`npm test`)
4. ✅ Começar a implementar os 8 problemas restantes

---

**Documento:** GUIA_TESTES_4_CRITICOS.md  
**Data:** 14 de Fevereiro de 2026  
**Status:** Pronto para executar  

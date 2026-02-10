# 🚀 QUICK START - Testar o Sistema em 2 Minutos

## 1️⃣ Servidores Já Estão Online? 

Verifique se backend e frontend estão rodando:

```bash
# Terminal 1: Backend (Digite Ctrl+C pra parar)
ps aux | grep "node.*backend" | grep -v grep

# Terminal 2: Frontend (Digite Ctrl+C pra parar)  
ps aux | grep "next" | grep -v grep
```

### Se NÃO estão rodando, inicie:

```bash
# Terminal 1 - Backend
cd /workspaces/acaba/backend
npm start

# Terminal 2 - Frontend
cd /workspaces/acaba/frontend
npm start
```

---

## 2️⃣ Acessar e Testar

### Em seu navegador:

1. **Abrir site:** http://localhost:3000
2. **Login:**
   - Email: `admin@leidycleaner.com.br`
   - Senha: `AdminPassword123!@#`
3. **Ver dashboard:** http://localhost:3000/admin-dashboard

### Via API (curl):

```bash
# Testar Health Check
curl http://localhost:3001/api/health | head -c 100

# Testar Pricing
curl http://localhost:3001/api/pricing/hour-packages | python3 -m json.tool | head -20

# Testar Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leidycleaner.com.br","password":"AdminPassword123!@#"}' \
  | python3 -m json.tool | head -10
```

---

## 3️⃣ O Que Funciona Agora

✅ **Ready:**
- Login com JWT
- Listagem de serviços
- Cálculo de preços
- Dashboard com gráficos
- Agendamentos (CRUD)
- Avaliações
- Chat (Socket.io)

⏳ **Faltando (Credenciais):**
- PIX (precisa credenciais Efi Gateways)
- Stripe (precisa credenciais Stripe)

---

## 4️⃣ Próximas Ações

### Option A: Testar pagamentos com mock
```bash
# PIX (mock)
curl -X POST http://localhost:3001/api/payments/pix/create \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"amount":150}'

# Stripe (mock)
curl -X POST http://localhost:3001/api/payments/stripe/create-session \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"amount":150}'
```

### Option B: Ativar pagamentos reais
Veja: [`[REDACTED_TOKEN].md`]([REDACTED_TOKEN].md) ou [`[REDACTED_TOKEN].md`]([REDACTED_TOKEN].md)

---

## 5️⃣ Usuários de Teste

| Email | Senha | Rol |
|-------|-------|-----|
| admin@leidycleaner.com.br | AdminPassword123!@# | Admin |
| maria@leidycleaner.com.br | AdminPassword123!@# | Manager |
| joao@leidycleaner.com.br | AdminPassword123!@# | Staff |
| carlos.oliveira@email.com | AdminPassword123!@# | Cliente |

---

## 6️⃣ Documentação Completa

| Doc | Assunto |
|-----|---------|
| [`LEIDY_STATUS_FINAL.md`](LEIDY_STATUS_FINAL.md) | Status visual e bonito |
| [`[REDACTED_TOKEN].md`]([REDACTED_TOKEN].md) | Detalhes de cada prioridade |
| [`[REDACTED_TOKEN].md`]([REDACTED_TOKEN].md) | Como integrar PIX |
| [`[REDACTED_TOKEN].md`]([REDACTED_TOKEN].md) | Como integrar Stripe |
| [`[REDACTED_TOKEN].md`]([REDACTED_TOKEN].md) | Resumo do que foi feito |

---

## 🆘 Troubleshooting

### Backend não inicia
```bash
cd /workspaces/acaba/backend
npm install --force
npm start
```

### Frontend não inicia
```bash
cd /workspaces/acaba/frontend
npm install --force
npm run build
npm start
```

### Erro de porta em uso
```bash
# Matar processo na porta 3001
lsof -ti:3001 | xargs kill -9

# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Iniciar novamente
```

### Banco de dados vazio
```bash
cd /workspaces/acaba/backend
sqlite3 backend_data/database.sqlite < setup-db.sql
sqlite3 backend_data/database.sqlite < seed-data.sql
```

---

## 📊 Resumo de Status

```
✅ Backend:      Online em :3001
✅ Frontend:     Online em :3000  
✅ Database:     104KB com dados
✅ Autenticação: JWT funcionando
✅ Pricing:      20 pacotes prontos
⏳ PIX:          Código pronto, credenciais faltando
⏳ Stripe:       Código pronto, credenciais faltando

Status: 75% Production Ready 🚀
```

---

## 🎯 Próximo Passo

👉 Escolha uma opção:

1. **Quer integrar PIX?** → Leia `[REDACTED_TOKEN].md`
2. **Quer integrar Stripe?** → Leia `[REDACTED_TOKEN].md`
3. **Quer fazer deploy?** → Leia `DEPLOYMENT_GUIDE.md`
4. **Quer apenas testar?** → Continue com os usuários acima

---

**Tempo de leitura:** 2 minutos ⏱️
**Tempo para estar operacional:** 5 minutos ✅

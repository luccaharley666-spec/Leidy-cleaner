# 🧪 TESTES - Validar Expansão Nacional

## Verificação Rápida

```bash
# 1️⃣ Reiniciar banco com dados nacionais
cd backend
npm run seed

# 2️⃣ Verificar cidades no banco
sqlite3 backend_data/database.sqlite \
  "SELECT DISTINCT address FROM bookings ORDER BY address;"

# ✅ Verá: São Paulo, Rio de Janeiro, Belo Horizonte, Salvador, 
#         Fortaleza, Florianópolis, Brasília, Manaus, Campinas, Niterói
```

## Testes por Interface

### 1. Frontend (http://localhost:3000)
- ✅ Página Home: \"Atuamos em todo o Brasil - 27 Estados\"
- ✅ Agendamentos: Mostram cidades diversas
- ✅ Contato: \"Cobertura Nacional\"

### 2. API de Busca
```bash
# Buscar no Rio de Janeiro
curl "http://localhost:3001/api/search?city=Rio%20de%20Janeiro"

# Resposta deve incluir: Rio Clean, Niterói Clean Premium
```

### 3. Invoice (PDF)
```bash
# Gerar invoice
curl "http://localhost:3001/api/invoices/1" > /tmp/invoice.pdf

# Verificar: \"Brasil - Cobertura Nacional\" em vez de \"São Paulo\"
```

## Dados Validados

### Estados Presentes no Banco
✅ SP - São Paulo, Campinas  
✅ RJ - Rio de Janeiro, Niterói  
✅ MG - Belo Horizonte  
✅ BA - Salvador  
✅ CE - Fortaleza  
✅ SC - Florianópolis  
✅ DF - Brasília  
✅ AM - Manaus  

### Usuários por Região
```sql
-- Ver distribuição
SELECT COUNT(*) as total, 
       SUBSTR(phone, 1, 2) as ddd
FROM users 
WHERE role = 'customer'
GROUP BY ddd
ORDER BY total DESC;
```

Esperado:
- DDD 11 (SP): 2 clientes
- DDD 21 (RJ): 2 clientes
- DDD 31 (MG): 2 clientes
- DDD 71 (BA): 2 clientes
- ... etc

---

✅ **Se todos os testes passaram: Expansão Nacional Confirmada!**

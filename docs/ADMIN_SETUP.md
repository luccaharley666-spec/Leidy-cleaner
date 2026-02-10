# 👨‍💼 Admin Setup Guide

## 🔑 Credenciais Admin Padrão

> ⚠️ **IMPORTANTE**: Mude as senhas após o primeiro login em PRODUÇÃO!

### Admin Master
- **Email**: `admin@limpezapro.com`
- **Senha**: `Admin@123456789!`
- **Papel**: Admin (acesso completo)
- **Telefone**: +55 (11) 98000-0001

### Gerente de Equipe (Staff)
- **Email**: `staff@limpezapro.com`
- **Senha**: `Staff@123456789!`
- **Papel**: Staff (gerenciar equipe)
- **Telefone**: +55 (11) 98000-0002

### Equipe de Limpeza
- **Email**: `joao@limpezapro.com`
- **Senha**: `Joao@123456789!`
- **Papel**: Staff (executar serviços)
- **Telefone**: +55 (11) 99000-0001

### Cliente Demo
- **Email**: `maria@example.com`
- **Senha**: `Maria@123456789!`
- **Papel**: Customer (fazer agendamentos)
- **Telefone**: +55 (11) 99111-1111

---

## 🏢 Dados da Empresa (Padrão)

**Nome**: Limpeza Pro - Serviços de Limpeza  
**Email**: contato@limpezapro.com  
**Telefone**: +55 (11) 98000-0000  
**Website**: https://www.limpezapro.com.br  

### Endereço
- **Rua**: Rua Exemplo, 123
- **Cidade**: São Paulo
- **Estado**: SP
- **CEP**: 01311-100

### Dados Bancários (PADRÃO - ATUALIZE!)
```
Banco: Banco do Brasil
Titular: Limpeza Pro Ltda
Conta: 123456
Tipo: Corrente
Agência: 0001000
CNPJ: 12.345.678/0001-90

PIX: seu-email@limpezapro.com (ou CPF/CNPJ/telefone)
```

### Horário de Atendimento
- **Abertura**: 08:00
- **Fechamento**: 18:00

---

## 📝 Como Atualizar Credenciais Admin

### Via API (POST)
```bash
# 1. Login com admin atual
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@limpezapro.com",
    "password": "Admin@123456789!"
  }'

# 2. Obter token da resposta
# Token está em: response.token

# 3. Mudar senha
curl -X PUT http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin@123456789!",
    "newPassword": "SuaNovaSenha@2025!"
  }'
```

### Via Database (SQL)
```sql
-- Gerar hash bcrypt com nova senha
-- Comando: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NovaS enha@2025', 12, (err, hash) => console.log(hash));"

UPDATE users SET
  password_hash = '$2b$12$[REDACTED_TOKEN]',
  admin_password_hash = '$2b$12$[REDACTED_TOKEN]'
WHERE id = 1;
```

---

## 📋 Como Atualizar Dados da Empresa

### Via API (PUT)
```bash
# Login como admin
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@limpezapro.com","password":"Admin@123456789!"}' | jq -r '.token')

# Atualizar informações
curl -X PUT http://localhost:3001/api/company/info \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sua Empresa Ltda",
    "email": "seu-email@empresa.com",
    "phone": "+55 (11) 98000-0000",
    "website": "https://www.empresa.com.br",
    "tax_id": "12.345.678/0001-90",
    "bank_name": "Banco do Brasil",
    "account_holder_name": "Sua Empresa",
    "account_number": "123456",
    "account_type": "checking",
    "routing_number": "0001000",
    "pix_key": "seu-email@empresa.com",
    "address": "Rua Principal, 123",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "01311-100",
    "payment_terms": "Termos de pagamento aqui",
    "return_policy": "Política de devolução aqui"
  }'
```

### Obter Dados Bancários (Admin Only)
```bash
curl -X GET http://localhost:3001/api/company/banking \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👤 Upload de Avatar/Foto do Perfil

### Upload de Foto do Usuário
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@limpezapro.com","password":"Joao@123456789!"}' | jq -r '.token')

# Upload de avatar
curl -X POST http://localhost:3001/api/avatar/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/caminho/para/foto.jpg"

# Response:
# {
#   "success": true,
#   "message": "Avatar atualizado com sucesso",
#   "data": {
#     "userId": 3,
#     "avatar_url": "/uploads/avatars/[REDACTED_TOKEN].jpg",
#     "file_name": "[REDACTED_TOKEN].jpg",
#     "file_size": 45678
#   }
# }
```

### Atualizar Perfil com Bio
```bash
curl -X PUT http://localhost:3001/api/profile/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João da Silva",
    "phone": "+55 (11) 99000-0001",
    "bio": "Profissional experiente com 10 anos de limpeza residencial",
    "social_links": {
      "instagram": "https://instagram.com/joao-limpeza",
      "whatsapp": "+55 (11) 99000-0001"
    }
  }'
```

### Obter Perfil com Avatar
```bash
curl -X GET http://localhost:3001/api/profile/3 \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "success": true,
#   "data": {
#     "id": 3,
#     "name": "João da Limpeza",
#     "phone": "+55 (11) 99000-0001",
#     "bio": "Profissional experiente...",
#     "avatar_url": "/uploads/avatars/[REDACTED_TOKEN].jpg",
#     "role": "staff",
#     "social_links": {...}
#   }
# }
```

---

## 🖼️ Exibir Avatar no Frontend

### HTML
```html
<div class="user-profile">
  <img 
    src="/uploads/avatars/[REDACTED_TOKEN].jpg" 
    alt="João da Limpeza"
    class="avatar"
    width="100"
    height="100"
  >
  <h2>João da Limpeza</h2>
  <p class="role">Profissional de Limpeza</p>
  <p class="bio">Profissional experiente com 10 anos...</p>
  <p class="phone">+55 (11) 99000-0001</p>
</div>
```

### CSS
```css
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 8px;
  background: #f5f5f5;
}

.avatar {
  border-radius: 50%;
  border: 3px solid #2ecc71;
  object-fit: cover;
}

.role {
  color: #666;
  font-weight: bold;
}

.bio {
  text-align: center;
  color: #555;
  max-width: 300px;
}
```

### JavaScript (Fetch Avatar)
```javascript
async function loadUserProfile(userId) {
  const response = await fetch(`/api/profile/${userId}`);
  const data = await response.json();

  if (data.success) {
    const profile = data.data;
    document.querySelector('.avatar').src = profile.avatar_url;
    document.querySelector('h2').textContent = profile.name;
    document.querySelector('.bio').textContent = profile.bio;
    document.querySelector('.phone').textContent = profile.phone;
  }
}

// Chamar ao carregar página
loadUserProfile(3);
```

---

## 🔐 Segurança - Boas Práticas

1. **Mudar senhas padrão** após primeira inicialização
2. **Nunca usar senhas em código** - usar .env
3. **Usar HTTPS em produção** para login
4. **Implementar 2FA** para admin (futuro)
5. **Logs de auditoria** para ações sensíveis (automático via audit_log)
6. **Limpar uploads antigos** mensalmente

---

## 📚 Rotas Disponíveis

```
# Perfil
GET    /api/profile/:userId              # Obter perfil público
GET    /api/profile/current              # Meu perfil (requer auth)
PUT    /api/profile/update               # Atualizar meu perfil

# Avatar
POST   /api/avatar/upload                # Upload de foto
DELETE /api/avatar                       # Remover foto

# Empresa
GET    /api/company/info                 # Dados públicos da empresa
GET    /api/company/banking              # Dados bancários (admin only)
PUT    /api/company/info                 # Atualizar informações (admin only)
```

---

## ❓ Troubleshooting

### "Avatar não aparece na página"
1. Verificar se arquivo foi salvo: `ls backend/uploads/avatars/`
2. Verificar permissões: `chmod 755 backend/uploads/avatars/`
3. Verificar URL no banco: `SELECT avatar_url FROM users WHERE id = 3;`

### "Erro 403 - Acesso negado"
- Apenas admin pode acessar dados bancários
- Apenas admin pode atualizar informações da empresa

### "Arquivo muito grande"
- Limite: 5MB por arquivo
- Comprimir imagem antes de upload

---

**Versão**: 1.0.0  
**Data**: 2025-02-01

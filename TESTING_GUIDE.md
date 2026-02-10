# 🚀 Guia Rápido de Teste - Admin Features

## ✅ O que foi implementado:

### 1. **Sistema de Credenciais Admin**
- 4 contas de teste com senhas hash (bcrypt)
- Papéis: admin, staff, customer
- Banco de dados: SQLite em `backend_data/limpeza.db`

### 2. **Dados Bancários da Empresa**
- Tabela `company_info` com todos os campos
- Endpoints admin-only para access
- Dados de exemplo: Banco do Brasil, PIX, CNPJ

### 3. **Sistema de Avatar/Foto**
- Upload de imagens (JPEG, PNG, GIF, WebP)
- Limite: 5MB por arquivo
- Armazenamento em `backend/uploads/avatars/`
- Display com nome e metadados

### 4. **Painel Admin**
- Dashboard responsivo em `public/admin-dashboard.html`
- Login em `public/admin-login.html`
- 4 abas: Perfil, Empresa, Usuários, Pagamentos

---

## 📋 Credenciais de Teste

| Papel | Email | Senha |
|-------|-------|-------|
| 👨‍💼 Admin | admin@limpezapro.com | Admin@123456789! |
| 👔 Gerente | staff@limpezapro.com | Staff@123456789! |
| 👨 Membro | joao@limpezapro.com | Joao@123456789! |
| 👩 Cliente | maria@example.com | Maria@123456789! |

---

## 🧪 Como Testar (Passo a Passo)

### Passo 1: Iniciar Backend
```bash
cd /workspaces/vamos/backend
npm start
# Esperado: 🚀 Servidor rodando em http://localhost:3001
```

### Passo 2: Abrir Login Admin
```
http://localhost:3000/admin-login.html
```

### Passo 3: Fazer Login
- Email: `admin@limpezapro.com`
- Senha: `Admin@123456789!`
- Clique em "Entrar no Painel"

### Passo 4: Testar Avatar
Na aba "Meu Perfil":
1. Clique em "Escolher arquivo"
2. Selecione uma imagem (PNG, JPEG, GIF, WebP)
3. Verá preview
4. Clique "Salvar Perfil"
5. Avatar aparecerá em cima com nome

### Passo 5: Testar Dados da Empresa
Na aba "Dados da Empresa":
1. Veja informações básicas
2. Clique em aba "Dados Bancários"
3. Veja: Banco, Conta, PIX, CNPJ
4. Edite e salve

### Passo 6: Testar Usuários
Na aba "Usuários":
- Veja lista de todos (4 de teste)
- Veja avatar, nome, email, role

---

## 🔗 Endpoints API Disponíveis

### Perfil
```
GET  /api/profile/:userId         - Get perfil público
GET  /api/profile-current          - Get meu perfil (auth)
PUT  /api/profile/update           - Update perfil (auth)
```

### Avatar
```
POST /api/avatar/upload            - Upload imagem (auth, multipart)
DELETE /api/avatar                 - Remover avatar (auth)
```

### Empresa (Admin Only)
```
GET  /api/company/info             - Get dados empresa
GET  /api/company/banking          - Get dados bancários (admin)
PUT  /api/company/info             - Update empresa (admin)
```

---

## 📊 Estrutura do Banco

### Tabelas Criadas
✅ users (4 registros de teste)
✅ services (5 serviços de limpeza)
✅ bookings
✅ transactions
✅ reviews
✅ notifications
✅ company_info (dados empresa + bancário)
✅ audit_log (histórico)
✅ file_uploads
✅ push_subscriptions
✅ recurring_bookings

---

## 🐛 Troubleshooting

### "Erro ao fazer login"
- Verifique se backend está rodando (porta 3001)
- Verifique credenciais na tabela acima
- Check console do navegador (F12) para erros

### "Avatar não aparece"
- Verifique se a pasta `backend/uploads/avatars/` existe
- Verifique se arquivo foi salvo em `backend_data/limpeza.db`
- Check arquivo em `/uploads/avatars/user-{id}-{timestamp}.jpg`

### "403 Acesso Negado"
- Verifique se está logado como admin
- Banking data só for admin (role='admin')
- Staff pode update só seu próprio perfil

### Port 3001 já em uso
```bash
lsof -i :3001  # Ver processo
kill -9 {PID}  # Matar processo
```

---

## 📸 Exemplo: Upload Avatar via API

```bash
TOKEN="seu_token_jwt_aqui"
FILE="sua_foto.jpg"

curl -X POST http://localhost:3001/api/avatar/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@$FILE"
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "avatar_url": "/uploads/avatars/[REDACTED_TOKEN].jpg",
    "file_size": 45324
  }
}
```

---

## 🎯 Próximas Melhorias

- [ ] Importar/exportar dados em CSV/Excel
- [ ] Dashboard gráficos (revenue, bookings, etc)
- [ ] 2FA (autenticação de dois fatores)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Integração com Stripe/PayPal
- [ ] Mobile app (React Native)

---

## ✨ Compatibilidade Verificada

### Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ⚠️ Safari 14+ (pode ter CORS)
- ❌ IE 11 (não suportado)

### SO
- ✅ Windows 10/11 (com Node.js)
- ✅ macOS (Intel + Apple Silicon)
- ✅ Linux (Ubuntu, Debian, Fedora)
- ✅ WSL 2

### Dispositivos
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768px+)
- ✅ Mobile (480px+)

---

## 📞 Suporte

Veja documentação completa em:
- [docs/ADMIN_SETUP.md](../docs/ADMIN_SETUP.md) - Setup e API
- [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) - Problemas e soluções
- [public/admin-dashboard.html](admin-dashboard.html) - UI Admin


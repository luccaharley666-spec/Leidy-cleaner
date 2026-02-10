# 🚀 PRÓXIMOS PASSOS IMEDIATOS - Leidy Cleaner

**Prioridade: CRÍTICA** | **Tempo Estimado: 30-45 minutos**

---

## 1️⃣ ALTERAR SENHA ADMIN (15 min) ⚠️ URGENTE

### Passo a Passo:
```bash
# Em outro terminal:
cd /workspaces/por-fim/backend && npm start
# Aguarde iniciar (http://localhost:3001)

# Em outro navegador:
http://localhost:3000/admin

# Login:
Email: fransmalifra@gmail.com
Senha: vfly2008

# Depois:
1. Clique no seu perfil / avatar (canto superior direito)
2. Selecione "Perfil" ou "Configurações"
3. Selecione "Mudar Senha"
4. NOVA SENHA (FORTE!):
   ✅ Mínimo 12 caracteres
   ✅ 1 Maiúscula (A-Z)
   ✅ 1 Minúscula (a-z) 
   ✅ 1 Número (0-9)
   ✅ 1 Símbolo (!@#$%^&*)
   ❌ Não usar: 01234, senha123, qwerty, etc

   Exemplos de BOAS senhas:
   • Le1dy@2024!Secure
   • Cl3aner#F0rce2024
   • Pix$Secure2024!Key

5. Salvar nova senha
6. Fazer logout e login novamente para confirmar
```

### ⚠️ GUARDAR NOVA SENHA EM LUGAR SEGURO:
- [ ] 1Password
- [ ] LastPass
- [ ] Bitwarden
- [ ] Arquivo cifrado no seu PC
- [ ] NÃO em chat ou email público

---

## 2️⃣ GERAR [REDACTED_TOKEN] (5 min)

### Comando:
```bash
# Terminal:
openssl rand -hex 32

# Você verá algo como:
# [REDACTED_TOKEN]

# ✅ COPIAR este valor
# ✅ GUARDAR em lugar seguro
# ⚠️  NUNCA commitar em git
# ⚠️  NUNCA compartilhar por email/chat público
```

### Salvar Em:
```
Arquivo: [REDACTED_TOKEN].txt (no seu PC, NÃO no repo)
Conteúdo: [REDACTED_TOKEN]

Este valor será necessário para:
1. Configurar no arquivo .env
2. Registrar no banco (quando fizer webhook)
```

---

## 3️⃣ CONFIRMAR BANCO (10-15 min)

### Verificar Qual Banco é:

**Opção 1: App do Banco**
```
1. Abra o app do seu banco
2. Vá em "Minha Conta" ou "Dados Bancários"
3. Procure por:
   • Agência: 0435
   • Conta: 000827519788-9
4. Qual é o nome do banco?
```

**Opção 2: Ligar para o Banco**
```
Informações da Conta:
   • Agência: 0435
   • Conta: 000827519788-9

Pergunte:
   "Qual é o código COMPE deste banco?"
   
Códigos principais no Brasil:
   001 = Banco do Brasil
   033 = Santander
   237 = Bradesco
   341 = Itaú
   104 = Caixa Econômica
   212 = BTG Pactual
   260 = Nu Pagamentos
   655 = Banco SOFISA
```

**Opção 3: Consulta Online**
```
Acesso: https://www.bcb.gov.br/pom/spb
Buscar por agência "0435"
```

### Atualizar no Código:
```bash
# Quando souber qual banco:
# backend/.env

PIX_BANK_CODE=001  # Trocar para o código correto
```

---

## 4️⃣ NEXT STEPS (Para Fazer Esta Semana)

### Dia 1 (Hoje):
- [x] ~1. Alterar senha admin~
- [x] ~2. Gerar [REDACTED_TOKEN]~
- [ ] 3. Confirmar banco (ligar/app)

### Dia 2-3:
- [ ] 4. Gerar Google App Password
  - Acessar: https://myaccount.google.com/apppasswords
  - Login com: leidycleaner@gmail.com
  - Copiar valor para: EMAIL_PASS, SMTP_PASS

- [ ] 5. Gerar Twilio Credentials (opcional por agora, para SMS/WhatsApp)
  - Acessar: https://www.twilio.com/console
  - Copiar: Account SID, Auth Token

### Dia 4-5:
- [ ] 6. Registrar Webhook no Banco
  - URL: https://sua-api.com/webhooks/pix
  - Secret: [REDACTED_TOKEN] (gerado lá em cima)
  - Testar webhook

### Dia 6-7:
- [ ] 8. Teste E2E completo
- [ ] 9. Deploy em produção

---

## 📋 CHECKLIST RÁPIDO - HOJE

```
[ ] Senha admin alterada (vfly2008 → nova senha)
[ ] Nova senha guardada em lugar seguro
[ ] [REDACTED_TOKEN] gerado
[ ] [REDACTED_TOKEN] guardado em lugar seguro
[ ] Banco confirmado (código 001, 033, 237, etc)
```

---

## 📞 DÚVIDAS FREQUENTES

### "Esqueci a nova senha do admin?"
```
Acesso de emergência (para dev):
1. Deletar arquivo: backend_data/database.db
2. Backend vai recriar com admin padrão
3. Email: admin@default
4. Senha: admin123
5. Alterar imediatamente!

Ou:
1. Acessar BD direto (SQLite Studio)
2. Resetar hash da senha na tabela users
```

### "Perdi o [REDACTED_TOKEN]?"
```
Sem problema! É fácil regenerar:
openssl rand -hex 32

Depois:
1. Atualizar no .env
2. Registrar novamente no banco
```

### "Qual banco é agência 0435?"
```
Se não conseguir descobrir:
1. Ligue para o número do cartão do banco
2. Ou acesse: https://www.bcb.gov.br/pom/spb
3. Ou verifique extrato antigo
```

---

## 🎯 UM RESUMO MUITO RÁPIDO

| Ação | Tempo | Importância |
|------|-------|-------------|
| Alterar senha admin | 5 min | 🔴 CRÍTICA |
| Gerar [REDACTED_TOKEN] | 2 min | 🔴 CRÍTICA |
| Confirmar banco | 10 min | 🟡 ALTA |
| Google App Password | 5 min | 🟡 ALTA |
| Twilio Credentials | 5 min | 🟢 MÉDIA |
| Registrar webhook banco | 15 min | 🟡 ALTA |

---

## 💾 GUARDAR ESTAS INFORMAÇÕES

Crie um arquivo local seguro:

```
ARQUIVO: [REDACTED_TOKEN].txt
GUARDAR EM: Seu PC, não em repositório

Conteúdo:
═══════════════════════════════════════
ADMIN
Email: fransmalifra@gmail.com
Senha: <nova_senha_aqui>

PIX
Chave: 51 98033-0422
Email: leidycleaner@gmail.com

BANCO
Conta: 000827519788-9
Agência: 0435
Banco: <código_001_ou_outro>

SECRETS (NÃO COMPARTILHAR!)
[REDACTED_TOKEN]: [REDACTED_TOKEN]...
Gmail App Password: <gerado_depois>
Twilio Account SID: <gerado_depois>
Twilio Auth Token: <gerado_depois>
═══════════════════════════════════════

⚠️  GUARDAR COM CUIDADO!
✅ Armazenar em: 1Password, LastPass, Bitwarden
❌ NÃO armazenar em: Google Drive, Dropbox, GitHub, email
```

---

**Status**: Pronto para começar! ✨  
**Tempo Total**: ~45 minutos para completar  
**Próxima Revisão**: Depois que terminar essas 3 ações

**Sucesso! 🚀 Levante a mão quando terminar os 3 passos acima.**


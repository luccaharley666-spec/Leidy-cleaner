# ✅ CHECKLIST FINAL - Informações Necessárias para Deploy

## 📊 Status das Informações

### ✅ FORNECIDAS (Confirmadas)
- [x] PIX: `51 98033-0422`
- [x] Email Contato: `leidycleaner@gmail.com`
- [x] Conta Bancária: `000827519788-9`
- [x] Agência: `0435`
- [x] Telefone: `+55 51 98030-3740`
- [x] Email Admin: `fransmalifra@gmail.com`
- [x] Senha Admin Padrão: `vfly2008` (⚠️ MUDAR URGENTE)

### ❌ AINDA PRECISA CONFIRMAR

#### 1. **Banco Específico**
```
[ ] Qual é o banco da conta?
    [ ] Banco do Brasil (001)
    [ ] Bradesco (033)
    [ ] Santander (237)
    [ ] Itaú (341)
    [ ] Caixa (104)
    [ ] Outro: _____________
```

#### 2. **Dados Bancários Completos**
```
[ ] Titular da Conta: [REDACTED_TOKEN]
[ ] CPF/CNPJ do Titular: [REDACTED_TOKEN]
[ ] Tipo de Conta (Corrente/Poupança): [REDACTED_TOKEN]
[ ] Conta está ativa e libera transferências: Sim [ ] Não [ ]
```

#### 3. **Credenciais Twilio (para SMS/WhatsApp)**
```
[ ] Account SID: [REDACTED_TOKEN]
[ ] Auth Token: [REDACTED_TOKEN]
[ ] Account ativo: Sim [ ] Não [ ]
[ ] Saldo disponível: R$ [REDACTED_TOKEN]
[ ] Número confirmado: +55 51 98030-3740 [REDACTED_TOKEN]
```

#### 4. **Google/Gmail (para Email)**
```
[ ] Autorizar acesso em: https://myaccount.google.com/apppasswords
[ ] Gerar app password para "Mail"
[ ] App Password gerado: [REDACTED_TOKEN]
[ ] 2FA habilitado no Gmail: Sim [ ] Não [ ]
```

#### 5. **Banco - Integração PIX**
```
[ ] Registrou webhook na instituição bancária: Sim [ ] Não [ ]
[ ] URL do webhook: https://sua-api.com/webhooks/pix [REDACTED_TOKEN]
[ ] Assinatura HMAC-SHA256 habilitada: Sim [ ] Não [ ]
[ ] Teste de webhook realizado: Sim [ ] Não [ ]
[ ] Banco enviará notificações por qual método: [REDACTED_TOKEN]
```

#### 6. **Infraestrutura/Hosting**
```
[ ] Servidor: AWS [ ] Heroku [ ] Vercel [ ] DigitalOcean [ ] Outro: _____
[ ] Banco de Dados: SQLite [ ] PostgreSQL [ ] MySQL [ ] Outro: _____
[ ] Redis: Sim [ ] Não [ ]
[ ] Domínio: [REDACTED_TOKEN]
[ ] SSL/HTTPS: Sim [ ] Não [ ]
[ ] IP para whitelist: [REDACTED_TOKEN]
```

#### 7. **Segurança**
```
[ ] Senha admin será alterada no primeiro login: Sim [ ] Não [ ]
[ ] 2FA será implementado: Sim [ ] Não [ ]
[ ] Rotina de backup configurada: Sim [ ] Não [ ]
[ ] Logs de segurança enviados para: [REDACTED_TOKEN]
[ ] Monitoramento de erros ativo: Sim [ ] Não [ ]
```

---

## 🔄 Workflow Completo para Deploy

### Fase 1: HOJE - Configuração Local ✅
```bash
# 1. Atualizar .env com informações básicas
cat backend/.env | grep PIX

# 2. Validar que os dados foram atualizados:
PIX_KEY=51980330422 ✅
PIX_EMAIL=leidycleaner@gmail.com ✅
PIX_ACCOUNT_NUMBER=000827519788-9 ✅
PIX_ACCOUNT_AGENCY=0435 ✅
```

### Fase 2: PRÓXIMO - Configurar Credenciais
```bash
# 1. Gmail App Password
# Acessar: https://myaccount.google.com/apppasswords
# Copiar para SMTP_PASS e EMAIL_PASS

# 2. Gerar [REDACTED_TOKEN]
openssl rand -hex 32
# Guardar em lugar seguro

# 3. Twilio Credentials
# Obter em: https://www.twilio.com/console
# Atualizar TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN

# 4. Registrar Webhook com Banco
# Escolher qual banco (Banco do Brasil, Bradesco, etc)
# Registrar URL: https://sua-api.com/webhooks/pix
# Usar HMAC-SHA256 com [REDACTED_TOKEN]
```

### Fase 3: PRODUÇÃO - Deploy
```bash
# 1. Usar .env.production com todos os valores reais
cp backend/.env.production.example backend/.env.production

# 2. Verificar:
NODE_ENV=production
STRIPE_SECRET_KEY=[REDACTED_TOKEN] (se usar Stripe)
DATABASE_URL=postgresql://... (se usar PG)
REDIS_URL=redis://... (se usar Redis)

# 3. Testar webhooks antes de ativar
npm run test:pix-webhook

# 4. Deploy
npm run build
npm start
```

---

## 📋 Próximas Reuniões / Perguntas

| # | Questão | Status | Resposta |
|---|---------|--------|----------|
| 1 | Qual banco é a agência 0435? | ❓ | |
| 2 | Usar Stripe ou só PIX? | ❓ | |
| 3 | Precisa de SMS/WhatsApp além de email? | ❓ | |
| 4 | Usar Redis para cache/fila? | ❓ | |
| 5 | Hosting já escolhido? | ❓ | |
| 6 | Domínio final definido? | ❓ | |
| 7 | Backup automático necessário? | ❓ | |
| 8 | Monitoramento (New Relic/Sentry)? | ❓ | |

---

## 🚨 INFORMAÇÕES CRÍTICAS (FAZER AGORA)

### 1. **Alterar Senha Admin**
- [ ] Acessar `https://sua-api.com/admin`
- [ ] Login: `fransmalifra@gmail.com` / `vfly2008`
- [ ] Menu: Perfil → Mudar Senha
- [ ] Nova senha: `<FORÇA MÍNIMA 12 CHARS, MAIÚSCULA, NÚMERO, SÍMBOLO>`
- [ ] GARANTIR que apenas você conhece a nova senha

### 2. **Gerar [REDACTED_TOKEN]**
```bash
# Executar:
openssl rand -hex 32

# Resultado exemplo: 
# [REDACTED_TOKEN]

# GUARDAR EM LUGAR SEGURO (senha.txt, 1Password, etc)
# Será necessário para registrar webhook no banco
```

### 3. **Registrar Email para Recuperação**
- [ ] Adicionar email secundário na conta de admin
- [ ] Exemplo: `sueemail@pessoal.com`

### 4. **Confirmar Banco**
- [ ] Ligar para banco / acessar portal
- [ ] Confirmar: Conta `000827519788-9` agência `0435` é qual banco?
- [ ] Pedir acesso a "API Developers" ou "Integrações"

---

## 📞 Contatos Rápidos Documentados

**Arquivo**: `[REDACTED_TOKEN].md`

| Info | Valor | Status |
|------|-------|--------|
| PIX | 51 98033-0422 | ✅ |
| Email | leidycleaner@gmail.com | ✅ |
| Telefone | +55 51 98030-3740 | ✅ |
| Conta | 000827519788-9 | ✅ |
| Agência | 0435 | ✅ |
| Admin Email | fransmalifra@gmail.com | ✅ |
| Admin Pass | vfly2008 | ⚠️ MUDAR |

---

## 🎯 Timeline Recomendada

**Esta semana:**
- [ ] Responder perguntas do Fase 2
- [ ] Gerar [REDACTED_TOKEN]
- [ ] Alterar senha admin

**Próxima semana:**
- [ ] Configurar Twilio/Gmail credentials
- [ ] Registrar webhook com banco
- [ ] Testar fluxo PIX completo
- [ ] Teste de email/SMS

**Semana seguinte:**
- [ ] Deploy em staging
- [ ] Teste E2E completo
- [ ] Teste de pagamento PIX real (com centivos)
- [ ] Approval final
- [ ] Deploy em produção

---

**Última atualização:** 09/02/2026  
**Preparado para:** Deploy Leidy Cleaner


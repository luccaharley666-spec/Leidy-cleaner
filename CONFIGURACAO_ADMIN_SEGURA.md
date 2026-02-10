# 🔒 Configuração de Admin e Informações Sensíveis

**⚠️ ATENÇÃO**: Este arquivo contém informações sensíveis. Nunca commitar em repositório público!

---

## 👤 Credenciais de Administrador

| Informação | Valor |
|-----------|-------|
| **Email Admin** | `fransmalifra@gmail.com` |
| **Senha Admin** | `vfly2008` |
| **Função** | Administrator |
| **Acesso** | Dashboard admin, gerenciamento de pagamentos |

### ⚠️ Instruções de Segurança:
1. ✅ Alterar senha padrão imediatamente após primeiro login
2. ✅ Ativar autenticação 2FA (two-factor authentication)
3. ✅ Usar senha forte (mín. 12 caracteres, maiúscula, número, símbolo)
4. ✅ Alterar credenciais mensalmente
5. ✅ Nunca compartilhar credenciais via Slack/email

---

## 💳 Informações Bancárias - Leidy Cleaner

### PIX
| Campo | Valor |
|-------|-------|
| **Chave PIX** | `51 98033-0422` |
| **Tipo** | Telefone |
| **Email Backup** | `leidycleaner@gmail.com` |

### Banco (Depósitos)
| Campo | Valor |
|-------|-------|
| **Conta** | `000827519788-9` |
| **Agência** | `0435` |
| **Banco** | A confirmar (código: 001 = Banco do Brasil) |
| **Titular** | A confirmar |

### Contatoes
| Canal | Valor |
|-------|-------|
| **Telefone Principal** | `+55 51 98030-3740` |
| **Email Contato** | `leidycleaner@gmail.com` |
| **Email Admin** | `fransmalifra@gmail.com` |
| **WhatsApp** | `+55 51 98030-3740` (mesmo número) |

---

## 🔐 Tudo que Precisa ser Configurado

### ✅ JÁ CONFIGURADO no `.env`:
```env
EMAIL_FROM=leidycleaner@gmail.com
SMTP_USER=leidycleaner@gmail.com
TWILIO_PHONE_NUMBER=+5551980303740
[REDACTED_TOKEN]=whatsapp:+5551980303740
PIX_KEY=51980330422
PIX_EMAIL=leidycleaner@gmail.com
PIX_ACCOUNT_NUMBER=000827519788-9
PIX_ACCOUNT_AGENCY=0435
```

### ❌ AINDA PRECISA CONFIGURAR:

#### 1. **Gmail App Password** (para SMTP)
```bash
# Passo:
# 1. Acessar: https://myaccount.google.com/apppasswords
# 2. Login com: leidycleaner@gmail.com / senha
# 3. Gerar "App Password" para "Mail"
# 4. Copiar e usar em:

SMTP_PASS=<APP_PASSWORD_GERADO>
EMAIL_PASS=<APP_PASSWORD_GERADO>
```

#### 2. **[REDACTED_TOKEN]** (para confirmação de pagamentos)
```bash
# Gerar SECRET seguro (use crypto ou openssl):
openssl rand -hex 32

# Resultado exemplo: [REDACTED_TOKEN]
# Adicionar em:
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# Depois registrar MESMO SECRET no banco (nas configurações de webhook)
```

#### 3. **Twilio Credentials** (SMS/WhatsApp)
```bash
# Obter em: https://www.twilio.com/console
# Login com credenciais Twilio

TWILIO_ACCOUNT_SID=[REDACTED_TOKEN]
TWILIO_AUTH_TOKEN=[REDACTED_TOKEN]
```

#### 4. **Stripe Webhook Secret** (se usar Stripe em produção)
```bash
# Obter em: https://dashboard.stripe.com/webhooks
# Criar novo endpoint: https://sua-api.com/webhooks/stripe

[REDACTED_TOKEN]=[REDACTED_TOKEN]
```

#### 5. **Confirmação de Banco** (Qual banco?)
```bash
# Verificar qual banco é a conta 0435-000827519788-9:
# Opções comuns no Brasil:
# - 001 = Banco do Brasil (atual)
# - 033 = Santander
# - 237 = Bradesco
# - 341 = Itaú
# - 104 = Caixa

PIX_BANK_CODE=001  # Confirmar banco real
```

---

## 📱 Integração PIX com Banco Real

### Passo-a-Passo para Registrar Webhook

1. **Acessar Portal do Banco**
   - Banco do Brasil: https://api.bb.com.br
   - Bradesco: https://developer.bradesco.com.br
   - Itaú: https://developer.itau.com.br
   - Caixa: https://desenvolvedor.caixa.gov.br

2. **Registrar Webhook**
   ```
   URL: https://sua-api.com/webhooks/pix
   Método: POST
   Evento: pix.transfer.in.received
   Assinatura: HMAC-SHA256
   Secret: [REDACTED_TOKEN] (mesmo valor do .env)
   ```

3. **Testar Webhook Localmente** (com ngrok)
   ```bash
   ngrok http 3001
   # Copiar URL: https://xxxxx.ngrok.io
   # Registrar no banco para testes
   ```

---

## 🔐 Checklist de Segurança

- [ ] Senha do Admin alterada (não usar `vfly2008`)
- [ ] 2FA ativado para conta do admin
- [ ] App Password Gmail gerado e configurado
- [ ] [REDACTED_TOKEN] gerado e salvo seguramente
- [ ] Credenciais Twilio configuradas
- [ ] Webhook PIX registrado no banco
- [ ] HTTPS ativado em produção
- [ ] `.env` não commitado em git
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Senhas não logadas (log level apropriado)
- [ ] Backup diário do banco de dados

---

## 📋 Informações Confirmadas

✅ **PIX Registrado**: 51 98033-0422  
✅ **Email Contato**: leidycleaner@gmail.com  
✅ **Número Telefone**: +55 51 98030-3740  
✅ **Conta Bancária**: 000827519788-9 / Agência 0435  
✅ **Admin**: fransmalifra@gmail.com / vfly2008  

---

## ⚠️ Próximas Ações Críticas

1. **Produção**: Alterar senha padrão do admin imediatamente
2. **Segurança**: Gerar e configurar `[REDACTED_TOKEN]`
3. **Email**: Configurar App Password do Gmail
4. **Banco**: Registrar webhook PIX com o banco
5. **HTTPS**: Garantir HTTPS em produção antes de habilitar webhooks

---

## 📞 Contatos Rápidos (Backend)

```javascript
// Frontend pode usar:
const CONTACT_INFO = {
  phone: '+55 51 98030-3740',
  email: 'leidycleaner@gmail.com',
  whatsapp: 'https://wa.me/5551980303740',
  pix: '51980330422',
  bankAccount: '000827519788-9',
  agency: '0435'
};
```

---

**Última atualização**: 09/02/2026  
**Status**: Configurações Bancárias + Admin Atualizadas


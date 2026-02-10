# 🏦 Guia de Registro do Webhook PIX com o Banco

**Status**: ⏳ Aguardando registro com banco  
**Agência**: 0435 ✅ (CONFIRMADA)  
**Data**: 09 de Fevereiro de 2026  
**Próximo Passo**: Registrar webhook no banco

---

## 📋 Informações de Registro

### Dados da Conta (Leidy Cleaner)

```
Banco: ?
Agência: 0435
Conta: 000827519788-9
Titular: Leidy Rani Delgado

Chave PIX: fransmalifra@gmail.com
```

### Endpoint do Webhook

```
URL: https://api.seu-dominio.com/api/pix/webhooks
Método: POST
Protocolo: HTTPS (obrigatório)
Content-Type: application/json
```

### Segurança - HMAC-SHA256

```
Algoritmo: HMAC-SHA256
Secret: [REDACTED_TOKEN]
Header: x-webhook-signature
```

**Exemplo de Assinatura**:
```
Body: {"id":"123","status":"confirmed","amount":150.00}
Signature: HMAC-SHA256(body, secret) → hex

Header enviado:
x-webhook-signature: abc123def456...
```

---

## 🏦 Bancos Principais do Brasil

### 1. **Banco do Brasil (BB) - Agência 0435**

**URL de Cadastro**: https://www.bb.com.br/pix  
**Atendimento**: 0800 729 0001 ou Gerente de Conta

**Como Registrar**:
1. Acessar [Gerenciador PIX BB](https://www.bb.com.br/)
2. Menu: Pix → Gerenciar Webhooks
3. Clicar em "Adicionar Webhook"
4. Informar:
   - ✅ URL: `https://api.seu-dominio.com/api/pix/webhooks`
   - ✅ Eventos: PIX Recebido, PIX Confirmado, PIX Devolvido
   - ✅ Secret HMAC: `[REDACTED_TOKEN]`
5. Testar conexão
6. Ativar webhook

**Documentação**: https://www.bb.com.br/pix/developers

---

### 2. **Banco Bradesco - Agência 0435**

**URL de Cadastro**: https://www.bradesco.com.br/pix  
**Atendimento**: 0800 701 1155 ou Gerente de Conta

**Como Registrar**:
1. Acessar [Bradesco PIX](https://www.bradesco.com.br/)
2. Menu: PIX → Webhooks
3. Clicar em "Novo Webhook"
4. Informar:
   - ✅ URL Endpoint: `https://api.seu-dominio.com/api/pix/webhooks`
   - ✅ Tipo: Recebimento de PIX
   - ✅ Autenticação: HMAC-SHA256
   - ✅ Secret: `[REDACTED_TOKEN]`
5. Teste: enviar payload de teste
6. Confirmar

**Documentação**: https://www.bradesco.com.br/api/pix

---

### 3. **Banco Itaú - Agência 0435**

**URL de Cadastro**: https://www.itau.com.br/pix  
**Atendimento**: 4002 4444 ou Gerente de Conta

**Como Registrar**:
1. Acessar [Itau PIX Developer](https://developer.itau.com.br/)
2. Menu: APIs → PIX → Webhooks
3. Botão: "Adicionar Webhook"
4. Informar:
   - ✅ URL: `https://api.seu-dominio.com/api/pix/webhooks`
   - ✅ Eventos: Pagamento Recebido
   - ✅ Certificado MTLS: (se solicitado)
   - ✅ Secret: `[REDACTED_TOKEN]`
5. Validar IP whitelist
6. Salvar

**Documentação**: https://developer.itau.com.br/pix

---

### 4. **Caixa Econômica Federal - Agência 0435**

**URL de Cadastro**: https://www.caixa.gov.br/pix  
**Atendimento**: 4020 0886 ou Gerente de Conta

**Como Registrar**:
1. Acessar Portal CAIXA PIX
2. Menu: Notificações → Webhooks
3. Novo: Cadastrar Webhook
4. Preencher:
   - ✅ Endpoint: `https://api.seu-dominio.com/api/pix/webhooks`
   - ✅ Protocolo: HTTPS POST
   - ✅ Autenticação: HMAC
   - ✅ Chave Secreta: `[REDACTED_TOKEN]`
5. Ativar

**Documentação**: https://www.caixa.gov.br/api

---

### 5. **Banco Santander - Agência 0435**

**URL de Cadastro**: https://www.santander.com.br/pix  
**Atendimento**: 0800 726 6000 ou Gerente de Conta

**Como Registrar**:
1. Acessar [Santander Developer](https://developer.santander.com.br/)
2. PIX → Configurações → Webhooks
3. Nova Configuração
4. Dados:
   - ✅ URL: `https://api.seu-dominio.com/api/pix/webhooks`
   - ✅ Método: POST
   - ✅ Autenticação: HMAC-SHA256
   - ✅ Secret: `[REDACTED_TOKEN]`
5. Testar
6. Confirmar

**Documentação**: https://developer.santander.com.br/pix

---

## 🔍 Como Qualificar sua Conta

**Pré-requisitos para receber webhooks**:
- [ ] Conta bancária ativa
- [ ] Agência verificada (0435 ✅)
- [ ] Conta verificada (000827519788-9)
- [ ] CNPJ/CPF validado
- [ ] Domínio com SSL/TLS válido
- [ ] IP whitelist configurado (se solicitado)
- [ ] Teste de conexão bem-sucedido

---

## 🧪 Testar o Webhook

### Usando cURL (Local)

```bash
# 1. Gerar assinatura HMAC
SECRET="[REDACTED_TOKEN]"
BODY='{"id":"[REDACTED_TOKEN]","status":"confirmed","amount":150.00}'

# Gerar HMAC em Linux/Mac
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

# 2. Enviar webhook
curl -X POST http://localhost:3001/api/pix/webhooks \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "$BODY"

# Esperado: HTTP 200 OK
# {
#   "success": true,
#   "message": "Webhook recebido com sucesso"
# }
```

### Usando Postman

1. **Criar Request**:
   - Method: POST
   - URL: `http://localhost:3001/api/pix/webhooks`

2. **Headers**:
   - `Content-Type`: application/json
   - `x-webhook-signature`: (gerado automaticamente com script)

3. **Body (raw JSON)**:
   ```json
   {
     "id": "[REDACTED_TOKEN]",
     "status": "confirmed",
     "amount": 150.00,
     "receivedAt": "2026-02-09T16:26:30Z"
   }
   ```

4. **Pre-request Script** (gerar assinatura):
   ```javascript
   const secret = "[REDACTED_TOKEN]";
   const body = JSON.stringify(pm.request.body.raw);
   
   const hash = CryptoJS.HmacSHA256(body, secret).toString();
   pm.request.headers.add("x-webhook-signature", hash);
   ```

---

## 📞 Contatos Úteis

### Bancos  
| Banco | Telefone | Email |
|-------|----------|-------|
| **BB** | 0800 729 0001 | pix@bb.com.br |
| **Bradesco** | 0800 701 1155 | pix@bradesco.com.br |
| **Itaú** | 4002 4444 | pix@itau.com.br |
| **Caixa** | 4020 0886 | pix@caixa.gov.br |
| **Santander** | 0800 726 6000 | pix@santander.com.br |

### Suporte Leidy Cleaner
- **WhatsApp**: https://wa.me/5551980303740
- **Email**: fransmalifra@gmail.com
- **Telefone**: (51) 98030-3740

---

## ✅ Checklist de Implementação

- [x] Agência confirmada: 0435
- [x] Conta confirmada: 000827519788-9
- [x] Backend implementado (PixPaymentService, [REDACTED_TOKEN])
- [x] Endpoints criados (5 rotas PIX)
- [x] Database migrado (tabela payments atualizada)
- [x] Frontend integrado (PixQRCodeCheckout, checkout.jsx)
- [x] HMAC-SHA256 implementado
- [x] Documentação criada
- [ ] **Webhook registrado com banco** ← PRÓXIMO PASSO
- [ ] Teste com simulador do banco
- [ ] Teste E2E completo
- [ ] Produção deployada

---

## 🚀 Após Registrar o Webhook

1. **Teste Imediato**:
   ```bash
   # Enviar payload de teste ao webhook registrado
   curl -X POST https://api.seu-dominio.com/api/pix/webhooks \
     -H "x-webhook-signature: {HMAC}" \
     -d '{...payload...}'
   ```

2. **Validação**:
   - [ ] Banco confirma recepção
   - [ ] Endpoint retorna 200 OK
   - [ ] Status no banco muda para "Confirmado"

3. **Teste Transacional**:
   - [ ] Faz um PIX manual (você para você)
   - [ ] Aguarda webhook chegar
   - [ ] Verifica se foi processado
   - [ ] Confirma status na API

4. **Produção**:
   - [ ] Deploy em produção
   - [ ] Atualizar URL webhook para domínio real
   - [ ] Testar novamente com transação real
   - [ ] Monitorar logs por 1 semana

---

## 📊 Status da Implementação

```
✅ Agência: 0435 CONFIRMADA
✅ Backend: Implementado (ServiceClass, Controller, Routes)
✅ Frontend: Integrado (Componente + Página)
✅ Database: Migrado (Tabela payments expandida)
✅ HMAC Security: Implementado
✅ Documentação: Completa

⏳ Webhook: Aguardando registro com banco
⏳ Testes: Aguardando confirmação do banco
⏳ Produção: Aguardando testes E2E
```

---

**Próximo Passo**: Contact seu banco e registrar o webhook com os dados acima! 🏦

# ✅ DEPLOY CHECKLIST - Leidy Cleaner

**Objetivo:** Garantir que todas as dependências estão prontas antes de ir para produção.

---

## 🎯 FASE 1: Validação (Hoje)

- [x] Backend online e respondendo
- [x] Frontend build completo
- [x] Database com dados de teste
- [x] Login funcionando com JWT
- [x] Pricing API operacional
- [x] Health check passando
- [x] Documentação completa

**Status:** ✅ APROVADO

---

## 🔑 FASE 2: Credenciais (Esta Semana)

### PIX
- [ ] Conta criada em Efi Gateways (https://www.efigateways.com.br)
- [ ] Aprovação recebida (2-3 dias úteis)
- [ ] `PIX_CLIENT_ID` obtido
- [ ] `PIX_CLIENT_SECRET` obtido  
- [ ] `[REDACTED_TOKEN]` obtido
- [ ] Atualizado em `/backend/.env`
- [ ] Webhook registrado na dashboard

### Stripe
- [ ] Conta criada (https://stripe.com)
- [ ] Onboarding completo (2-3 dias)
- [ ] `pk_live_...` obtido
- [ ] `sk_live_...` obtido
- [ ] `[REDACTED_TOKEN]` obtido
- [ ] Atualizado em `/backend/.env`
- [ ] Webhook registrado na dashboard

### Sentry
- [ ] Conta criada (https://sentry.io)
- [ ] Projeto Node.js criado
- [ ] `SENTRY_DSN` obtido
- [ ] Atualizado em `/backend/.env`

### NewRelic
- [ ] Conta criada (https://newrelic.com)
- [ ] `LICENSE_KEY` obtido
- [ ] Atualizado em `/backend/.env`

**Status:** ⏳ EM PROGRESSO

---

## 🧪 FASE 3: Testes (Próxima Semana)

### Testes de Pagamento
- [ ] PIX: Criar cobrança com credenciais reais
- [ ] PIX: Testar QR code gerado
- [ ] PIX: Simular webhook recebido
- [ ] PIX: Verificar BD atualizado
- [ ] Stripe: Criar session de checkout
- [ ] Stripe: Testar com cartão 4242...
- [ ] Stripe: Verificar webhook recebido

### Testes de Integração
- [ ] Login → Agendamento → Pagamento (PIX)
- [ ] Login → Agendamento → Pagamento (Stripe)
- [ ] Admin Dashboard com dados reais
- [ ] Notificações de pagamento por email
- [ ] Dashboard de transações

### Testes de Performance
- [ ] Tempo de resposta < 200ms em endpoints críticos
- [ ] Load test: 100 requests/s no pricing
- [ ] Database queries < 50ms
- [ ] Frontend load time < 2s em 3G

### Testes de Segurança
- [ ] Não há credenciais em logs
- [ ] JWT sendo validado em todas as rotas protegidas
- [ ] Rate limiting funcionando
- [ ] CORS não allowing *
- [ ] SQL injection prevention verificado

**Status:** ⏳ PENDENTE

---

## 🐳 FASE 4: Deploy (Semana 2)

### Docker
- [ ] `Dockerfile.backend` testado localmente
- [ ] `Dockerfile.frontend` testado localmente
- [ ] `docker-compose.yml` configurado
- [ ] `docker build` sem erros
- [ ] `docker run` funcionando

### Staging Environment
- [ ] Servidor staging provisionado
- [ ] HTTPS certificado instalado
- [ ] Variáveis de ambiente (.env) configuradas
- [ ] Database migrations executadas
- [ ] Backup automatizado configurado

### Produção
- [ ] Servidor produção provisionado
- [ ] HTTPS certificado (Let's Encrypt)
- [ ] DNS apontando para servidor
- [ ] CI/CD pipeline configurado
- [ ] Monitoring ativo (Sentry + NewRelic)
- [ ] Alertas configurados

**Status:** ⏳ PENDENTE

---

## 📊 FASE 5: Pós-Deploy

### Operacional
- [ ] Backup horário do database
- [ ] Logs sendo coletados centralmente
- [ ] Uptime monitoring ativo
- [ ] Error tracking ativo
- [ ] Performance monitoring ativo

### Usuários
- [ ] Documentação de uso criada
- [ ] FAQ respondido
- [ ] Suporte por email ativo
- [ ] Feedback form implementado

### Negócio
- [ ] Primeiros pagamentos processados
- [ ] Receita sendo rastreada
- [ ] Métricas de uso coletadas
- [ ] Plano de evolução definido

**Status:** ⏳ PENDENTE

---

## 📈 Progresso Geral

```
Validação:    ████████████████████░ 90%
Credenciais:  ██░░░░░░░░░░░░░░░░░░ 10%
Testes:       ░░░░░░░░░░░░░░░░░░░░░  0%
Deploy:       ░░░░░░░░░░░░░░░░░░░░░  0%
Pós-Deploy:   ░░░░░░░░░░░░░░░░░░░░░  0%

Total:        30% para produção pronta
```

---

## ⏰ Timeline Estimado

| Fase | Data Início | Duração | Data Fim | Status |
|------|------------|---------|----------|--------|
| Validação | 10/02 | 1 dia | 10/02 | ✅ DONE |
| Credenciais | 10/02 | 3-5 dias | 13-15/02 | ⏳ IN PROGRESS |
| Testes | 15/02 | 3 dias | 18/02 | ⏳ BLOCKED |
| Deploy | 18/02 | 2 dias | 20/02 | ⏳ BLOCKED |
| Pós-Deploy | 20/02 | 2 dias | 22/02 | ⏳ BLOCKED |
| **PRODUÇÃO** | - | - | **22/02** | 🎯 TARGET |

### Caminho Crítico:
Credenciais de Stripe/PIX → Bloqueador de tudo o mais

---

## 🚨 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Aprovação Stripe demora | Alta | Alto | Começar logo, ter PIX como backup |
| Erro em webhook | Média | Médio | Testes exaustivos antes |
| Dados corrompidos | Baixa | Alto | Backup antes de cada deploy |
| Performance insuficiente | Baixa | Médio | Load testing antes de lancamento |

---

## 📞 Responsabilidades

- **DevOps:** Infraestrutura, Docker, Deploy
- **Backend:** Integração PIX/Stripe, Webhooks, Tests
- **Frontend:** Testes E2E, UI/UX em produção
- **QA:** Validação de fluxos completos
- **Ops:** Monitoring, Alertas, Backup

---

## ✅ Checklist Final Antes de Ir Live

- [ ] Todos os testes passando
- [ ] Performance < 200ms em 95% das requisições
- [ ] Uptime 99.9% em staging por 48h
- [ ] Nenhum erro não-tratado em logs
- [ ] Backup testado e funcionando
- [ ] Monitoring e alertas confirmados
- [ ] Runbook de operações escrito
- [ ] Time treinado em procedures
- [ ] Rollback plan disponível
- [ ] Contatos de emergência documentados

---

**Última atualização:** 2026-02-10 05:35 UTC
**Próxima revisão:** Daily durante as fases ativas

# 🔍 Guia de Monitoramento - Sentry + NewRelic

## 🎯 Objetivo

Este guia configurar os serviços de monitoramento (Sentry e NewRelic) para rastreamento de erros, performance e métricas em produção.

---

## 📦 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install @sentry/node newrelic
```

### 2. Configurar variáveis de ambiente

```bash
# .env.production
SENTRY_DSN=https://your-key@sentry.io/your-project-id
[REDACTED_TOKEN]=your-license-key
NEW_RELIC_APP_NAME=limpeza-pro-backend
NODE_ENV=production
```

---

## 🔴 Sentry - Error Tracking

### ✅ O que é rastreado:

- ❌ Erros não tratados
- 🔴 Exceções capturadas
- 📊 Performance (traces)
- 🍞 Breadcrumbs (histórico de ações)
- 📱 Contexto do dispositivo/navegador
- 🔗 Relações entre eventos

### 📝 Uso no código

```javascript
const monitoringService = require('./services/MonitoringService');

// Capturar erro
try {
  await someOperation();
} catch (error) {
  monitoringService.captureError(error, {
    userId: user.id,
    endpoint: req.path,
  });
}

// Registrar ação
monitoringService.addBreadcrumb(
  'Usuário fez login',
  'auth',
  { userId: 123 }
);

// Rastrear autenticação
monitoringService.trackAuthEvent('login_success', userId, {
  provider: 'email',
});
```

### 🎯 Dashboard Sentry

1. Acesse [sentry.io](https://sentry.io)
2. Projeto > Issues
3. Veja erros em tempo real
4. Configure alertas e resolução automática

---

## 🟢 NewRelic - APM (Application Performance Monitoring)

### ✅ O que é monitorado:

- ⚡ Tempo de resposta
- 📊 Taxa de erro
- 💾 Uso de memória
- 🔄 Throughput (requisições/segundo)
- 📈 Gráficos de performance
- 🔗 Rastreamento de transações distribuídas

### 📝 Uso no código

```javascript
const monitoringService = require('./services/MonitoringService');

// Registrar métrica
monitoringService.recordMetric('booking.created', 1, {
  serviceType: 'general_cleaning'
});

// Rastrear operação
await monitoringService.trackOperation(
  'payment_processing',
  async () => {
    return await paymentService.process(order);
  }
);

// Rastrear pagamento
monitoringService.trackPaymentEvent('payment_success', 150.00, 'BRL', {
  method: 'stripe',
  serviceId: 1
});
```

### 🎯 Dashboard NewRelic

1. Acesse [newrelic.com](https://newrelic.com)
2. APM > Applications
3. Veja métricas em tempo real
4. Configure alertas

---

## 🚨 Alertas Configurados

### Sentry Alerts

| Evento | Ação |
|--------|------|
| Erro crítico | Notificação imediata |
| Spike de erros | Alerta automático |
| Erro em produção | Slack/Email |

### NewRelic Alerts

| Métrica | Limite | Ação |
|---------|--------|------|
| Taxa de erro | > 5% | Aviso |
| Tempo de resposta | > 500ms | Aviso |
| Memória | > 80% | Crítico |
| CPU | > 90% | Crítico |

---

## 📊 Eventos Rastreados

### Autenticação
```javascript
trackAuthEvent('login_success', userId, { provider })
trackAuthEvent('login_failed', email, { reason })
trackAuthEvent('logout', userId)
trackAuthEvent('signup', userId, { plan })
```

### Pagamentos
```javascript
trackPaymentEvent('payment_success', amount, currency, { method })
trackPaymentEvent('payment_failed', amount, currency, { reason })
trackPaymentEvent('payment_refunded', amount, currency)
```

### Agendamentos
```javascript
trackBookingEvent('booking_created', bookingId, userId)
trackBookingEvent('booking_completed', bookingId, userId)
trackBookingEvent('booking_cancelled', bookingId, userId)
```

### Buscas
```javascript
trackSearch(query, resultsCount, { category, filters })
```

---

## 🔧 Configuração em docker-compose

```yaml
services:
  backend:
    environment:
      - SENTRY_DSN=${SENTRY_DSN}
      - [REDACTED_TOKEN]=${[REDACTED_TOKEN]}
      - NEW_RELIC_APP_NAME=limpeza-pro-backend
      - NODE_ENV=production
```

---

## 📈 Métricas Chave

### Performance
- **APDEX (Apdex)**: Application Performance Index (0-1)
  - 1.0 = Perfeito
  - 0.5 = Aceitável
  - < 0.5 = Ruim

- **Response Time**: Tempo médio de resposta
- **Throughput**: Requisições por minuto

### Confiabilidade
- **Error Rate**: Taxa de erro
- **Availability**: Disponibilidade do serviço

### Recursos
- **Memory**: Uso de memória
- **CPU**: Uso de processador
- **Database**: Tempo de query

---

## 🚀 Deployment

### 1. Configurar Secrets no GitHub

```bash
# Settings > Secrets
SENTRY_DSN=https://...
[REDACTED_TOKEN]=...
```

### 2. CI/CD Pipeline

O GitHub Actions automaticamente:
- ✅ Registra deployment no Sentry
- ✅ Cria release no Sentry
- ✅ Notifica NewRelic

### 3. Release Tracking

```javascript
// Sentry registra automaticamente releases
// A partir do package.json version
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.APP_VERSION, // v1.0.0
});
```

---

## 📚 Integração Frontend

### Próximos Passos

Para monitorar também o Frontend (React/Next.js):

```bash
npm install @sentry/react @sentry/nextjs
```

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.[REDACTED_TOKEN],
  environment: process.env.NODE_ENV,
});
```

---

## 🔍 Troubleshooting

### Eventos não aparecem no Sentry

1. Verifique se `SENTRY_DSN` está correto
2. Confirme se `NODE_ENV` não é "test"
3. Verifique logs: `logger.error()` deve funcionar

### Métricas NewRelic não aparecem

1. Verifique se `[REDACTED_TOKEN]` está correto
2. Aguarde 5-10 minutos para primeira agregação
3. Verifique se `NEW_RELIC_APP_NAME` está único

### Performance lenta do monitoramento

1. Aumente `tracesSampleRate` (só produção)
2. Reduza frequência de breadcrumbs
3. Configure limites de cache

---

## 💡 Best Practices

1. **Não logar dados sensíveis** (senhas, tokens)
2. **Use contexto** para adicionar informações relevantes
3. **Agregue eventos similares** para reduzir ruído
4. **Configure alertas** de forma inteligente (evitar notificações em excesso)
5. **Revise regularmente** dashboards e métricas
6. **Documente padrões** de erro conhecidos

---

## 📞 Suporte

- **Sentry Docs**: https://docs.sentry.io/
- **NewRelic Docs**: https://docs.newrelic.com/
- **GitHub Issues**: Crie issue com tag `monitoring`


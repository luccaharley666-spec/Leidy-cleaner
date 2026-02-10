# Procedimentos de Emergência - LimpezaPro

## 1. Banco de Dados Offline

### Detectar
- API retorna erro 500
- Logs mostram `connection refused`

### Ação Imediata
```bash
# Verificar status do PostgreSQL
docker logs postgres

# Tentar reconectar
docker-compose restart postgres

# Se não funcionar, restore do backup
docker exec postgres pg_restore -U user -d limpezapro < backup_latest.sql
```

### Comunicação
- Enviar email para todos os clientes
- Ativar página de manutenção
- Atualizar status no Twitter

---

## 2. Gateway de Pagamento Down

### Detectar
- Webhook do Stripe/MP não chega
- Pagamentos falham com timeout

### Ação Imediata
```javascript
// Ativar modo offline
process.env.[REDACTED_TOKEN] = 'true';

// Emails para clientes
await notifyCustomers({
  type: 'PAYMENT_DELAY',
  message: 'Gateway temporariamente indisponível'
});

// Queue de pagamentos para processar depois
await [REDACTED_TOKEN](booking);
```

### Recuperação
```bash
# Verificar status do webhook
curl https://api.stripe.com/v1/webhook_endpoints

# Reprocessar fila de pagamentos
npm run scripts/retryFailedPayments.js
```

---

## 3. Equipa Indisponível em Emergência

### Cenário
Todos os membros da equipa não podem comparecer

### Ação Imediata
```javascript
// Notificar cliente
await [REDACTED_TOKEN](booking.userId, {
  type: 'TEAM_UNAVAILABLE',
  message: 'Precisamos remarcar seu agendamento',
  options: [
    { date: '2024-02-16', time: '10:00' },
    { date: '2024-02-17', time: '14:00' }
  ]
});

// Reembolsar automaticamente
await processRefund(booking, 'Serviço indisponível - reembolso completo');

// Alertar admin
await alertAdmin({
  severity: 'HIGH',
  message: 'Nenhuma equipa disponível para agendamentos'
});
```

---

## 4. Ataque DDoS / Sobrecarga

### Detectar
- Tempo de resposta > 5s
- Taxa de erro > 10%
- CPU/Memória > 90%

### Ação Imediata
```bash
# Aumentar auto-scaling
docker-compose scale backend=5

# Ativar rate limiting
RATE_LIMIT=100/min

# Limpara cache malicioso
redis-cli FLUSHALL

# Ativar CDN
aws cloudfront create-distribution ...
```

---

## 5. Vazamento de Dados / Segurança

### Se suspeitar de vazamento
```bash
# 1. Isolar o servidor
docker-compose stop

# 2. Fazer snapshot para forensics
docker exec postgres pg_dump > forensics_backup.sql

# 3. Resetar senhas
npm run scripts/resetAllPasswords.js

# 4. Notificar usuários
npm run scripts/[REDACTED_TOKEN].js

# 5. Registrar com autoridades
# Documentar tudo em relatório
```

### Comunicação
- Email imediato para todos os usuários
- Transparência total sobre o incidente
- Plano de ação claro

---

## 6. Sistema de Notificações Fora

### Detectar
- Clientes recebem 0 notificações
- Logs mostram erro no Twilio/SendGrid

### Fallback
```javascript
// Usar NotificationQueue como fallback
class [REDACTED_TOKEN] {
  async send(user, message) {
    // Email primário
    if (!await sendEmail(user.email, message)) {
      // SMS secundário
      if (!await sendSMS(user.phone, message)) {
        // Armazenar para envio manual
        await [REDACTED_TOKEN](user, message);
      }
    }
  }
}
```

---

## 7. Rollback de Deployment

### Se novo deploy quebra o sistema
```bash
# Ver versões anteriores
docker images | grep limpezapro

# Reverter para versão anterior
docker-compose pull v1.2.3
docker-compose up -d

# Ou restaurar do git
git revert HEAD
git push production main
```

---

## 8. Perda Parcial de Dados

### Backup Automático
```bash
# Executar diariamente às 02:00
0 2 * * * /scripts/dailyBackup.sh

# Armazenar em múltiplos locais
- Local: /backups/
- AWS S3: s3://backups/
- Google Cloud: gs://backups/
```

### Restauração
```bash
# Ver backups disponíveis
ls -la /backups/

# Restaurar específico
docker exec postgres pg_restore -U user -d limpezapro < /backups/2024-01-30.sql

# Verificar integridade
docker exec postgres pg_dump | md5sum
```

---

## 9. Contatos de Emergência

```
CEO/Owner: +55 11 99999-9999
Tech Lead: +55 11 98888-8888
DBA: +55 11 97777-7777
AWS Support: +55 11 support@aws.com

Fornecedores:
- Stripe: +1-888-768-7435
- AWS: +1-206-766-7330
- Twilio: +1-844-839-5456
```

---

## 10. Plano de Continuidade (BCP)

### RTO (Recovery Time Objective): 1 hora
### RPO (Recovery Point Objective): 15 minutos

### Steps de Recuperação
1. Diagnosticar problema (5 min)
2. Ativar plano de backup (10 min)
3. Restaurar dados (15 min)
4. Verificar integridade (10 min)
5. Retomar operações (5 min)
6. Comunicar status (5 min)

### Teste Mensal
```bash
# Simular disaster recovery
npm run scripts/[REDACTED_TOKEN].js
```

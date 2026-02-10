# Fluxos de Automação - LimpezaPro

## 1. Fluxo de Agendamento Automático

```
[Cliente Agenda] 
    ↓
[Validação de dados]
    ↓
[Cálculo de preço]
    ↓
[Email de confirmação enviado]
    ↓
[Atribuição automática de equipa]
    ↓
[SMS/WhatsApp notificado]
    ↓
[Cálculo de rota otimizada]
    ↓
[Agendar lembrete 24h antes]
```

## 2. Fluxo de Pagamento Automático

```
[Cliente inicia pagamento]
    ↓
[Integração com gateway (Stripe/MP)]
    ↓
[Validação de dados de pagamento]
    ↓
[Processamento]
    ├─ [Aprovado] → [Marcar como confirmado]
    └─ [Recusado] → [Notificar cliente]
    ↓
[Fatura gerada]
    ↓
[Recibo enviado por email]
```

## 3. Fluxo de Lembrete Automático

```
[Agendamento confirmado]
    ↓
[Agendar 24h antes] (cron job)
    ↓
[Executar scheduler] (às 10:00 diariamente)
    ↓
[Buscar agendamentos próximos]
    ↓
[Enviar notificação multi-canal]
    ├─ Email
    ├─ SMS
    └─ Push notification
```

## 4. Fluxo de Follow-up Pós-Serviço

```
[Serviço concluído]
    ↓
[Marcar como completed]
    ↓
[Aguardar 1 dia]
    ↓
[Enviar email de satisfação]
    ↓
[Aguardar 3 dias]
    ↓
[Enviar solicitação de avaliação]
    ↓
[Aguardar 14 dias]
    ↓
[Oferecer re-agendamento]
```

## 5. Fluxo de Resolução de Problemas

```
[Problema detectado]
    ↓
[Classificar tipo]
    ├─ No show (cliente não apareceu)
    ├─ Quality complaint (reclamação)
    ├─ Team unavailable (equipa indisponível)
    └─ Payment issue (problema de pagamento)
    ↓
[Escalonamento automático ou manual]
    ├─ Tentar solução automática
    └─ Alertar admin se necessário
    ↓
[Notificar cliente com solução]
    ├─ Re-agendamento automático
    ├─ Reembolso automático
    └─ Compensação (crédito/desconto)
```

## 6. Configurações de Cronograma (CRON)

```bash
# Lembretes diários às 10:00
0 10 * * * /scripts/sendReminders.js

# Verificar agendamentos próximos a cada hora
0 * * * * /scripts/autoAssignJobs.js

# Follow-up automático a cada 6 horas
0 */6 * * * /scripts/executeFollowUps.js

# Limpeza de dados antigos toda segunda à meia-noite
0 0 * * 1 /scripts/cleanupOldData.js

# Gerar relatórios mensais no 1º dia do mês
0 0 1 * * /scripts/[REDACTED_TOKEN].js
```

## 7. Integração com Serviços Externos

### Google Calendar
- Sincronizar novo agendamento
- Verificar disponibilidade de slots
- Atualizar com status em tempo real

### Google Maps
- Calcular rotas otimizadas
- Estimar tempo de viagem
- Fornecer direções para equipa

### WhatsApp Business
- Confirmar agendamento
- Enviar lembrete 24h antes
- Notificar mudanças
- Solicitar feedback

### Stripe/Mercado Pago
- Processar pagamentos
- Validar cartões
- Gerar recibos
- Processar reembolsos

## 8. Regras de Automação (YAML)

```yaml
automation_rules:
  [REDACTED_TOKEN]:
    trigger: new_booking
    conditions:
      - status == 'pending'
      - payment_status == 'unpaid'
    actions:
      - send_email: [REDACTED_TOKEN]
      - send_sms: reminder_48h
      - assign_to_team: auto_assign
  
  [REDACTED_TOKEN]:
    trigger: 24h_before_service
    conditions:
      - status == 'confirmed'
      - booking_date == tomorrow
    actions:
      - send_reminder: client
      - send_details: cleaning_team
      - check_availability: team
  
  [REDACTED_TOKEN]:
    trigger: service_completed
    conditions:
      - status == 'completed'
      - [REDACTED_TOKEN] == 1
    actions:
      - send_thank_you: client
      - request_review: 3_days_later
      - process_payment: automatic
```

## 9. Métricas de Automação

- **Taxa de conclusão automática**: % de agendamentos processados sem intervenção
- **Tempo médio de resposta**: Quanto tempo a automação leva para atuar
- **Taxa de erro**: % de falhas em automações
- **Economia de tempo**: Horas economizadas com automação
- **Satisfação**: Feedback de clientes sobre processo automatizado

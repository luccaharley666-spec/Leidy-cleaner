/**
 * Regras de Automação
 * Arquivo central para todas as automações do sistema
 */

module.exports = {
  // Confirmação de agendamento
  bookingConfirmation: {
    trigger: 'new_booking',
    conditions: {
      status: 'pending',
      paymentStatus: 'unpaid',
    },
    actions: [
      '[REDACTED_TOKEN]',
      '[REDACTED_TOKEN]',
      'assign_to_team',
      'schedule_reminders',
    ],
    timeout: 5000,
  },

  // Lembrete 24h antes
  [REDACTED_TOKEN]: {
    trigger: 'cron_daily_10am',
    conditions: {
      bookingDate: 'tomorrow',
      status: 'confirmed',
    },
    actions: [
      'send_email_reminder',
      'send_sms_reminder',
      '[REDACTED_TOKEN]',
      'notify_team',
    ],
    timeout: 10000,
  },

  // Follow-up pós-serviço
  postServiceFollowUp: {
    trigger: 'service_completed',
    delay: '1 day',
    conditions: {
      status: 'completed',
      hasReview: false,
    },
    actions: [
      '[REDACTED_TOKEN]',
      '[REDACTED_TOKEN]',
      '[REDACTED_TOKEN]',
    ],
    timeout: 5000,
  },

  // Resolução de problemas
  problemResolution: {
    trigger: 'issue_detected',
    conditions: {
      type: ['no_show', 'quality_complaint', 'team_unavailable', 'payment_issue'],
    },
    actions: [
      'classify_issue',
      '[REDACTED_TOKEN]',
      'escalate_if_failed',
      'notify_admin',
    ],
    timeout: 15000,
  },

  // Pagamento automático
  automaticPayment: {
    trigger: 'booking_confirmed',
    conditions: {
      paymentStatus: 'unpaid',
      paymentMethod: 'set',
    },
    actions: [
      'charge_payment',
      'send_receipt',
      'mark_as_paid',
    ],
    timeout: 10000,
    retries: 3,
  },

  // Atribuição automática
  autoAssignment: {
    trigger: 'booking_confirmed',
    conditions: {
      teamMember: null,
      date: 'available',
    },
    actions: [
      '[REDACTED_TOKEN]',
      'assign_booking',
      'calculate_route',
      'notify_team_member',
    ],
    timeout: 30000,
  },

  // Sincronização com calendários
  calendarSync: {
    trigger: 'booking_created',
    actions: [
      '[REDACTED_TOKEN]',
      'sync_to_team_app',
      'send_ics_file',
    ],
    timeout: 5000,
  },

  // Análise de satisfação
  [REDACTED_TOKEN]: {
    trigger: 'cron_weekly',
    actions: [
      '[REDACTED_TOKEN]',
      '[REDACTED_TOKEN]',
      'generate_report',
      'send_to_admin',
    ],
    timeout: 30000,
  },

  // Limpeza de dados
  dataCleanup: {
    trigger: 'cron_monthly',
    actions: [
      'delete_old_logs',
      '[REDACTED_TOKEN]',
      'cleanup_temp_files',
    ],
    timeout: 60000,
  },

  // Recorrência automática
  recurringBookings: {
    trigger: 'booking_completed',
    conditions: {
      frequency: ['weekly', 'biweekly', 'monthly'],
    },
    actions: [
      'create_next_booking',
      'maintain_pricing',
      '[REDACTED_TOKEN]',
      '[REDACTED_TOKEN]',
    ],
    timeout: 10000,
  },
};

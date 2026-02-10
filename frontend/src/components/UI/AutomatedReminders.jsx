import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, ClockIcon, CheckCircleIcon, XCircleIcon, EnvelopeIcon, [REDACTED_TOKEN] } from '@heroicons/react/24/outline';

const AutomatedReminders = ({ clientId }) => {
  const [reminders, setReminders] = useState([]);
  const [settings, setSettings] = useState({
    email: true,
    sms: true,
    whatsapp: false,
    push: true
  });

  useEffect(() => {
    // Simular carregamento de lembretes
    const mockReminders = [
      {
        id: 1,
        serviceId: 3,
        type: 'upcoming_service',
        title: 'Lembrete: Serviço amanhã',
        message: 'Seu serviço de limpeza de vidros está agendado para amanhã às 10:00.',
        scheduledFor: '2024-01-20T10:00:00',
        channels: ['email', 'push'],
        status: 'pending',
        sentAt: null
      },
      {
        id: 2,
        serviceId: 1,
        type: 'service_completed',
        title: 'Avaliação do serviço',
        message: 'Como foi seu serviço de limpeza residencial? Deixe sua avaliação!',
        scheduledFor: '2024-01-15T16:00:00',
        channels: ['email', 'push'],
        status: 'sent',
        sentAt: '2024-01-15T16:05:00'
      },
      {
        id: 3,
        serviceId: 2,
        type: 'payment_reminder',
        title: 'Lembrete de pagamento',
        message: 'O pagamento do seu último serviço ainda está pendente.',
        scheduledFor: '2024-01-12T09:00:00',
        channels: ['sms', 'whatsapp'],
        status: 'sent',
        sentAt: '2024-01-12T09:02:00'
      }
    ];

    setReminders(mockReminders);
  }, [clientId]);

  const [REDACTED_TOKEN] = (type) => {
    switch (type) {
      case 'upcoming_service': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'service_completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'payment_reminder': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'birthday': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getReminderTypeIcon = (type) => {
    switch (type) {
      case 'upcoming_service': return <ClockIcon className="w-5 h-5" />;
      case 'service_completed': return <CheckCircleIcon className="w-5 h-5" />;
      case 'payment_reminder': return <BellIcon className="w-5 h-5" />;
      case 'birthday': return <BellIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <EnvelopeIcon className="w-4 h-4" />;
      case 'sms': return '📱';
      case 'whatsapp': return '💬';
      case 'push': return <BellIcon className="w-4 h-4" />;
      default: return <BellIcon className="w-4 h-4" />;
    }
  };

  const [REDACTED_TOKEN] = (channel, enabled) => {
    setSettings(prev => ({
      ...prev,
      [channel]: enabled
    }));
  };

  const sendTestReminder = () => {
    // Simular envio de lembrete de teste
    alert('Lembrete de teste enviado! Verifique seus canais configurados.');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔔 Lembretes Automáticos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Nunca perca um agendamento ou oportunidade de avaliação
        </p>
      </div>

      {/* Settings Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⚙️ Configurações de Notificação
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(settings).map(([channel, enabled]) => (
            <label key={channel} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => [REDACTED_TOKEN](channel, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:[REDACTED_TOKEN] focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getChannelIcon(channel)}
                </span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {channel === 'sms' ? 'SMS' : channel}
                </span>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={sendTestReminder}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📤 Enviar Lembrete de Teste
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📋 Histórico de Lembretes
        </h3>

        {reminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${[REDACTED_TOKEN](reminder.type)}`}>
                  {getReminderTypeIcon(reminder.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {reminder.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {reminder.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      📅 {new Date(reminder.scheduledFor).toLocaleString('pt-BR')}
                    </span>
                    {reminder.sentAt && (
                      <span>
                        ✅ Enviado em {new Date(reminder.sentAt).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                reminder.status === 'sent'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {reminder.status === 'sent' ? 'Enviado' : 'Pendente'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Canais:</span>
              <div className="flex gap-2">
                {reminder.channels.map((channel) => (
                  <span
                    key={channel}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {typeof getChannelIcon(channel) === 'string' ? getChannelIcon(channel) : <span className="text-xs">{getChannelIcon(channel)}</span>}
                    <span className="capitalize">{channel === 'sms' ? 'SMS' : channel}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reminder Types Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📋 Tipos de Lembretes Automáticos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Serviço Próximo</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lembrete 24h antes do agendamento
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Serviço Concluído</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Solicitação de avaliação após o serviço
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BellIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Pagamento Pendente</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lembrete para pagamentos em atraso
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BellIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Aniversário</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Parabenização e oferta especial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedReminders;
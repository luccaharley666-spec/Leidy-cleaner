import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, CheckCircleIcon, ArrowPathIcon, LinkIcon } from '@heroicons/react/24/outline';

const GoogleCalendarSync = ({ clientId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSync, setLastSync] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [settings, setSettings] = useState({
    autoSync: true,
    syncDirection: 'both', // both, to_google, from_google
    defaultCalendar: 'primary',
    includeDetails: true,
    reminderMinutes: 60
  });

  useEffect(() => {
    // Simular verificação de conexão
    const checkConnection = async () => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simular status de conexão (80% chance de conectado)
      const connected = Math.random() > 0.2;
      setIsConnected(connected);

      if (connected) {
        setLastSync(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 horas atrás

        // Simular eventos próximos
        const mockEvents = [
          {
            id: 'event_1',
            title: 'Limpeza Residencial - Maria Silva',
            start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
            end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            location: 'Rua A, 123 - Porto Alegre',
            synced: true
          },
          {
            id: 'event_2',
            title: 'Limpeza de Vidros - João Santos',
            start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Depois de amanhã
            end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
            location: 'Rua B, 456 - Porto Alegre',
            synced: false
          }
        ];
        setUpcomingEvents(mockEvents);
      }
    };

    checkConnection();
  }, [clientId]);

  const handleConnect = async () => {
    setSyncStatus('syncing');

    // Simular processo de conexão
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular sucesso (90% de chance)
    if (Math.random() > 0.1) {
      setIsConnected(true);
      setSyncStatus('success');
      setLastSync(new Date());
    } else {
      setSyncStatus('error');
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');

    // Simular sincronização
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simular sucesso
    setSyncStatus('success');
    setLastSync(new Date());

    // Atualizar status dos eventos
    setUpcomingEvents(prev => prev.map(event => ({
      ...event,
      synced: true
    })));
  };

  const handleDisconnect = () => {
    if (window.confirm('Tem certeza que deseja desconectar do Google Calendar?')) {
      setIsConnected(false);
      setSyncStatus('idle');
      setLastSync(null);
      setUpcomingEvents([]);
    }
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusIcon = (status) => { switch (status) {
      case 'success': return <CheckCircleIcon className="w-5 h-5" />;
      case 'error': return <decoded className="w-5 h-5" />;
      case 'syncing': return <ArrowPathIcon className="w-5 h-5 animate-spin" />;
      default: return <CalendarIcon className="w-5 h-5" />; }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📅 Sincronização Google Calendar
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Mantenha seus agendamentos sincronizados automaticamente
        </p>
      </div>

      {/* Connection Status */}
      <div className={`rounded-xl p-6 border-2 ${
        isConnected
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              isConnected ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-slate-600'
            }`}>
              {isConnected ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <LinkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isConnected ? 'Conectado ao Google Calendar' : 'Não conectado'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isConnected
                  ? `Última sincronização: ${lastSync?.toLocaleString('pt-BR')}`
                  : 'Conecte sua conta para sincronizar agendamentos'
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={syncStatus === 'syncing'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Conectar
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="w-4 h-4" />
                      Sincronizar
                    </>
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Desconectar
                </button>
              </>
            )}
          </div>
        </div>

        {syncStatus !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${getSyncStatusColor(syncStatus)} bg-white dark:bg-slate-800`}>
            {getSyncStatusIcon(syncStatus)}
            <span className="text-sm">
              {syncStatus === 'syncing' && 'Sincronizando agendamentos...'}
              {syncStatus === 'success' && 'Sincronização concluída com sucesso!'}
              {syncStatus === 'error' && 'Erro na sincronização. Tente novamente.'}
            </span>
          </div>
        )}
      </div>

      {/* Settings */}
      {isConnected && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ⚙️ Configurações de Sincronização
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900 dark:text-white">Sincronização automática</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Direção da Sincronização
                </label>
                <select
                  value={settings.syncDirection}
                  onChange={(e) => setSettings(prev => ({ ...prev, syncDirection: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="both">Ambos os sentidos</option>
                  <option value="to_google">Apenas para Google Calendar</option>
                  <option value="from_google">Apenas do Google Calendar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calendário Padrão
                </label>
                <select
                  value={settings.defaultCalendar}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultCalendar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="primary">Calendário Principal</option>
                  <option value="work">Trabalho</option>
                  <option value="personal">Pessoal</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.includeDetails}
                  onChange={(e) => setSettings(prev => ({ ...prev, includeDetails: e.target.checked }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900 dark:text-white">Incluir detalhes do serviço</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lembrete (minutos antes)
                </label>
                <input
                  type="number"
                  value={settings.reminderMinutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  min="0"
                  max="1440"
                />
              </div>

              <div className="pt-4">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  💾 Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {isConnected && upcomingEvents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📅 Próximos Agendamentos
          </h3>

          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>📅 {event.start.toLocaleDateString('pt-BR')}</span>
                    <span>🕐 {event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>📍 {event.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {event.synced ? (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      Sincronizado
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">
                      Pendente
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ✨ Benefícios da Integração
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Sincronização Automática</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agendamentos atualizados em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Lembretes Integrados</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notificações diretamente no seu calendário
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Visualização Completa</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Todos os compromissos em um só lugar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarSync;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PushNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Verificar permissão de notificações
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Simular notificações automáticas
    const intervals = [
      setTimeout(() => {
        addNotification({
          id: 1,
          title: '🎉 Promoção Especial!',
          body: '20% OFF na primeira limpeza residencial',
          icon: '🎯',
          type: 'promo'
        });
      }, 5000),

      setTimeout(() => {
        addNotification({
          id: 2,
          title: '⏰ Lembrete',
          body: 'Sua limpeza está agendada para amanhã às 14h',
          icon: '📅',
          type: 'reminder'
        });
      }, 15000),

      setTimeout(() => {
        addNotification({
          id: 3,
          title: '⭐ Avaliação',
          body: 'Como foi seu último serviço? Deixe sua opinião!',
          icon: '⭐',
          type: 'review'
        });
      }, 25000)
    ];

    return () => intervals.forEach(clearTimeout);
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        addNotification({
          id: Date.now(),
          title: '✅ Notificações Ativadas!',
          body: 'Você receberá atualizações importantes',
          icon: '🔔',
          type: 'success'
        });
      }
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar notificação do browser se permitida
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico'
      });
    }

    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [REDACTED_TOKEN] = (type) => {
    switch (type) {
      case 'promo':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'reminder':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'review':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  return (
    <>
      {/* Notification Permission Banner */}
      {permission === 'default' && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-semibold">Receba notificações importantes</p>
                <p className="text-sm opacity-90">Atualizações sobre seus agendamentos e promoções</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestPermission}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Ativar
              </button>
              <button
                onClick={() => setPermission('denied')}
                className="text-blue-200 hover:text-white transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`${[REDACTED_TOKEN](notification.type)} text-white p-4 rounded-lg shadow-lg max-w-sm`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{notification.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{notification.body}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SMS/WhatsApp Toggle (simulado) */}
      <div className="fixed bottom-4 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-3 rounded-full shadow-lg border border-gray-200 dark:border-slate-700"
          title="Preferências de notificação"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0l-4 4m4-4l4 4" />
          </svg>
        </motion.button>
      </div>
    </>
  );
};

export default PushNotifications;
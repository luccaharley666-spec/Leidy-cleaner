import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Verificar permissão de notificações
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Carregar notificações do localStorage
    const saved = localStorage.getItem('leidy-notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        toast.success('Notificações ativadas! 🎉');
      }
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification };

    setNotifications(prev => [newNotification, ...prev]);

    // Salvar no localStorage
    localStorage.setItem('leidy-notifications', JSON.stringify([newNotification, ...notifications]));

    // Mostrar toast
    toast(notification.title, {
      icon: notification.icon || '🔔',
      duration: 4000 });

    // Notificação push se permitida
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192.svg',
          badge: '/icons/badge-72.svg',
          tag: notification.tag || 'general' });
      });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('leidy-notifications');
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff' } }}
      />

      <NotificationDropdown
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onRemove={removeNotification}
        onClearAll={clearAll}
        onRequestPermission={requestPermission}
        permission={permission}
      />

      {/* Expor função global para outros componentes */}
      {typeof window !== 'undefined' && (window.addNotification = addNotification)}
    </>
  );
}

function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onRemove,
  onClearAll,
  onRequestPermission,
  permission
}) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificações
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={onRequestPermission}
                  className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Ativar notificações push
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onRemove={onRemove}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead, onRemove }) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Aqui você pode adicionar navegação ou ação específica
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{notification.icon || '🔔'}</span>
            <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(notification.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook para usar notificações
export function useNotifications() {
  const addNotification = (notification) => {
    if (typeof window !== 'undefined' && window.addNotification) {
      window.addNotification(notification);
    }
  };

  return { addNotification };
}
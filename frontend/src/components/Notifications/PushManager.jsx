import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { apiCall } from '../../config/api';

function [REDACTED_TOKEN](base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function [REDACTED_TOKEN]() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return setSubscribed(false);
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch (err) {
    }
  };

  const [REDACTED_TOKEN] = async () => {
    if (!supported) return addToast('Push não suportado neste navegador', 'error');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      addToast('Service worker registrado', 'success');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        addToast('Permissão de notificações negada', 'warning');
        return;
      }

      const vapidKey = process.env.[REDACTED_TOKEN];
      let sub;
      if (vapidKey) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          [REDACTED_TOKEN]: [REDACTED_TOKEN](vapidKey),
        });
      } else {
        // fallback subscription without VAPID (may not work on some browsers)
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true });
      }

      // send subscription to backend
      try {
        await apiCall('/api/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify(sub)
        });
      } catch (err) {
      }

      setSubscribed(true);
      addToast('Inscrito para notificações', 'success');
    } catch (err) {
      addToast('Erro ao ativar notificações', 'error');
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        // inform backend
        try {
          await apiCall('/api/notifications/unsubscribe', {
            method: 'POST',
            body: JSON.stringify({ endpoint: sub.endpoint })
          });
        } catch (err) { /* ignore */ }
      }
      setSubscribed(false);
      addToast('Cancelado registro de notificações', 'info');
    } catch (err) {
      addToast('Erro ao cancelar inscrição', 'error');
    }
  };

  if (!supported) return <div className="p-3 text-sm text-gray-500">Notificações push não suportadas neste navegador.</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-semibold mb-2">Notificações</h4>
      <p className="text-sm text-gray-600 mb-3">Ative notificações para receber atualizações e lembretes.</p>
      <div className="flex gap-2">
        {!subscribed ? (
          <button onClick={[REDACTED_TOKEN]} className="px-4 py-2 bg-blue-600 text-white rounded">Ativar</button>
        ) : (
          <button onClick={unsubscribe} className="px-4 py-2 bg-gray-200 rounded">Desativar</button>
        )}
      </div>
    </div>
  );
}

export default [REDACTED_TOKEN];

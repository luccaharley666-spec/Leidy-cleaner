import React, { useEffect, useState } from 'react';

export default function PushNotifications() {
  const [permission, setPermission] = useState('default');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const request = async () => {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === 'granted') show({ title: 'Notificações ativadas', body: 'Você receberá atualizações.' });
  };

  const show = (n) => {
    const id = Date.now();
    setToasts(t => [{ id, ...n }, ...t]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
    if (permission === 'granted' && 'Notification' in window) new Notification(n.title, { body: n.body });
  };

  return (
    <div className="push-notifications">
      {permission !== 'granted' ? (
        <div className="p-3 bg-blue-50 rounded">
          <div className="mb-2">Ative notificações para receber alertas.</div>
          <button onClick={request} className="px-3 py-1 bg-blue-600 text-white rounded">Ativar</button>
        </div>
      ) : (
        <div className="p-3 bg-green-50 rounded">Notificações ativadas</div>
      )}

      <div className="fixed right-4 top-20 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="p-3 bg-white rounded shadow">
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-gray-600">{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
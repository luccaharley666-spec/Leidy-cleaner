import React from 'react';

export default function NotificationBanner({ message, type = 'info', onClose }: { message: string; type?: 'info' | 'success' | 'error'; onClose?: () => void }) {
  if (!message) return null;
  let color = 'bg-blue-100 text-blue-800 border-blue-200';
  if (type === 'success') color = 'bg-green-100 text-green-800 border-green-200';
  if (type === 'error') color = 'bg-red-100 text-red-800 border-red-200';
  return (
    <div className={`border p-3 rounded mb-4 flex items-center justify-between ${color}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-xs underline">Fechar</button>
      )}
    </div>
  );
}

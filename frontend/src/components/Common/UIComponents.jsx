import React from 'react';

export function SimpleNotification({ children, type = 'info' }) {
  const colors = {
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800'
  };
  return <div className={`p-2 rounded ${colors[type] || colors.info}`}>{children}</div>;
}

export function Loading({ size = 'sm' }) {
  return <div className={`loading-${size} text-sm text-gray-500`}>Carregando...</div>;
}

export default function UIComponents() {
  return (
    <div className="ui-components">
      <SimpleNotification>Componente UI disponível</SimpleNotification>
    </div>
  );
}

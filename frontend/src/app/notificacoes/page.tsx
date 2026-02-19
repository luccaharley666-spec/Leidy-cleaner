import React from 'react';

export default function NotificacoesPage() {
  const [loading, setLoading] = React.useState(false);
  const handlePush = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/notifications/push', { method: 'POST' });
      alert('Push enviado com sucesso!');
    } catch {
      alert('Erro ao enviar push');
    } finally {
      setLoading(false);
    }
  };
  const handleSMS = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/notifications/sms', { method: 'POST' });
      alert('SMS enviado/configurado com sucesso!');
    } catch {
      alert('Erro ao enviar/configurar SMS');
    } finally {
      setLoading(false);
    }
  };
  const handleWhatsApp = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/notifications/whatsapp', { method: 'POST' });
      alert('WhatsApp enviado/configurado com sucesso!');
    } catch {
      alert('Erro ao enviar/configurar WhatsApp');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Notificações Push, SMS e WhatsApp</h1>
      <p className="mb-6 text-gray-700">Configure e visualize o status das notificações automáticas enviadas para os usuários.</p>
      <div className="bg-gray-100 rounded p-4 mb-4">
        <h2 className="font-semibold mb-2">Push Notifications</h2>
        <p>Status: <span className="text-green-600">Ativo</span></p>
        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handlePush} disabled={loading}>
          {loading ? 'Processando...' : 'Testar Push'}
        </button>
      </div>
      <div className="bg-gray-100 rounded p-4 mb-4">
        <h2 className="font-semibold mb-2">SMS</h2>
        <p>Status: <span className="text-yellow-600">Configuração Pendente</span></p>
        <button className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition" onClick={handleSMS} disabled={loading}>
          {loading ? 'Processando...' : 'Configurar SMS'}
        </button>
      </div>
      <div className="bg-gray-100 rounded p-4">
        <h2 className="font-semibold mb-2">WhatsApp</h2>
        <p>Status: <span className="text-yellow-600">Configuração Pendente</span></p>
        <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" onClick={handleWhatsApp} disabled={loading}>
          {loading ? 'Processando...' : 'Configurar WhatsApp'}
        </button>
      </div>
    </div>
  );
}

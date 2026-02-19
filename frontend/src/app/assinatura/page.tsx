import React from 'react';

export default function AssinaturaPage() {
  const [loading, setLoading] = React.useState(false);
  const handleChangePlan = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/subscription/change', { method: 'POST' });
      alert('Plano alterado com sucesso!');
    } catch {
      alert('Erro ao alterar plano');
    } finally {
      setLoading(false);
    }
  };
  const handleActivateTrial = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/subscription/activate-trial', { method: 'POST' });
      alert('Trial ativado com sucesso!');
    } catch {
      alert('Erro ao ativar trial');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/subscription/cancel', { method: 'POST' });
      alert('Assinatura cancelada com sucesso!');
    } catch {
      alert('Erro ao cancelar assinatura');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Assinatura, Trial e Cancelamento</h1>
      <p className="mb-6 text-gray-700">Gerencie sua assinatura, período de avaliação (trial) e opções de cancelamento do serviço.</p>
      <div className="bg-gray-100 rounded p-4 mb-4">
        <h2 className="font-semibold mb-2">Plano Atual</h2>
        <p>Profissional (R$ 49,90/mês)</p>
        <p>Próxima cobrança: 01/03/2026</p>
        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleChangePlan} disabled={loading}>
          {loading ? 'Processando...' : 'Alterar Plano'}
        </button>
      </div>
      <div className="bg-gray-100 rounded p-4 mb-4">
        <h2 className="font-semibold mb-2">Período de Avaliação</h2>
        <p>Seu trial termina em: 28/02/2026</p>
        <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" onClick={handleActivateTrial} disabled={loading}>
          {loading ? 'Processando...' : 'Ativar Assinatura'}
        </button>
      </div>
      <div className="bg-gray-100 rounded p-4">
        <h2 className="font-semibold mb-2">Cancelar Assinatura</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={handleCancel} disabled={loading}>
          {loading ? 'Processando...' : 'Cancelar Agora'}
        </button>
      </div>
    </div>
  );
}

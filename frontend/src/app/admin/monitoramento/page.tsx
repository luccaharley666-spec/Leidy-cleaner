import React from 'react';

export default function MonitoramentoPage() {
  const [status, setStatus] = React.useState({ api: 'Online', db: 'Online', downtime: '' });
  const [logs, setLogs] = React.useState<string[]>([]);
  const [audit, setAudit] = React.useState<string[]>([]);
  React.useEffect(() => {
    // Simulação de integração real
    fetch('/api/v1/admin/status')
      .then(res => res.json())
      .then(data => setStatus(data));
    fetch('/api/v1/admin/logs')
      .then(res => res.json())
      .then(data => setLogs(data));
    fetch('/api/v1/admin/audit')
      .then(res => res.json())
      .then(data => setAudit(data));
  }, []);
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Monitoramento, Logs e Auditoria</h1>
      <p className="mb-6 text-gray-700">Acompanhe o status do sistema, uptime, logs de acesso e ações administrativas. Esta área é restrita a administradores.</p>
      <div className="bg-gray-100 rounded p-4 mb-4">
        <h2 className="font-semibold mb-2">Status do Sistema</h2>
        <ul className="list-disc pl-5 text-gray-600">
          <li>API: {status.api}</li>
          <li>Banco de Dados: {status.db}</li>
          <li>Último downtime: {status.downtime || 'Nunca'}</li>
        </ul>
      </div>
      <div className="bg-gray-100 rounded p-4 mb-4">
        <h2 className="font-semibold mb-2">Logs Recentes</h2>
        <ul className="list-disc pl-5 text-gray-600">
          {logs.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>
      <div className="bg-gray-100 rounded p-4">
        <h2 className="font-semibold mb-2">Auditoria</h2>
        <ul className="list-disc pl-5 text-gray-600">
          {audit.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}

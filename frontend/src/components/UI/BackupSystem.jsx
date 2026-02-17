import React, { useState } from 'react';
import axios from 'axios';

export default function BackupSystem() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const runBackup = async () => {
    setStatus('running');
    setMessage('Iniciando backup...');
    try {
      await axios.post('/api/admin/backup');
      setStatus('done');
      setMessage('Backup iniciado com sucesso');
    } catch (err) {
      setStatus('error');
      setMessage('Erro ao iniciar backup');
    }
  };

  return (
    <div className="backup-system p-3 bg-white rounded">
      <h4 className="font-semibold mb-2">Backup do Sistema</h4>
      <p className="text-sm text-gray-600 mb-3">Status: {status}</p>
      {message && <div className="text-sm text-gray-700 mb-2">{message}</div>}
      <button onClick={runBackup} className="px-4 py-2 bg-blue-600 text-white rounded">Executar Backup</button>
    </div>
  );
}

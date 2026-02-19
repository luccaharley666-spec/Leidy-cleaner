import React from 'react';

export default function BackupRestorePage() {
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/backup');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Erro ao fazer backup');
    } finally {
      setLoading(false);
    }
  };
  const handleRestore = async () => {
    if (!file) return alert('Selecione um arquivo');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('backup', file);
      await fetch('/api/v1/admin/restore', { method: 'POST', body: formData });
      alert('Restore realizado com sucesso!');
    } catch {
      alert('Erro ao restaurar backup');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Backup e Restore de Dados</h1>
      <p className="mb-6 text-gray-700">Faça backup dos dados do sistema ou restaure um backup existente. Esta funcionalidade é restrita a administradores.</p>
      <div className="flex flex-col gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleBackup} disabled={loading}>
          {loading ? 'Processando...' : 'Fazer Backup Agora'}
        </button>
        <div>
          <label className="block mb-2 font-medium">Restaurar Backup</label>
          <input type="file" className="mb-2" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" onClick={handleRestore} disabled={loading}>
            {loading ? 'Processando...' : 'Restaurar'}
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Histórico de Backups</h2>
        <ul className="list-disc pl-5 text-gray-600">
          <li>backup_2024-06-01.zip</li>
          <li>backup_2024-05-15.zip</li>
        </ul>
      </div>
    </div>
  );
}

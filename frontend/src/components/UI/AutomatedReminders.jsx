import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AutomatedReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get('/api/reminders');
        if (!mounted) return;
        setReminders(res.data.reminders || []);
      } catch (err) {
      } finally { setLoading(false); }
    };
    load();
    return () => { mounted = false };
  }, []);

  const toggle = async (id, enabled) => {
    try {
      await axios.post(`/api/reminders/${id}/toggle`, { enabled: !enabled });
      setReminders(r => r.map(x => x.id === id ? { ...x, enabled: !enabled } : x));
    } catch (err) {}
  };

  if (loading) return <div className="p-3">Carregando lembretes...</div>;

  return (
    <div className="automated-reminders p-3 bg-white rounded">
      <h4 className="font-semibold mb-2">Lembretes Automáticos</h4>
      {reminders.length === 0 ? <div>Nenhum lembrete configurado</div> : (
        reminders.map(r => (
          <div key={r.id} className="flex items-center justify-between p-2 border-b">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-500">{r.description}</div>
            </div>
            <button onClick={() => toggle(r.id, r.enabled)} className={`px-3 py-1 rounded ${r.enabled ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              {r.enabled ? 'Ativado' : 'Desativado'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

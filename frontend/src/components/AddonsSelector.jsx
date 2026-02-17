import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AddonsSelector({ bookingId, token, onTotalChange }) {
  const [addons, setAddons] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchAddons = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/addons');
        if (!mounted) return;
        setAddons(res.data.addons || []);
      } catch (err) {
        setMessage('Erro ao carregar add-ons');
      } finally {
        setLoading(false);
      }
    };
    fetchAddons();
    return () => { mounted = false };
  }, []);

  const toggle = (addon) => {
    const exists = selected.find(a => a.id === addon.id);
    if (exists) setSelected(selected.filter(a => a.id !== addon.id));
    else setSelected([...selected, { ...addon, quantity: 1 }]);
  };

  const setQuantity = (addonId, q) => {
    setSelected(selected.map(a => a.id === addonId ? { ...a, quantity: q } : a));
  };

  const confirm = async () => {
    if (!bookingId) return setMessage('BookingId não fornecido');
    try {
      for (const a of selected) {
        await axios.post('/api/addons/add', { bookingId, addonId: a.id, quantity: a.quantity });
      }
      onTotalChange?.(selected.reduce((s, a) => s + a.price * a.quantity, 0));
      setMessage('Add-ons adicionados');
    } catch (err) {
      setMessage('Erro ao adicionar add-ons');
    }
  };

  if (loading) return <div className="p-3">Carregando add-ons...</div>;

  return (
    <div className="addons-selector p-3 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Add-ons</h3>
      {message && <div className="text-sm text-red-600 mb-2">{message}</div>}
      <div className="grid grid-cols-2 gap-3">
        {addons.map(addon => {
          const sel = selected.find(s => s.id === addon.id);
          return (
            <div key={addon.id} className={`p-3 border rounded ${sel ? 'border-green-500' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{addon.name}</div>
                  <div className="text-sm text-gray-600">R$ {Number(addon.price).toFixed(2)}</div>
                </div>
                <button onClick={() => toggle(addon)} className="px-3 py-1 bg-blue-600 text-white rounded">{sel ? 'Remover' : 'Adicionar'}</button>
              </div>
              {sel && (
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setQuantity(addon.id, Math.max(1, sel.quantity - 1))}>−</button>
                  <input type="number" value={sel.quantity} min={1} onChange={e => setQuantity(addon.id, Math.max(1, parseInt(e.target.value || '1')))} className="w-16 text-center" />
                  <button onClick={() => setQuantity(addon.id, sel.quantity + 1)}>+</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div className="mt-3 flex justify-between items-center">
          <div>Total: R$ {selected.reduce((s,a) => s + a.price * a.quantity, 0).toFixed(2)}</div>
          <button onClick={confirm} className="px-4 py-2 bg-green-600 text-white rounded">Confirmar</button>
        </div>
      )}
    </div>
  );
}

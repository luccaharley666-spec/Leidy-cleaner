import React, { useState, useEffect } from 'react';

const PriceCalculator = ({ services = [], date = null }) => {
  const [metragem, setMetragem] = useState(0);
  const [frequencia, setFrequencia] = useState('unica');
  const [urgencia, setUrgencia] = useState('normal');
  const [totalPrice, setTotalPrice] = useState(0);

  const frequencies = {
    unica: { label: 'Única vez', multiplier: 1 },
    semanal: { label: 'Semanal', multiplier: 0.8 },
    quinzenal: { label: 'Quinzenal', multiplier: 0.9 },
    mensal: { label: 'Mensal', multiplier: 0.95 } };

  const urgencies = {
    normal: { label: 'Normal (2-3 dias)', multiplier: 1 },
    express: { label: 'Express (24h)', multiplier: 1.3 },
    emergencia: { label: 'Emergência (mesma hora)', multiplier: 1.5 } };

  useEffect(() => {
    const serviceTotal = services.reduce((sum, service) => sum + service.price, 0);
    const metreagePrice = metragem * 0.5;
    const urgencyMultiplier = urgencies[urgencia].multiplier;
    const frequencyMultiplier = frequencies[frequencia].multiplier;

    const calculated = (serviceTotal + metreagePrice) * urgencyMultiplier * frequencyMultiplier;
    setTotalPrice(Math.max(calculated, 0));
  }, [services, metragem, frequencia, urgencia]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-6">Calculadora de Preços</h3>

      {/* Metragem */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Metragem (m²)</label>
        <input
          type="number"
          value={metragem}
          onChange={(e) => setMetragem(Number(e.target.value))}
          placeholder="Ex: 100"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
        <p className="text-sm text-gray-600 mt-1">R$ 0,50 por m²</p>
      </div>

      {/* Frequência */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Frequência</label>
        <select
          value={frequencia}
          onChange={(e) => setFrequencia(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          {Object.entries(frequencies).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
      </div>

      {/* Urgência */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Urgência</label>
        <select
          value={urgencia}
          onChange={(e) => setUrgencia(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          {Object.entries(urgencies).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
      </div>

      {/* Serviços */}
      {services.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p className="font-semibold mb-2">Serviços:</p>
          <ul className="space-y-1">
            {services.map((service) => (
              <li key={service.id} className="text-sm text-gray-700">
                • {service.name}: R$ {service.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Total */}
      <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-600">
        <p className="text-sm text-blue-600 font-semibold">Preço Total Estimado</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">R$ {totalPrice.toFixed(2)}</p>
        {date && (
          <p className="text-sm text-blue-600 mt-2">Para {date.toLocaleDateString('pt-BR')}</p>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;

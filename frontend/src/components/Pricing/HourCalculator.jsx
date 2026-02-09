/**
 * Hour Calculator Component
 * Calculadora interativa de horas com cálculo de preço em tempo real
 */

import React, { useState, useEffect } from 'react';

const HourCalculator = ({ onCalculate, userId }) => {
  const [selectedHours, setSelectedHours] = useState(40);
  const [characteristics, setCharacteristics] = useState({
    environments: 1,
    people: 1,
    complexity: 'low', // low, medium, high
  });
  const [priceResult, setPriceResult] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar pacotes disponíveis ao montar
  useEffect(() => {
    fetchPackages();
  }, []);

  // Recalcular preço quando horas ou características mudam
  useEffect(() => {
    if (selectedHours > 0) {
      calculatePrice();
    }
  }, [selectedHours, characteristics]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing/hour-packages');
      const data = await response.json();

      if (data.success) {
        setPackages(data.packages);
      } else {
        setError(data.error || 'Erro ao buscar pacotes');
      }
    } catch (err) {
      console.error('Erro ao buscar pacotes:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing/calculate-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          hours: selectedHours,
          characteristics: characteristics,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPriceResult(data);
        if (onCalculate) {
          onCalculate(data);
        }
      } else {
        setError(data.error || 'Erro ao calcular preço');
      }
    } catch (err) {
      console.error('Erro ao calcular preço:', err);
      setError('Erro ao calcular preço');
    } finally {
      setLoading(false);
    }
  };

  const suggestPackage = async () => {
    try {
      const response = await fetch(
        `/api/pricing/suggest-package?hoursNeeded=${selectedHours}`
      );
      const data = await response.json();

      if (data.success && data.suggestedPackage) {
        setSelectedHours(data.suggestedPackage.hours);
      }
    } catch (err) {
      console.error('Erro ao sugerir pacote:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-green-900 mb-6">
        💰 Calculadora de Horas
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LADO ESQUERDO: Seleção de Horas e Características */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            Configuração do Serviço
          </h3>

          {/* Seletor de Horas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Horas: <strong>{selectedHours}h</strong>
            </label>
            <input
              type="range"
              min="1"
              max="420"
              step="1"
              value={selectedHours}
              onChange={(e) => setSelectedHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1h</span>
              <span>420h</span>
            </div>
          </div>

          {/* Botão Sugerir Pacote */}
          <button
            onClick={suggestPackage}
            className="w-full mb-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            💡 Sugerir Pacote para {selectedHours}h
          </button>

          {/* Características */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Ambientes:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={characteristics.environments}
                onChange={(e) =>
                  setCharacteristics({
                    ...characteristics,
                    environments: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Pessoas:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={characteristics.people}
                onChange={(e) =>
                  setCharacteristics({
                    ...characteristics,
                    people: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexidade do Serviço:
              </label>
              <select
                value={characteristics.complexity}
                onChange={(e) =>
                  setCharacteristics({
                    ...characteristics,
                    complexity: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded"
              >
                <option value="low">🟢 Baixa</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Resultado do Preço */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            Detalhamento do Preço
          </h3>

          {priceResult && !loading ? (
            <div className="space-y-3 text-sm">
              {/* Preço Base */}
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-700">Preço Base ({selectedHours}h):</span>
                <strong>R$ {priceResult.breakdown.basePrice.toFixed(2)}</strong>
              </div>

              {/* Taxa de Serviço */}
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-700">Taxa de Serviço (40%):</span>
                <strong className="text-orange-600">
                  + R$ {priceResult.breakdown.serviceFee.toFixed(2)}
                </strong>
              </div>

              {/* Pós-Obra */}
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-700">Pós-Obra (20%):</span>
                <strong className="text-orange-600">
                  + R$ {priceResult.breakdown.postWorkFee.toFixed(2)}
                </strong>
              </div>

              {/* Organização */}
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-700">Organização (10%):</span>
                <strong className="text-orange-600">
                  + R$ {priceResult.breakdown.organizationFee.toFixed(2)}
                </strong>
              </div>

              {/* Produto */}
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-700">Produto (fixo):</span>
                <strong className="text-orange-600">
                  + R$ {priceResult.breakdown.productFee.toFixed(2)}
                </strong>
              </div>

              {/* Preço Final */}
              <div className="flex justify-between pt-4">
                <strong className="text-lg text-gray-900">Preço Total:</strong>
                <strong className="text-2xl text-green-600">
                  R$ {priceResult.finalPrice.toFixed(2)}
                </strong>
              </div>

              {/* Se maior com crédito */}
              {priceResult.creditInfo?.hasCredit &&
                priceResult.creditInfo.availableHours >= selectedHours && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
                    <p className="text-sm text-green-800">
                      ✅ Você tem {priceResult.creditInfo.availableHours.toFixed(1)}h disponíveis!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Desconto com crédito:{' '}
                      <strong>R$ {priceResult.creditInfo.discountValue?.toFixed(2) || '0.00'}</strong>
                    </p>
                    <p className="text-sm text-green-700 font-semibold mt-1">
                      Novo total:
                      <strong> R$ {priceResult.discountedPrice?.toFixed(2) || priceResult.finalPrice.toFixed(2)}</strong>
                    </p>
                  </div>
                )}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="text-gray-500">Calculando...</div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-48">
              <div className="text-gray-500">Carregando resultado...</div>
            </div>
          )}
        </div>
      </div>

      {/* PACOTES SUGERIDOS */}
      {packages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Pacotes Disponíveis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {packages.slice(0, 6).map((pkg) => (
              <button
                key={pkg.hours}
                onClick={() => setSelectedHours(pkg.hours)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedHours === pkg.hours
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-green-300'
                }`}
              >
                <div className="font-bold text-lg text-green-700">{pkg.hours}h</div>
                <div className="text-sm text-gray-600">
                  R$ {pkg.totalPrice.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HourCalculator;

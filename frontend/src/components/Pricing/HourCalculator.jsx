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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recalcula o preço localmente sem depender de pacotes
  useEffect(() => {
    if (selectedHours > 0) {
      calculatePrice();
    }
  }, [selectedHours, characteristics]);

  const calculatePrice = () => {
    try {
      setLoading(true);

      const baseRate = 60; // R$ por hora (estimativa local)
      const complexityMultiplier =
        characteristics.complexity === 'low'
          ? 1
          : characteristics.complexity === 'medium'
          ? 1.2
          : 1.5;

      const envMultiplier = 1 + Math.max(0, characteristics.environments - 1) * 0.02;
      const peopleMultiplier = 1 + Math.max(0, characteristics.people - 1) * 0.01;

      const basePrice =
        selectedHours * baseRate * complexityMultiplier * envMultiplier * peopleMultiplier;

      const serviceFee = basePrice * 0.4;
      const postWorkFee = basePrice * 0.2;
      const organizationFee = basePrice * 0.1;
      const productFee = 50; // custo fixo estimado

      const finalPrice = basePrice + serviceFee + postWorkFee + organizationFee + productFee;

      const result = {
        breakdown: {
          basePrice,
          serviceFee,
          postWorkFee,
          organizationFee,
          productFee },
        finalPrice };

      setPriceResult(result);
      if (onCalculate) onCalculate(result);
    } catch (err) {
      console.error('Erro ao calcular preço localmente:', err);
      setError('Erro ao calcular estimativa');
    } finally {
      setLoading(false);
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

          {/* Botão Ir para Pagamento (por booking) */}
          <a
            href={`/hour-checkout?bookingId=estimator&amount=${Math.ceil(
              (priceResult && priceResult.finalPrice) || 0
            )}`}
            className="w-full inline-block mb-4 text-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            💳 Ir para Pagamento — R$ {priceResult ? Math.ceil(priceResult.finalPrice) : '0'}
          </a>

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
                    environments: parseInt(e.target.value) || 1 })
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
                    people: parseInt(e.target.value) || 1 })
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
                    complexity: e.target.value })
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

      {/* Removido: pacotes/sugestões — fluxo de pagamento por bookingId */}
    </div>
  );
};

export default HourCalculator;

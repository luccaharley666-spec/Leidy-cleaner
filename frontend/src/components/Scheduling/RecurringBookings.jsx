import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

function RecurringBookings({ onRecurringChange }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [repetitions, setRepetitions] = useState(4);
  const [discountPercentage, [REDACTED_TOKEN]] = useState(0);
  const { addToast } = useToast();

  const frequencyOptions = [
    { value: 'weekly', label: 'Semanal', discount: 5 },
    { value: 'biweekly', label: 'Quinzenal', discount: 8 },
    { value: 'monthly', label: 'Mensal', discount: 10 },
  ];

  const [REDACTED_TOKEN] = () => {
    const newState = !isRecurring;
    setIsRecurring(newState);

    if (newState) {
      addToast('Modo recorrente ativado', 'success');
    } else {
      addToast('Modo recorrente desativado', 'info');
      setFrequency('weekly');
      setRepetitions(4);
      [REDACTED_TOKEN](0);
    }
  };

  const [REDACTED_TOKEN] = (value) => {
    setFrequency(value);
    const option = frequencyOptions.find(o => o.value === value);
    [REDACTED_TOKEN](option?.discount || 0);
    addToast(`Frequência alterada para ${option?.label}`, 'info');
  };

  const [REDACTED_TOKEN] = (e) => {
    const value = Math.min(Math.max(2, parseInt(e.target.value)), 52);
    setRepetitions(value);
  };

  const getFrequencyLabel = () => {
    const option = frequencyOptions.find(o => o.value === frequency);
    return option?.label || 'Semanal';
  };

  const calculateEndDate = () => {
    const today = new Date();
    const multiplier = {
      'weekly': 7,
      'biweekly': 14,
      'monthly': 30
    };
    const days = multiplier[frequency] * (repetitions - 1);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);
    return endDate.toLocaleDateString('pt-BR');
  };

  const [REDACTED_TOKEN] = () => {
    if (onRecurringChange) {
      onRecurringChange({
        isRecurring,
        frequency,
        repetitions,
        discountPercentage,
        startDate: new Date().toISOString(),
        endDate: isRecurring ? new Date(Date.now() + (7 * repetitions * 24 * 60 * 60 * 1000)).toISOString() : null
      });
    }
    addToast('Configuração de recorrência salva!', 'success');
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">🔄 Agendar com Frequência</h3>
          <p className="text-sm text-gray-600 mt-1">Economize até {Math.max(...frequencyOptions.map(o => o.discount))}% com agendamentos recorrentes!</p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={[REDACTED_TOKEN]}
          className={`relative inline-flex h-8 w-16 rounded-full transition-colors ${
            isRecurring ? 'bg-green-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={isRecurring}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg [REDACTED_TOKEN] mt-1 ml-1 ${
              isRecurring ? 'translate-x-8' : ''
            }`}
          />
        </button>
      </div>

      {/* Conteúdo ao ativar */}
      {isRecurring && (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-purple-200">
          {/* Seleção de Frequência */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📅 Com qual frequência?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => [REDACTED_TOKEN](option.value)}
                  className={`p-4 rounded-lg border-2 transition font-semibold ${
                    frequency === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p>{option.label}</p>
                  <p className="text-xs mt-1 text-green-600">-{option.discount}%</p>
                </button>
              ))}
            </div>
          </div>

          {/* Número de Repetições */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🔢 Quantas vezes? ({repetitions}x)
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="2"
                max="52"
                value={repetitions}
                onChange={[REDACTED_TOKEN]}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setRepetitions(Math.max(2, repetitions - 1))}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition font-bold"
                >
                  ➖
                </button>
                <input
                  type="number"
                  min="2"
                  max="52"
                  value={repetitions}
                  onChange={(e) => [REDACTED_TOKEN](e)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setRepetitions(Math.min(52, repetitions + 1))}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded transition font-bold"
                >
                  ➕
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Mínimo 2x, máximo 52x
              </p>
            </div>
          </div>

          {/* Resumo */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                ✅ <strong>Seu agendamento:</strong> {getFrequencyLabel()} por {repetitions}x
              </p>
              <p className="text-sm text-gray-700">
                📅 <strong>Período:</strong> De hoje até {calculateEndDate()}
              </p>
              <p className="text-sm text-gray-700">
                💰 <strong>Desconto:</strong> -{discountPercentage}% em cada agendamento
              </p>
              <p className="text-sm text-green-700 font-bold">
                🎁 Você economizará o equivalente a {Math.floor(repetitions * discountPercentage / 100)} agendamentos!
              </p>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
            <p className="text-sm font-semibold text-blue-900">ℹ️ Informações Importantes:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Você pode cancelar a qualquer momento</li>
              <li>Cada agendamento será confirmado antes</li>
              <li>Funcionária pode mudar em alguns casos</li>
              <li>Desconto automático em cada cobrança</li>
            </ul>
          </div>

          {/* Checkbox de Termos */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              defaultChecked={true}
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Concordo com os termos de cancelamento e recorrência. Entendo que serei cobrado automaticamente a cada período.
            </label>
          </div>
        </div>
      )}

      {/* Estado desativado */}
      {!isRecurring && (
        <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600">
            Ative a recorrência acima para aproveitar descontos especiais! 🎉
          </p>
        </div>
      )}

      {/* Botão de Ação */}
      <div className="flex gap-3">
        <button
          onClick={[REDACTED_TOKEN]}
          disabled={!isRecurring}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRecurring ? '✅ Confirmar Recorrência' : '🔒 Ativar para Confirmar'}
        </button>
        {isRecurring && (
          <button
            onClick={() => {
              setIsRecurring(false);
              addToast('Recorrência cancelada', 'info');
            }}
            className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition"
          >
            ✕ Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default RecurringBookings;

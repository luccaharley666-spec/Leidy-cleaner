import React, { useState, useEffect } from 'react'

/**
 * Live Calendar Availability - Mostra disponibilidade em tempo real
 */
export default function [REDACTED_TOKEN]() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [availability, setAvailability] = useState({})

  // Gerar dados de disponibilidade (simulado)
  useEffect(() => {
    const availData = {}
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      const day = date.getDay()
      
      // Indisponível em alguns dias (simulação)
      if (day === 0 || [5, 12, 19, 26].includes(i)) {
        availData[i] = 'unavailable'
      } else if ([8, 15, 22, 29].includes(i)) {
        availData[i] = 'limited' // Apenas alguns horários
      } else {
        availData[i] = 'available'
      }
    }
    setAvailability(availData)
  }, [currentMonth])

  const getDayColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900/20 border-green-300 hover:bg-green-200'
      case 'limited':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 hover:bg-yellow-200'
      case 'unavailable':
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-400 cursor-not-allowed'
      default:
        return ''
    }
  }

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate()
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay()

    const days = []
    
    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>)
    }

    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      const status = availability[i] || 'available'
      days.push(
        <button
          key={i}
          onClick={() => status !== 'unavailable' && setSelectedDate(i)}
          className={`text-center py-2 rounded-lg border-2 transition-all font-medium ${getDayColor(
            status
          )}`}
        >
          <div className="text-lg">{i}</div>
          <div className="text-xs">
            {status === 'available' && '✓'}
            {status === 'limited' && '⚠'}
            {status === 'unavailable' && '✗'}
          </div>
        </button>
      )
    }

    return days
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅</span> Disponibilidade Ao Vivo
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Próximo →
            </button>
          </div>
        </div>

        {/* Mês/Ano */}
        <div className="text-center text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>

        {/* Legenda */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Limitado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Cheio</span>
          </div>
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>

        {/* Data selecionada */}
        {selectedDate && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              📍 <strong>Data selecionada:</strong> {selectedDate} de {currentMonth.toLocaleDateString('pt-BR', { month: 'long' })}
            </p>
            <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-semibold">
              Prosseguir com Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

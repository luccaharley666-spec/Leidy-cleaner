import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Check, AlertCircle } from 'lucide-react'

export default function DynamicCalendar({ professionalId, durationHours = 2, onSelectSlot }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (professionalId) {
      loadAvailability()
    }
  }, [professionalId])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/availability/calendar/${professionalId}?days=30&duration=${durationHours}`
      )
      const data = await response.json()

      if (data.success) {
        // Converter para map de datas
        const availMap = {}
        data.data.days.forEach(day => {
          availMap[day.date] = day.availableSlots
        })
        setAvailability(availMap)
      }
    } catch (err) {
      console.error('Erro ao buscar disponibilidade:', err)
      setError('Erro ao carregar calendário')
    } finally {
      setLoading(false)
    }
  }

  const fetchDaySlots = async (date) => {
    try {
      setLoading(true)
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(
        `/api/availability/slots/${professionalId}?date=${dateStr}&duration=${durationHours}`
      )
      const data = await response.json()

      if (data.success) {
        setSlots(data.data.available)
        setSelectedDate(date)
      }
    } catch (err) {
      console.error('Erro ao buscar slots:', err)
      setError('Erro ao carregar horários')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSlot = (time) => {
    setSelectedSlot(time)
    const dateStr = selectedDate.toISOString().split('T')[0]
    onSelectSlot?.({
      date: dateStr,
      time: time,
      durationHours: durationHours
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Days of month
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const hasSlots = availability[dateStr] > 0
      const isPast = date < today

      days.push(
        <button
          key={day}
          onClick={() => !isPast && hasSlots && fetchDaySlots(date)}
          disabled={isPast || !hasSlots}
          className={`p-3 rounded-lg font-semibold transition ${
            isPast
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
              : !hasSlots
              ? 'text-gray-500'
              : isSelected
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300'
          }`}
        >
          <div className="text-sm">{day}</div>
          {hasSlots && (
            <div className="text-xs mt-1">
              {availability[dateStr]} {availability[dateStr] === 1 ? 'slot' : 'slots'}
            </div>
          )}
        </button>
      )
    }

    return days
  }

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">📅 Selecione uma Data</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="mb-6">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
            <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            ⏰ Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR')}
          </h3>

          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Carregando horários...</p>
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map(time => (
                <button
                  key={time}
                  onClick={() => handleSelectSlot(time)}
                  className={`p-3 rounded-lg font-semibold transition ${
                    selectedSlot === time
                      ? 'bg-green-600 text-white border-2 border-green-700'
                      : 'bg-green-50 text-green-700 border-2 border-green-300 hover:bg-green-100'
                  }`}
                >
                  <Clock size={16} className="inline mr-2" />
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Nenhum horário disponível</p>
            </div>
          )}

          {selectedSlot && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <Check size={20} />
                <span>
                  Agendamento selecionado: {selectedDate.toLocaleDateString('pt-BR')} às {selectedSlot}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

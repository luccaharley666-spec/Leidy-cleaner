import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const CalendarBooking = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({
    // Simulação de horários ocupados
    '2024-01-15': ['09:00', '14:00'],
    '2024-01-16': ['10:00', '15:00'],
    '2024-01-17': ['08:00', '16:00']
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Adicionar dias vazios no início
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateBooked = (date) => {
    const dateKey = formatDateKey(date);
    return bookedSlots[dateKey] && bookedSlots[dateKey].length >= timeSlots.length;
  };

  const isTimeSlotBooked = (date, time) => {
    const dateKey = formatDateKey(date);
    return bookedSlots[dateKey] && bookedSlots[dateKey].includes(time);
  };

  const handleDateClick = (date) => {
    if (!date || isDateBooked(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => {
    if (!selectedDate || isTimeSlotBooked(selectedDate, time)) return;
    setSelectedTime(time);
    onDateSelect?.({ date: selectedDate, time });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          📅 Escolha a Data e Horário
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione uma data disponível e horário preferido
        </p>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          ←
        </button>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h4>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}

        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            disabled={!date || isDateBooked(date)}
            className={`
              p-3 text-sm rounded-lg transition-all relative
              ${!date
                ? 'invisible'
                : isDateBooked(date)
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-not-allowed'
                  : selectedDate && date && selectedDate.toDateString() === date.toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white'
              }
            `}
          >
            {date && date.getDate()}
            {date && isDateBooked(date) && (
              <XCircleIcon className="w-3 h-3 absolute top-1 right-1 text-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 dark:border-slate-600 pt-4"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR')}
          </h4>

          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(time => (
              <button
                key={time}
                onClick={() => handleTimeClick(time)}
                disabled={isTimeSlotBooked(selectedDate, time)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-sm font-medium
                  ${isTimeSlotBooked(selectedDate, time)
                    ? 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-not-allowed'
                    : selectedTime === time
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{time}</span>
                  {isTimeSlotBooked(selectedDate, time) ? (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  ) : selectedTime === time ? (
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Selected Date/Time Summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-semibold">
              Agendamento selecionado: {selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}
            </span>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 dark:bg-slate-600 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700"></div>
          <span>Indisponível</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarBooking;
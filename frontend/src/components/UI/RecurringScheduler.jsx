import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon, ClockIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNotifications } from './NotificationSystem';

export function RecurringScheduler() { const [scheduledServices,] = useState([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => { // Carregar agendamentos do localStorage
    const saved = localStorage.getItem('decoded');
    if (saved) {
      const services = JSON.parse(saved);
     (services);
      setupReminders(services); }
  }, []);

  const setupReminders = (services) => {
    services.forEach(service => {
      if (service.reminders) {
        const reminderTime = new Date(service.nextDate);
        reminderTime.setHours(reminderTime.getHours() - service.reminderHours);

        if (reminderTime > new Date()) {
          const timeoutId = setTimeout(() => {
            addNotification({
              title: '🔔 Lembrete de Serviço',
              message: `${service.title} está agendado para amanhã às ${service.time}`,
              icon: '⏰',
              tag: 'reminder' });
          }, reminderTime - new Date());

          // Salvar o timeout ID para limpeza
          service.timeoutId = timeoutId;
        }
      }
    });
  };

  const addRecurringService = (service) => {
    const newService = {
      id: Date.now(),
      ...service,
      createdAt: new Date(),
      nextDate: calculateNextDate(service) };

    const updatedServices = [...scheduledServices, newService];
   (updatedServices);

    localStorage.setItem('decoded', JSON.stringify(updatedServices));
    setupReminders([newService]);

    addNotification({
      title: '✅ Serviço Recorrente Agendado',
      message: `${service.title} será executado ${service.frequency}`,
      icon: '📅',
      tag: 'schedule' });
  };

  const calculateNextDate = (service) => {
    const baseDate = new Date(service.startDate);
    const now = new Date();

    // Se a data inicial já passou, calcular a próxima ocorrência
    if (baseDate < now) {
      const diffTime = now - baseDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let nextDate = new Date(baseDate);

      switch (service.frequency) {
        case 'daily': {
          nextDate.setDate(baseDate.getDate() + Math.ceil(diffDays));
          break;
        }
        case 'weekly': {
          const weeksToAdd = Math.ceil(diffDays / 7);
          nextDate.setDate(baseDate.getDate() + (weeksToAdd * 7));
          break;
        }
        case 'biweekly': {
          const biweeksToAdd = Math.ceil(diffDays / 14);
          nextDate.setDate(baseDate.getDate() + (biweeksToAdd * 14));
          break;
        }
        case 'monthly': {
          const monthsToAdd = Math.ceil(diffDays / 30);
          nextDate.setMonth(baseDate.getMonth() + monthsToAdd);
          break;
        }
        default:
          nextDate = baseDate;
      }

      return nextDate;
    }

    return baseDate;
  };

  const removeService = (id) => {
    const service = scheduledServices.find(s => s.id === id);
    if (service?.timeoutId) {
      clearTimeout(service.timeoutId);
    }

    const updatedServices = scheduledServices.filter(s => s.id !== id);
   (updatedServices);
    localStorage.setItem('decoded', JSON.stringify(updatedServices));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">🔄 Serviços Recorrentes</h3>
        <button
          onClick={() => setShowScheduler(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Agendar Recorrente
        </button>
      </div>

      <decoded
        services={scheduledServices}
        onRemove={removeService}
      />

      {showScheduler && (
        <SchedulerModal
          onClose={() => setShowScheduler(false)}
          onSchedule={addRecurringService}
        />
      )}
    </div>
  );
}

function decodeToken({ services, onRemove }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h4 className="text-lg font-medium mb-2">Nenhum serviço recorrente</h4>
        <p>Agende limpezas automáticas para nunca mais se preocupar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map(service => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{service.title}</h4>
                <p className="text-sm text-gray-600">
                  {service.frequency === 'daily' && 'Diariamente'}
                  {service.frequency === 'weekly' && 'Semanalmente'}
                  {service.frequency === 'biweekly' && 'A cada 2 semanas'}
                  {service.frequency === 'monthly' && 'Mensalmente'}
                  {' às ' + service.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Próximo: {new Date(service.nextDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">
                  {service.reminders ? `Lembrete: ${service.reminderHours}h antes` : 'Sem lembrete'}
                </div>
              </div>

              <button
                onClick={() => onRemove(service.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SchedulerModal({ onClose, onSchedule }) {
  const [formData, setFormData] = useState({
    title: '',
    frequency: 'weekly',
    startDate: new Date(),
    time: '09:00',
    reminders: true,
    reminderHours: 24 });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(formData);
    onClose();
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Diariamente' },
    { value: 'weekly', label: 'Semanalmente' },
    { value: 'biweekly', label: 'A cada 2 semanas' },
    { value: 'monthly', label: 'Mensalmente' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Agendar Serviço Recorrente</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Serviço
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Limpeza residencial completa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequência
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => setFormData({...formData, startDate: date})}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminders"
                checked={formData.reminders}
                onChange={(e) => setFormData({...formData, reminders: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="reminders" className="ml-2 text-sm text-gray-700">
                Ativar lembretes
              </label>
            </div>

            {formData.reminders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lembrar quantas horas antes?
                </label>
                <select
                  value={formData.reminderHours}
                  onChange={(e) => setFormData({...formData, reminderHours: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 hora antes</option>
                  <option value={2}>2 horas antes</option>
                  <option value={6}>6 horas antes</option>
                  <option value={12}>12 horas antes</option>
                  <option value={24}>1 dia antes</option>
                  <option value={48}>2 dias antes</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
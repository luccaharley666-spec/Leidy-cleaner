/**
 * [REDACTED_TOKEN].jsx
 * User notification preferences component
 */

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { apiCall } from '@/config/api';

export default function [REDACTED_TOKEN]() {
  const { user } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    sms_enabled: false,
    whatsapp_enabled: false,
    push_enabled: true,
    reminder_2days: true,
    reminder_1day: true,
    reminder_1hour: false,
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.id) return;
    try {
      const data = await apiCall(`/api/notifications/preferences/${user.id}`);
      setPreferences(data);
    } catch (err) {
    }
  };

  const handleToggle = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePhoneChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      phone_number: e.target.value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await apiCall(`/api/notifications/preferences/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
      setMessage('✅ Preferências salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (type) => {
    setTesting(true);
    try {
      await apiCall('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, type })
      });
      setMessage(`✅ ${type.toUpperCase()} de teste enviado!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erro ao enviar: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        ⚙️ Configurações de Notificações
      </h2>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Canais de Notificação */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📬 Canais de Notificação</h3>

        {/* Email */}
        <div className="mb-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_enabled}
                onChange={() => handleToggle('email_enabled')}
                className="w-4 h-4 mr-2"
              />
              <span className="font-medium text-gray-900 dark:text-white">📧 Email</span>
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">Receber confirmações e lembretes por email</p>
          </div>
          <button
            onClick={() => handleSendTest('email')}
            disabled={!preferences.email_enabled || testing}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Testar
          </button>
        </div>

        {/* SMS */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <label className="flex items-center cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={preferences.sms_enabled}
              onChange={() => handleToggle('sms_enabled')}
              className="w-4 h-4 mr-2"
            />
            <span className="font-medium text-gray-900 dark:text-white">📱 SMS</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 mb-2">Receber lembretes por SMS</p>

          {preferences.sms_enabled && (
            <div className="ml-6">
              <input
                type="tel"
                placeholder="+55 51 98030-3740"
                value={preferences.phone_number || ''}
                onChange={handlePhoneChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white mb-2"
              />
              <button
                onClick={() => handleSendTest('sms')}
                disabled={!preferences.phone_number || testing}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Testar SMS
              </button>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <label className="flex items-center cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={preferences.whatsapp_enabled}
              onChange={() => handleToggle('whatsapp_enabled')}
              className="w-4 h-4 mr-2"
            />
            <span className="font-medium text-gray-900 dark:text-white">💬 WhatsApp</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6 mb-2">Receber notificações via WhatsApp</p>

          {preferences.whatsapp_enabled && (
            <div className="ml-6">
              <input
                type="tel"
                placeholder="+55 51 98030-3740"
                value={preferences.phone_number || ''}
                onChange={handlePhoneChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white mb-2"
              />
              <button
                onClick={() => handleSendTest('whatsapp')}
                disabled={!preferences.phone_number || testing}
                className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Testar WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Push */}
        <div className="mb-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.push_enabled}
                onChange={() => handleToggle('push_enabled')}
                className="w-4 h-4 mr-2"
              />
              <span className="font-medium text-gray-900 dark:text-white">🔔 Notificações Push</span>
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">Receber notificações no navegador</p>
          </div>
        </div>
      </div>

      {/* Tempo de Lembretes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">⏰ Quando Receber Lembretes?</h3>

        <label className="flex items-center mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.reminder_2days}
            onChange={() => handleToggle('reminder_2days')}
            className="w-4 h-4 mr-3"
          />
          <span className="text-gray-900 dark:text-white">2 dias antes</span>
        </label>

        <label className="flex items-center mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.reminder_1day}
            onChange={() => handleToggle('reminder_1day')}
            className="w-4 h-4 mr-3"
          />
          <span className="text-gray-900 dark:text-white">1 dia antes</span>
        </label>

        <label className="flex items-center mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.reminder_1hour}
            onChange={() => handleToggle('reminder_1hour')}
            className="w-4 h-4 mr-3"
          />
          <span className="text-gray-900 dark:text-white">1 hora antes</span>
        </label>
      </div>

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '⏳ Salvando...' : '💾 Salvar Preferências'}
      </button>

      {/* Dica */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Dica:</strong> Recomendamos ativar pelo menos WhatsApp para reduzir "no-shows". 
          Lembretes automáticos reduzem ausências em 90%!
        </p>
      </div>
    </div>
  );
}

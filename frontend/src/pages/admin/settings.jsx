/**
 * Admin Settings Page
 * Configuração de parâmetros gerais do sistema
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const PushManager = dynamic(() => import('../../components/Notifications/PushManager'), { ssr: false });

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: 'Leidy Cleaner',
    company_email: 'contato@leidycleaner.com.br',
    company_phone: '(11) 98765-4321',
    support_email: 'suporte@leidycleaner.com.br',
    website_url: 'https://leidycleaner.com.br',
    
    // Horários
    business_hours_start: '08:00',
    business_hours_end: '18:00',
    timezone: 'America/Sao_Paulo',
    
    // Preços
    base_price: 100.00,
    price_per_hour: 50.00,
    minimum_service_time: 2,
    
    // Configurações de notificação
    notify_admin_new_booking: true,
    notify_customer_confirmation: true,
    notify_professional_assignment: true,
    notify_customer_completion: true,
    
    // Configurações de pagamento
    commission_percentage: 30,
    min_withdrawal_amount: 50.00,
    payment_methods: ['pix', 'card'],
    
    // Termos e política
    require_terms_acceptance: true,
    terms_version: '1.0' });

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSettings(prev => ({ ...prev, ...result.data }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Configurações do Sistema - Admin</title>
        <meta name="description" content="Configurações gerais do sistema" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <PushManager />

        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              ⚙️ Configurações do Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie as configurações gerais da plataforma
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'company', label: '🏢 Empresa' },
                { id: 'hours', label: '⏰ Horários' },
                { id: 'pricing', label: '💰 Preços' },
                { id: 'notifications', label: '🔔 Notificações' },
                { id: 'payments', label: '💳 Pagamentos' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                    localStorage.getItem('admin-settings-tab') === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => {
                    localStorage.setItem('admin-settings-tab', tab.id);
                    window.location.href = `#${tab.id}`;
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Empresa */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">🏢 Informações da Empresa</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={settings.company_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="company_email"
                      value={settings.company_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="company_phone"
                      value={settings.company_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email de Suporte
                    </label>
                    <input
                      type="email"
                      name="support_email"
                      value={settings.support_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website_url"
                      value={settings.website_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="America/Sao_Paulo">America/São Paulo</option>
                      <option value="America/Rio_Branco">America/Rio Branco</option>
                      <option value="America/Manaus">America/Manaus</option>
                      <option value="America/Recife">America/Recife</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Horários */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">⏰ Horários de Funcionamento</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horário de Abertura
                    </label>
                    <input
                      type="time"
                      name="business_hours_start"
                      value={settings.business_hours_start}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horário de Fechamento
                    </label>
                    <input
                      type="time"
                      name="business_hours_end"
                      value={settings.business_hours_end}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Preços */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">💰 Configuração de Preços</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preço Base (R$)
                    </label>
                    <input
                      type="number"
                      name="base_price"
                      value={settings.base_price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preço por Hora (R$)
                    </label>
                    <input
                      type="number"
                      name="price_per_hour"
                      value={settings.price_per_hour}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tempo Mínimo de Serviço (horas)
                    </label>
                    <input
                      type="number"
                      name="minimum_service_time"
                      value={settings.minimum_service_time}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comissão para Profissional (%)
                    </label>
                    <input
                      type="number"
                      name="commission_percentage"
                      value={settings.commission_percentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Notificações */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔔 Configurações de Notificação</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_admin_new_booking"
                      checked={settings.notify_admin_new_booking}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Notificar admin de novo agendamento</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_customer_confirmation"
                      checked={settings.notify_customer_confirmation}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Notificar cliente de confirmação</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_professional_assignment"
                      checked={settings.notify_professional_assignment}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Notificar profissional de atribuição</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notify_customer_completion"
                      checked={settings.notify_customer_completion}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Notificar cliente de conclusão</span>
                  </label>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Pagamentos */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">💳 Configurações de Pagamento</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor Mínimo para Saque (R$)
                    </label>
                    <input
                      type="number"
                      name="min_withdrawal_amount"
                      value={settings.min_withdrawal_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Métodos de Pagamento
                    </label>
                    <div className="flex gap-4 mt-2">
                      {['pix', 'card'].map(method => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.payment_methods?.includes(method) || false}
                            onChange={(e) => {
                              const methods = settings.payment_methods || [];
                              if (e.target.checked) {
                                setSettings(prev => ({
                                  ...prev,
                                  payment_methods: [...methods, method]
                                }));
                              } else {
                                setSettings(prev => ({
                                  ...prev,
                                  payment_methods: methods.filter(m => m !== method)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300 capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Términos */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">📋 Termos e Políticas</h2>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="require_terms_acceptance"
                    checked={settings.require_terms_acceptance}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Exigir aceita de termos na régistro</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Versão dos Termos
                  </label>
                  <input
                    type="text"
                    name="terms_version"
                    value={settings.terms_version}
                    onChange={handleInputChange}
                    placeholder="1.0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer with Save Button */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => fetchSettings()}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
              >
                {saving ? 'Salvando...' : '💾 Salvar Configurações'}
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

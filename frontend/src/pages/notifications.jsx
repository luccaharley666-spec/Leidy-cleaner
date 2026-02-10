/**
 * pages/notifications.jsx
 * Notification settings and history page
 */

import React, { useState, useContext } from 'react';
import Head from 'next/head';
import { AuthContext } from '@/context/AuthContext';
import [REDACTED_TOKEN] from '@/components/[REDACTED_TOKEN]';

export default function NotificationsPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('preferences');

  if (!user) {
    return <div className="p-4 text-center">⏳ Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Notificações - Leidy Cleaner</title>
        <meta name="description" content="Gerenciar preferências de notificação" />
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🔔 Central de Notificações
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personalize como você gostaria de receber lembretes sobre agendamentos
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ⚙️ Preferências
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'help'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ❓ Como Funciona
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'preferences' && <[REDACTED_TOKEN] />}

            {activeTab === 'help' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      📧 Email
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Receba confirmação de agendamento e lembretes por email. Ideal para manter um registro.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ✓ Confirmação imediata após agendamento<br/>
                      ✓ Lembretes 2 dias, 1 dia antes<br/>
                      ✓ Resumo da semana
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      💬 WhatsApp
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Receba mensagens rápidas e diretas via WhatsApp. A melhor forma para lembretes automáticos.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ✓ Lembretes instantâneos<br/>
                      ✓ Fácil de confirmar pelo app<br/>
                      ✓ Reduz ausências em 90%<br/>
                      ⚠️ Requer número de telefone atualizado
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      📱 SMS
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Receba mensagens de texto simples. Funciona em qualquer aparelho.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ✓ Chega sempre (mesmo sem internet)<br/>
                      ✓ Número exibido claramente<br/>
                      ⚠️ Requer número de telefone atualizado
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      🔔 Notificações Push
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Receba notificações no navegador (se tiver ativado).
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ✓ Rápida e discreta<br/>
                      ✓ Funciona em smartphone<br/>
                      ⚠️ Requer permissão no navegador
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-4">
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                      ⚠️ Importante
                    </h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                      <li>✓ Mantenha seu número de telefone atualizado para receber SMS/WhatsApp</li>
                      <li>✓ Confirme seu email para receber confirmações</li>
                      <li>✓ Ative lembretes para reduzir a chance de esquecer agendamentos</li>
                      <li>✓ Qualquer dúvida, entre em contato pelo Chat</li>
                    </ul>
                  </div>

                  {/* FAQ */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      ❓ Perguntas Frequentes
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          Como mudo meu telefone para SMS/WhatsApp?
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Na seção de preferências, ative SMS ou WhatsApp e insira seu novo número. 
                          Recomendamos usar formato internacional: +55 51 98030-3740
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          Posso receber lembretes em horários específicos?
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Sim! Você pode escolher receber lembretes 2 dias antes, 1 dia antes ou 1 hora antes 
                          do agendamento.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          E se eu nunca confirmar o agendamento?
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Os lembretes são informativos - você não precisa confirmar. A equipe chegará no 
                          horário agendado. Confirmar é apenas para sua conveniência.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          Como posso desabilitar notificações completamente?
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Desative todos os canais na seção "Canais de Notificação". Mesmo sem notificações, 
                          mantenha seu agendamento.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

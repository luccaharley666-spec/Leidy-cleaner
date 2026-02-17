/**
 * /pages/checkout.jsx
 * Página de checkout integrada com PixQRCodeCheckout
 * Suporta PIX, Cartão de Crédito e Boleto
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
// import PixQRCodeCheckout from '../components/Payment/PixQRCodeCheckout';
import CheckoutForm from '../components/Payments/CheckoutForm';
import LoyaltyPanel from '../components/Loyalty/LoyaltyPanel';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// const PushManager = dynamic(() => import('../components/Notifications/PushManager'), { ssr: false });

export default function CheckoutPage() {
  const router = useRouter();
  const { booking_id, amount, method = 'pix' } = router.query;
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(!!booking_id);

  // Se vier com booking_id, carrega dados do agendamento
  useEffect(() => {
    if (booking_id && booking_id !== 'undefined') {
      fetchBookingData();
    } else {
      setLoading(false);
    }
  }, [booking_id]);

  // Atualiza método de pagamento
  useEffect(() => {
    if (method && method !== 'undefined') {
      setPaymentMethod(method);
    }
  }, [method]);

  const fetchBookingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${booking_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setBookingData(result.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = bookingData?.total_price || (amount ? parseFloat(amount) : 120.00);

  return (
    <>
      <Head>
        <title>Checkout - Leidy Cleaner</title>
        <meta name="description" content="Finalize seu agendamento com segurança" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Checkout Seguro
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Escolha o método de pagamento e finalize seu agendamento
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods */}
              <div className="lg:col-span-2 space-y-6">
                {/* Method Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Método de Pagamento
                  </h2>

                  <div className="space-y-3">
                    {/* PIX */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === 'pix'
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment-method"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="ml-4">
                        <span className="block font-bold text-gray-900 dark:text-white">
                          💚 PIX (QR Code)
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Instantâneo - Escanear código QR com seu banco
                        </span>
                      </span>
                    </label>

                    {/* Credit Card */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment-method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="ml-4">
                        <span className="block font-bold text-gray-900 dark:text-white">
                          💳 Cartão de Crédito
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Parcelado em até 12x sem juros
                        </span>
                      </span>
                    </label>

                    {/* Boleto */}
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === 'boleto'
                        ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-yellow-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment-method"
                        value="boleto"
                        checked={paymentMethod === 'boleto'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="ml-4">
                        <span className="block font-bold text-gray-900 dark:text-white">
                          📄 Boleto Bancário
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Vencimento em 3 dias úteis
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Payment Component Based on Method */}
                {/* PixQRCodeCheckout desabilitado temporariamente */}

                {paymentMethod !== 'pix' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <CheckoutForm amount={finalAmount} method={paymentMethod} />
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Order Summary */}
                {bookingData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Resumo do Pedido
                    </h3>

                    <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Serviço</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {bookingData.service_type || 'Limpeza'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Data</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {bookingData.scheduled_date
                            ? new Date(bookingData.scheduled_date).toLocaleDateString('pt-BR')
                            : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Duração</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {bookingData.duration_hours || 2}h
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        R$ {finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Loyalty Panel */}
                {!bookingData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Valor do Pagamento
                    </h3>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      R$ {finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {bookingData && <LoyaltyPanel />}

                {/* Support */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    💬 Precisa de Ajuda?
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                    Fale com nosso suporte no WhatsApp
                  </p>
                  <a
                    href="https://wa.me/5551980303740"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
                  >
                    Abrir Chat
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>

        <div className="mt-4">
          {/* PushManager desabilitado temporariamente */}
        </div>

        <Footer />
      </div>
    </>
  );
}

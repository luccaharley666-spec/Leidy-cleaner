// TEMPORARILY DISABLED:
// TEMPORARILY DISABLED:
/**
 * PixQRCodeCheckout.jsx
 * Componente para exibir QR Code PIX e confirmar pagamento
 * 
 * Features:
 * - Exibe QR Code gerado no backend
 * - Timer debounce (10 minutos)
 * - Polling de status (a cada 5 segundos)
 * - 3 estados: Aguardando → Recebido → Confirmado
 * - Cópia do código PIX para clipboard
 * - Dark mode support
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function PixQRCodeCheckout({ bookingId, amount, orderId }) {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('waiting'); // waiting | received | confirmed | expired
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos = 600 segundos
  const [copied, setCopied] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);

  // Buscar dados de pagamento (QR Code)
  useEffect(() => {
    fetchPaymentData();
  }, [bookingId]);

  // Timer debounce (10 minutos)
  useEffect(() => {
    if (!pollingActive || status === 'confirmed') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('expired');
          setPollingActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pollingActive, status]);

  // Polling de status (a cada 5 segundos)
  useEffect(() => {
    if (!pollingActive || !paymentData?.transactionId) return;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pix/status/${paymentData.transactionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const result = await response.json();
        if (result.data?.status === 'confirmed') {
          setStatus('confirmed');
          setPollingActive(false);
        } else if (result.data?.status === 'received') {
          setStatus('received');
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pollingActive, paymentData?.transactionId]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/pix/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId, amount, orderId })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPaymentData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Erro ao gerar QR Code');
      }
    } catch (err) {
      console.error('Erro ao buscar dados de pagamento:', err);
      setError(err.message);
      setPollingActive(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const pixCode = paymentData?.brCode || paymentData?.qrCode;
      if (pixCode) {
        await navigator.clipboard.writeText(pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 dark:text-green-400';
      case 'received':
        return 'text-blue-600 dark:text-blue-400';
      case 'waiting':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'confirmed':
        return '✅ Pagamento Confirmado!';
      case 'received':
        return '✓ Pagamento Recebido';
      case 'waiting':
        return '⏳ Aguardando Pagamento';
      case 'expired':
        return '❌ QR Code Expirado';
      default:
        return 'Carregando...';
    }
  };

  return (
    <>
      <Head>
        <title>Checkout PIX - Leidy Cleaner</title>
        <meta name="description" content="Finalize seu pagamento com PIX" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Gerando QR Code...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg shadow-xl p-6">
              <h3 className="text-red-800 dark:text-red-100 font-bold mb-2">Erro ao Gerar QR Code</h3>
              <p className="text-red-700 dark:text-red-200 text-sm mb-4">{error}</p>
              <button
                onClick={fetchPaymentData}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Payment Card */}
          {!loading && !error && paymentData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Pagamento com PIX</h1>
                <p className="text-green-100">Escaneie o código abaixo</p>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Amount */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Valor a Pagar</p>
                  <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                    R$ { amount?.toLocaleString('pt-BR', {: 2 })}
                  </p>
                </div>

                {/* QR Code */}
                <div className={`relative bg-white dark:bg-gray-700 rounded-lg p-4 mb-6 ${
                  status === 'expired' ? 'opacity-50' : ''
                }`}>
                  {/* QR Code Image */}
                  {paymentData?.qrCodeImage ? (
                    <div className="text-center">
                      <img
                        src={paymentData.qrCodeImage}
                        alt="PIX QR Code"
                        className="w-full max-w-xs mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">QR Code indisponível</p>
                    </div>
                  )}

                  {/* Expired Overlay */}
                  {status === 'expired' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-700 dark:text-red-300 font-bold text-lg">EXPIRADO</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PIX Code Copy */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ou copie o código PIX:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentData?.brCode || ''}
                      readOnly
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm font-mono border border-gray-300 dark:border-gray-600 focus:border-green-500"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 py-2 rounded font-semibold transition ${
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {copied ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className={`text-center py-4 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 mb-6 ${getStatusColor()}`}>
                  <p className="font-semibold text-lg mb-2">{getStatusText()}</p>
                  {status !== 'expired' && status !== 'confirmed' && (
                    <p className="text-sm">
                      Expira em: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </p>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📱 Como Pagar:</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Abra seu app de banco</li>
                    <li>2. Selecione PIX → QR Code</li>
                    <li>3. Escaneie a imagem acima</li>
                    <li>4. Confirme o valor e envie</li>
                  </ol>
                </div>

                {/* Buttons */}
                {status === 'confirmed' ? (
                  <button
                    onClick={() => {
                      localStorage.removeItem('pendingBooking');
                      window.location.href = '/confirmacao';
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition text-lg"
                  >
                    ✓ Ir para Confirmação
                  </button>
                ) : status === 'expired' ? (
                  <button
                    onClick={fetchPaymentData}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition"
                  >
                    Gerar Novo QR Code
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                  >
                    ⏳ Aguardando Confirmação...
                  </button>
                )}

                {/* Additional Info */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                  ID da Transação: <span className="font-mono">{paymentData?.transactionId}</span>
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-8 py-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  💡 Dúvida? Entre em contato com nosso suporte
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

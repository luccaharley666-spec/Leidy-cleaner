import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';

const PaymentSystem = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [pixCode, setPixCode] = useState('');

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      icon: CreditCardIcon,
      description: 'Visa, Mastercard, Elo'
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: ShieldCheckIcon,
      description: 'Pagamento instantâneo'
    },
    {
      id: 'bank_transfer',
      name: 'Transferência',
      icon: TruckIcon,
      description: 'Para pagamentos maiores'
    }
  ];

  const generatePixCode = () => { // Simulação de código PIX
    const code = `00020126580014BR.GOV.BCB.decoded.COM.decoded${amount.toFixed(2).replace('.', '') }5802BR5913Leidy Cleaner6009SAO PAULO62070503***6304`;
    setPixCode(code);
  };

  const handleCardPayment = async () => {
    setIsProcessing(true);

    // Simulação de processamento de pagamento
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simular taxa de aprovação de 95%
      if (Math.random() > 0.05) {
        onPaymentSuccess({
          method: 'credit_card',
          transactionId: `TXN_${Date.now()}`,
          amount: amount,
          status: 'approved'
        });
      } else {
        throw new Error('Cartão recusado');
      }
    } catch (error) {
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePixPayment = () => {
    generatePixCode();
    // Em produção, aqui seria integrada com API do banco
    setTimeout(() => {
      onPaymentSuccess({
        method: 'pix',
        transactionId: `PIX_${Date.now()}`,
        amount: amount,
        status: 'approved'
      });
    }, 5000); // Simular tempo de confirmação PIX
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          💳 Pagamento Seguro
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Total: <span className="font-bold text-green-600">R$ {amount.toFixed(2)}</span>
        </p>
      </div>

      {/* Método de Pagamento */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Método de Pagamento
        </h4>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                paymentMethod === method.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <method.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de Cartão */}
      {paymentMethod === 'credit_card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número do Cartão
            </label>
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Validade
              </label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                placeholder="MM/AA"
                maxLength="5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/[^0-9]/g, '')})}
                placeholder="123"
                maxLength="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome no Cartão
            </label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData({...cardData, name: e.target.value})}
              placeholder="João Silva"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <button
            onClick={handleCardPayment}
            disabled={isProcessing || !cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            { isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white rounded-full animate-spin"></div>
                Processando...
              </div>
            ) : (
              `Pagar R$ ${amount.toFixed(2) }`
            )}
          </button>
        </motion.div>
      )}

      {/* PIX */}
      {paymentMethod === 'pix' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-center space-y-4"
        >
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Pagamento via PIX
            </p>
            <p className="text-green-600 dark:text-green-300 text-sm">
              Instantâneo e sem taxas
            </p>
          </div>

          {!pixCode ? (
            <button
              onClick={handlePixPayment}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              Gerar Código PIX
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Código PIX gerado:
                </p>
                <p className="text-xs font-mono break-all text-gray-900 dark:text-white">
                  {pixCode}
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Abra seu app bancário e escaneie o QR Code ou copie o código acima
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Transferência Bancária */}
      {paymentMethod === 'bank_transfer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Dados para Transferência
            </h4>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p><strong>Banco:</strong> Itaú (341)</p>
              <p><strong>Agência:</strong> 1234</p>
              <p><strong>Conta:</strong> 56789-0</p>
              <p><strong>Titular:</strong> Leidy Cleaner Ltda</p>
              <p><strong>CNPJ:</strong> 12.345.678/0001-90</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Importante:</strong> Após a transferência, envie o comprovante para nosso WhatsApp para confirmação.
            </p>
          </div>

          <button
            onClick={() => onPaymentSuccess({
              method: 'bank_transfer',
              transactionId: `BANK_${Date.now()}`,
              amount: amount,
              status: 'pending'
            })}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Confirmar Transferência
          </button>
        </motion.div>
      )}

      {/* Segurança */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Pagamento 100% seguro</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;
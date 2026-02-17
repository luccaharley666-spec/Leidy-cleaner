/**
 * CheckoutModal.jsx
 * Modal de checkout com Stripe - Cartão de Crédito
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function CheckoutModal({ bookingId, amount, onSuccess, onClose }) { const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);

  useEffect(() => {
    // Carregar Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      const stripeInstance = window.Stripe(process.env.decoded);
      setStripe(stripeInstance); };
    document.body.appendChild(script);
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Criar payment intent
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount, bookingId })
      });

      const intentData = await intentRes.json();
      if (!intentData.success) throw new Error(intentData.error);

      // 2. Confirmar pagamento com Stripe
      const cardInput = document.getElementById('card-element');
      const result = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: cardInput,
          billing_details: {
            name: localStorage.getItem('userName') || 'Cliente'
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // 3. Confirmar no backend
      const confirmRes = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId: result.paymentIntent.id,
          bookingId,
          amount,
          method: 'card'
        })
      });

      const confirmData = await confirmRes.json();
      if (!confirmData.success) throw new Error(confirmData.error);

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-8">
        <h2 className="text-2xl font-bold mb-6">💳 Pagamento Seguro</h2>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-600">Pagamento realizado com sucesso!</h3>
            <p className="text-gray-600 mt-2">Seu agendamento foi confirmado.</p>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-4">
            {/* Valor */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              <p className="text-sm text-gray-600">Total a pagar</p>
              <p className="text-3xl font-bold text-gray-800">
                R$ {amount.toFixed(2)}
              </p>
            </div>

            {/* Card Element */}
            <div>
              <label className="block text-sm font-bold mb-2">Dados do Cartão</label>
              <div
                id="card-element"
                className="border-2 border-gray-300 rounded-lg p-4 bg-white"
                style={{
                  base: {
                    fontSize: '16px',
                    color: '#424770'
                  },
                  invalid: {
                    color: '#fa755a'
                  }
                }}
              />
            </div>

            {/* Erros */}
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Pagar R$ ${amount.toFixed(2)}`
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Pagamento protegido pelo Stripe. Seus dados estão seguros.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

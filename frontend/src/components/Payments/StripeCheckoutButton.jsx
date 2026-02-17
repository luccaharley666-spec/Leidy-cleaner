'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/js';

/**
 * StripeCheckoutButton Component
 * Inicia checkout via Stripe para pagamento por booking
 * Props: bookingId (string), amount (number em reais)
 */
const StripeCheckoutButton = ({ bookingId, amount }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Buscar session ID do backend
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setError('Você precisa estar logado');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: amount }) });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Erro ao criar sessão de checkout');
        setLoading(false);
        return;
      }

      // 2. Redirecionar para Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

      if (!stripe) {
        setError('Erro ao carregar Stripe');
        setLoading(false);
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId });

      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao processar pagamento');
    }

    setLoading(false);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
      >
        {loading ? '⏳ Processando...' : `💰 Pagar R$ ${amount?.toFixed(2) || '0.00'}`}
      </button>
    </div>
  );
};

export default StripeCheckoutButton;

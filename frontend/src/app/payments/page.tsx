"use client";

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PaymentsPage() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Processando (placeholder)...');
    // Here you'd call backend to create payment intent and redirect to gateway
    setTimeout(() => setMessage('Pagamento (simulado) concluído.'), 900);
  };

  return (
    <ProtectedRoute role="customer">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Pagamentos</h1>
        <p className="mb-4 text-gray-600">Sistema de pagamento - Stripe/PayPal (placeholder)</p>
        <form onSubmit={handlePay} className="space-y-3 bg-white p-4 rounded shadow">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)" className="w-full border p-2 rounded" />
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700">Pagar (simulado)</button>
        </form>
        {message && <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">{message}</div>}
      </div>
    </ProtectedRoute>
  );
}

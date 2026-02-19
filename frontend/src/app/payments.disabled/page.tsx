"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, Booking } from '@/services/api';
import { redirectTo } from '@/utils/navigation';

export default function PaymentsPage() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId') || undefined;
  const router = useRouter();

  useEffect(() => {
    if (bookingId) {
      apiClient.getBookingById(bookingId)
        .then((b) => setBooking(b))
        .catch(() => setMessage('Não foi possível carregar o agendamento'));
    }
  }, [bookingId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingId) {
      setMessage('Processando pagamento...');
      try {
        const res = await apiClient.createCheckoutSession(bookingId);
        if (res.url) {
          // redirect to Stripe checkout
          redirectTo(res.url);
        } else {
          setMessage('Pagamento confirmado!');
          router.push(`/bookings/${bookingId}`);
        }
      } catch (err: any) {
        setMessage(err.message || 'Erro no pagamento');
      }
      return;
    }

    setMessage('Processando (placeholder)...');
    setTimeout(() => setMessage('Pagamento (simulado) concluído.'), 900);
  };

  return (
    <ProtectedRoute role="customer">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Pagamentos</h1>
        <p className="mb-4 text-gray-600">Sistema de pagamento - Stripe/PayPal (placeholder)</p>
        {booking && (
          <div className="mb-4 p-3 border rounded bg-gray-50">
            <p><strong>Agendamento:</strong> {booking.id}</p>
            <p><strong>Serviço:</strong> {booking.serviceName || booking.serviceId}</p>
            <p><strong>Preço:</strong> R$ {booking.totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> {booking.status}</p>
          </div>
        )}
        <form onSubmit={handlePay} className="space-y-3 bg-white p-4 rounded shadow">
          {!booking && (
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)" className="w-full border p-2 rounded" />
          )}
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700">
            {booking ? 'Pagar agendamento' : 'Pagar (simulado)'}
          </button>
        </form>
        {message && <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">{message}</div>}
      </div>
    </ProtectedRoute>
  );
}

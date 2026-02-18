"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../services/api';
import CalendarPlaceholder from '@/components/CalendarPlaceholder';

export default function NewBookingClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();

  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
      // client-side validation
      try {
        const v = require('@/utils/validators');
        const err = v.validateBooking({ bookingDate: date, address, notes });
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }
      } catch (_) {
        // ignore
      }
    try {
      await apiClient.client.post('/bookings', {
        serviceId,
        bookingDate: date,
        address,
        notes,
        totalPrice: 0,
      });
      router.push('/bookings');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Novo Agendamento</h2>
      {error && <div className="bg-red-100 text-red-800 p-2 mb-4">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <label className="block">Escolha uma data e horário</label>
        <CalendarPlaceholder value={date} onChange={setDate} />

        <label className="block">Endereço</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded" />
        <label className="block">Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded" />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Agendar</button>
      </form>
    </div>
  );
}

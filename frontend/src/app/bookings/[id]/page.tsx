"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, Booking } from '@/services/api';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (!params?.id) return;
    apiClient.getBookingById(params.id as string)
      .then(setBooking)
      .catch(() => setError('Agendamento não encontrado'))
      .finally(() => setLoading(false));
  }, [params]);

  const handleCancel = async () => {
    if (!booking) return;
    setCanceling(true);
    setCancelError('');
    try {
      await apiClient.updateBookingStatus(booking.id, 'cancelled');
      setBooking({ ...booking, status: 'cancelled' });
    } catch (err: any) {
      setCancelError(err.message || 'Erro ao cancelar agendamento');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;
  if (!booking) return <div>Agendamento não encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-2">Detalhes do Agendamento</h1>
      <div className="mb-2"><strong>Serviço:</strong> {booking.serviceName || booking.serviceId}</div>
      <div className="mb-2"><strong>Data:</strong> {new Date(booking.scheduledDate).toLocaleString()}</div>
      <div className="mb-2"><strong>Status:</strong> {booking.status}</div>
      {booking.address && <div className="mb-2"><strong>Endereço:</strong> {booking.address}</div>}
      {booking.notes && <div className="mb-2"><strong>Notas:</strong> {booking.notes}</div>}
      {booking.status !== 'cancelled' && (
        <button
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleCancel}
          disabled={canceling}
        >
          Cancelar Agendamento
        </button>
      )}
      {cancelError && <div className="mt-2 text-red-600">{cancelError}</div>}
      <button className="mt-4 ml-4 text-blue-600 underline" onClick={() => router.back()}>Voltar</button>
    </div>
  );
}"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, Booking, Review } from '@/services/api';
import ReviewForm from '@/components/ReviewForm';

export default function BookingDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiClient.getBookingById(id)
      .then((b) => setBooking(b))
      .catch((err) => setError(err.message || 'Erro ao carregar booking'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') {
      setSuccess('Pagamento realizado com sucesso!');
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    apiClient.getBookingReviews(id)
      .then((res) => {
        if (res.reviews.length > 0) {
          setReview(res.reviews[0]);
        }
      })
      .catch(() => {
        // ignore
      });
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  
  if (!booking) return <p>Booking não encontrado.</p>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2">Detalhes do Agendamento</h2>
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <p><strong>Serviço:</strong> {booking.serviceName || booking.serviceId}</p>
      <p><strong>Data:</strong> {new Date(booking.scheduledDate).toLocaleString()}</p>
      {booking.address && <p><strong>Endereço:</strong> {booking.address}</p>}
      {booking.notes && <p><strong>Notas:</strong> {booking.notes}</p>}
      <p><strong>Preço total:</strong> R$ {booking.totalPrice.toFixed(2)}</p>
      <p><strong>Status:</strong> {booking.status}</p>
      {booking.paymentStatus && <p><strong>Pagamento:</strong> {booking.paymentStatus}</p>}
      <p><strong>Criado em:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
      <div className="mt-4 space-x-2">
        {booking.status === 'pending' && (
          <a href={`/payments?bookingId=${booking.id}`} className="inline-block bg-green-600 text-white px-4 py-2 rounded">
            Pagar agora
          </a>
        )}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={async () => {
              try {
                await apiClient.client.delete(`/bookings/${booking.id}`);
                router.push('/bookings');
              } catch (err: any) {
                setError(err.message || 'Erro ao cancelar booking');
              }
            }}
            className="inline-block bg-red-500 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        )}
      </div>
      {/* review section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Avaliação</h3>
        {review ? (
          <div className="border p-3 rounded">
            <p className="font-semibold">{review.rating} ⭐</p>
            {review.comment && <p>"{review.comment}"</p>}
          </div>
        ) : booking.status === 'confirmed' || booking.status === 'completed' ? (
          <ReviewForm
            bookingId={booking.id}
            onSubmitted={(r) => setReview(r)}
          />
        ) : (
          <p>Você pode avaliar após o serviço ser confirmado.</p>
        )}
      </div>
    </div>
  );
}

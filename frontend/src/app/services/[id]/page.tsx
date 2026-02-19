"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, Service } from '@/services/api';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    apiClient.getServiceById(params.id as string)
      .then(setService)
      .catch(() => router.push('/services'))
      .finally(() => setLoading(false));
  }, [params, router]);

  if (loading) return <div>Carregando...</div>;
  if (!service) return <div>Serviço não encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
      <p className="mb-4 text-gray-700">{service.description}</p>
      <div className="mb-4">
        <span className="font-semibold">Preço:</span> R$ {service.basePrice}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Duração:</span> {service.durationMinutes} min
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => router.push(`/bookings/new?serviceId=${service.id}`)}
      >
        Agendar este serviço
      </button>
      <button
        className="ml-4 text-blue-600 underline"
        onClick={() => router.back()}
      >Voltar</button>
    </div>
  );
}"use client";

import React, { useEffect, useState } from 'react';
import { apiClient, Service } from '../../../services/api';
import { useRouter } from 'next/navigation';
import ReviewList from '@/components/ReviewList';

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const s = await apiClient.getServiceById(params.id);
        setService(s);
      try {
        const revs = await apiClient.getPublicReviews(params.id);
        setReviews(revs);
      } catch {
        // ignore
      }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <p>Carregando...</p>;
  if (!service) return <p>Serviço não encontrado</p>;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
      <p className="mb-4">{service.description}</p>
      <p className="font-semibold">Preço: R$ {service.basePrice}</p>
      <p className="text-sm text-gray-500 mb-4">Duração: {service.durationMinutes} minutos</p>
      {reviews.length > 0 && (
        <p className="mb-2">Avaliação média: {avgRating.toFixed(1)} ⭐ ({reviews.length} avaliações)</p>
      )}
      <button onClick={() => router.push(`/bookings/new?serviceId=${service.id}`)} className="bg-green-600 text-white px-4 py-2 rounded">Agendar</button>
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Avaliações</h3>
        {reviews.length > 0 ? (
          <ReviewList reviews={reviews} />
        ) : (
          <p>Sem avaliações ainda.</p>
        )}
      </div>
    </div>
  );
}

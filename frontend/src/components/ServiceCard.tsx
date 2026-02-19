import React from 'react';
import Link from 'next/link';
import { Service } from '../services/api';

export default function ServiceCard({
  service,
  rating,
  reviewCount,
}: {
  service: Service;
  rating?: number;
  reviewCount?: number;
}) {
  return (
    <div className="border rounded-lg p-4 shadow bg-white focus-within:ring-2 focus-within:ring-blue-600" tabIndex={0} aria-label={`Serviço: ${service.name}`}>
      {service.imageUrl && (
        <img src={service.imageUrl} alt={service.name} className="w-full h-40 object-cover rounded mb-3" loading="lazy" />
      )}
      <h3 className="text-lg font-semibold mb-2" aria-label="Nome do serviço">{service.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
      {rating !== undefined && (
        <p className="text-sm text-yellow-600 mb-2" aria-label="Avaliação">
          {rating.toFixed(1)} ⭐ ({reviewCount || 0})
        </p>
      )}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xl font-bold" aria-label="Preço">R$ {service.basePrice}</p>
          <p className="text-xs text-gray-500" aria-label="Duração">{service.durationMinutes} min</p>
        </div>
        <Link href={`/services/${service.id}`} className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600" aria-label="Ver detalhes do serviço">Detalhes</Link>
      </div>
    </div>
  );
}

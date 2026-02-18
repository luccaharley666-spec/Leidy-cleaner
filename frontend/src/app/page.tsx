"use client";

import React, { useEffect, useState } from 'react';
import { apiClient, Service } from '../services/api';
import ServiceCard from '@/components/ServiceCard';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getServices({ limit: 12 });
        setServices(res.services || []);
      } catch (err) {
        // console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <section className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-3">Limpeza Profissional que Você Merece</h1>
        <p className="text-lg">Serviços de limpeza para casa, escritório ou evento. Rápido, confiável e com qualidade garantida!</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold">Nossos Serviços</h2>
        <p className="text-gray-600">Escolha o serviço ideal e agende com facilidade:</p>
      </section>

      <section>
        {loading ? (
          <p>Carregando serviços...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

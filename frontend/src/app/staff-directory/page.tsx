"use client";

import React, { useEffect, useState } from 'react';
import { apiClient, User } from '@/services/api';
import Link from 'next/link';

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.getStaffList()
      .then(async (list) => {
        // fetch rating for each
        const withRatings = await Promise.all(
          list.map(async s => {
            try {
              const r = await apiClient.getStaffRating(s.id);
              return { ...s, rating: r };
            } catch {
              return { ...s, rating: null };
            }
          })
        );
        setStaff(withRatings as User[]);
      })
      .catch(err => setError(err.message || 'Erro ao carregar staff'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Equipe de Limpeza</h1>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && staff.length === 0 && <p>Nenhum funcionário encontrado.</p>}
      <ul className="space-y-4">
        {staff.map(s => (
          <li key={s.id} className="p-4 border rounded hover:shadow">
            <Link href={`/staff-profile/${s.id}`} className="flex items-center space-x-4">
              {s.photoUrl && <img src={s.photoUrl} alt={s.name} className="w-12 h-12 rounded-full object-cover" />}
              <div>
                <h2 className="font-semibold">{s.name}</h2>
                {s.bio && <p className="text-sm text-gray-600 truncate w-64">{s.bio}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

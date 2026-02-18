"use client";

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export default function CompanyPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.client.get('/company');
        setInfo(res.data.data || res.data);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  if (!info) return <p>Carregando...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sobre a Limpar Plus</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-blue-700">Quem Somos</h2>
        <p className="text-gray-700 mb-4">{info.description || info.about || 'Somos a Limpar Plus, especializada em serviços de limpeza profissional para residências, escritórios e eventos.'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-2">⭐ Profissionalismo</h3>
          <p className="text-sm text-gray-700">Equipe treinada e certificada com experiência de 10+ anos.</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-700 mb-2">♻️ Sustentabilidade</h3>
          <p className="text-sm text-gray-700">Produtos eco-friendly que respeitam o meio ambiente.</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-700 mb-2">✓ Confiança</h3>
          <p className="text-sm text-gray-700">Garantia de satisfação em 100% dos nossos serviços.</p>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Informações de Contato</h2>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-2"><strong>Telefone:</strong> {info.phone || '(11) 98765-4321'}</p>
        <p className="text-gray-700 mb-2"><strong>Email:</strong> {info.email || 'contato@limparplus.com.br'}</p>
        <p className="text-gray-700 mb-2"><strong>Endereço:</strong> {info.address || 'São Paulo, SP'}</p>
        <p className="text-gray-700"><strong>Atendimento:</strong> Segunda a Sábado, 8h às 18h</p>
      </div>
    </div>
  );
}

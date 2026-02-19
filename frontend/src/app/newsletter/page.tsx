"use client";
import React, { useState } from 'react';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setEnviado(true);
    } catch {
      alert('Erro ao assinar newsletter');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Assine nossa Newsletter</h1>
      <p className="mb-4">Receba novidades, promoções e dicas de limpeza diretamente no seu email.</p>
      {enviado ? (
        <div className="text-green-600 font-semibold">Inscrição realizada com sucesso!</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Seu email"
            className="border p-2 rounded flex-1"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Assinar</button>
        </form>
      )}
    </div>
  );
}

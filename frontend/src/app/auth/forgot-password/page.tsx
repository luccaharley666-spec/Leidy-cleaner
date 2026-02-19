"use client";
import React, { useState } from 'react';
import { apiClient } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Suporte real depende do backend
      await apiClient.client.post('/auth/forgot-password', { email });
      setMessage('Se o email existir, você receberá instruções para redefinir a senha.');
    } catch {
      setMessage('Se o email existir, você receberá instruções para redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Esqueci minha senha</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Enviar
        </button>
      </form>
      {message && <div className="mt-4 text-blue-700">{message}</div>}
    </div>
  );
}

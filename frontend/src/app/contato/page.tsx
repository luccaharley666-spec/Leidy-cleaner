"use client";
import React, { useState } from 'react';

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui integraria com backend/email
    setEnviado(true);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Fale Conosco</h1>
      <p className="mb-4">Entre em contato pelo formulário ou pelos canais abaixo.</p>
      {enviado ? (
        <div className="text-green-600 font-semibold">Mensagem enviada! Retornaremos em breve.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" className="w-full border p-2 rounded" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Seu email" className="w-full border p-2 rounded" required />
          <textarea name="mensagem" value={form.mensagem} onChange={handleChange} placeholder="Sua mensagem" className="w-full border p-2 rounded" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
        </form>
      )}
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Outros canais</h2>
        <p>Email: contato@limpezapro.com.br</p>
        <p>Telefone: (11) 99999-9999</p>
        <p>Endereço: Av. Exemplo, 123 - São Paulo/SP</p>
        <p className="mt-2">Siga nas redes sociais:
          <a href="https://instagram.com/limpezapro" className="ml-2 text-blue-600 underline">Instagram</a>
          <a href="https://facebook.com/limpezapro" className="ml-2 text-blue-600 underline">Facebook</a>
        </p>
        <div className="mt-2">
          <iframe title="mapa" src="https://www.openstreetmap.org/export/embed.html?bbox=-46.633309%2C-23.55052%2C-46.623309%2C-23.54052&amp;layer=mapnik" style={{ width: '100%', height: 200, border: 0 }}></iframe>
        </div>
      </div>
    </div>
  );
}

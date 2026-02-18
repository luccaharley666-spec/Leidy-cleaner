"use client";

import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Fale Conosco</h1>
      <p className="text-gray-600 mb-8">Tem dúvidas? Envie-nos uma mensagem e nossa equipe responderá em breve!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {submitted && <div className="bg-green-100 border border-green-400 text-green-800 p-4 mb-4 rounded">✓ Mensagem enviada com sucesso!</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Seu nome" className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="seu@email.com" className="w-full border border-gray-300 p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="(11) 99999-9999" className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assunto</label>
              <input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Ex: Orçamento para limpeza" className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mensagem</label>
              <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Digite sua mensagem..." className="w-full border border-gray-300 p-2 rounded h-32" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">Enviar Mensagem</button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-semibold">Telefone</p>
                <p className="text-gray-600">(11) 98765-4321</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-gray-600">atendimento@limparplus.com.br</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="font-semibold">Horário de Atendimento</p>
                <p className="text-gray-600">Seg-Sex: 8h às 18h<br/>Sábado: 9h às 14h</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold">Localização</p>
                <p className="text-gray-600">São Paulo, SP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';

export default function PerfilEmpresaPage() {
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    cep: '',
    telefone: '',
  });
  const [salvo, setSalvo] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integrar com backend para salvar dados
    setSalvo(true);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Dados da Empresa</h1>
      {salvo && <div className="text-green-600 font-semibold mb-2">Dados salvos!</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome da empresa" className="w-full border p-2 rounded" required />
        <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="CNPJ" className="w-full border p-2 rounded" required />
        <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço completo" className="w-full border p-2 rounded" required />
        <input name="cep" value={form.cep} onChange={handleChange} placeholder="CEP" className="w-full border p-2 rounded" required />
        <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
      </form>
    </div>
  );
}

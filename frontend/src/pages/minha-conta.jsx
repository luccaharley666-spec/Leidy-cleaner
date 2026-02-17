'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

/**
 * 📱 Página de Minha Conta - Fluxo Melhorado
 * Detecta se já é cadastrado e vai para Perfil ou Cadastro
 */
export default function MyAccount() {
  const router = useRouter();
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Não autenticado, ir para login
        router.push('/login');
        return;
      }

      // Tentar obter perfil
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUserStatus('authenticated');
      } else {
        // Token inválido, ir para login
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se é CLIENTE
  if (user.role === 'customer') {
    return <ClientProfile user={user} />;
  }

  // Se é PROFISSIONAL
  if (user.role === 'staff' || user.role === 'professional') {
    return <ProfessionalProfile user={user} />;
  }

  // Se é ADMIN
  if (user.role === 'admin') {
    return <AdminProfile user={user} />;
  }

  return null;
}

/**
 * Perfil do Cliente
 */
function ClientProfile({ user }) {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '' });

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch (error) {
      alert('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header com Avatar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-3xl shadow-lg">
              {user.name?.charAt(0) || '👤'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Cliente Premium</p>
              <p className="text-sm text-gray-500 mt-2">Membro desde {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
            {[
              { id: 'info', label: 'Informações', icon: '📋' },
              { id: 'bookings', label: 'Meus Agendamentos', icon: '📅' },
              { id: 'payments', label: 'Pagamentos', icon: '💳' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'info' && (
            <div>
              {isEditing ? (
                <EditClientForm 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InfoField label="Nome" value={user.name} />
                    <InfoField label="Email" value={user.email} />
                    <InfoField label="Telefone" value={user.phone || '-'} />
                    <InfoField label="Endereço" value={user.address || '-'} />
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    ✏️ Editar Informações
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <BookingsList userId={user.id} />
          )}

          {activeTab === 'payments' && (
            <PaymentsList userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Perfil do Profissional com Tabela de Preços e Agenda
 */
function ProfessionalProfile({ user }) {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    basePrice: user.basePrice || 50.00,
    bankAccount: user.bankAccount || '',
    bankCode: user.bankCode || '',
    pixKey: user.pixKey || '' });

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch (error) {
      alert('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header com Avatar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white text-3xl shadow-lg">
                👩‍💼
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Profissional de Limpeza</p>
                <div className="flex gap-4 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    ⭐ 4.8 (120 avaliações)
                  </span>
                </div>
              </div>
            </div>
            <Link href="/staff/booking-requests" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              📅 Ver Solicitações
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
            {[
              { id: 'info', label: 'Informações', icon: '📋' },
              { id: 'pricing', label: 'Tabela de Preços', icon: '💰' },
              { id: 'agenda', label: 'Minha Agenda', icon: '📅' },
              { id: 'earnings', label: 'Ganhos', icon: '💵' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'info' && (
            <div>
              {isEditing ? (
                <EditProfessionalForm 
                  formData={formData} 
                  setFormData={setFormData}
                  onSave={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <InfoProfessionalViewer user={user} formData={formData} />
              )}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  ✏️ Editar Informações
                </button>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <PricingTable servicePrice={formData.basePrice} />
          )}

          {activeTab === 'agenda' && (
            <ProfessionalSchedule staffId={user.id} />
          )}

          {activeTab === 'earnings' && (
            <EarningsDashboard staffId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}

// ====== Componentes Auxiliares ======

function InfoField({ label, value }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</label>
      <p className="text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function EditClientForm({ formData, setFormData, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      <input
        type="tel"
        placeholder="Telefone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      <input
        type="text"
        placeholder="Endereço"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      <div className="flex gap-4">
        <button
          onClick={onSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          💾 Salvar
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}

function EditProfessionalForm({ formData, setFormData, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
      />
      <textarea
        placeholder="Bio/Descrição"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        rows="3"
      />
      <input
        type="number"
        placeholder="Preço Base (R$)"
        value={formData.basePrice}
        onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        step="0.01"
      />
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
        <h3 className="font-semibold mb-3 text-yellow-900 dark:text-yellow-200">💰 Dados para Recebimento</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Chave PIX</label>
            <input
              type="text"
              placeholder="Seu PIX (email, telefone, CPF ou chave aleatória)"
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Banco</label>
              <input
                type="text"
                placeholder="Código do banco"
                value={formData.bankCode}
                onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Conta</label>
              <input
                type="text"
                placeholder="Número da conta"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          💾 Salvar
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}

function InfoProfessionalViewer({ user, formData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoField label="Nome" value={formData.name} />
      <InfoField label="Email" value={user.email} />
      <InfoField label="Bio" value={formData.bio || '-'} />
      <InfoField label="Preço Base" value={`R$ ${formData.basePrice?.toFixed(2) || '0.00'}`} />
      <InfoField label="Chave PIX" value={formData.pixKey || '-'} />
      <InfoField label="Banco" value={formData.bankCode || '-'} />
    </div>
  );
}

function PricingTable({ servicePrice = 50 }) {
  const services = [
    { name: 'Limpeza Básica (1h)', hours: 1, multiplier: 1 },
    { name: 'Limpeza Padrão (2h)', hours: 2, multiplier: 1 },
    { name: 'Limpeza Profunda (3h)', hours: 3, multiplier: 1.2 },
    { name: 'Organização (2h)', hours: 2, multiplier: 1.3 },
    { name: 'Limpeza Pós-Reforma (4h)', hours: 4, multiplier: 1.5 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-50 dark:bg-blue-900/30">
            <th className="px-4 py-3 text-left font-semibold">Serviço</th>
            <th className="px-4 py-3 text-center font-semibold">Duração</th>
            <th className="px-4 py-3 text-right font-semibold">Preço</th>
            <th className="px-4 py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, idx) => {
            const price = servicePrice * service.hours * service.multiplier;
            return (
              <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">{service.name}</td>
                <td className="px-4 py-3 text-center">{service.hours} hora{service.hours > 1 ? 's' : ''}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">R$ {price.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ativo</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProfessionalSchedule({ staffId }) {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const [schedule, setSchedule] = useState({});

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📅 Minha Disponibilidade</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50 dark:bg-blue-900/30">
              <th className="px-2 py-2">Horário</th>
              {days.map(day => (
                <th key={day} className="px-2 py-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time} className="border-b dark:border-gray-700">
                <td className="px-2 py-2 font-semibold">{time}</td>
                {days.map(day => (
                  <td key={`${day}-${time}`} className="px-2 py-2 text-center">
                    <button
                      className="w-8 h-8 rounded bg-green-100 hover:bg-green-200 text-green-700 font-semibold transition"
                      title={`${day} às ${time}`}
                    >
                      ✓
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EarningsDashboard({ staffId }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 dark:text-green-300">Este Mês</p>
          <p className="text-2xl font-bold text-green-600">R$ 2.450,00</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 dark:text-blue-300">Total Acumulado</p>
          <p className="text-2xl font-bold text-blue-600">R$ 12.890,00</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800 dark:text-purple-300">Agendamentos</p>
          <p className="text-2xl font-bold text-purple-600">47</p>
        </div>
      </div>
    </div>
  );
}

function AdminProfile({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-yellow-50 dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-yellow-600 flex items-center justify-center text-white text-3xl shadow-lg">
              👨‍💼
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Administrador</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdminCard title="Usuários" value="247" icon="👥" />
            <AdminCard title="Agendamentos" value="1,234" icon="📅" />
            <AdminCard title="Profissionais" value="48" icon="👩‍💼" />
            <AdminCard title="Receita" value="R$ 45.2k" icon="💰" />
          </div>

          <div className="mt-8">
            <Link href="/admin-dashboard" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              🛠️ Painel Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCard({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function BookingsList({ userId }) {
  return (
    <div>
      <p className="text-gray-600 dark:text-gray-400">Seus agendamentos aparecerão aqui</p>
    </div>
  );
}

function PaymentsList({ userId }) {
  return (
    <div>
      <p className="text-gray-600 dark:text-gray-400">Seu histórico de pagamentos aparecerá aqui</p>
    </div>
  );
}

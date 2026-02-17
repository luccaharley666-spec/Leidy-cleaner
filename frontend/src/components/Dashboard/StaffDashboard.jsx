import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiCall } from '../../config/api';

function StaffDashboard() {
  const [staffStats, setStaffStats] = useState({
    earnings: 0,
    monthlyEarnings: 0,
    totalJobs: 0,
    completedJobs: 0,
    rating: 0,
    streak: 0 });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [earningsChart, setEarningsChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const data = await apiCall(`/api/staff/${userId}/dashboard`, { method: 'GET' });
        setStaffStats(data.stats);
        setUpcomingBookings(data.upcomingBookings || decodedFunction());
        setEarningsChart(data.earningsChart || decodedFunction());
        
        setLoading(false);
      } catch (error) {
        setStaffStats({
          earnings: 2450.50,
          monthlyEarnings: 8900.00,
          totalJobs: 42,
          completedJobs: 40,
          rating: 4.9,
          streak: 12 });
        setUpcomingBookings(decodedFunction());
        setEarningsChart(decodedFunction());
        setLoading(false);
      }
    };
    
    fetchStaffStats();
  }, []);

  const scheduledServices = () => [
    { id: 1, client: 'Maria Silva', service: 'Limpeza Residencial', date: '2026-02-01', time: '09:00', address: 'Rua A, 123', status: 'confirmado' },
    { id: 2, client: 'João Santos', service: 'Limpeza Comercial', date: '2026-02-01', time: '14:00', address: 'Av. B, 456', status: 'confirmado' },
    { id: 3, client: 'Ana Costa', service: 'Limpeza Residencial', date: '2026-02-02', time: '10:00', address: 'Rua C, 789', status: 'pendente' },
  ];

  const earningsData = () => [
    { day: 'Seg', earnings: 450 },
    { day: 'Ter', earnings: 520 },
    { day: 'Qua', earnings: 380 },
    { day: 'Qui', earnings: 600 },
    { day: 'Sex', earnings: 500 },
  ];

  if (loading) {
    return <div className="p-6 text-center">⏳ Carregando seu painel...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">💼 Meu Painel de Ganhos</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          📋 Ver Histórico
        </button>
      </div>

      {/* Stats Cards - Ganhos em destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow hover:shadow-lg transition border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Ganhos este mês</p>
              <p className="text-3xl font-bold text-green-700 mt-2">R$ {staffStats.monthlyEarnings.toFixed(2)}</p>
            </div>
            <span className="text-4xl">💵</span>
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 15% vs mês anterior</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow hover:shadow-lg transition border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Saldo atual</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">R$ {staffStats.earnings.toFixed(2)}</p>
            </div>
            <span className="text-4xl">🏦</span>
          </div>
          <p className="text-xs text-blue-600 mt-2">Disponível para saque</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow hover:shadow-lg transition border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">Agendamentos</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">{staffStats.completedJobs}/{staffStats.totalJobs}</p>
            </div>
            <span className="text-4xl">📅</span>
          </div>
          <p className="text-xs text-purple-600 mt-2">Concluídos neste mês</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow hover:shadow-lg transition border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-semibold">Avaliação & Streak</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">{staffStats.rating}⭐ ({staffStats.streak}🔥)</p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Dias consecutivos</p>
        </div>
      </div>

      {/* Gráfico de Ganhos */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📊 Ganhos desta Semana</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={earningsChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value}`} />
            <Legend />
            <Bar dataKey="earnings" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Próximos Agendamentos */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📅 Próximos 7 Dias</h3>
        
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{booking.client}</p>
                    <p className="text-sm text-gray-600 mt-1">🔧 {booking.service}</p>
                    <p className="text-sm text-gray-600">📍 {booking.address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'confirmado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm">📅 {new Date(booking.date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-sm">🕐 {booking.time}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">
                  ✅ Concluir
                </button>
                <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition">
                  📍 Rota
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow hover:shadow-md transition text-left border border-blue-200">
          <p className="font-bold text-lg">💸 Solicitar Saque</p>
          <p className="text-sm text-gray-600 mt-2">Transferir ganhos para sua conta</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow hover:shadow-md transition text-left border border-purple-200">
          <p className="font-bold text-lg">📊 Ver Relatório</p>
          <p className="text-sm text-gray-600 mt-2">Análise detalhada de ganhos</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow hover:shadow-md transition text-left border border-green-200">
          <p className="font-bold text-lg">⭐ Minhas Avaliações</p>
          <p className="text-sm text-gray-600 mt-2">Ver feedback dos clientes</p>
        </button>
      </div>
    </div>
  );
}

export default StaffDashboard;

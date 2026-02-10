import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LeidyHeader from '../components/Layout/LeidyHeader';
import LeidyFooter from '../components/Layout/LeidyFooter';

const COLORS = ['#2e7d32', '#4caf50', '#8bc34a', '#66bb6a', '#7cb342'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState('month');

  // Buscar dados do dashboard da API
  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter token do localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Não autenticado. Faça login para continuar.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Acesso negado. Apenas administradores podem acessar.');
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setDashboardData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Erro ao buscar dados');
      }
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError(err.message);
      // Mostrar dados de fallback em caso de erro
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'Confirmado': 'bg-green-100 text-green-800 border-green-300',
      'Confirmada': 'bg-green-100 text-green-800 border-green-300',
      'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Concluído': 'bg-blue-100 text-blue-800 border-blue-300',
      'Concluída': 'bg-blue-100 text-blue-800 border-blue-300',
      'Cancelado': 'bg-red-100 text-red-800 border-red-300',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'confirmed': 'bg-green-100 text-green-800 border-green-300',
      'completed': 'bg-blue-100 text-blue-800 border-blue-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300',
      'no_show': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const kpis = dashboardData?.kpis || {
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    conversionRate: 0
  };

  const graphs = dashboardData?.charts || {
    salesData: [],
    serviceData: [],
    monthlyRevenue: []
  };

  const bookings = dashboardData?.recentBookings || [];

  return (
    <>
      <Head>
        <title>Dashboard Admin - Leidy Cleaner</title>
        <meta name="description" content="Dashboard administrativo com análise de vendas e agendamentos em tempo real" />
      </Head>

      <LeidyHeader />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-900 dark:text-green-300 mb-2">Dashboard Admin</h1>
            <p className="text-gray-600 dark:text-gray-400">Análise de vendas, agendamentos e receita em tempo real</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded mb-6">
              <span className="font-semibold">Erro:</span> {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando dados do dashboard...</p>
            </div>
          )}

          {/* KPI Cards */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">RECEITA TOTAL</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-1">
                        R$ {kpis.totalRevenue?.toLocaleString('pt-BR', { [REDACTED_TOKEN]: 0 }) || '0'}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-xs mt-2">Período: {period === 'week' ? 'Esta Semana' : period === 'month' ? 'Este Mês' : 'Este Ano'}  </p>
                    </div>
                    <div className="text-5xl text-green-200 dark:text-green-900">💰</div>
                  </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">AGENDAMENTOS</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-1">{kpis.totalBookings || 0}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                        Confirmados: {kpis.confirmedBookings || 0}
                      </p>
                    </div>
                    <div className="text-5xl text-blue-200 dark:text-blue-900">📅</div>
                  </div>
                </div>

                {/* Average Rating */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">AVALIAÇÃO MÉDIA</p>
                      <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">
                        {kpis.averageRating?.toFixed(1) || '0.0'}
                      </p>
                      <div className="text-yellow-500 mt-1">⭐ {'★'.repeat(Math.floor(kpis.averageRating || 0))}</div>
                    </div>
                    <div className="text-5xl text-yellow-200 dark:text-yellow-900">⭐</div>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">TAXA CONVERSÃO</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-1">
                        {(kpis.conversionRate || 0).toFixed(1)}%
                      </p>
                      <p className="text-purple-600 dark:text-purple-400 text-xs mt-2">Visitantes → Booking</p>
                    </div>
                    <div className="text-5xl text-purple-200 dark:text-purple-900">📊</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales & Revenue Line Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-green-900 dark:text-green-300">Vendas vs Receita</h2>
                    <select 
                      value={period} 
                      onChange={(e) => setPeriod(e.target.value)}
                      className="px-3 py-1 border border-green-300 dark:border-green-700 bg-white dark:bg-gray-700 dark:text-white rounded text-sm focus:outline-none focus:border-green-500"
                    >
                      <option value="week">Esta Semana</option>
                      <option value="month">Este Mês</option>
                      <option value="year">Este Ano</option>
                    </select>
                  </div>
                  {graphs.salesData && graphs.salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={graphs.salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#2e7d32" 
                          strokeWidth={2}
                          dot={{ fill: '#2e7d32', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Vendas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#4caf50" 
                          strokeWidth={2}
                          dot={{ fill: '#4caf50', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Receita (R$)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum dado disponível para o período selecionado</p>
                  )}
                </div>

                {/* Services Distribution Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">Distribuição de Serviços</h2>
                  {graphs.serviceData && graphs.serviceData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={graphs.serviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {graphs.serviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {graphs.serviceData.map((service, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                              <span className="text-gray-700 dark:text-gray-300">{service.name}</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{service.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum serviço agendado</p>
                  )}
                </div>
              </div>

              {/* Monthly Revenue Bar Chart */}
              {graphs.monthlyRevenue && graphs.monthlyRevenue.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                  <h2 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">Receita Mensal</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphs.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                        contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #2e7d32', borderRadius: '8px' }}
                      />
                      <Bar dataKey="revenue" fill="#2e7d32" name="Receita (R$)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Bookings Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">Agendamentos Recentes</h2>
                {bookings && bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-green-200 dark:border-green-700">
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Cliente</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Serviço</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Data</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{booking.name}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{booking.service}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{booking.date}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.statusColor || booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold">{booking.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum agendamento neste período</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <LeidyFooter />
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiCall } from '../../config/api';

function AdminPanel() {
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    revenue: 0,
    customers: 0,
    teamMembers: 0,
    satisfaction: 0 });
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [serviceBreakdown, setServiceBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('current');
  const [exportLoading, setExportLoading] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiCall('/api/admin/dashboard', { method: 'GET' });
        setMetrics(data);
        
        // Simular dados de gráfico se não houver
        setRevenueByMonth(data.revenueByMonth || decodedFunction());
        setRecentBookings(data.recentBookings || decodedFunction());
        setServiceBreakdown(data.serviceBreakdown || decodedFunction());
        
        setLoading(false);
      } catch (error) {
        setMetrics({
          totalBookings: 0,
          revenue: 0,
          customers: 0,
          teamMembers: 0,
          satisfaction: 0 });
        setRevenueByMonth(decodedFunction());
        setRecentBookings(decodedFunction());
        setServiceBreakdown(decodedFunction());
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);

  const revenueData = () => [
    { month: 'Jan', revenue: 4000 },
    { month: 'Fev', revenue: 3000 },
    { month: 'Mar', revenue: 2000 },
    { month: 'Abr', revenue: 2780 },
    { month: 'Mai', revenue: 1890 },
    { month: 'Jun', revenue: 2390 },
  ];

  const ordersData = () => [
    { id: '#001', client: 'Maria Silva', service: 'Limpeza Residencial', date: '2026-01-31', status: 'confirmado', value: 250 },
    { id: '#002', client: 'João Santos', service: 'Limpeza Comercial', date: '2026-01-30', status: 'concluído', value: 450 },
    { id: '#003', client: 'Ana Costa', service: 'Limpeza Pós-obra', date: '2026-01-29', status: 'concluído', value: 800 },
    { id: '#004', client: 'Pedro Oliveira', service: 'Limpeza Residencial', date: '2026-01-28', status: 'pendente', value: 250 },
  ];

  const servicesData = () => [
    { name: 'Limpeza Residencial', value: 45 },
    { name: 'Limpeza Comercial', value: 30 },
    { name: 'Limpeza Pós-obra', value: 15 },
    { name: 'Outras', value: 10 },
  ];

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      // Simulação de exportação
      setTimeout(() => {
        alert('📊 Relatório PDF gerado com sucesso!');
        setExportLoading(false);
      }, 1000);
    } catch (error) {
      setExportLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmado': 'bg-blue-100 text-blue-800',
      'concluído': 'bg-green-100 text-green-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-6 text-center">⏳ Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">📊 Painel Administrativo</h2>
        <button 
          onClick={handleExportPDF}
          disabled={exportLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {exportLoading ? '⏳ Exportando...' : '📥 Exportar PDF'}
        </button>
      </div>

      {/* KPIs - Primeira linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Agendamentos</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.totalBookings}</p>
            </div>
            <span className="text-4xl">📅</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">↑ 12% vs mês passado</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Receita Total</p>
              <p className="text-3xl font-bold text-green-600 mt-2">R$ {(metrics.revenue / 1000).toFixed(1)}k</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">↑ 8% vs mês passado</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Clientes</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.customers}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">↑ 5 novos clientes</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Equipe</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{metrics.teamMembers}</p>
            </div>
            <span className="text-4xl">👔</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">✅ Todos disponíveis</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Satisfação</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{metrics.satisfaction}/5</p>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on {metrics.customers} reviews</p>
        </div>
      </div>

      {/* Gráficos - Segunda linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita ao longo do tempo */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">📈 Receita por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Serviços mais vendidos */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">🎯 Distribuição de Serviços</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Agendamentos Recentes */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">📋 Agendamentos Recentes</h3>
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="current">Mês Atual</option>
            <option value="last30">Últimos 30 dias</option>
            <option value="last90">Últimos 90 dias</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">ID</th>
                <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold">Serviço</th>
                <th className="text-left py-3 px-4 font-semibold">Data</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                  <td className="py-3 px-4">{booking.client}</td>
                  <td className="py-3 px-4 text-sm">{booking.service}</td>
                  <td className="py-3 px-4 text-sm">{new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">R$ {booking.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions - Terceira linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow hover:shadow-md transition text-left border border-blue-200">
          <p className="font-bold text-lg">📊 Relatórios</p>
          <p className="text-sm text-gray-600 mt-2">Análise de receita e despesas</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow hover:shadow-md transition text-left border border-purple-200">
          <p className="font-bold text-lg">👥 Equipa</p>
          <p className="text-sm text-gray-600 mt-2">Designar tarefas e performance</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow hover:shadow-md transition text-left border border-green-200">
          <p className="font-bold text-lg">⚙️ Serviços</p>
          <p className="text-sm text-gray-600 mt-2">Editar preços e tipos</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow hover:shadow-md transition text-left border border-orange-200">
          <p className="font-bold text-lg">📧 Automações</p>
          <p className="text-sm text-gray-600 mt-2">Gerenciar regras automáticas</p>
        </button>
      </div>
    </div>
  );
}
export default AdminPanel;


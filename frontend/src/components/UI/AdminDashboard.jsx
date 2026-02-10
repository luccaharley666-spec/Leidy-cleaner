import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeClients: 0,
    averageRating: 0,
    monthlyGrowth: 0,
    pendingBookings: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);

  useEffect(() => {
    // Simular dados (em produção viria da API)
    setStats({
      totalRevenue: 45280,
      totalBookings: 156,
      activeClients: 89,
      averageRating: 4.7,
      monthlyGrowth: 12.5,
      pendingBookings: 8,
    });

    setRecentBookings([
      {
        id: 1,
        client: 'Maria Silva',
        service: 'Limpeza Residencial',
        date: new Date(),
        status: 'confirmed',
        value: 180,
      },
      {
        id: 2,
        client: 'João Santos',
        service: 'Limpeza Comercial',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'in_progress',
        value: 350,
      },
      {
        id: 3,
        client: 'Ana Costa',
        service: 'Passadoria',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'completed',
        value: 120,
      },
    ]);

    // Dados do gráfico de receita
    setRevenueChart([
      { month: 'Jan', revenue: 32000 },
      { month: 'Fev', revenue: 35000 },
      { month: 'Mar', revenue: 38000 },
      { month: 'Abr', revenue: 42000 },
      { month: 'Mai', revenue: 45280 },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard Administrativo</h2>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueChart} />
        <RecentBookings bookings={recentBookings} />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Performance Insights */}
      <PerformanceInsights stats={stats} />
    </div>
  );
}

function StatsGrid({ stats }) {
  const statCards = [
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`,
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-600',
      change: `+${stats.monthlyGrowth}%`,
      changeType: 'positive',
    },
    {
      title: 'Agendamentos',
      value: stats.totalBookings,
      icon: CalendarIcon,
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%',
      changeType: 'positive',
    },
    {
      title: 'Clientes Ativos',
      value: stats.activeClients,
      icon: UsersIcon,
      color: 'from-purple-500 to-purple-600',
      change: '+15.3%',
      changeType: 'positive',
    },
    {
      title: 'Avaliação Média',
      value: stats.averageRating,
      icon: StarIcon,
      color: 'from-yellow-500 to-yellow-600',
      change: '+0.2',
      changeType: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className={`text-sm mt-2 ${
                stat.changeType === 'positive' ? 'text-green-200' : 'text-red-200'
              }`}>
                {stat.change} vs mês anterior
              </p>
            </div>
            <stat.icon className="w-8 h-8 opacity-80" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RevenueChart({ data }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Receita Mensal</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.month} className="flex items-center gap-4">
            <div className="w-12 text-sm font-medium text-gray-600">{item.month}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-blue-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </div>
            <div className="w-20 text-right text-sm font-medium text-gray-900">
              R$ {(item.revenue / 1000).toFixed(0)}k
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentBookings({ bookings }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CalendarIcon className="w-4 h-4" />;
      case 'in_progress': return <ClockIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 Agendamentos Recentes</h3>
      <div className="space-y-4">
        {bookings.map(booking => (
          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {booking.client.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{booking.client}</p>
                <p className="text-sm text-gray-600">{booking.service}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">R$ {booking.value}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status === 'confirmed' && 'Confirmado'}
                {booking.status === 'in_progress' && 'Em Andamento'}
                {booking.status === 'completed' && 'Concluído'}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
        Ver todos os agendamentos →
      </button>
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      title: 'Novo Agendamento',
      description: 'Agendar um serviço',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      action: () => {},
    },
    {
      title: 'Gerenciar Clientes',
      description: 'Ver lista de clientes',
      icon: UsersIcon,
      color: 'bg-green-500',
      action: () => {},
    },
    {
      title: 'Relatórios',
      description: 'Ver relatórios detalhados',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      action: () => {},
    },
    {
      title: 'Promoções',
      description: 'Criar nova promoção',
      icon: StarIcon,
      color: 'bg-yellow-500',
      action: () => {},
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(action => (
          <button
            key={action.title}
            onClick={action.action}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 [REDACTED_TOKEN]`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PerformanceInsights({ stats }) {
  const insights = [
    {
      title: 'Crescimento Mensal',
      value: `+${stats.monthlyGrowth}%`,
      description: 'Comparado ao mês anterior',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
    },
    {
      title: 'Taxa de Conversão',
      value: '68%',
      description: 'De visitantes para agendamentos',
      trend: 'up',
      icon: ChartBarIcon,
    },
    {
      title: 'Tempo Médio de Serviço',
      value: '2h 15min',
      description: 'Duração média dos serviços',
      trend: 'neutral',
      icon: ClockIcon,
    },
    {
      title: 'Satisfação do Cliente',
      value: `${stats.averageRating}/5`,
      description: 'Avaliação média dos clientes',
      trend: 'up',
      icon: StarIcon,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights de Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <insight.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">{insight.title}</div>
            <div className="text-xs text-gray-600">{insight.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
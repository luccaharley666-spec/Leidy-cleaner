import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { StatsCard, ActivityTimeline, QuickActions, UpcomingCard, EmptyState } from '../components/Dashboard/DashboardWidgets';

/**
 * Dashboard Redesenhado - Layout Moderno e Amplo
 */
export default function DashboardNew() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const userStats = {
    totalBookings: 12,
    upcomingBookings: 3,
    totalSpent: 1850.50,
    loyaltyPoints: 450,
    bookingsChange: 25,
    pointsChange: 15
  };

  const upcomingBookings = [
    {
      id: 1,
      icon: '🏠',
      title: 'Limpeza Residencial Completa',
      date: '15 de Fev, 2024',
      time: '14:00 - 16:00',
      location: 'Av. Paulista, 1000 - São Paulo',
      status: 'confirmed',
      price: 250,
      profissional: 'Maria Silva',
      actions: [
        { label: 'Ver Detalhes', onClick: () => alert('Detalhes'), variant: 'primary' },
        { label: 'Cancelar', onClick: () => alert('Cancelado') }
      ]
    },
    {
      id: 2,
      icon: '🪟',
      title: 'Limpeza de Vidros',
      date: '18 de Fev, 2024',
      time: '10:00 - 11:30',
      location: 'Rua Augusta, 500 - São Paulo',
      status: 'confirmed',
      price: 150,
      profissional: 'João Santos',
      actions: [
        { label: 'Ver Detalhes', onClick: () => alert('Detalhes'), variant: 'primary' },
        { label: 'Cancelar', onClick: () => alert('Cancelado') }
      ]
    },
    {
      id: 3,
      icon: '✨',
      title: 'Limpeza Profunda Pós Obra',
      date: '22 de Fev, 2024',
      time: '09:00 - 13:00',
      location: 'Rua Oscar Freire, 2000 - São Paulo',
      status: 'pending',
      price: 450,
      profissional: 'Team Especial',
      actions: [
        { label: 'Confirmar', onClick: () => alert('Confirmado'), variant: 'primary' },
        { label: 'Cancelar', onClick: () => alert('Cancelado') }
      ]
    }
  ];

  const recentActivities = [
    { icon: '✓', title: 'Limpeza concluída', description: 'Limpeza Residencial - Av. Paulista', time: '2 dias atrás' },
    { icon: '🎉', title: 'Ganhou pontos', description: '+150 pontos de fidelidade', time: '5 dias atrás' },
    { icon: '📝', title: 'Agendamento criado', description: 'Limpeza de Vidros - Rua Augusta', time: '1 semana atrás' },
    { icon: '💝', title: 'Cupom aplicado', description: 'Desconto de 10% em próximo serviço', time: '2 semanas atrás' },
  ];

  const quickActions = [
    { icon: '→', label: 'Agendar', onClick: () => alert('Agendar novo serviço') },
    { icon: '📍', label: 'Histórico', onClick: () => alert('Ver histórico') },
    { icon: '⭐', label: 'Avaliações', onClick: () => alert('Ver avaliações') },
    { icon: '🎁', label: 'Ofertas', onClick: () => alert('Ver ofertas especiais') },
    { icon: '💬', label: 'Chat', onClick: () => alert('Abrir chat de suporte') },
    { icon: '⚙️', label: 'Perfil', onClick: () => alert('Editar perfil') },
  ];

  const paymentMethods = [
    { type: 'card', last4: '4242', brand: '💳 Visa', default: true },
    { type: 'pix', key: 'email@example.com', brand: '🔑 PIX', default: false },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - Limpeza Pro</title>
        <meta name="description" content="Seu dashboard de agendamentos e perfil" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-grow px-4 py-6 md:px-6 lg:px-8">
          <div className="container mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo, João! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Aqui está um resumo da sua conta e próximos agendamentos</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              {['overview', 'bookings', 'profile', 'payments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold transition border-b-2 ${
                    activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'overview' ? '📊 Visão Geral' : tab === 'bookings' ? '📅 Agendamentos' : tab === 'profile' ? '👤 Perfil' : '💳 Pagamentos'}
                </button>
              ))}
            </div>

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    icon="📅"
                    label="Agendamentos Totais"
                    value={userStats.totalBookings}
                    change={userStats.bookingsChange}
                    trend="up"
                    change_label="vs. último mês"
                    color="purple"
                  />
                  <StatsCard
                    icon="⏳"
                    label="Próximos Agendamentos"
                    value={userStats.upcomingBookings}
                    change_label="Confirmados"
                    color="blue"
                  />
                  <StatsCard
                    icon="💰"
                    label="Total Gasto"
                    value={`R$ ${userStats.totalSpent.toLocaleString('pt-BR')}`}
                    change_label="Em todos os serviços"
                    color="green"
                  />
                  <StatsCard
                    icon="⭐"
                    label="Pontos de Fidelidade"
                    value={userStats.loyaltyPoints}
                    change={userStats.pointsChange}
                    trend="up"
                    change_label="Pontos disponíveis"
                    color="orange"
                  />
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
                  <QuickActions actions={quickActions} />
                </div>

                {/* Upcoming & Activity Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Próximos Agendamentos */}
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Próximos Agendamentos</h2>
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <UpcomingCard key={booking.id} {...booking} />
                      ))}
                    </div>
                  </div>

                  {/* Atividade Recente */}
                  <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Atividade Recente</h3>
                    <ActivityTimeline activities={recentActivities} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Bookings */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Agendamentos</h2>
                  <button className="btn-primary">+ Novo Agendamento</button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {['Todos', 'Pendentes', 'Confirmados', 'Concluídos', 'Cancelados'].map((filter) => (
                    <button
                      key={filter}
                      className="px-4 py-2 rounded-full text-sm font-medium border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-600 hover:text-purple-600 transition"
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <UpcomingCard key={booking.id} {...booking} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Profile */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dados Pessoais</h2>
                  <div className="card space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
                        <input
                          type="text"
                          defaultValue="João Silva"
                          className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="joao@example.com"
                          className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                        <input
                          type="tel"
                          defaultValue="(11) 98765-4321"
                          className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CPF</label>
                        <input
                          type="text"
                          defaultValue="123.456.789-00"
                          className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Endereço</label>
                      <input
                        type="text"
                        defaultValue="Av. Paulista, 1000 - São Paulo, SP 01311-100"
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <button className="btn-primary w-full">Salvar Alterações</button>
                  </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-4">
                  <div className="card text-center">
                    <div className="text-5xl mb-2">👤</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Membro desde Out 2023</p>
                  </div>
                  <div className="card">
                    <h3 className="font-bold mb-4">Estatísticas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avaliação</span>
                        <span className="font-bold">⭐ 4.8/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Agendamentos</span>
                        <span className="font-bold">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cancelamentos</span>
                        <span className="font-bold">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Payments */}
            {activeTab === 'payments' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Métodos de Pagamento</h2>
                  <div className="space-y-4">
                    {paymentMethods.map((method, idx) => (
                      <div key={idx} className="card flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{method.brand}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Terminado em {method.last4}</p>
                        </div>
                        <div className="flex gap-2">
                          {method.default && <span className="badge badge-success">Padrão</span>}
                          <button className="btn-secondary text-sm">Editar</button>
                          <button className="btn-secondary text-sm">Remover</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary mt-6 w-full">+ Adicionar Método de Pagamento</button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Histórico de Pagamentos</h3>
                  <div className="card space-y-3">
                    {[
                      { date: '15/02/2024', amount: 'R$ 250,00', status: 'Pago' },
                      { date: '10/02/2024', amount: 'R$ 150,00', status: 'Pago' },
                      { date: '05/02/2024', amount: 'R$ 450,00', status: 'Pendente' },
                    ].map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payment.date}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{payment.amount}</p>
                        </div>
                        <span className={`text-sm font-bold ${payment.status === 'Pago' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {payment.status === 'Pago' ? '✓' : '⏳'} {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

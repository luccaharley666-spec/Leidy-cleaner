import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Breadcrumb from '../components/UI/Breadcrumb';
import Footer from '../components/Layout/Footer';
import { apiCall } from '../config/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        Router.push('/login');
        return;
      }
      setUserInfo(JSON.parse(user));
      loadBookings();
    };

    checkAuth();
    
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  const loadBookings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;

      const response = await apiCall(`/api/bookings?userId=${user.id}`, { method: 'GET' });
      if (response && Array.isArray(response)) {
        setBookings(response);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      await apiCall(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      toast.success('Agendamento cancelado');
      loadBookings();
    } catch (error) {
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    Router.push('/login');
  };

  const nextBookings = bookings.filter(b => new Date(b.date) >= new Date()).slice(0, 3);
  const pastBookings = bookings.filter(b => new Date(b.date) < new Date()).slice(0, 3);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'bookings', label: 'Próximos Agendamentos', icon: '📅' },
    { id: 'history', label: 'Histórico', icon: '📋' },
    { id: 'account', label: 'Conta', icon: '👤' }
  ];

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Leidy Cleaner</title>
      </Head>
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Bem-vindo, {userInfo?.name || 'usuário'}!</p>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex overflow-x-auto gap-2 sm:gap-3 pb-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:shadow'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700 shadow-lg"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Agendamentos</p>
                  <p className="text-4xl font-black text-green-600">{bookings.length}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700 shadow-lg"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Próximos Agendamentos</p>
                  <p className="text-4xl font-black text-emerald-600">{nextBookings.length}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700 shadow-lg"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Serviços Realizados</p>
                  <p className="text-4xl font-black text-teal-600">{pastBookings.length}</p>
                </motion.div>
              </div>
              
              {nextBookings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700"
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📅 Próximos Agendamentos</h3>
                  <div className="space-y-3">
                    {nextBookings.map((booking, idx) => (
                      <motion.div
                        key={booking.id || idx}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-slate-700"
                      >
                        <p className="font-bold text-gray-900 dark:text-white">{booking.serviceName || `Serviço #${booking.id}`}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">📅 {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700"
            >
              {loading ? (
                <p className="text-center py-12 text-gray-600 dark:text-gray-400">Carregando...</p>
              ) : nextBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Nenhum agendamento futuro</p>
                  <a href="/agendar-novo" className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg">
                    Agendar Agora →
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {nextBookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id || idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border-2 border-green-200 dark:border-slate-700 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{booking.serviceName || `Serviço #${booking.id}`}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">📅 {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">📍 {booking.address}</p>
                      </div>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                      >
                        Cancelar
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700"
            >
              {loading ? (
                <p className="text-center py-12 text-gray-600 dark:text-gray-400">Carregando...</p>
              ) : pastBookings.length === 0 ? (
                <p className="text-center py-12 text-gray-600 dark:text-gray-400">Nenhum serviço realizado ainda</p>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id || idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border-2 border-green-200 dark:border-slate-700 rounded-lg"
                    >
                      <p className="font-bold text-gray-900 dark:text-white">{booking.serviceName || `Serviço #${booking.id}`}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">📅 {new Date(booking.date).toLocaleDateString('pt-BR')}</p>
                      <div className="mt-2 p-2 bg-green-50 dark:bg-slate-900 rounded text-sm text-gray-700 dark:text-gray-300">✅ Serviço concluído</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700"
              >
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Informações Pessoais</h3>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400"><strong>Nome:</strong> {userInfo?.name}</p>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Email:</strong> {userInfo?.email}</p>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Telefone:</strong> {userInfo?.phone || 'Não fornecido'}</p>
                  <p className="text-gray-600 dark:text-gray-400"><strong>Membro desde:</strong> {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('pt-BR') : 'Recentemente'}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-green-200 dark:border-slate-700"
              >
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Configurações</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300">Modo Escuro</span>
                  </label>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                🚪 Logout
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

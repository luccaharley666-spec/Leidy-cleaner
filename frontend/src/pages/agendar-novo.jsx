import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Breadcrumb from '../components/UI/Breadcrumb';
import Footer from '../components/Layout/Footer';
import { apiCall } from '../config/api';
import toast from 'react-hot-toast';

export default function Agendar() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const defaultServices = [
    { id: 1, name: 'Limpeza Residencial', price: 150, icon: '🏠', time: '2-3h' },
    { id: 2, name: 'Limpeza Profunda', price: 250, icon: '✨', time: '4-5h' },
    { id: 3, name: 'Limpeza de Vidros', price: 100, icon: '🪟', time: '1-2h' },
    { id: 4, name: 'Limpeza de Tapetes', price: 80, icon: '🧽', time: '1-3h' },
    { id: 5, name: 'Limpeza Comercial', price: 300, icon: '🏢', time: '3-6h' },
    { id: 6, name: 'Limpeza de Áreas Externas', price: 120, icon: '🌳', time: '1-2h' }
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !fullName || !phone || !address || !selectedService) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId) {
        toast.error('Você precisa estar logado para agendar');
        setIsSubmitting(false);
        return;
      }

      const bookingData = {
        userId,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        address,
        phone,
        email: email || '',
        durationHours: 2
      };

      const response = await apiCall('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response.success || response.id) {
        toast.success('Agendamento confirmado!');
        setSubmitted(true);
        setStep(1);
        setSelectedService(null);
        setSelectedDate('');
        setFullName('');
        setPhone('');
        setEmail('');
        setAddress('');
      } else {
        toast.error(response.error || 'Erro ao processar agendamento');
      }
    } catch (error) {
      console.error('Erro ao enviar agendamento:', error);
      toast.error(error.message || 'Erro ao processar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Head>
          <title>Agendamento Confirmado - Leidy Cleaner</title>
        </Head>
        <Header />
        <Breadcrumb />
        <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6 text-6xl sm:text-7xl"
              >
                ✅
              </motion.div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white mb-4">
                Agendamento Confirmado!
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
                Recebemos sua solicitação. Acompanhe no seu dashboard.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/" className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg transition-all">
                  ← Voltar ao Home
                </Link>
                <Link href="/dashboard-novo" className="px-8 py-3 rounded-lg border-2 border-green-600 text-green-700 dark:text-green-400 font-bold hover:shadow-lg transition-all">
                  Meus Agendamentos →
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Agendar - Leidy Cleaner</title>
      </Head>
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Agende Seu Serviço
            </h1>
          </motion.div>

          {/* Progress Bar */}
          <motion.div 
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="flex gap-2 sm:gap-4 mb-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col items-center flex-1">
                  <motion.div
                    className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
                      step >= item
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {item}
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(step - 1) * 33.33}%` }}
                className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1 */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-green-200 dark:border-slate-700"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">✨ Qual serviço você precisa?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultServices.map((service) => (
                      <motion.button
                        key={service.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleServiceSelect(service)}
                        className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border-2 border-green-300 dark:border-green-700 rounded-xl hover:shadow-lg transition-all text-left"
                      >
                        <div className="text-4xl mb-3">{service.icon}</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{service.name}</h3>
                        <p className="text-green-600 dark:text-green-400 font-bold">R$ {service.price}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-green-200 dark:border-slate-700 space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📅 Quando?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-2 text-gray-900 dark:text-white">Data</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-3 border-2 border-green-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-2 text-gray-900 dark:text-white">Horário</label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 border-2 border-green-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-lg font-bold hover:bg-gray-300">← Voltar</button>
                    {selectedDate && <button type="button" onClick={() => setStep(3)} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg">Próximo →</button>}
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-green-200 dark:border-slate-700 space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Seus dados</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="p-3 border-2 border-green-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" required />
                    <input type="tel" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-3 border-2 border-green-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" required />
                  </div>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border-2 border-green-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
                  <input type="text" placeholder="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border-2 border-green-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" required />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-lg font-bold">← Voltar</button>
                    {fullName && phone && address && <button type="button" onClick={() => setStep(4)} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold">Confirmar →</button>}
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-green-200 dark:border-slate-700 space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✅ Confirme seu agendamento</h2>
                  <div className="bg-green-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                    <p className="text-gray-700 dark:text-gray-300"><strong>Serviço:</strong> {selectedService?.name}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Data:</strong> {selectedDate}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Horário:</strong> {selectedTime}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Nome:</strong> {fullName}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Telefone:</strong> {phone}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Endereço:</strong> {address}</p>
                    <p className="text-lg font-bold text-green-600"><strong>Total:</strong> R$ {selectedService?.price}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(3)} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-lg font-bold">← Voltar</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold disabled:opacity-50">
                      {isSubmitting ? 'Enviando...' : 'Confirmar ✅'}
                    </button>
                  </div>
                </motion.div>
              )}

            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

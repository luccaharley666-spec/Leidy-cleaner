import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { RecurringScheduler } from '../components/UI/RecurringScheduler';
// import { BookingForm } from '../components/Common/UIComponents';
import AvailableStaffWidget from '../components/AvailableStaffWidget';
import { apiCall } from '../config/api';
import toast from 'react-hot-toast';

/**
 * Página de Agendamento - Formulário interativo em 4 passos
 */
export default function Agendar() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const services = [
    { id: 1, name: 'Limpeza Residencial', price: 150, icon: '🏠', duration: '2-3h' },
    { id: 2, name: 'Limpeza Profunda', price: 250, icon: '✨', duration: '4-5h' },
    { id: 3, name: 'Limpeza de Vidros', price: 100, icon: '🪟', duration: '1-2h' },
    { id: 4, name: 'Limpeza de Tapetes', price: 80, icon: '🧽', duration: '1-3h' },
    { id: 5, name: 'Limpeza Comercial', price: 300, icon: '🏢', duration: '3-6h' },
    { id: 6, name: 'Limpeza de Áreas Externas', price: 120, icon: '🌳', duration: '1-2h' }
  ];

  const handleServiceToggle = (serviceId) => {
    if (selectedServices.find(s => s.id === serviceId)) {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    } else {
      const service = services.find(s => s.id === serviceId);
      setSelectedServices([...selectedServices, service]);
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !fullName || !phone || !address || selectedServices.length === 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      // Recuperar user ID do localStorage ou contexto
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId) {
        toast.error('Você precisa estar logado para agendar');
        setIsSubmitting(false);
        return;
      }

      // Enviar agendamento para o backend
      const bookingData = {
        userId,
        serviceId: selectedServices[0]?.id,
        date: selectedDate,
        time: selectedTime,
        address,
        phone,
        email: email || '',
        notes: notes || '',
        durationHours: 2,
        hasStaff: selectedStaff ? 1 : 0,
        isRecurring: isRecurring
      };

      const response = await apiCall('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response.success || response.id) {
        toast.success('Agendamento confirmado! Você receberá uma confirmação em breve.');
        setSubmitted(true);
        // Limpar formulário
        setStep(1);
        setSelectedDate('');
        setFullName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setNotes('');
        setSelectedServices([]);
        setSelectedStaff(null);
        setIsRecurring(false);
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
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6 text-6xl animate-bounce">✅</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Agendamento Confirmado!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Recebemos sua solicitação de agendamento e entraremos em contato em breve para confirmar.
              </p>
              <div className="bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-600 rounded-xl p-8 mb-8">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📞 Você receberá uma ligação ou mensagem em:
                </p>
                <p className="text-2xl font-bold text-blue-600">{phone}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link href="/" className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg transition-all">
                  ← Voltar ao Home
                </Link>
                <Link href="/servicos" className="px-8 py-3 rounded-lg bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white font-bold hover:shadow-lg transition-all">
                  Ver Serviços →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Agendar Serviço - Leidy Cleaner | Limpeza Premium</title>
        <meta name="description" content="Agende seu serviço de limpeza profissional com a Leidy Cleaner. Rápido, fácil e seguro." />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-center mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent">
              Agende Seu Serviço
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
              Preencha o formulário abaixo para solicitar seu agendamento
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                      step >= num
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                        : 'bg-gray-300 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {num}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                    {['Data/Hora', 'Serviços', 'Dados', 'Resumo'][num - 1]}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 h-1">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`flex-1 rounded-full transition-all ${
                    step >= num ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-gray-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 sm:p-12">
              {/* Step 1: Data e Hora */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Quando você quer agendar?
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="block font-bold text-gray-900 dark:text-white mb-3">
                        📅 Data Desejada
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-900 dark:text-white mb-3">
                        🕒 Horário Preferido
                      </label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Staff Availability Widget */}
                  {selectedDate && selectedTime && selectedServices.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        👥 Profissionais Disponíveis
                      </h3>
                      <AvailableStaffWidget
                        date={selectedDate}
                        time={selectedTime}
                        serviceId={selectedServices[0]?.id}
                        onSelectStaff={setSelectedStaff}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Serviços */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Quais serviços você precisa?
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceToggle(service.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedServices.find(s => s.id === service.id)
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                            : 'border-gray-300 dark:border-slate-600 hover:border-blue-300'
                        }`}
                      >
                        <p className="text-2xl mb-2">{service.icon}</p>
                        <p className="font-bold text-gray-900 dark:text-white">{service.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {service.duration} • R$ {service.price}
                        </p>
                      </button>
                    ))}
                  </div>
                  {selectedServices.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        ✓ {selectedServices.length} serviço(s) selecionado(s) - Total: R$ {calculateTotal()}
                      </p>
                    </div>
                  )}

                  {/* Recurring Scheduling Option */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-purple-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          🔄 Agendamento Recorrente
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Economize tempo com limpeza programada automaticamente
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {isRecurring && (
                      <div className="mt-4">
                        <RecurringScheduler />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Dados Pessoais */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Suas Informações
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Nome Completo *"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Telefone (WhatsApp) *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="CEP"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Endereço Completo *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                    required
                  />
                  <textarea
                    placeholder="Observações especiais (animais de estimação, características do imóvel, etc)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-600 focus:outline-none transition-all"
                    rows="4"
                  />
                </div>
              )}

              {/* Step 4: Resumo */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Resumo do Agendamento
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Data e Hora */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">📅 Data e Hora</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {new Date(selectedDate + 'T' + selectedTime).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}{' '}
                        às {selectedTime}
                      </p>
                    </div>

                    {/* Serviços */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">✨ Serviços</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedServices.length} serviço(s)
                      </p>
                    </div>

                    {/* Cliente */}
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">👤 Cliente</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{phone}</p>
                    </div>

                    {/* Valor */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">💰 Valor Total</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        R$ {calculateTotal().toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  {/* Serviços Listados */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
                    <p className="font-bold text-gray-900 dark:text-white mb-4">Serviços Agendados:</p>
                    <ul className="space-y-2">
                      {selectedServices.map((service) => (
                        <li key={service.id} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                          <span>{service.icon} {service.name}</span>
                          <span className="font-bold">R$ {service.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Endereço */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">📍 Localização</p>
                    <p className="text-gray-700 dark:text-gray-300">{address}</p>
                    {cep && <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">CEP: {cep}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-between mt-12">
                <button
                  type="button"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="px-8 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(Math.min(4, step + 1))}
                    disabled={
                      (step === 1 && !selectedDate) ||
                      (step === 2 && selectedServices.length === 0) ||
                      (step === 3 && (!fullName || !phone || !address))
                    }
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '⏳ Processando...' : '✅ Confirmar Agendamento'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

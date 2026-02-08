import React, { useState, useContext } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import CalendarPicker from '../components/Scheduling/CalendarPicker';
import ServiceSelector from '../components/Scheduling/ServiceSelector';
import PriceCalculator from '../components/Scheduling/PriceCalculator';
import { AuthContext } from '../context/AuthContext';
import { apiCall } from '../config/api';

export default function Agendar() {
  const { user } = useContext(AuthContext); // ✅ NOVO: Pegar user autenticado
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('10:00'); // ✅ NOVO: Hora selecionada
  const [selectedServices, setSelectedServices] = useState([]);
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [phone, setPhone] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    // ✅ CORRIGIDO: Usar userId do context + hora do state + apiCall
    try {
      setLoading(true);
      
      // Validar dados antes de enviar
      if (!selectedDate || !selectedServices.length || !address || !phone) {
        alert('⚠️ Por favor, preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Validar usuário autenticado
      if (!user || !user.id) {
        alert('⚠️ Você precisa estar autenticado para fazer um agendamento');
        setLoading(false);
        return;
      }

      // Preparar dados para envio ao backend
      const booking = {
        userId: user.id, // ✅ CORRIGIDO: Usar ID do usuário logado (from context)
        serviceId: selectedServices[0]?.id || 1,
        date: selectedDate,
        time: selectedTime, // ✅ CORRIGIDO: Usar hora selecionada pelo usuário
        address,
        phone,
        price: calculateTotal(),
        notes,
      };
      
      // ✅ CORRIGIDO: Usar apiCall com timeout automático
      const result = await apiCall('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      });

      alert(`✅ Agendamento realizado com sucesso!\nID: ${result.booking?.id || 'N/A'}`);
      
      // Limpar formulário
      setSelectedDate(null);
      setSelectedTime('10:00');
      setSelectedServices([]);
      setAddress('');
      setPhone('');
      setCep('');
      setNotes('');
      setStep(1);
      
    } catch (error) {
      alert(`❌ Erro: ${error.message || 'Falha ao agendar. Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Agendar Serviço de Limpeza</h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 mx-1 rounded transition ${
                  num <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-600 font-semibold">
            Passo {step} de 4
          </p>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {step === 1 && (
            <CalendarPicker onDateSelected={setSelectedDate} />
          )}

          {step === 2 && (
            <ServiceSelector onServiceSelected={setSelectedServices} />
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Localização e Detalhes</h3>
              <div className="space-y-6">
                <div>
                  <label className="block font-semibold mb-2">Hora Preferida *</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Telefone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 9999-9999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Endereço Completo *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento, bairro, cidade"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Notas Adicionais</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações adicionais sobre o serviço..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Resumo do Agendamento</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <p><strong>Data:</strong> {selectedDate}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                <p><strong>Serviço:</strong> {selectedServices.map(s => s.name).join(', ')}</p>
                <p><strong>Endereço:</strong> {address}</p>
                <p><strong>Telefone:</strong> {phone}</p>
                <p><strong>Total:</strong> R$ {calculateTotal().toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mb-8">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold disabled:opacity-50"
          >
            Voltar
          </button>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '⏳ Agendando...' : '✅ Confirmar Agendamento'}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

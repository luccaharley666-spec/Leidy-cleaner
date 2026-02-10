/**
 * EXEMPLO DE INTEGRAÇÃO: [REDACTED_TOKEN] em agendar-updated.jsx
 * 
 * Este arquivo mostra COMO integrar o componente novo na página existente
 * Copie e cole a seção relevante na sua página de agendamento
 */

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import [REDACTED_TOKEN] from '../components/[REDACTED_TOKEN]';
import apiCall from '../config/api';
import styles from '../styles/agendar.module.css';

export default function [REDACTED_TOKEN]() {
  const { user, token, userId } = useContext(AuthContext);
  
  // Estados do formulário
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Step-based form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Serviços disponíveis (mock, substitua pela API)
  const services = [
    { id: 1, name: 'Limpeza Profunda', price: 199.90, icon: '🧹' },
    { id: 2, name: 'Limpeza Pós-Obra', price: 299.90, icon: '🏗️' },
    { id: 3, name: 'Limpeza Residencial', price: 149.90, icon: '🏠' },
    { id: 4, name: 'Higienização Profissional', price: 249.90, icon: '✨' },
  ];

  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleSelectStaff = (staff) => {
    console.log('Staff selecionado:', staff);
    setSelectedStaff(staff);
  };

  const handleCreateBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !address) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        address: address,
        notes: notes,
        staffId: selectedStaff?.id || null, // Staff pode ser null (auto-assign)
        duration: 2,
        userId: userId
      };

      const response = await apiCall(
        'POST',
        '/api/bookings',
        bookingData
      );

      if (response.success || response.data) {
        setSuccess(true);
        // Redirecionar ou mostrar sucesso
        console.log('Agendamento criado:', response);
        
        // Reset form
        setTimeout(() => {
          setCurrentStep(1);
          setSelectedService(null);
          setSelectedDate(null);
          setSelectedTime(null);
          setSelectedStaff(null);
          setAddress('');
          setNotes('');
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1>📅 Agende Seu Serviço</h1>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className={styles.stepCounter}>
            Passo {currentStep} de {totalSteps}
          </p>
        </div>

        {/* STEP 1: Selecionar Serviço */}
        {currentStep === 1 && (
          <div className={styles.step}>
            <h2>Qual serviço você precisa?</h2>
            <div className={styles.serviceGrid}>
              {services.map(service => (
                <div
                  key={service.id}
                  className={`${styles.serviceCard} ${
                    selectedService?.id === service.id ? styles.selected : ''
                  }`}
                  onClick={() => handleSelectService(service)}
                >
                  <span className={styles.serviceIcon}>{service.icon}</span>
                  <h3>{service.name}</h3>
                  <p className={styles.price}>
                    A partir de <strong>R$ {service.price.toFixed(2)}</strong>
                  </p>
                  <button className={styles.selectBtn}>
                    {selectedService?.id === service.id ? '✓ Selecionado' : 'Selecionar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Selecionar Data e Hora */}
        {currentStep === 2 && selectedService && (
          <div className={styles.step}>
            <h2>Quando você prefere o serviço?</h2>
            <div className={styles.formGroup}>
              <label>Data</label>
              <input
                type="date"
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Horário</label>
              <select
                value={selectedTime || ''}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Selecione um horário --</option>
                {['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {selectedDate && selectedTime && (
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(3)}
              >
                Continuar →
              </button>
            )}
          </div>
        )}

        {/* STEP 3: NOVO! Selecionar Profissional ([REDACTED_TOKEN]) */}
        {currentStep === 3 && selectedService && selectedDate && selectedTime && (
          <div className={styles.step}>
            <h2>Qual profissional você prefere?</h2>
            
            {/* Componente novo aqui! */}
            <[REDACTED_TOKEN]
              date={selectedDate}
              time={selectedTime}
              serviceId={selectedService.id}
              onSelectStaff={handleSelectStaff}
              autoScroll={true}
            />

            <div className={styles.staffOptional}>
              <input
                type="checkbox"
                id="autoAssign"
                defaultChecked={!selectedStaff}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStaff(null);
                  }
                }}
              />
              <label htmlFor="autoAssign">
                Deixar o sistema escolher a melhor profissional para mim
              </label>
            </div>

            <button
              className={styles.nextBtn}
              onClick={() => setCurrentStep(4)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 4: Endereço e Observações */}
        {currentStep === 4 && (
          <div className={styles.step}>
            <h2>Últimos detalhes</h2>

            <div className={styles.formGroup}>
              <label>Endereço Completo *</label>
              <input
                type="text"
                placeholder="Rua, número, complemento"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Observações (opcional)</label>
              <textarea
                placeholder="Deixe alguma informação importante para a profissional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
                rows="4"
              />
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h3>Resumo do Agendamento</h3>
              <div className={styles.summaryItem}>
                <span>Serviço:</span>
                <strong>{selectedService?.name}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Data:</span>
                <strong>{new Date(selectedDate).toLocaleDateString('pt-BR')}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Horário:</span>
                <strong>{selectedTime}</strong>
              </div>
              {selectedStaff && (
                <div className={styles.summaryItem}>
                  <span>Profissional:</span>
                  <strong>{selectedStaff.name}</strong>
                </div>
              )}
              <div className={styles.summaryItem}>
                <span>Preço estimado:</span>
                <strong className={styles.price}>
                  R$ {selectedService?.price.toFixed(2)}
                </strong>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>✓ Agendamento realizado com sucesso!</div>}

            <button
              className={styles.submitBtn}
              onClick={handleCreateBooking}
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        )}

        {/* Navigation */}
        {currentStep > 1 && !success && (
          <button
            className={styles.backBtn}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
}

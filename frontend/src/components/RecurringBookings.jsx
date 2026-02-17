import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecurringBookings.css';

const RecurringBookings = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    professionalId: '',
    serviceId: '',
    dayOfWeek: 0,
    time: '09:00',
    frequency: 'weekly',
    endDate: ''
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/recurring-bookings/my-recurring', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/recurring-bookings/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      await loadBookings();
      alert('✅ Agendamento recorrente criado!');
    } catch (error) {
      alert('❌ Erro ao criar agendamento');
    }
  };

  const handlePauseResume = async (bookingId, isPaused) => {
    try {
      const endpoint = isPaused ? `/api/recurring-bookings/resume/${bookingId}` : `/api/recurring-bookings/pause/${bookingId}`;
      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadBookings();
      alert('✅ Status atualizado!');
    } catch (error) {
      alert('❌ Erro ao atualizar');
    }
  };

  const getDayName = (dayNum) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayNum];
  };

  if (loading) return <div className="recurring-loading">Carregando...</div>;

  return (
    <div className="recurring-bookings">
      <div className="recurring-header">
        <h2>🔄 Agendamentos Recorrentes</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          + Novo Agendamento Recorrente
        </button>
      </div>

      { showForm && (
        <form onSubmit={handleCreate} className="recurring-form">
          <input
            type="text"
            placeholder="ID do Profissional"
            value={formData.professionalId}
            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="ID do Serviço"
            value={formData.serviceId}
            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            required
          />
          <select
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
          >
            <option value="0">Domingo</option>
            <option value="1">Segunda</option>
            <option value="2">Terça</option>
            <option value="3">Quarta</option>
            <option value="4">Quinta</option>
            <option value="5">Sexta</option>
            <option value="6">Sábado</option>
          </select>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <button type="submit">Criar Recorrência</button>
          <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
        </form>
      )}

      {bookings.length === 0 ? (
        <p className="no-bookings">Nenhum agendamento recorrente</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h4>{booking.professional_name}</h4>
                <p>Serviço: {booking.service_name}</p>
                <p>📅 {getDayName(booking.day_of_week)} às {booking.time}</p>
                <p>🔄 {booking.frequency}</p>
              </div>
              <div className="booking-actions">
                <button
                  className={`status-btn ${booking.active ? 'active' : 'paused'}`}
                  onClick={() => handlePauseResume(booking.id, !booking.active)}
                >
                  {booking.active ? '⏸️ Pausar' : '▶️ Retomar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringBookings;

/**
 * NextBookings.jsx - Mostra Próximos Agendamentos
 * Feature útil #3 - Destaca os próximos compromissos
 */

import React, { useState, useEffect } from 'react';
import styles from './NextBookings.module.css';

const NextBookings = ({ limit = 3, onBookingClick = null }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch upcoming bookings from API
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        // Se tiver token, fetch do backend
        // Por enquanto, mock data
        const mockBookings = [
          {
            id: 1,
            service: 'Limpeza Residencial',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            time: '10:00',
            address: 'Rua das Flores, 123 - Apto 42',
            staff: 'Maria Silva',
            status: 'confirmed',
            price: 150,
            statusLabel: 'Confirmado'
          },
          {
            id: 2,
            service: 'Limpeza de Vidros',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            time: '14:00',
            address: 'Rua das Flores, 123 - Apto 42',
            staff: 'João Pedro',
            status: 'confirmed',
            price: 100,
            statusLabel: 'Confirmado'
          },
          {
            id: 3,
            service: 'Limpeza Profunda',
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            time: '09:00',
            address: 'Rua das Flores, 123 - Apto 42',
            staff: 'Ana Costa',
            status: 'pending',
            price: 250,
            statusLabel: 'Pendente'
          }
        ];
        
        setBookings(mockBookings.slice(0, limit));
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [limit]);

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) {
      return 'Hoje';
    } else if (d.getTime() === tomorrow.getTime()) {
      return 'Amanhã';
    } else {
      const days = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
      return `Em ${days} dias`;
    }
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className={styles.loading}>⏳ Carregando agendamentos...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📅</span>
        <p className={styles.emptyText}>Nenhum agendamento próximo</p>
        <small>Agende um serviço para começar!</small>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📅 Próximos Agendamentos</h3>
        <span className={styles.count}>{bookings.length}</span>
      </div>

      <div className={styles.bookingsList}>
        {bookings.map((booking, index) => {
          const daysUntil = getDaysUntil(booking.date);
          const isUrgent = daysUntil <= 2;
          
          return (
            <div
              key={booking.id}
              className={`${styles.bookingCard} ${isUrgent ? styles.urgent : ''}`}
              onClick={() => onBookingClick && onBookingClick(booking)}
            >
              {/* Left Side - Timeline */}
              <div className={styles.timeline}>
                <div className={`${styles.dot} ${styles[`status-${booking.status}`]}`} />
                {index < bookings.length - 1 && <div className={styles.line} />}
              </div>

              {/* Content */}
              <div className={styles.content}>
                <div className={styles.topRow}>
                  <div className={styles.serviceInfo}>
                    <h4 className={styles.serviceName}>{booking.service}</h4>
                    <span className={styles.dateTag}>{formatDate(booking.date)}</span>
                  </div>
                  {isUrgent && <span className={styles.urgentBadge}>⏰</span>}
                </div>

                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <span className={styles.icon}>🕐</span>
                    <span>{booking.time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.icon}>👤</span>
                    <span>{booking.staff}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.icon}>📍</span>
                    <span className={styles.addressTruncate}>{booking.address}</span>
                  </div>
                </div>

                <div className={styles.footer}>
                  <span className={`${styles.status} ${styles[`status-${booking.status}`]}`}>
                    {booking.statusLabel}
                  </span>
                  <span className={styles.price}>R$ {booking.price}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className={styles.arrow}>→</div>
            </div>
          );
        })}
      </div>

      <button className={styles.viewAllBtn}>
        Ver todos os agendamentos →
      </button>
    </div>
  );
};

export default NextBookings;

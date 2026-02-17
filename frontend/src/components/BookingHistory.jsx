/**
 * BookingHistory.jsx - Histórico Completo de Agendamentos
 * Feature útil #5 - Acesso a todo o histórico com filtros
 */

import React, { useState, useMemo } from 'react';
import styles from './BookingHistory.module.css';

const BookingHistory = ({ limit = 10 }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - substituir com API call
  const allBookings = [
    {
      id: 1,
      service: 'Limpeza Residencial',
      date: new Date(2024, 1, 25, 10, 0),
      address: 'Rua A, 123',
      staff: 'Maria Silva',
      status: 'completed',
      price: 150,
      rating: 5,
      notes: 'Excelente trabalho!'
    },
    {
      id: 2,
      service: 'Limpeza de Vidros',
      date: new Date(2024, 1, 20, 14, 0),
      address: 'Rua A, 123',
      staff: 'João Pedro',
      status: 'completed',
      price: 100,
      rating: 4.5,
      notes: 'Muito bom'
    },
    {
      id: 3,
      service: 'Limpeza Profunda',
      date: new Date(2024, 1, 15, 9, 0),
      address: 'Rua A, 123',
      staff: 'Ana Costa',
      status: 'completed',
      price: 250,
      rating: 5,
      notes: 'Perfeito!'
    },
    {
      id: 4,
      service: 'Limpeza Residencial',
      date: new Date(2024, 0, 28, 10, 0),
      address: 'Rua B, 456',
      staff: 'Maria Silva',
      status: 'completed',
      price: 150,
      rating: 4,
      notes: 'Bom'
    },
    {
      id: 5,
      service: 'Limpeza de Áreas Externas',
      date: new Date(2024, 0, 20, 11, 0),
      address: 'Rua A, 123',
      staff: 'Carlos Santos',
      status: 'completed',
      price: 120,
      rating: 4.5,
      notes: 'Ótimo!'
    },
    {
      id: 6,
      service: 'Limpeza Comercial',
      date: new Date(2024, 0, 10, 8, 0),
      address: 'Av. Principal, 1000',
      staff: 'Pedro Lima',
      status: 'cancelled',
      price: 300,
      rating: null,
      notes: 'Cancelado por motivo pessoal'
    }
  ];

  const filtered = useMemo(() => {
    let result = [...allBookings];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(b => b.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(b =>
        b.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => b.date - a.date);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.date - b.date);
    } else if (sortBy === 'highest-price') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'lowest-price') {
      result.sort((a, b) => a.price - b.price);
    }

    return result.slice(0, limit);
  }, [filterStatus, searchTerm, sortBy, limit]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'pending': return '⏳';
      default: return '•';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📜 Histórico de Agendamentos</h3>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por serviço, profissional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.select}
          >
            <option value="all">📋 Todos os status</option>
            <option value="completed">✅ Concluídos</option>
            <option value="cancelled">❌ Cancelados</option>
            <option value="pending">⏳ Pendentes</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="recent">🔄 Mais recentes</option>
            <option value="oldest">🔄 Mais antigos</option>
            <option value="highest-price">💰 Maior preço</option>
            <option value="lowest-price">💰 Menor preço</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className={styles.bookingsList}>
        {filtered.length > 0 ? (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.colService}>Serviço</div>
              <div className={styles.colDate}>Data/Hora</div>
              <div className={styles.colStaff}>Profissional</div>
              <div className={styles.colPrice}>Valor</div>
              <div className={styles.colRating}>Avaliação</div>
              <div className={styles.colStatus}>Status</div>
            </div>

            {filtered.map((booking) => (
              <div key={booking.id} className={`${styles.bookingRow} ${styles[`status-${booking.status}`]}`}>
                <div className={styles.colService}>
                  <div className={styles.serviceBlock}>
                    <span className={styles.serviceName}>{booking.service}</span>
                    <small className={styles.address}>{booking.address}</small>
                  </div>
                </div>

                <div className={styles.colDate}>
                  <div className={styles.dateBlock}>
                    <span>{formatDate(booking.date)}</span>
                  </div>
                </div>

                <div className={styles.colStaff}>
                  <span>{booking.staff}</span>
                </div>

                <div className={styles.colPrice}>
                  <strong>R$ {booking.price}</strong>
                </div>

                <div className={styles.colRating}>
                  {booking.rating ? (
                    <div className={styles.ratingStars}>
                      {'⭐'.repeat(Math.floor(booking.rating))}
                      {booking.rating % 1 !== 0 && '✨'}
                      <small className={styles.ratingValue}>{booking.rating}</small>
                    </div>
                  ) : (
                    <small className={styles.noRating}>N/A</small>
                  )}
                </div>

                <div className={styles.colStatus}>
                  <span className={`${styles.status} ${styles[`status-${booking.status}`]}`}>
                    {getStatusIcon(booking.status)} {getStatusLabel(booking.status)}
                  </span>
                </div>

                {/* Notes if any */}
                {booking.notes && (
                  <div className={styles.notes}>
                    💬 {booking.notes}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>Nenhum agendamento encontrado</p>
            <small>Tente outro filtro ou termo de busca</small>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total de agendamentos:</span>
          <strong>{allBookings.length}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total gasto:</span>
          <strong>R$ {allBookings.reduce((sum, b) => sum + b.price, 0)}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Média de avaliação:</span>
          <strong>{(allBookings.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / allBookings.filter(b => b.rating).length).toFixed(1)}</strong>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;

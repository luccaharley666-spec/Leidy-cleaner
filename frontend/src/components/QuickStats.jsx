/**
 * QuickStats.jsx - Estatísticas Rápidas do Usuário
 * Feature útil #4 - Dashboard com KPIs principais
 */

import React, { useState, useEffect } from 'react';
import styles from './QuickStats.module.css';

const QuickStats = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    nextBooking: null,
    favoriteService: null,
    memberSince: null
  });

  useEffect(() => {
    // Mock data - substituir por chamada de API
    const mockStats = {
      totalBookings: 12,
      totalSpent: 1450,
      averageRating: 4.8,
      nextBooking: 'Amanhã às 10h',
      favoriteService: 'Limpeza Residencial',
      memberSince: new Date(2024, 0, 15) // Jan 15, 2024
    };

    setStats(mockStats);
  }, []);

  const formatDate = (date) => {
    if (!date) return 'Desde início';
    const now = new Date();
    const months = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'Menos de 1 mês';
    return `${months} mês${months > 1 ? 'es' : ''}`;
  };

  const getSavingsEstimate = () => {
    // Estimar economia baseado em padrão de uso
    return Math.floor(stats.totalSpent * 0.15); // 15% economizado com smart features
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📊 Sua Atividade</h3>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Total Spent */}
        <div className={styles.statCard}>
          <div className={styles.icon}>💰</div>
          <div className={styles.content}>
            <span className={styles.label}>Total Gasto</span>
            <h4 className={styles.value}>R$ {stats.totalSpent}</h4>
            <small className={styles.helper}>Em {stats.totalBookings} agendamentos</small>
          </div>
        </div>

        {/* Total Bookings */}
        <div className={styles.statCard}>
          <div className={styles.icon}>📅</div>
          <div className={styles.content}>
            <span className={styles.label}>Agendamentos</span>
            <h4 className={styles.value}>{stats.totalBookings}</h4>
            <small className={styles.helper}>{formatDate(stats.memberSince)} de membro</small>
          </div>
        </div>

        {/* Rating */}
        <div className={styles.statCard}>
          <div className={styles.icon}>⭐</div>
          <div className={styles.content}>
            <span className={styles.label}>Média de Avaliações</span>
            <h4 className={styles.value}>{stats.averageRating}</h4>
            <small className={styles.helper}>Muito bom!</small>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className={styles.statCard}>
          <div className={styles.icon}>💚</div>
          <div className={styles.content}>
            <span className={styles.label}>Economia Estimada</span>
            <h4 className={styles.value}>R$ {getSavingsEstimate()}</h4>
            <small className={styles.helper}>Com smart features</small>
          </div>
        </div>
      </div>

      {/* Additional Info Row */}
      <div className={styles.infoRow}>
        <div className={styles.infoBlock}>
          <span className={styles.infoIcon}>🏆</span>
          <div>
            <strong>Próximo agendamento</strong>
            <p className={styles.infoValue}>{stats.nextBooking}</p>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <span className={styles.infoIcon}>❤️</span>
          <div>
            <strong>Serviço favorito</strong>
            <p className={styles.infoValue}>{stats.favoriteService}</p>
          </div>
        </div>
      </div>

      {/* Benefits Card */}
      <div className={styles.benefitsCard}>
        <h4 className={styles.benefitsTitle}>🎁 Seus Benefícios</h4>
        <ul className={styles.benefitsList}>
          <li>✅ Acesso a horários com preço reduzido</li>
          <li>✅ Recomendações inteligentes de serviços</li>
          <li>✅ Prioridade na disponibilidade</li>
          <li>✅ Programa de lealdade com descontos</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.primaryBtn}>
          📅 Novo Agendamento
        </button>
        <button className={styles.secondaryBtn}>
          📜 Ver Histórico
        </button>
      </div>
    </div>
  );
};

export default QuickStats;

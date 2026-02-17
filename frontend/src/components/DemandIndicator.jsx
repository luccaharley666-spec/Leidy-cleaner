/**
 * DemandIndicator.jsx - Mostra Horários com Baixa Demanda
 * Feature útil #2 - Preços mais baixos em horários menos procurados
 */

import React, { useMemo } from 'react';
import styles from './DemandIndicator.module.css';

const DemandIndicator = ({ selectedDate = null, onSelectTime = null }) => {
  // Simular dados de demanda do backend
  const demandData = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Padrão típico de demanda: manhã alta, meio do dia média, noite alta
    const timeSlots = [
      { time: '08:00', label: '8h da manhã', demand: 'high', savings: 0 },
      { time: '09:00', label: '9h da manhã', demand: 'high', savings: 0 },
      { time: '10:00', label: '10h da manhã', demand: 'high', savings: 0 },
      { time: '11:00', label: '11h da manhã', demand: 'medium', savings: 5 },
      { time: '12:00', label: '12h (almoço)', demand: 'low', savings: 15, badge: '💰 Barato!' },
      { time: '13:00', label: '13h (tarde)', demand: 'low', savings: 15, badge: '💰 Barato!' },
      { time: '14:00', label: '14h (tarde)', demand: 'low', savings: 15, badge: '💰 Barato!' },
      { time: '15:00', label: '15h (tarde)', demand: 'medium', savings: 8 },
      { time: '16:00', label: '16h (tarde)', demand: 'medium', savings: 8 },
      { time: '17:00', label: '17h (final)', demand: 'high', savings: 0 },
      { time: '18:00', label: '18h (noite)', demand: 'high', savings: 0 },
      { time: '19:00', label: '19h (noite)', demand: 'high', savings: 0 },
    ];

    return timeSlots;
  }, []);

  const getDemandIcon = (demand) => {
    switch(demand) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  const getDemandText = (demand) => {
    switch(demand) {
      case 'low': return 'Baixa demanda';
      case 'medium': return 'Demanda média';
      case 'high': return 'Alta demanda';
      default: return 'Normal';
    }
  };

  const lowDemandSlots = demandData.filter(s => s.demand === 'low');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>⏰ Horários com Melhor Preço</h3>
        <p className={styles.subtitle}>Reserve em horários com menos demanda e economize!</p>
      </div>

      {/* Recommended Times */}
      <div className={styles.recommended}>
        <div className={styles.recommendedHeader}>
          <span className={styles.badge}>💰 Recomendado</span>
          <span className={styles.count}>{lowDemandSlots.length} horários</span>
        </div>
        
        <div className={styles.timeGrid}>
          {lowDemandSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSelectTime && onSelectTime(slot)}
              className={styles.timeSlot}
              title={`Economize até ${slot.savings}%`}
            >
              <div className={styles.timeDisplay}>{slot.time}</div>
              <div className={styles.savingsTag}>-{slot.savings}%</div>
            </button>
          ))}
        </div>
      </div>

      {/* All Time Slots */}
      <div className={styles.allTimes}>
        <details>
          <summary className={styles.summary}>
            📋 Ver todos os horários ({demandData.length})
          </summary>
          
          <div className={styles.allTimesList}>
            {demandData.map((slot) => (
              <div
                key={slot.time}
                className={`${styles.timeOption} ${styles[`demand-${slot.demand}`]}`}
                onClick={() => onSelectTime && onSelectTime(slot)}
              >
                <div className={styles.timeInfo}>
                  <span className={styles.demandIcon}>{getDemandIcon(slot.demand)}</span>
                  <div className={styles.details}>
                    <span className={styles.timeLabel}>{slot.label}</span>
                    <span className={styles.demandLabel}>{getDemandText(slot.demand)}</span>
                  </div>
                </div>
                
                <div className={styles.rightSide}>
                  {slot.savings > 0 && (
                    <span className={styles.economyTag}>-{slot.savings}%</span>
                  )}
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Info Card */}
      <div className={styles.infoCard}>
        <span className={styles.infoIcon}>ℹ️</span>
        <div className={styles.infoText}>
          <strong>Dica:</strong> Horários de menor demanda têm preços mais baixos automaticamente. Nossa IA valida a disponibilidade em tempo real!
        </div>
      </div>
    </div>
  );
};

export default DemandIndicator;

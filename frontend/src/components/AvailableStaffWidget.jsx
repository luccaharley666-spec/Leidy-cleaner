/**
 * AvailableStaffWidget.jsx
 * Mostra staff disponível com scores, ratings, carga
 * Componente reutilizável para booking flow
 * ✅ Real-time updates via WebSocket ready
 */

import React, { useEffect, useState } from 'react';
import { apiCall } from '../config/api';

const AvailableStaffWidget = ({ 
  date, 
  time, 
  serviceId, 
  onSelectStaff,
  autoScroll = true 
}) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [expandedStaffId, setExpandedStaffId] = useState(null);

  // Fetch available staff
  useEffect(() => {
    if (!date || !time || !serviceId) {
      setLoading(false);
      return;
    }

    const fetchAvailableStaff = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          date,
          time,
          serviceId,
          duration: 2
        });

        const result = await apiCall(`/api/staff/available?${params.toString()}`, { method: 'GET' });
        setStaff(result.data || []);
        setError(null);

        // Auto-select best option
        if (result.data?.length > 0 && !selectedStaffId) {
          const bestOption = result.data[0];
          setSelectedStaffId(bestOption.id);
          onSelectStaff?.(bestOption);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para não fazer requests demais
    const timer = setTimeout(fetchAvailableStaff, 300);
    return () => clearTimeout(timer);
  }, [date, time, serviceId]);

  // Auto-scroll ao staff recomendado
  useEffect(() => {
    if (autoScroll && staff.length > 0) {
      const recommendedElement = document.getElementById(`staff-${staff[0]?.id}`);
      recommendedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [staff, autoScroll]);

  const getLoadStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';    // verde
      case 'light': return '#f59e0b';        // amarelo
      case 'medium': return '#f97316';       // laranja
      case 'heavy': return '#ef4444';        // vermelho
      default: return '#6b7280';
    }
  };

  const getLoadStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'light': return '1-2 agendamentos';
      case 'medium': return '3-4 agendamentos';
      case 'heavy': return 'Lotada';
      default: return 'Unknown';
    }
  };

  const handleSelectStaff = (selectedStaff) => {
    setSelectedStaffId(selectedStaff.id);
    onSelectStaff?.(selectedStaff);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Carregando profissionais disponíveis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <span>😞</span>
          <p>Nenhum profissional disponível para este horário</p>
          <small>Tente outro dia ou horário</small>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>👥 Profissionais Disponíveis</h3>
        <span className={styles.badge}>{staff.length} profissional(is)</span>
      </div>

      {/* Recomendado */}
      {staff[0]?.recommendation === 'highly_recommended' && (
        <div className={styles.recommendation}>
          <span>⭐ ALTAMENTE RECOMENDADO</span>
          <p>{staff[0].name} tem a melhor avaliação para este serviço</p>
        </div>
      )}

      <div className={styles.staffList}>
        {staff.map((s) => (
          <div
            key={s.id}
            id={`staff-${s.id}`}
            className={`${styles.staffCard} ${selectedStaffId === s.id ? styles.selected : ''}`}
            onClick={() => handleSelectStaff(s)}
          >
            {/* Avatar & Basic Info */}
            <div className={styles.staffHeader}>
              <div className={styles.avatar}>
                {s.profile_image ? (
                  <img src={s.profile_image} alt={s.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                {/* Load status indicator */}
                <div
                  className={styles.loadIndicator}
                  style={{ backgroundColor: getLoadStatusColor(s.load_status) }}
                  title={getLoadStatusLabel(s.load_status)}
                />
              </div>

              <div className={styles.basicInfo}>
                <h4>{s.name}</h4>
                
                {/* Rating */}
                <div className={styles.rating}>
                  {'⭐'.repeat(Math.floor(s.avg_rating))}
                  <span className={styles.ratingNumber}>
                    {s.avg_rating.toFixed(1)}
                  </span>
                  <span className={styles.ratingCount}>
                    ({s.total_completed} serviços)
                  </span>
                </div>

                {/* Bio/Specialization */}
                {s.bio && <p className={styles.bio}>{s.bio}</p>}
              </div>

              {/* Recommendation Badge */}
              {s.recommendation === 'highly_recommended' && (
                <div className={styles.recommendationBadge}>
                  RECOMENDADO
                </div>
              )}
            </div>

            {/* Details - Expandible */}
            {expandedStaffId !== s.id && (
              <div className={styles.staffMetrics}>
                {/* Load */}
                <div className={styles.metric}>
                  <label>Carga de Trabalho</label>
                  <div className={styles.loadBar}>
                    <div
                      className={styles.loadFill}
                      style={ {
                        width: `${100 - s.decoded }%`,
                        backgroundColor: getLoadStatusColor(s.load_status)
                      }}
                    />
                  </div>
                  <span className={styles.metricValue}>
                    {s.bookings_today}/6 agendamentos
                  </span>
                </div>

                {/* Availability */}
                <div className={styles.metric}>
                  <label>Disponibilidade</label>
                  <span className={styles.metricValue}>
                    { s.decoded }%
                  </span>
                  <small className={styles.metricLabel}>
                    {getLoadStatusLabel(s.load_status)}
                  </small>
                </div>

                {/* Estimated Price */}
                <div className={styles.metric}>
                  <label>Preço Estimado</label>
                  <span className={styles.price}>
                    R$ {s.estimated_price?.toFixed(2)}
                  </span>
                  <small className={styles.metricLabel}>
                    {s.bookings_today > 0 && '+surge pricing'}
                  </small>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className={styles.action}>
              <button
                className={`${styles.selectButton} ${selectedStaffId === s.id ? styles.selected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectStaff(s);
                }}
              >
                {selectedStaffId === s.id ? '✓ Selecionado' : 'Selecionar'}
              </button>

              <button
                className={styles.expandButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedStaffId(expandedStaffId === s.id ? null : s.id);
                }}
              >
                {expandedStaffId === s.id ? '▲' : '▼'}
              </button>
            </div>

            {/* Expanded Details */}
            {expandedStaffId === s.id && (
              <div className={styles.expandedDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Próximo Agendamento:</span>
                  <span className={styles.detailValue}>
                    {s.next_booking_time 
                      ? new Date(s.next_booking_time).toLocaleTimeString('pt-BR')
                      : 'Sem agendamentos'
                    }
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Score de Alocação:</span>
                  <span className={styles.detailValue}>{s.final_score}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <p>
          <strong>{selectedStaffId ? '✓ Profissional selecionado' : 'Selecione uma profissional acima'}</strong>
        </p>
        {selectedStaffId && (
          <p className={styles.summaryText}>
            Você será agendado com <strong>{staff.find(s => s.id === selectedStaffId)?.name}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default AvailableStaffWidget;

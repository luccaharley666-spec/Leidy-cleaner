/**
 * DynamicPricingDisplay.jsx
 * Mostra preço dinâmico com breakdown e savings
 * Feature #2: Dynamic Pricing Engine
 */

import React, { useEffect, useState } from 'react';
import { apiCall } from '../config/api';
import styles from './DynamicPricingDisplay.module.css';

export const DynamicPricingDisplay = ({
  serviceId,
  date,
  time,
  duration = 2,
  userId,
  onPricingUpdate
}) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    if (!serviceId || !date || !time) return;

    const fetchPricing = async () => {
      try {
        setLoading(true);
        const result = await apiCall('/api/smart/pricing/calculate', {
          method: 'POST',
          body: JSON.stringify({
            serviceId,
            date,
            time,
            duration,
            userId
          })
        });

        setPricing(result.data);
        onPricingUpdate?.(result.data);
      } catch (error) {
        console.error('Error fetching pricing', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPricing, 500);
    return () => clearTimeout(debounceTimer);
  }, [serviceId, date, time, duration, userId]);

  if (loading) {
    return <div className={styles.loading}>Calculando preço...</div>;
  }

  if (!pricing) {
    return <div className={styles.empty}>Preço indisponível</div>;
  }

  const hasDiscount = pricing.savings > 0;
  const discountColor = hasDiscount ? '#10b981' : '#6b7280';

  return (
    <div className={styles.container}>
      {/* Preço Principal */}
      <div className={styles.priceDisplay}>
        <div className={styles.finalPrice}>
          <span className={styles.label}>Preço Final</span>
          <span className={styles.value}>
            R$ {pricing.final_price.toFixed(2)}
          </span>
        </div>

        {hasDiscount && (
          <div className={styles.savings}>
            <span className={styles.badge} style={{ background: discountColor }}>
              💰 Economize R$ {pricing.savings.toFixed(2)}
              <span className={styles.percentage}>
                ({pricing.savings_percentage}%)
              </span>
            </span>
          </div>
        )}

        {!hasDiscount && pricing.base_calculated_price > 0 && (
          <div className={styles.basePrice}>
            <s>R$ {pricing.base_calculated_price.toFixed(2)}</s>
          </div>
        )}
      </div>

      {/* Resumo Rápido */}
      <div className={styles.quickSummary}>
        <div className={styles.summaryItem}>
          <span>Duração</span>
          <strong>{pricing.duration_hours}h</strong>
        </div>

        {pricing.price_factors.rush_hour_factor > 1 && (
          <div className={styles.summaryItem}>
            <span>Horário de pico</span>
            <strong style={{ color: '#ef4444' }}>
              +{Math.round((pricing.price_factors.rush_hour_factor - 1) * 100)}%
            </strong>
          </div>
        )}

        {pricing.discounts.total_discount_percentage > 0 && (
          <div className={styles.summaryItem}>
            <span>Desconto</span>
            <strong style={{ color: '#10b981' }}>
              -{pricing.discounts.total_discount_percentage}%
            </strong>
          </div>
        )}
      </div>

      {/* Expandível: Detalhes Completos */}
      <button
        className={styles.expandButton}
        onClick={() => setExpandedView(!expandedView)}
      >
        {expandedView ? '✕ Fechar detalhes' : '⋮ Ver detalhes'}
      </button>

      {expandedView && (
        <div className={styles.expandedView}>
          {/* Breakdown de Preço */}
          <div className={styles.section}>
            <h4>Breakdown de Preço</h4>
            <div className={styles.breakdownChart}>
              <div className={styles.step}>
                <span>Preço base</span>
                <strong>R$ {pricing.base_price.toFixed(2)}</strong>
              </div>

              {pricing.duration_multiplier > 1 && (
                <div className={styles.step}>
                  <span>
                    × Duração ({pricing.duration_hours}h)
                  </span>
                  <strong>
                    R$ {pricing.pricing_breakdown?.duration_adjusted?.toFixed(2)}
                  </strong>
                </div>
              )}

              {pricing.price_factors.demand_factor > 1 && (
                <div className={styles.step}>
                  <span>
                    × Demanda ({(pricing.price_factors.demand_factor * 100).toFixed(0)}%)
                  </span>
                  <strong>
                    R$ {pricing.pricing_breakdown?.with_demand?.toFixed(2)}
                  </strong>
                </div>
              )}

              {pricing.price_factors.rush_hour_factor > 1 && (
                <div className={styles.step}>
                  <span>
                    × Horário ({(pricing.price_factors.rush_hour_factor * 100).toFixed(0)}%)
                  </span>
                  <strong>
                    R$ {pricing.pricing_breakdown?.with_rush?.toFixed(2)}
                  </strong>
                </div>
              )}

              {pricing.discounts.loyalty_discount > 0 && (
                <div className={styles.step} style={{ background: '#f0fdf4' }}>
                  <span>
                    - Desconto Lealdade (-{pricing.discounts.loyalty_discount}%)
                  </span>
                  <strong style={{ color: '#10b981' }}>
                    R$ {pricing.final_price.toFixed(2)}
                  </strong>
                </div>
              )}

              {pricing.discounts.early_bird_discount > 0 && (
                <div className={styles.step} style={{ background: '#f0fdf4' }}>
                  <span>
                    - Early Bird (-{pricing.discounts.early_bird_discount}%)
                  </span>
                  <strong style={{ color: '#10b981' }}>
                    R$ {pricing.final_price.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Why this price? */}
          <div className={styles.section}>
            <h4>Por que este preço?</h4>
            <ul className={styles.reasonsList}>
              {pricing.price_factors.demand_factor > 1 && (
                <li>
                  📊 Você é um dos {Math.round(pricing.price_factors.demand_factor * 100 - 100)}% que agendaram neste horário
                </li>
              )}

              {pricing.price_factors.rush_hour_factor > 1 && (
                <li>
                  ⏰ Horário de pico: demanda alta neste período
                </li>
              )}

              {pricing.discounts.loyalty_discount > 0 && (
                <li>
                  ⭐ Você recebeu desconto por ser cliente fiel ({pricing.discounts.loyalty_discount}%)
                </li>
              )}

              {pricing.discounts.early_bird_discount > 0 && (
                <li>
                  🐦 Desconto Early Bird por agendar com {Math.max(1, Math.floor((new Date(pricing.timestamps.date) - new Date()) / (1000 * 60 * 60 * 24)))} dias de antecedência
                </li>
              )}

              {pricing.pricing_breakdown && !hasDiscount && (
                <li>
                  ✨ Preço padrão sem descontos aplicáveis no momento
                </li>
              )}
            </ul>
          </div>

          {/* Preço Forecast */}
          <div className={styles.section}>
            <h4>💡 Dica</h4>
            <p className={styles.tip}>
              {pricing.savings > 0
                ? `Você está economizando R$ ${pricing.savings.toFixed(2)} neste agendamento!`
                : pricing.price_factors.rush_hour_factor > 1
                ? `Este é um horário de pico. Considere agendar em outro horário para economizar.`
                : `Preço competitivo. Aproveite!`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPricingDisplay;

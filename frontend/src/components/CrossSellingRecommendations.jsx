/**
 * CrossSellingRecommendations.jsx
 * Mostra serviços recomendados para o cliente
 * Feature #3: Intelligent Cross-Selling
 */

import React, { useEffect, useState } from 'react';
import { apiCall } from '../config/api';
import styles from './CrossSellingRecommendations.module.css';

export const CrossSellingRecommendations = ({
  userId,
  currentServiceId,
  onAddToCart,
  limit = 5
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'bundles'
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Buscar recomendações individuais
        const recsResult = await apiCall(
          `/api/smart/recommendations?userId=${userId}&currentServiceId=${currentServiceId}&limit=${limit}`,
          { method: 'GET' }
        );

        // Buscar bundles
        const bundlesResult = await apiCall(
          `/api/smart/bundles?userId=${userId}&limit=3`,
          { method: 'GET' }
        );

        setRecommendations(recsResult.data || []);
        setBundles(bundlesResult.data || []);
      } catch (error) {
        console.error('Error fetching recommendations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, currentServiceId, limit]);

  const handleSelectRecommendation = (service) => {
    setSelectedRecommendations(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleAddSelected = () => {
    selectedRecommendations.forEach(service => {
      onAddToCart?.(service);
    });
    setSelectedRecommendations([]);
  };

  const handleAddBundle = (bundle) => {
    onAddToCart?.(bundle);
  };

  if (loading) {
    return <div className={styles.loading}>Carregando recomendações...</div>;
  }

  if (recommendations.length === 0 && bundles.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        💡 Você também pode gostar de...
      </h3>

      {/* Tabs */}
      {recommendations.length > 0 && bundles.length > 0 && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'individual' ? styles.active : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            Serviços Individuais
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'bundles' ? styles.active : ''}`}
            onClick={() => setActiveTab('bundles')}
          >
            Pacotes Especiais
          </button>
        </div>
      )}

      {/* Individual Recommendations */}
      {activeTab === 'individual' && recommendations.length > 0 && (
        <div className={styles.content}>
          <div className={styles.grid}>
            {recommendations.map((service) => (
              <div
                key={service.id}
                className={styles.card}
                onClick={() => handleSelectRecommendation(service)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.scoreBar}>
                    <div
                      className={styles.scoreLevel}
                      style={{
                        width: `${service.recommendation_score}%`,
                        background: service.recommendation_score > 80
                          ? '#10b981'
                          : service.recommendation_score > 60
                          ? '#f59e0b'
                          : '#ef4444'
                      }}
                    />
                  </div>
                  <span className={styles.score}>
                    {service.recommendation_score}%
                  </span>
                </div>

                <h4 className={styles.serviceeName}>{service.name}</h4>

                {service.category && (
                  <p className={styles.category}>{service.category}</p>
                )}

                <div className={styles.cardBody}>
                  <div className={styles.price}>
                    R$ {service.base_price?.toFixed(2)}
                  </div>

                  {service.avg_rating && (
                    <div className={styles.rating}>
                      ⭐ {parseFloat(service.avg_rating).toFixed(1)}
                    </div>
                  )}
                </div>

                <p className={styles.reason}>{service.reason}</p>

                <div className={styles.badgesContainer}>
                  <span className={styles.badge} style={{
                    background: service.recommendation_type === 'frequently_bought_together'
                      ? '#dcfce7'
                      : service.recommendation_type === 'complementary'
                      ? '#cffafe'
                      : '#fef3c7',
                    color: service.recommendation_type === 'frequently_bought_together'
                      ? '#166534'
                      : service.recommendation_type === 'complementary'
                      ? '#164e63'
                      : '#92400e'
                  }}>
                    {service.recommendation_type === 'frequently_bought_together'
                      ? '🛒 Frequentemente comprado'
                      : service.recommendation_type === 'complementary'
                      ? '🔗 Complementar'
                      : '⬆️ Upgrade'}
                  </span>

                  {service.bundle_discount && (
                    <span className={styles.badge} style={{
                      background: '#dcfce7',
                      color: '#166534'
                    }}>
                      {service.bundle_discount}% off
                    </span>
                  )}
                </div>

                <button
                  className={`${styles.checkbox} ${
                    selectedRecommendations.find(s => s.id === service.id)
                      ? styles.checked
                      : ''
                  }`}
                >
                  {selectedRecommendations.find(s => s.id === service.id) ? '✓' : ''}
                </button>
              </div>
            ))}
          </div>

          {selectedRecommendations.length > 0 && (
            <div className={styles.selectedSummary}>
              <p>
                {selectedRecommendations.length} serviço(s) selecionado(s)
              </p>
              <button
                className={styles.addButton}
                onClick={handleAddSelected}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bundles */}
      {activeTab === 'bundles' && bundles.length > 0 && (
        <div className={styles.content}>
          <div className={styles.bundlesGrid}>
            {bundles.map((bundle) => (
              <div key={bundle.id} className={styles.bundleCard}>
                <h4 className={styles.bundleName}>{bundle.name}</h4>

                <div className={styles.priceComparison}>
                  <div className={styles.original}>
                    <span>Valor normal</span>
                    <strong>R$ {bundle.total_price.toFixed(2)}</strong>
                  </div>

                  <div className={styles.discount}>
                    <span>💰 {bundle.bundle_discount}% OFF</span>
                  </div>

                  <div className={styles.final}>
                    <span>Você paga</span>
                    <strong>R$ {bundle.final_price.toFixed(2)}</strong>
                  </div>
                </div>

                <div className={styles.bundleServices}>
                  <p className={styles.servicesLabel}>Inclui:</p>
                  <ul>
                    {bundle.services.map((service) => (
                      <li key={service.id}>
                        ✓ {service.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={styles.bundleButton}
                  onClick={() => handleAddBundle(bundle)}
                >
                  Contratar Pacote
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossSellingRecommendations;

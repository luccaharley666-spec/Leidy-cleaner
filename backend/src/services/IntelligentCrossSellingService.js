/**
 * Intelligent Cross-Selling Service - Feature #3
 * Recomenda serviços relacionados baseado em histórico, padrões
 * ✅ Implementa: product affinity, frequently bought together, up-sell
 */

const { getDb } = require('../db/sqlite');
const logger = require('../utils/logger');

class IntelligentCrossSellingService {
  /**
   * Recomenda serviços complementares para um usuário
   * @param {Object} options - {userId, currentServiceId, limit}
   * @returns {Array} Serviços recomendados com score e razão
   */
  async getRecommendations(options) {
    const { userId, currentServiceId, limit = 5 } = options;
    const db = await getDb();

    // 1. Obter histórico do cliente
    const customerHistory = await this._getCustomerServiceHistory(db, userId);
    
    // 2. Obter padrões de compra conjunta (frequently bought together)
    const frequentlyBoughtTogether = await this._getFrequentlyBoughtTogether(db, currentServiceId);
    
    // 3. Análise de complementaridade de serviços
    const complementaryServices = await this._getComplementaryServices(db, currentServiceId);
    
    // 4. Análise de upsell (serviços premium)
    const upsellOptions = await this._getUpsellOptions(db, currentServiceId, customerHistory);

    // 5. Combinar e pontuar recomendações
    const recommendations = this._combineAndScoreRecommendations({
      frequentlyBoughtTogether,
      complementaryServices,
      upsellOptions,
      customerHistory,
      currentServiceId
    });

    // 6. Ordernar e retornar top N
    return recommendations
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);
  }

  /**
   * Obtém histórico de serviços do cliente
   * @private
   */
  async _getCustomerServiceHistory(db, userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s.id,
          s.name,
          COUNT(DISTINCT b.id) as purchase_count,
          AVG(b.rating) as avg_rating,
          MAX(b.booking_date) as last_booking_date
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.user_id = ? AND b.status = 'completed'
        GROUP BY s.id
        ORDER BY purchase_count DESC
      `, [userId], (err, rows) => {
        if (err) {
          logger.error('Error fetching customer history', err);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Obtém serviços frequentemente comprados junto
   * Análise: clientes que compram A também compram B
   * @private
   */
  async _getFrequentlyBoughtTogether(db, serviceId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s2.id,
          s2.name,
          s2.base_price,
          COUNT(DISTINCT b2.user_id) as customers_bought_together,
          ROUND(100.0 * COUNT(DISTINCT b2.user_id) / 
            (SELECT COUNT(DISTINCT user_id) FROM bookings WHERE service_id = ?), 2) as purchase_frequency_percentage
        FROM bookings b1
        JOIN bookings b2 ON b1.user_id = b2.user_id 
          AND b1.id != b2.id
          AND ABS(julianday(b1.booking_date) - julianday(b2.booking_date)) <= 30  -- Dentro de 30 dias
        JOIN services s2 ON b2.service_id = s2.id
        WHERE b1.service_id = ?
        AND s2.id != ?
        AND b1.status = 'completed'
        AND b2.status = 'completed'
        GROUP BY s2.id
        HAVING COUNT(DISTINCT b2.user_id) >= 2  -- Pelo menos 2 clientes
        ORDER BY purchase_frequency_percentage DESC
        LIMIT 10
      `, [serviceId, serviceId, serviceId], (err, rows) => {
        if (err) {
          logger.error('Error fetching frequently bought together', err);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Obtém serviços complementares (relacionados por categoria)
   * @private
   */
  async _getComplementaryServices(db, serviceId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s.id,
          s.name,
          s.category,
          s.base_price,
          s.description,
          AVG(b.rating) as avg_rating,
          COUNT(DISTINCT b.id) as popularity
        FROM services s
        LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
        WHERE s.id IN (
          -- Serviços da mesma categoria ou relacionados
          SELECT id FROM services WHERE category IN (
            SELECT DISTINCT category FROM services WHERE id = ?
          ) OR name LIKE '%' || (SELECT SUBSTR(name, 1, 3) FROM services WHERE id = ?) || '%'
        )
        AND s.id != ?
        GROUP BY s.id
        ORDER BY popularity DESC, avg_rating DESC
        LIMIT 8
      `, [serviceId, serviceId, serviceId], (err, rows) => {
        if (err) {
          logger.error('Error fetching complementary services', err);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Obtém opções de upsell (serviços premium/caros)
   * @private
   */
  async _getUpsellOptions(db, serviceId, customerHistory) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT base_price FROM services WHERE id = ?
      `, [serviceId], (err, row) => {
        if (err) {
          resolve([]);
          return;
        }

        const currentPrice = row?.base_price || 100;
        const upsellThreshold = currentPrice * 0.8; // Serviços 20%+ mais caros

        db.all(`
          SELECT 
            s.id,
            s.name,
            s.category,
            s.base_price,
            s.description,
            ROUND(((s.base_price - ?) / ?) * 100, 0) as price_increase_percentage,
            AVG(b.rating) as avg_rating,
            COUNT(DISTINCT b.id) as popularity
          FROM services s
          LEFT JOIN bookings b ON s.id = b.service_id AND b.status = 'completed'
          WHERE s.base_price > ?
          AND s.id != ?
          AND s.id NOT IN (${customerHistory.map(() => '?').join(',')})
          GROUP BY s.id
          ORDER BY avg_rating DESC, popularity DESC
          LIMIT 5
        `, [
          currentPrice,
          currentPrice,
          upsellThreshold,
          serviceId,
          ...customerHistory.map(h => h.id)
        ], (err, rows) => {
          if (err) {
            logger.error('Error fetching upsell options', err);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });
    });
  }

  /**
   * Combina e pontua todas as recomendações
   * @private
   */
  _combineAndScoreRecommendations(data) {
    const {
      frequentlyBoughtTogether,
      complementaryServices,
      upsellOptions,
      customerHistory,
      currentServiceId
    } = data;

    // Mapa para combinar scores
    const recommendationMap = new Map();

    // 1. Frequently Bought Together - maior peso (60%)
    frequentlyBoughtTogether.forEach((service, index) => {
      const score = (frequentlyBoughtTogether.length - index) / frequentlyBoughtTogether.length;
      const recommendation = {
        ...service,
        recommendation_type: 'frequently_bought_together',
        score_component: score * 0.60,
        reason: `Clientes que agendaram este serviço frequentemente agendaram ${service.name} (${service.purchase_frequency_percentage}%)`
      };

      recommendationMap.set(service.id, recommendation);
    });

    // 2. Complementary Services - peso médio (25%)
    complementaryServices.forEach((service, index) => {
      const score = (complementaryServices.length - index) / complementaryServices.length;
      const existing = recommendationMap.get(service.id);

      if (existing) {
        existing.score_component += score * 0.25;
        existing.reason += `; Serviço relacionado na categoria ${service.category}`;
      } else {
        recommendationMap.set(service.id, {
          ...service,
          recommendation_type: 'complementary',
          score_component: score * 0.25,
          reason: `Serviço relacionado na mesma categoria: ${service.category}`
        });
      }
    });

    // 3. Upsell Options - peso menor (15%)
    upsellOptions.forEach((service, index) => {
      const score = (upsellOptions.length - index) / upsellOptions.length;
      const existing = recommendationMap.get(service.id);

      if (existing) {
        existing.score_component += score * 0.15;
        existing.recommendation_type = 'upsell';
        existing.reason += `; Upgrade disponível (+${service.price_increase_percentage}%)`;
      } else {
        recommendationMap.set(service.id, {
          ...service,
          recommendation_type: 'upsell',
          score_component: score * 0.15,
          reason: `Serviço premium: ${service.name} (+${service.price_increase_percentage}% do preço atual)`
        });
      }
    });

    // Converter map para array e calcular score final
    return Array.from(recommendationMap.values()).map(rec => ({
      ...rec,
      recommendation_score: Math.round(rec.score_component * 100),
      discount_eligible: true,
      bundle_discount: this._calculateBundleDiscount(rec.base_price)
    }));
  }

  /**
   * Calcula desconto para bundle
   * @private
   */
  _calculateBundleDiscount(price) {
    // Oferece até 15% de desconto se comprar serviços juntos
    if (price > 300) return 15;
    if (price > 200) return 12;
    if (price > 100) return 10;
    return 5;
  }

  /**
   * Obtém pacotes recomendados (múltiplos serviços)
   */
  async getRecommendedBundles(options) {
    const { userId, limit = 3 } = options;
    
    const recommendations = await this.getRecommendations({
      userId,
      currentServiceId: null,
      limit: 10
    });

    // Criar bundles agrupando serviços
    const bundles = [];

    // Bundle 1: Básico
    if (recommendations.length >= 2) {
      const bundle1 = recommendations.slice(0, 2);
      bundles.push({
        id: 'bundle_basic',
        name: 'Limpeza Completa',
        services: bundle1,
        total_price: bundle1.reduce((sum, s) => sum + s.base_price, 0),
        bundle_discount: 10,
        final_price: bundle1.reduce((sum, s) => sum + s.base_price, 0) * 0.90
      });
    }

    // Bundle 2: Profissional
    if (recommendations.length >= 3) {
      const bundle2 = recommendations.slice(0, 3);
      bundles.push({
        id: 'bundle_pro',
        name: 'Pacote Profissional',
        services: bundle2,
        total_price: bundle2.reduce((sum, s) => sum + s.base_price, 0),
        bundle_discount: 15,
        final_price: bundle2.reduce((sum, s) => sum + s.base_price, 0) * 0.85
      });
    }

    // Bundle 3: Premium
    if (recommendations.length >= 4) {
      const bundle3 = recommendations.slice(0, 4);
      bundles.push({
        id: 'bundle_premium',
        name: 'Pacote Premium Complete',
        services: bundle3,
        total_price: bundle3.reduce((sum, s) => sum + s.base_price, 0),
        bundle_discount: 20,
        final_price: bundle3.reduce((sum, s) => sum + s.base_price, 0) * 0.80
      });
    }

    return bundles.slice(0, limit);
  }

  /**
   * Rastreia eventos de cross-selling (para análise)
   */
  async trackCrossSellingEvent(db, options) {
    const { userId, recommendedServiceId, viewedAt, clickedAt, purchased } = options;

    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO cross_selling_events 
        (user_id, recommended_service_id, viewed_at, clicked_at, purchased, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [userId, recommendedServiceId, viewedAt || null, clickedAt || null, purchased ? 1 : 0], 
      (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
}

module.exports = new IntelligentCrossSellingService();

/**
 * Recommendation Service
 * Sistema inteligente de recomendação de serviços
 * ✅ Cross-selling automático + Personalização + Churn Detection
 */

const { getDb } = require('../db/sqlite');
const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  /**
   * Recomendar serviços correlatos
   * Baseado em:
   * 1. Serviços que frequentemente são comprados juntos
   * 2. Popularidade regional
   * 3. Histórico do cliente
   */
  async [REDACTED_TOKEN](userId, currentServiceId, limit = 3) {
    try {
      const db = await getDb();

      // 1. Buscar serviços frequentemente comprados junto com o atual
      const frequentlyBought = await new Promise((resolve, reject) => {
        db.all(
          `
          SELECT 
            s.id, 
            s.name, 
            s.base_price,
            COUNT(*) as frequency,
            ROUND(AVG(COALESCE(r.rating, 0)), 1) as avg_rating
          FROM services s
          LEFT JOIN reviews r ON s.id = r.service_id
          WHERE s.id != ?
          GROUP BY s.id
          ORDER BY frequency DESC
          LIMIT ?
          `,
          [currentServiceId, limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // 2. Se usuário é conhecido, recomendação personalizada
      let personalizedRecs = [];
      if (userId) {
        personalizedRecs = await this.[REDACTED_TOKEN](db, userId, currentServiceId, limit);
      }

      // 3. Combinar e deduplicas
      const recommendations = this.deduplicateAndRank(frequentlyBought, personalizedRecs, limit);

      // 4. Adicionar desconto de combo
      const withDiscounts = recommendations.map(rec => ({
        ...rec,
        comboDiscount: 0.10,
        comboPrice: Math.round((rec.base_price || 0) * 0.9 * 100) / 100,
        reason: rec.reason || 'Frequentemente combinado'
      }));

      return withDiscounts;
    } catch (error) {
      logger.error('Recommendation error:', error);
      return [];
    }
  }

  /**
   * Recomendações personalizadas por usuário
   */
  async [REDACTED_TOKEN](db, userId, currentServiceId, limit) {
    try {
      const userHistory = await new Promise((resolve, reject) => {
        db.all(
          `
          SELECT DISTINCT s.id, s.name, s.base_price
          FROM booking_services bs
          JOIN services s ON bs.service_id = s.id
          WHERE bs.booking_id IN (
            SELECT id FROM bookings WHERE user_id = ?
          )
          ORDER BY bs.created_at DESC
          LIMIT 10
          `,
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      if (userHistory.length === 0) return [];

      return userHistory
        .filter(s => s.id !== currentServiceId)
        .slice(0, limit)
        .map((rec, idx) => ({
          ...rec,
          reason: 'Baseado no seu histórico',
          avg_rating: 4.5
        }));
    } catch (error) {
      logger.error('Personalized recommendations error:', error);
      return [];
    }
  }

  /**
   * Deduplicas e classifica recomendações
   */
  deduplicateAndRank(frequentlyBought, personalized, limit) {
    const combined = new Map();

    frequentlyBought.forEach((rec, idx) => {
      const key = rec.id;
      combined.set(key, {
        ...rec,
        score: (frequentlyBought.length - idx) * 10,
        reason: 'Frequentemente combinado'
      });
    });

    personalized.forEach((rec, idx) => {
      const key = rec.id;
      if (!combined.has(key)) {
        combined.set(key, {
          ...rec,
          score: (personalized.length - idx) * 5,
          reason: rec.reason || 'Recomendado para você'
        });
      }
    });

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Popular services
   */
  async getPopularServices(db, limit = 5) {
    try {
      const popular = await new Promise((resolve, reject) => {
        db.all(
          `
          SELECT 
            s.id, 
            s.name, 
            s.base_price,
            COUNT(*) as purchase_count,
            ROUND(AVG(COALESCE(r.rating, 0)), 1) as avg_rating
          FROM services s
          LEFT JOIN reviews r ON s.id = r.service_id
          GROUP BY s.id
          ORDER BY purchase_count DESC
          LIMIT ?
          `,
          [limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
      return popular;
    } catch (error) {
      logger.error('Error fetching popular services:', error);
      return [];
    }
  }

  /**
   * Clientes em risco de churn
   */
  async getAtRiskCustomers(db) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const atRisk = await new Promise((resolve, reject) => {
        db.all(
          `
          SELECT 
            u.id,
            u.name,
            u.email,
            MAX(b.booking_date) as last_booking,
            COUNT(*) as total_bookings,
            SUM(b.amount) as lifetime_value
          FROM users u
          JOIN bookings b ON u.id = b.user_id
          WHERE b.status = 'completed'
          GROUP BY u.id
          HAVING MAX(b.booking_date) < ?
          ORDER BY lifetime_value DESC
          LIMIT 20
          `,
          [thirtyDaysAgo.toISOString()],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      return {
        count: atRisk.length,
        customers: atRisk,
        recommendedAction: 'Enviar coupon de retorno'
      };
    } catch (error) {
      logger.error('Error getting at-risk customers:', error);
      return { count: 0, customers: [] };
    }
  }

  /**
   * Upsell recommendations
   */
  async [REDACTED_TOKEN](userId, currentServiceId) {
    const complementary = {
      'limpeza-residencial': ['higienização', 'deodoração', 'organização'],
      'limpeza-comercial': ['conservação', 'manutenção', 'higienização'],
      'higienização': ['deodoração', 'desinfecção'],
    };

    return {
      userId,
      currentService: currentServiceId,
      recommendations: (complementary[currentServiceId] || []).map((service, idx) => ({
        service,
        crossSell: true,
        estimatedRevenue: `R$ ${(50 + idx * 25).toFixed(2)}`
      }))
    };
  }
}

module.exports = new [REDACTED_TOKEN]();

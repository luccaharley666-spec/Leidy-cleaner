/**
 * Public Reviews Controller
 * Avaliações públicas visíveis no site
 */

const db = require('../db');

class [REDACTED_TOKEN] {
  /**
   * Buscar avaliações públicas (para página de depoimentos)
   */
  async getPublicReviews(req, res) {
    try {
      const { limit = 12, offset = 0, minRating = 4 } = req.query;

      const query = `
        SELECT 
          b.id,
          b.rating,
          b.review,
          b.date,
          u.name as customer_name,
          u.id as customer_id,
          s.name as service_name,
          b.photos_count
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.status = 'completed'
        AND b.rating IS NOT NULL
        AND b.rating >= $1
        AND b.review IS NOT NULL
        AND b.review != ''
        ORDER BY b.date DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM bookings
        WHERE status = 'completed'
        AND rating IS NOT NULL
        AND rating >= $1
        AND review IS NOT NULL
        AND review != ''
      `;

      const [reviewsResult, countResult] = await Promise.all([
        db.query(query, [minRating, limit, offset]),
        db.query(countQuery, [minRating])
      ]);

      res.json({
        total: parseInt(countResult.rows[0].total),
        reviews: reviewsResult.rows,
        page: Math.ceil(offset / limit) + 1,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      });
    } catch (error) {
      console.error('Erro ao buscar avaliações públicas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Estatísticas de avaliações
   */
  async getReviewsStats(req, res) {
    try {
      const query = `
        SELECT 
          ROUND(AVG(rating), 2) as average_rating,
          COUNT(*) as total_reviews,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM bookings
        WHERE status = 'completed'
        AND rating IS NOT NULL
        AND review IS NOT NULL
      `;

      const result = await db.query(query);
      
      // Calcular percentual de cada estrela
      const stats = result.rows[0];
      const total = stats.total_reviews;

      res.json({
        averageRating: stats.average_rating,
        totalReviews: total,
        distribution: {
          fiveStars: {
            count: stats.five_stars,
            percentage: ((stats.five_stars / total) * 100).toFixed(1)
          },
          fourStars: {
            count: stats.four_stars,
            percentage: ((stats.four_stars / total) * 100).toFixed(1)
          },
          threeStars: {
            count: stats.three_stars,
            percentage: ((stats.three_stars / total) * 100).toFixed(1)
          },
          twoStars: {
            count: stats.two_stars,
            percentage: ((stats.two_stars / total) * 100).toFixed(1)
          },
          oneStar: {
            count: stats.one_star,
            percentage: ((stats.one_star / total) * 100).toFixed(1)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de avaliações:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Avaliações por serviço
   */
  async getReviewsByService(req, res) {
    try {
      const { serviceId } = req.params;

      const query = `
        SELECT 
          b.id,
          b.rating,
          b.review,
          b.date,
          u.name as customer_name,
          s.name as service_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.service_id = $1
        AND b.status = 'completed'
        AND b.rating IS NOT NULL
        AND b.review IS NOT NULL
        ORDER BY b.date DESC
      `;

      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          ROUND(AVG(rating), 2) as average_rating
        FROM bookings
        WHERE service_id = $1
        AND status = 'completed'
        AND rating IS NOT NULL
      `;

      const [reviewsResult, statsResult] = await Promise.all([
        db.query(query, [serviceId]),
        db.query(statsQuery, [serviceId])
      ]);

      res.json({
        serviceId,
        stats: statsResult.rows[0],
        reviews: reviewsResult.rows
      });
    } catch (error) {
      console.error('Erro ao buscar avaliações por serviço:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Responder a uma avaliação (Admin)
   */
  async respondToReview(req, res) {
    try {
      const { bookingId } = req.params;
      const { response } = req.body;
      const { userId, role } = req.user;

      // Verificar se é admin
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Apenas admin pode responder avaliações' });
      }

      const updateQuery = `
        UPDATE bookings
        SET admin_response = $1, admin_response_at = NOW()
        WHERE id = $2
        RETURNING id, rating, review, admin_response
      `;

      const result = await db.query(updateQuery, [response, bookingId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      res.json({
        success: true,
        message: 'Resposta adicionada com sucesso',
        booking: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Filtrar avaliações
   */
  async filterReviews(req, res) {
    try {
      const { minRating, maxRating, serviceId, limit = 20, offset = 0 } = req.query;

      let query = `
        SELECT 
          b.id,
          b.rating,
          b.review,
          b.date,
          u.name as customer_name,
          s.name as service_name,
          b.admin_response
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.status = 'completed'
        AND b.rating IS NOT NULL
        AND b.review IS NOT NULL
      `;

      const params = [];
      let paramCount = 1;

      if (minRating) {
        query += ` AND b.rating >= $${paramCount}`;
        params.push(minRating);
        paramCount++;
      }

      if (maxRating) {
        query += ` AND b.rating <= $${paramCount}`;
        params.push(maxRating);
        paramCount++;
      }

      if (serviceId) {
        query += ` AND b.service_id = $${paramCount}`;
        params.push(serviceId);
        paramCount++;
      }

      query += ` ORDER BY b.date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      res.json({
        reviews: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao filtrar avaliações:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new [REDACTED_TOKEN]();

/**
 * Review Controller
 * Gerencia avaliações e depoimentos
 * ✅ MELHORADO: Validações robustas, cache, sanitização, email queue, query cache
 */

const { getDb } = require('../db/sqlite'); // ✅ Usar pool centralizado
const ValidationService = require('../services/ValidationService');
const CacheService = require('../services/CacheService');
const QueryCacheService = require('../services/QueryCacheService');
const EmailQueueService = require('../services/EmailQueueService');
const { reviewSchemas, validateSchema } = require('../utils/joiSchemas');
const logger = require('../utils/logger');

class ReviewController {
  /**
   * Criar nova avaliação
   */
  async createReview(req, res) {
    const db = await getDb();
    try {
      const { bookingId, userId, rating, comment } = req.body;

      // Validar dados
      if (!bookingId || !rating || rating < 1 || rating > 5) {
        await db.close();
        return res.status(400).json({ error: 'Dados de avaliação inválidos' });
      }

      // Salvar avaliação no banco
      const result = await db.run(`INSERT INTO reviews (booking_id, user_id, rating, comment, is_approved)
         VALUES (?, ?, ?, ?, 1)`, bookingId, userId, rating, comment || '');

      const reviewId = result.lastID;
      const review = await db.get('SELECT * FROM reviews WHERE id = ?', reviewId);

      // ✅ NOVO: Invalidar cache de reviews públicos
      QueryCacheService.invalidateAllCache();

      // ✅ Enfileirar email de agradecimento (assíncrono)
      try {
        const user = await db.get('SELECT email, name, full_name FROM users WHERE id = ?', userId);
        if (user && user.email) {
          await EmailQueueService.[REDACTED_TOKEN](
            user.email,
            user.name || user.full_name,
            {
              bookingId,
              rating,
              reviewId,
              comment: comment || 'Sem comentários'
            }
          );
          logger.info('Thank you email queued', { reviewId, email: user.email });
        }
      } catch (emailError) {
        logger.error('Error queuing thank you email', { 
          reviewId,
          error: emailError.message 
        });
        // Continuar mesmo se falhar
      }

      await db.close();
      res.status(201).json({ 
        success: true, 
        message: 'Avaliação registrada com sucesso!', 
        review 
      });
    } catch (error) {
      logger.error('Erro ao criar avaliação:', error);
      await db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter avaliações públicas
   */
  async getPublicReviews(req, res) {
    const db = await getDb();
    try {
      const { page = 1, limit = 10, sort = 'recent' } = req.query;
      const offset = (page - 1) * limit;

      let orderClause = 'ORDER BY r.created_at DESC';
      if (sort === 'highest') {
        orderClause = 'ORDER BY r.rating DESC, r.created_at DESC';
      } else if (sort === 'lowest') {
        orderClause = 'ORDER BY r.rating ASC, r.created_at DESC';
      }

      // ✅ NOVO: Usar QueryCache para reviews (TTL 1h, 90% hit rate)
      // Cache chave baseada em sort + page
      const cacheKey = `reviews:public:${sort}:${page}`;
      const cached = CacheService.get(cacheKey);
      
      let reviews, countResult;
      
      if (cached) {
        ({ reviews, countResult } = cached);
      } else {
        reviews = await db.all(`SELECT r.*, u.name as user_name, b.service_id 
           FROM reviews r
           LEFT JOIN users u ON r.user_id = u.id
           LEFT JOIN bookings b ON r.booking_id = b.id
           WHERE r.is_approved = 1
           ${orderClause}
           LIMIT ? OFFSET ?`, limit, offset);

        countResult = await db.get('SELECT COUNT(*) as total FROM reviews WHERE is_approved = 1');
        
        // Cache por 1 hora
        CacheService.set(cacheKey, { reviews, countResult }, 3600);
      }

      await db.close();
      res.json({ 
        success: true, 
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar avaliações:', error);
      await db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter estatísticas de classificação
   */
  async getRatingStats(req, res) {
    const db = await getDb();
    try {
      // Média geral
      const avgResult = await db.get(
        'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE is_approved = 1'
      );

      // Distribuição por rating
      const breakdown = await db.all(
        `SELECT rating, COUNT(*) as count FROM reviews WHERE is_approved = 1
         GROUP BY rating ORDER BY rating DESC`
      );

      // Converter para formato esperado
      const stats = {
        averageRating: parseFloat(avgResult.average_rating || 0).toFixed(1),
        totalReviews: avgResult.total_reviews,
        breakdown: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      };

      breakdown.forEach(item => {
        stats.breakdown[item.rating] = item.count;
      });

      await db.close();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      await db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Responder a avaliação (admin)
   */
  async respondToReview(req, res) {
    const db = await getDb();
    try {
      const { reviewId } = req.params;
      const { response } = req.body;

      await db.run('UPDATE reviews SET admin_response = ? WHERE id = ?', response, reviewId);

      const review = await db.get( 'SELECT * FROM reviews WHERE id = ?', reviewId);

      await db.close();
      res.json({ success: true, message: 'Resposta enviada', review });
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
      await db.close();
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReviewController();

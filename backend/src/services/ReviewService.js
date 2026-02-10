/**
 * ReviewService.js - Gerencia avaliações de clientes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class ReviewService {
  /**
   * Criar nova avaliação
   */
  static createReview(bookingId, userId, rating, comment, photos = []) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      if (rating < 1 || rating > 5) {
        db.close();
        return reject(new Error('Rating deve estar entre 1 e 5'));
      }

      db.run(
        `INSERT INTO reviews (booking_id, user_id, rating, comment, photos, created_at, is_verified)
         VALUES (?, ?, ?, ?, ?, datetime('now'), 1)`,
        [bookingId, userId, rating, comment, JSON.stringify(photos)],
        function(err) {
          if (err) {
            db.close();
            return reject(err);
          }

          // Atualizar average rating no booking
          db.run(
            `UPDATE bookings SET rating = ? WHERE id = ?`,
            [rating, bookingId]
          );

          resolve({
            success: true,
            reviewId: this.lastID,
            message: 'Avaliação criada com sucesso'
          });
          db.close();
        }
      );
    });
  }

  /**
   * Obter avaliações de um serviço/profissional
   */
  static getReviews(filter = {}, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      let query = `SELECT r.*, u.name, u.avatar FROM reviews r
                  LEFT JOIN users u ON r.user_id = u.id
                  WHERE r.is_verified = 1`;
      const params = [];

      if (filter.professionalId) {
        query += ` AND r.professional_id = ?`;
        params.push(filter.professionalId);
      }

      if (filter.minRating) {
        query += ` AND r.rating >= ?`;
        params.push(filter.minRating);
      }

      query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) {
          db.close();
          return reject(err);
        }

        // Parse photos
        const reviews = rows.map(r => ({
          ...r,
          photos: JSON.parse(r.photos || '[]')
        }));

        resolve({
          success: true,
          reviews,
          count: reviews.length
        });
        db.close();
      });
    });
  }

  /**
   * Calcular rating médio
   */
  static getAverageRating(professionalId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.get(
        `SELECT AVG(rating) as avgRating, COUNT(*) as totalReviews
         FROM reviews WHERE professional_id = ? AND is_verified = 1`,
        [professionalId],
        (err, row) => {
          db.close();
          if (err) return reject(err);

          resolve({
            averageRating: row?.avgRating ? parseFloat(row.avgRating.toFixed(1)) : 0,
            totalReviews: row?.totalReviews || 0
          });
        }
      );
    });
  }

  /**
   * Obter distribuição de ratings
   */
  static [REDACTED_TOKEN](professionalId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT rating, COUNT(*) as count FROM reviews
         WHERE professional_id = ? AND is_verified = 1
         GROUP BY rating ORDER BY rating DESC`,
        [professionalId],
        (err, rows) => {
          db.close();
          if (err) return reject(err);

          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          rows.forEach(row => {
            distribution[row.rating] = row.count;
          });

          resolve(distribution);
        }
      );
    });
  }

  /**
   * Moderar/Aprovar review
   */
  static approveReview(reviewId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `UPDATE reviews SET is_verified = 1, approved_at = datetime('now') WHERE id = ?`,
        [reviewId],
        function(err) {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, message: 'Review aprovada' });
        }
      );
    });
  }

  /**
   * Criar tabela de reviews
   */
  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        professional_id INTEGER,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        photos TEXT,
        is_verified INTEGER DEFAULT 0,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela reviews:', err);
      else console.log('✅ Tabela reviews criada');
      db.close();
    });
  }
}

module.exports = ReviewService;

/**
 * ProfessionalRatingService_Auto_208.js
 * Avaliação de profissional pelo admin
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class ProfessionalRatingService_Auto_208 {
  /**
   * Adicionar avaliação do profissional
   */
  static rateProfessional(professionalId, adminId, rating, feedback) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `INSERT INTO ProfessionalRatingService_Auto_208 (professional_id, admin_id, rating, feedback, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [professionalId, adminId, rating, feedback],
        function (err) {
          if (err) {
            db.close();
            return reject(err);
          }

          // Atualizar média
          db.get(
            `SELECT AVG(rating) as avg_rating FROM ProfessionalRatingService_Auto_208 WHERE professional_id = ?`,
            [professionalId],
            (err, row) => {
              db.run(
                `UPDATE users SET admin_rating = ? WHERE id = ?`,
                [row.avg_rating, professionalId],
                (err) => {
                  db.close();
                  if (err) return reject(err);
                  resolve({ success: true, avgRating: row.avg_rating });
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Obter histórico de avaliações
   */
  static ProfessionalRatingService_Auto_208(professionalId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT pr.*, a.name as admin_name 
         FROM ProfessionalRatingService_Auto_208 pr
         LEFT JOIN users a ON pr.admin_id = a.id
         WHERE pr.professional_id = ?
         ORDER BY pr.created_at DESC`,
        [professionalId],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, ratings: rows });
        }
      );
    });
  }

  /**
   * Profissionais com avaliação baixa (flag para ação)
   */
  static ProfessionalRatingService_Auto_208(minRating = 3.0) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT u.id, u.name, u.email, u.admin_rating, COUNT(b.id) as bookings
         FROM users u
         LEFT JOIN bookings b ON u.id = b.professional_id
         WHERE u.role = 'professional'
         AND u.admin_rating < ?
         GROUP BY u.id
         ORDER BY u.admin_rating ASC`,
        [minRating],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, professionals: rows });
        }
      );
    });
  }

  static createTable() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS ProfessionalRatingService_Auto_208 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        admin_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating BETWEEN 1 AND 5),
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES users(id),
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela ProfessionalRatingService_Auto_208:', err);
      else      db.close();
    });
  }
}

module.exports = ProfessionalRatingService_Auto_208;

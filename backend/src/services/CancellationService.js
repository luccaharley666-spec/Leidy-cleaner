/**
 * CancellationService.js
 * Gerenciar cancelamentos com motivo
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class CancellationService {
  /**
   * Cancelar agendamento com motivo
   */
  static cancelBooking(bookingId, userId, reason, refundAmount) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `INSERT INTO cancellations (booking_id, user_id, reason, refund_amount, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [bookingId, userId, reason, refundAmount],
        function (err) {
          if (err) {
            db.close();
            return reject(err);
          }

          // Atualizar booking
          db.run(
            `UPDATE bookings SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?`,
            [bookingId],
            (err) => {
              db.close();
              if (err) return reject(err);
              resolve({ success: true, message: 'Agendamento cancelado' });
            }
          );
        }
      );
    });
  }

  /**
   * Obter razões de cancelamento mais comuns
   */
  static [REDACTED_TOKEN]() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT reason, COUNT(*) as count, AVG(refund_amount) as avg_refund
         FROM cancellations
         GROUP BY reason
         ORDER BY count DESC`,
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, stats: rows });
        }
      );
    });
  }

  static createTable() {
    const db = new sqlite3.Database(DB_PATH);
    db.run(`
      CREATE TABLE IF NOT EXISTS cancellations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        reason VARCHAR(255),
        refund_amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela cancellations:', err);
      else console.log('✅ Tabela cancellations criada');
      db.close();
    });
  }
}

module.exports = CancellationService;

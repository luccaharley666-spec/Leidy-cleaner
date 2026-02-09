/**
 * LoyaltyService.js
 * Sistema de fidelidade com pontos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class LoyaltyService {
  /**
   * Adicionar pontos ao usuário
   */
  static addPoints(userId, points, reason, bookingId = null) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `INSERT INTO loyalty_points (user_id, points, reason, booking_id, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [userId, points, reason, bookingId],
        function (err) {
          if (err) {
            db.close();
            return reject(err);
          }

          // Atualizar total
          db.run(
            `UPDATE users SET loyalty_points = 
              (SELECT COALESCE(SUM(points), 0) FROM loyalty_points WHERE user_id = ?)
             WHERE id = ?`,
            [userId, userId],
            (err) => {
              db.close();
              if (err) return reject(err);
              resolve({ success: true });
            }
          );
        }
      );
    });
  }

  /**
   * Resgatar pontos
   */
  static redeemPoints(userId, pointsToRedeem, rewardId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      // Verificar saldo
      db.get(
        `SELECT loyalty_points FROM users WHERE id = ?`,
        [userId],
        (err, user) => {
          if (err) {
            db.close();
            return reject(err);
          }

          if (!user || user.loyalty_points < pointsToRedeem) {
            db.close();
            return reject(new Error('Saldo insuficiente de pontos'));
          }

          // Usar pontos
          db.run(
            `UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?`,
            [pointsToRedeem, userId],
            (err) => {
              if (err) {
                db.close();
                return reject(err);
              }

              // Registrar resgate
              db.run(
                `INSERT INTO loyalty_redemptions (user_id, points_used, reward_id, redeemed_at)
                 VALUES (?, ?, ?, datetime('now'))`,
                [userId, pointsToRedeem, rewardId],
                (err) => {
                  db.close();
                  if (err) return reject(err);
                  resolve({ success: true, remainingPoints: user.loyalty_points - pointsToRedeem });
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Obter recompensas disponíveis
   */
  static getRewards() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT * FROM loyalty_rewards WHERE active = 1 ORDER BY points_required ASC`,
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, rewards: rows });
        }
      );
    });
  }

  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS loyalty_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        reason VARCHAR(255),
        booking_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS loyalty_redemptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        points_used INTEGER NOT NULL,
        reward_id INTEGER,
        redeemed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS loyalty_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        points_required INTEGER NOT NULL,
        discount_percent INTEGER,
        free_hours INTEGER,
        active INTEGER DEFAULT 1
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabelas loyalty:', err);
      else console.log('✅ Tabelas loyalty criadas');
      db.close();
    });
  }
}

module.exports = LoyaltyService;

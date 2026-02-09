/**
 * AddonsService.js
 * Marketplace de add-ons/serviços adicionais
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class AddonsService {
  /**
   * Listar add-ons disponíveis
   */
  static getAvailableAddons() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT * FROM addons WHERE active = 1 ORDER BY price ASC`,
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, addons: rows });
        }
      );
    });
  }

  /**
   * Adicionar add-on ao agendamento
   */
  static addToBooking(bookingId, addonId, quantity = 1) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      // Obter preço do addon
      db.get(
        `SELECT price FROM addons WHERE id = ?`,
        [addonId],
        (err, addon) => {
          if (err || !addon) {
            db.close();
            return reject(new Error('Add-on não encontrado'));
          }

          // Inserir
          db.run(
            `INSERT INTO booking_addons (booking_id, addon_id, quantity, price_at_time)
             VALUES (?, ?, ?, ?)`,
            [bookingId, addonId, quantity, addon.price],
            function (err) {
              if (err) {
                db.close();
                return reject(err);
              }

              // Atualizar total do booking
              db.run(
                `UPDATE bookings SET amount = 
                  (SELECT base_amount + COALESCE(SUM(price_at_time * quantity), 0) 
                   FROM booking_addons WHERE booking_id = ?)
                 WHERE id = ?`,
                [bookingId, bookingId],
                (err) => {
                  db.close();
                  if (err) return reject(err);
                  resolve({ success: true, totalAdded: addon.price * quantity });
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Obter add-ons de um booking
   */
  static getBookingAddons(bookingId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT a.name, ba.quantity, ba.price_at_time, (ba.quantity * ba.price_at_time) as total
         FROM booking_addons ba
         JOIN addons a ON ba.addon_id = a.id
         WHERE ba.booking_id = ?`,
        [bookingId],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, addons: rows });
        }
      );
    });
  }

  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS addons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category VARCHAR(100),
        active INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS booking_addons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        addon_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        price_at_time REAL NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (addon_id) REFERENCES addons(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabelas addons:', err);
      else console.log('✅ Tabelas addons criadas');
      db.close();
    });
  }
}

module.exports = AddonsService;

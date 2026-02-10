/**
 * [REDACTED_TOKEN].js
 * Agendamentos por minuto/hora em vez de pacotes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class [REDACTED_TOKEN] {
  /**
   * Criar agendamento por horas
   */
  static createHourlyBooking(userId, professionalId, date, startTime, durationHours, hourlyRate) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      const amount = durationHours * hourlyRate;
      const endTime = this.calculateEndTime(startTime, durationHours);

      db.run(
        `INSERT INTO hourly_bookings (
          user_id, professional_id, date, start_time, end_time, 
          duration_hours, hourly_rate, total_amount, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        [userId, professionalId, date, startTime, endTime, durationHours, hourlyRate, amount],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, bookingId: this.lastID, totalAmount: amount });
        }
      );
    });
  }

  /**
   * Obter tarifas por hora por profissional
   */
  static [REDACTED_TOKEN](professionalId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.get(
        `SELECT hourly_rate, min_booking_hours, max_booking_hours FROM hourly_rates WHERE professional_id = ?`,
        [professionalId],
        (err, row) => {
          db.close();
          if (err) return reject(err);
          resolve({
            success: true,
            rate: row || { hourly_rate: 0, min_booking_hours: 0.5, max_booking_hours: 8 }
          });
        }
      );
    });
  }

  /**
   * Calcular tempo final
   */
  static calculateEndTime(startTime, durationHours) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Verificar disponibilidade (por minuto)
   */
  static checkAvailability(professionalId, date, startTime, endTime) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.get(
        `SELECT COUNT(*) as conflicts FROM hourly_bookings
         WHERE professional_id = ? 
         AND date = ?
         AND (
           (start_time < ? AND end_time > ?) OR
           (start_time < ? AND end_time > ?)
         )
         AND status IN ('pending', 'confirmed')`,
        [professionalId, date, endTime, startTime, endTime, startTime],
        (err, row) => {
          db.close();
          if (err) return reject(err);
          resolve({ available: row.conflicts === 0 });
        }
      );
    });
  }

  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS hourly_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        professional_id INTEGER NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration_hours REAL NOT NULL,
        hourly_rate REAL NOT NULL,
        total_amount REAL NOT NULL,
        status VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (professional_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS hourly_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER UNIQUE NOT NULL,
        hourly_rate REAL NOT NULL,
        min_booking_hours REAL DEFAULT 0.5,
        max_booking_hours REAL DEFAULT 8,
        FOREIGN KEY (professional_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabelas hourly_bookings:', err);
      else console.log('✅ Tabelas hourly_bookings criadas');
      db.close();
    });
  }
}

module.exports = [REDACTED_TOKEN];

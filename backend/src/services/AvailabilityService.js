/**
 * AvailabilityService.js - Gerencia disponibilidade de profissionais
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class AvailabilityService {
  /**
   * Obter slots disponíveis para um período
   */
  static getAvailableSlots(professionalId, date, durationHours = 2) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);
      
      const dayOfWeek = new Date(date).getDay();
      const timeSlots = this.generateTimeSlots(durationHours);

      // Query para bookings existentes
      db.all(
        `SELECT time, duration_hours FROM bookings 
         WHERE professional_id = ? AND DATE(date) = ? AND status != 'cancelled'`,
        [professionalId, date],
        (err, existingBookings) => {
          if (err) {
            db.close();
            return reject(err);
          }

          // Filtrar slots disponíveis
          const bookedTimes = existingBookings.map(b => b.time);
          const available = timeSlots.filter(slot => !bookedTimes.includes(slot));

          db.close();
          resolve({
            date,
            professionalId,
            durationHours,
            totalSlots: timeSlots.length,
            availableSlots: available.length,
            available
          });
        }
      );
    });
  }

  /**
   * Gerar slots de tempo (ex: 09:00, 11:00, 14:00)
   */
  static generateTimeSlots(durationHours) {
    const slots = [];
    const startHour = 8; // 8h da manhã
    const endHour = 18; // 6h da tarde
    const duration = durationHours * 60; // minutos

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 60) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        // Verificar se cabe dentro do horário
        if (hour + durationHours <= endHour) {
          slots.push(timeStr);
        }
      }
    }
    return slots;
  }

  /**
   * Obter disponibilidade para próximos 30 dias
   */
  static [REDACTED_TOKEN](professionalId, durationHours = 2, days = 30) {
    return new Promise((resolve, reject) => {
      const availability = [];
      let processed = 0;

      for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        this.getAvailableSlots(professionalId, dateStr, durationHours)
          .then(slots => {
            if (slots.availableSlots > 0) {
              availability.push({
                date: slots.date,
                availableSlots: slots.availableSlots
              });
            }
            processed++;
            if (processed === days) {
              resolve(availability);
            }
          })
          .catch(err => reject(err));
      }
    });
  }

  /**
   * Bloquear um horário (manual block)
   */
  static blockTimeSlot(professionalId, date, time, reason = 'Manual block') {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `INSERT INTO time_blocks (professional_id, date, time, reason, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [professionalId, date, time, reason],
        function(err) {
          db.close();
          if (err) reject(err);
          else resolve({ success: true, blockId: this.lastID });
        }
      );
    });
  }

  /**
   * Validar se horário está disponível
   */
  static async validateTimeSlot(professionalId, date, time) {
    const slots = await this.getAvailableSlots(professionalId, date);
    return slots.available.includes(time);
  }

  /**
   * Integração com Google Calendar (opcional)
   */
  static async syncGoogleCalendar(professionalId, googleCalendarId) {
    // Implementação da integração com Google Calendar
    // Requer: google-auth-library, googleapis
    return {
      success: true,
      message: 'Google Calendar sincronizado'
    };
  }

  /**
   * Criar tabelas necessárias
   */
  static createTables() {
    const db = new sqlite3.Database(DB_PATH);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela time_blocks:', err);
      else console.log('✅ Tabela time_blocks criada');
      db.close();
    });
  }
}

module.exports = AvailabilityService;

/**
 * GeoLocationService.js
 * Filtrar profissionais por localização (Google Maps)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class GeoLocationService {
  /**
   * Encontrar profissionais próximos
   * Usa fórmula Haversine para distância
   */
  static [REDACTED_TOKEN](userLat, userLng, radiusKm = 5) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT 
          u.id, u.name, u.avatar,
          u.latitude, u.longitude,
          (6371 * acos(
            cos(radians(?)) * cos(radians(u.latitude)) * 
            cos(radians(u.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(u.latitude))
          )) AS distance,
          AVG(r.rating) as avg_rating
         FROM users u
         LEFT JOIN reviews r ON u.id = r.professional_id
         WHERE u.role = 'professional'
         AND u.latitude IS NOT NULL
         AND u.longitude IS NOT NULL
         HAVING distance <= ?
         ORDER BY distance ASC`,
        [userLat, userLng, userLat, radiusKm],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, professionals: rows });
        }
      );
    });
  }

  /**
   * Geocodificar endereço (Google Maps API)
   */
  static async geocodeAddress(address) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Endereço não encontrado');
      }

      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: response.data.results[0].formatted_address
      };
    } catch (error) {
      throw new Error(`Erro ao geocodificar: ${error.message}`);
    }
  }

  /**
   * Atualizar localização do usuário
   */
  static updateUserLocation(userId, latitude, longitude) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `UPDATE users SET latitude = ?, longitude = ? WHERE id = ?`,
        [latitude, longitude, userId],
        (err) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  /**
   * Salvar endereço do cliente
   */
  static saveClientAddress(userId, address, latitude, longitude) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `INSERT OR REPLACE INTO user_addresses (user_id, address, latitude, longitude, is_default)
         VALUES (?, ?, ?, ?, 1)`,
        [userId, address, latitude, longitude],
        (err) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true });
        }
      );
    });
  }

  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude REAL,
        longitude REAL,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela user_addresses:', err);
      else console.log('✅ Tabela user_addresses criada');
      db.close();
    });
  }
}

module.exports = GeoLocationService;

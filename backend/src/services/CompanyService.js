/**
 * CompanyService.js
 * Gerencia informações da empresa, dados bancários e configurações
 */

const db = require('../db');
const logger = require('../utils/logger');

class CompanyService {
  /**
   * Obter informações da empresa
   */
  static async getCompanyInfo() {
    return new Promise((resolve, reject) => {
      db.get().get('SELECT * FROM company_info WHERE id = 1', (err, row) => {
        if (err) {
          logger.error('Erro ao buscar informações da empresa:', err);
          reject(err);
        } else {
          resolve(row || {});
        }
      });
    });
  }

  /**
   * Atualizar informações da empresa
   */
  static async updateCompanyInfo(data) {
    const {
      name,
      email,
      phone,
      website,
      logo_url,
      bank_name,
      account_holder_name,
      account_number,
      account_type,
      routing_number,
      pix_key,
      tax_id,
      address,
      city,
      state,
      postal_code,
      business_hours_open,
      [REDACTED_TOKEN],
      payment_terms,
      return_policy,
      privacy_policy
    } = data;

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE company_info SET
          name = ?,
          email = ?,
          phone = ?,
          website = ?,
          logo_url = ?,
          bank_name = ?,
          account_holder_name = ?,
          account_number = ?,
          account_type = ?,
          routing_number = ?,
          pix_key = ?,
          tax_id = ?,
          address = ?,
          city = ?,
          state = ?,
          postal_code = ?,
          business_hours_open = ?,
          [REDACTED_TOKEN] = ?,
          payment_terms = ?,
          return_policy = ?,
          privacy_policy = ?,
          updated_at = datetime('now')
        WHERE id = 1
      `;

      const params = [
        name,
        email,
        phone,
        website,
        logo_url,
        bank_name,
        account_holder_name,
        account_number,
        account_type,
        routing_number,
        pix_key,
        tax_id,
        address,
        city,
        state,
        postal_code,
        business_hours_open,
        [REDACTED_TOKEN],
        payment_terms,
        return_policy,
        privacy_policy
      ];

      db.get().run(sql, params, function(err) {
        if (err) {
          logger.error('Erro ao atualizar informações da empresa:', err);
          reject(err);
        } else {
          logger.info('Informações da empresa atualizadas');
          resolve({ id: 1, ...data });
        }
      });
    });
  }

  /**
   * Obter dados bancários da empresa (apenas para admin)
   */
  static async getBankingInfo() {
    return new Promise((resolve, reject) => {
      db.get().get(
        `SELECT 
          bank_name, 
          account_holder_name, 
          account_number, 
          account_type, 
          routing_number, 
          pix_key, 
          tax_id 
        FROM company_info WHERE id = 1`,
        (err, row) => {
          if (err) {
            logger.error('Erro ao buscar dados bancários:', err);
            reject(err);
          } else {
            resolve(row || {});
          }
        }
      );
    });
  }

  /**
   * Obter dados públicos da empresa (sem informações sensíveis)
   */
  static async getPublicInfo() {
    return new Promise((resolve, reject) => {
      db.get().get(
        `SELECT 
          name,
          email,
          phone,
          website,
          logo_url,
          address,
          city,
          state,
          postal_code,
          business_hours_open,
          [REDACTED_TOKEN],
          payment_terms,
          return_policy,
          privacy_policy
        FROM company_info WHERE id = 1`,
        (err, row) => {
          if (err) {
            logger.error('Erro ao buscar dados públicos:', err);
            reject(err);
          } else {
            resolve(row || {});
          }
        }
      );
    });
  }
}

module.exports = CompanyService;

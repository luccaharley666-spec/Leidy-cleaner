/**
 * AffiliateService.js - Sistema de referência e afiliados
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class AffiliateService {
  /**
   * Criar código de referência único
   */
  static [REDACTED_TOKEN](userId) {
    return `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Registrar usuário como afiliado
   */
  static registerAffiliate(userId, commissionRate = 0.10) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);
      const referralCode = this.[REDACTED_TOKEN](userId);

      db.run(
        `INSERT INTO affiliates (user_id, referral_code, commission_rate, total_referrals, total_earnings, status)
         VALUES (?, ?, ?, 0, 0, 'active')`,
        [userId, referralCode, commissionRate],
        function(err) {
          db.close();
          if (err) return reject(err);

          resolve({
            success: true,
            affiliateId: this.lastID,
            referralCode,
            commissionRate
          });
        }
      );
    });
  }

  /**
   * Registrar referral (quando alguém usa código)
   */
  static registerReferral(referralCode, newUserId, transactionAmount) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      // 1. Encontrar afiliado pelo código
      db.get(
        'SELECT user_id, commission_rate FROM affiliates WHERE referral_code = ?',
        [referralCode],
        (err, affiliate) => {
          if (err) {
            db.close();
            return reject(err);
          }

          if (!affiliate) {
            db.close();
            return reject(new Error('Código de referência inválido'));
          }

          const commission = transactionAmount * affiliate.commission_rate;

          // 2. Registrar referral
          db.run(
            `INSERT INTO referrals (affiliate_user_id, referred_user_id, referral_code, transaction_amount, commission_earned, status, created_at)
             VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'))`,
            [affiliate.user_id, newUserId, referralCode, transactionAmount, commission],
            function(err) {
              if (err) {
                db.close();
                return reject(err);
              }

              // 3. Atualizar totais do afiliado
              db.run(
                `UPDATE affiliates SET total_referrals = total_referrals + 1, total_earnings = total_earnings + ?
                 WHERE user_id = ?`,
                [commission, affiliate.user_id],
                function(err) {
                  db.close();
                  if (err) return reject(err);

                  resolve({
                    success: true,
                    referralId: this.lastID,
                    affiliateUserId: affiliate.user_id,
                    commission
                  });
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Obter dados do afiliado
   */
  static getAffiliateStats(userId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.get(
        `SELECT * FROM affiliates WHERE user_id = ?`,
        [userId],
        (err, affiliate) => {
          if (err) {
            db.close();
            return reject(err);
          }

          if (!affiliate) {
            db.close();
            return reject(new Error('Afiliado não encontrado'));
          }

          // Obter histórico de referrals
          db.all(
            `SELECT r.*, u.name as referred_user_name FROM referrals r
             LEFT JOIN users u ON r.referred_user_id = u.id
             WHERE r.affiliate_user_id = ? ORDER BY r.created_at DESC`,
            [userId],
            (err, referrals) => {
              db.close();
              if (err) return reject(err);

              resolve({
                success: true,
                affiliate,
                referrals
              });
            }
          );
        }
      );
    });
  }

  /**
   * Solicitar saque de ganhos
   */
  static requestWithdrawal(userId, amount) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      // Verificar se tem saldo suficiente
      db.get(
        `SELECT total_earnings FROM affiliates WHERE user_id = ?`,
        [userId],
        (err, affiliate) => {
          if (err) {
            db.close();
            return reject(err);
          }

          if (!affiliate || affiliate.total_earnings < amount) {
            db.close();
            return reject(new Error('Saldo insuficiente'));
          }

          // Criar requisição de saque
          db.run(
            `INSERT INTO [REDACTED_TOKEN] (user_id, amount, status, requested_at)
             VALUES (?, ?, 'pending', datetime('now'))`,
            [userId, amount],
            function(err) {
              db.close();
              if (err) return reject(err);

              resolve({
                success: true,
                withdrawalId: this.lastID,
                amount,
                status: 'pending',
                message: 'Saque solicitado. Processaremos em até 5 dias úteis.'
              });
            }
          );
        }
      );
    });
  }

  /**
   * Aprovar saque (admin)
   */
  static approveWithdrawal(withdrawalId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.run(
        `UPDATE [REDACTED_TOKEN] SET status = 'approved', approved_at = datetime('now')
         WHERE id = ?`,
        [withdrawalId],
        function(err) {
          db.close();
          if (err) return reject(err);

          resolve({
            success: true,
            message: 'Saque aprovado'
          });
        }
      );
    });
  }

  /**
   * Criar tabelas necessárias
   */
  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    // Tabela de afiliados
    db.run(`
      CREATE TABLE IF NOT EXISTS affiliates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        referral_code VARCHAR(20) UNIQUE NOT NULL,
        commission_rate DECIMAL(5, 2) DEFAULT 10.00,
        total_referrals INTEGER DEFAULT 0,
        total_earnings DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela affiliates:', err);
      else console.log('✅ Tabela affiliates criada');
    });

    // Tabela de referrals
    db.run(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        affiliate_user_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL,
        referral_code VARCHAR(20),
        transaction_amount DECIMAL(10, 2),
        commission_earned DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (affiliate_user_id) REFERENCES users(id),
        FOREIGN KEY (referred_user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela referrals:', err);
      else console.log('✅ Tabela referrals criada');
    });

    // Tabela de saques
    db.run(`
      CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at DATETIME,
        approved_at DATETIME,
        paid_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela [REDACTED_TOKEN]:', err);
      else console.log('✅ Tabela [REDACTED_TOKEN] criada');
      db.close();
    });
  }
}

module.exports = AffiliateService;

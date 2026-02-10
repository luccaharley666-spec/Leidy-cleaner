/**
 * ReferralService.js - Programa de indicação com rewards
 */

const db = require('../db');
const logger = require('../utils/logger');
const crypto = require('crypto');

class ReferralService {
  /**
   * Gerar link de referência para um usuário
   */
  static async [REDACTED_TOKEN](userId) {
    try {
      // Verificar se já tem link
      const referralLink = await db.get(
        'SELECT code FROM referral_links WHERE user_id = ?',
        userId
      );

      if (referralLink) {
        return { success: true, code: referralLink.code };
      }

      // Gerar código único
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();

      // Verificar se código já existe
      const existing = await db.get(
        'SELECT id FROM referral_links WHERE code = ?',
        code
      );

      if (existing) {
        // Retry recursivo (muito raro)
        return this.[REDACTED_TOKEN](userId);
      }

      // Criar link de referência
      await db.run(
        `INSERT INTO referral_links (user_id, code, reward_amount, signup_count, reward_earned)
         VALUES (?, ?, 50, 0, 0)`,
        userId,
        code
      );

      logger.info('Referral link generated', { userId, code });

      return {
        success: true,
        code,
        link: `${process.env.FRONTEND_URL || 'https://limpezapro.com'}/ref/${code}`
      };
    } catch (err) {
      logger.error('Generate referral link failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Processa nova signup com código de referência
   */
  static async [REDACTED_TOKEN](newUserId, referralCode) {
    try {
      // Buscar link de referência
      const referralLink = await db.get(
        'SELECT id, user_id, reward_amount FROM referral_links WHERE code = ?',
        referralCode
      );

      if (!referralLink) {
        return { success: false, error: 'Código de referência inválido' };
      }

      // Registrar signup
      await db.run(
        `INSERT INTO referral_signups (referrer_id, new_user_id, reward_amount, status)
         VALUES (?, ?, ?, 'pending')`,
        referralLink.user_id,
        newUserId,
        referralLink.reward_amount
      );

      // Atualizar contador
      await db.run(
        'UPDATE referral_links SET signup_count = signup_count + 1 WHERE id = ?',
        referralLink.id
      );

      logger.info('Referral signup processed', {
        referrer: referralLink.user_id,
        newUser: newUserId,
        code: referralCode
      });

      return {
        success: true,
        reward: referralLink.reward_amount,
        message: 'Cadastro via referência registrado!'
      };
    } catch (err) {
      logger.error('Process referral signup failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Confirmar reward quando novo usuário faz primeiro payment
   */
  static async [REDACTED_TOKEN](newUserId) {
    try {
      // Buscar signup referral
      const signup = await db.get(
        `SELECT id, referrer_id, reward_amount FROM referral_signups
         WHERE new_user_id = ? AND status = 'pending'`,
        newUserId
      );

      if (!signup) {
        return { success: false, error: 'Nenhum referral pendente' };
      }

      // Atualizar status
      await db.run(
        'UPDATE referral_signups SET status = ? WHERE id = ?',
        'completed',
        signup.id
      );

      // Atualizar reward_earned
      await db.run(
        `UPDATE referral_links 
         SET reward_earned = reward_earned + ? 
         WHERE user_id = ?`,
        signup.reward_amount,
        signup.referrer_id
      );

      // TODO: Criar credit na conta do referrer (implementar saldo de créditos)
      logger.info('Referral reward confirmed', {
        referrer: signup.referrer_id,
        newUser: newUserId,
        amount: signup.reward_amount
      });

      return {
        success: true,
        rewardAmount: signup.reward_amount,
        message: 'Reward confirmado!'
      };
    } catch (err) {
      logger.error('Confirm referral reward failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Obter estatísticas de referral do usuário
   */
  static async getReferralStats(userId) {
    try {
      const linkData = await db.get(
        'SELECT * FROM referral_links WHERE user_id = ?',
        userId
      );

      if (!linkData) {
        return { success: false, error: 'Usuário não tem link de referência' };
      }

      // Contar signups completados
      const [{ completedSignups }] = await db.all(
        'SELECT COUNT(*) as completedSignups FROM referral_signups WHERE referrer_id = ? AND status = ?',
        userId,
        'completed'
      );

      return {
        success: true,
        stats: {
          code: linkData.code,
          totalSignups: linkData.signup_count,
          completedSignups,
          rewardPerSignup: linkData.reward_amount,
          totalRewardEarned: linkData.reward_earned,
          link: `${process.env.FRONTEND_URL || 'https://limpezapro.com'}/ref/${linkData.code}`
        }
      };
    } catch (err) {
      logger.error('Get referral stats failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Listar referral signups (admin)
   */
  static async listReferrals(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const referrals = await db.all(
        `SELECT 
          rs.id,
          rs.referrer_id,
          u_referrer.name as referrer_name,
          u_referrer.email as referrer_email,
          rs.new_user_id,
          u_new.name as new_user_name,
          u_new.email as new_user_email,
          rs.reward_amount,
          rs.status,
          rs.created_at
        FROM referral_signups rs
        JOIN users u_referrer ON rs.referrer_id = u_referrer.id
        JOIN users u_new ON rs.new_user_id = u_new.id
        ORDER BY rs.created_at DESC
        LIMIT ? OFFSET ?`,
        limit,
        offset
      );

      const [{ total }] = await db.all('SELECT COUNT(*) as total FROM referral_signups');

      return {
        success: true,
        referrals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      logger.error('List referrals failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Relatório de referências
   */
  static async getReferralReport() {
    try {
      const [{ totalSignups }] = await db.all('SELECT COUNT(*) as totalSignups FROM referral_signups');
      const [{ completedSignups }] = await db.all(
        'SELECT COUNT(*) as completedSignups FROM referral_signups WHERE status = ?',
        'completed'
      );
      const [{ totalRewards }] = await db.all(
        'SELECT SUM(reward_earned) as totalRewards FROM referral_links'
      );
      const [{ activeReferrers }] = await db.all(
        'SELECT COUNT(*) as activeReferrers FROM referral_links WHERE signup_count > ?',
        0
      );

      return {
        success: true,
        report: {
          totalSignups,
          completedSignups,
          conversionRate: `${((completedSignups / Math.max(totalSignups, 1)) * 100).toFixed(1)}%`,
          totalRewardsGiven: totalRewards || 0,
          activeReferrers,
          [REDACTED_TOKEN]: activeReferrers > 0 ? Math.round((totalRewards || 0) / activeReferrers) : 0
        }
      };
    } catch (err) {
      logger.error('Referral report failed', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = ReferralService;

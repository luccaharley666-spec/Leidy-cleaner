const db = require('../db');
const PixPaymentService = require('./PixPaymentService');

/**
 * [REDACTED_TOKEN]
 * Reconcilia pagamentos PIX entre banco e sistema local
 * Verifica se todos os pagamentos foram realmente processados
 */
class [REDACTED_TOKEN] {
  constructor() {
    this.[REDACTED_TOKEN] = parseInt(process.env.[REDACTED_TOKEN] || '24');
  }

  /**
   * Executar reconciliação completa
   */
  async reconcileAll() {
    console.log('🔄 Iniciando reconciliação de pagamentos...');
    
    try {
      const unreconciled = await db.all(
        `SELECT p.id, p.transaction_id, p.booking_id, p.status, p.created_at 
         FROM payments p 
         WHERE p.method = 'pix' 
         AND p.status IN ('pending', 'waiting')
         AND p.created_at > datetime('now', '-' || ? || ' hours')
         ORDER BY p.created_at ASC`,
        this.[REDACTED_TOKEN]
      );

      console.log(`📊 Encontrados ${unreconciled.length} pagamentos pendentes para reconciliar`);

      let reconciled = 0;
      let failed = 0;

      for (const payment of unreconciled) {
        const result = await this.reconcilePayment(payment);
        if (result.reconciled) {
          reconciled++;
        } else {
          failed++;
        }
      }

      console.log(`✅ Reconciliação concluída: ${reconciled} reconciliados, ${failed} falhados`);
      
      return {
        success: true,
        total: unreconciled.length,
        reconciled,
        failed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro na reconciliação:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reconciliar um pagamento específico
   */
  async reconcilePayment(payment) {
    const { id, transaction_id, booking_id, status } = payment;

    try {
      // 1. Consultar status real do PIX junto ao banco (placeholder)
      const bankStatus = await this.checkBankStatus(transaction_id);

      // 2. Registrar tentativa de reconciliação
      await db.run(
        `INSERT INTO [REDACTED_TOKEN] (transaction_id, booking_id, payment_id, [REDACTED_TOKEN], status_in_system)
         VALUES (?, ?, ?, ?, ?)`,
        transaction_id,
        booking_id,
        id,
        bankStatus.status,
        status
      );

      // 3. Se banco confirma pagamento, atualizar no sistema
      if (bankStatus.status === 'confirmed' && status !== 'confirmed') {
        console.log(`📌 Atualizando pagamento ${transaction_id} para confirmed`);

        await db.run(
          `UPDATE payments SET status = 'confirmed', confirmed_at = ? WHERE id = ?`,
          new Date().toISOString(),
          id
        );

        // 4. Atualizar booking para completed
        if (booking_id) {
          await db.run(
            `UPDATE bookings SET status = 'completed', updated_at = ? WHERE id = ?`,
            new Date().toISOString(),
            booking_id
          );
        }

        // 5. Marcar reconciliação como sucesso
        await db.run(
          `UPDATE [REDACTED_TOKEN] SET reconciled = 1, reconciled_at = ? WHERE transaction_id = ?`,
          new Date().toISOString(),
          transaction_id
        );

        return { reconciled: true, transactionId: transaction_id };
      } else if (bankStatus.status === 'expired' || bankStatus.status === 'rejected') {
        // PIX expirou ou foi rejeitado
        console.log(`⏰ Marcando PIX ${transaction_id} como expirado`);

        await db.run(
          `UPDATE payments SET status = 'expired', updated_at = ? WHERE id = ?`,
          new Date().toISOString(),
          id
        );

        await db.run(
          `UPDATE [REDACTED_TOKEN] SET reconciled = 1, reconciled_at = ? WHERE transaction_id = ?`,
          new Date().toISOString(),
          transaction_id
        );

        return { reconciled: true, transactionId: transaction_id, expired: true };
      } else {
        // Ainda pendente no banco
        console.log(`⏳ PIX ${transaction_id} ainda está pendente no banco`);
        return { reconciled: false, transactionId: transaction_id, reason: 'pending_in_bank' };
      }
    } catch (error) {
      console.error(`❌ Erro ao reconciliar ${transaction_id}:`, error.message);
      return { reconciled: false, error: error.message };
    }
  }

  /**
   * Consultar status PIX no banco
   * Em produção, chamar API real do banco (BB, Itaú, etc)
   * Implementação futura: integrar com API do banco real
   */
  async checkBankStatus(transactionId) {
    try {
      const logger = require('../utils/logger');
      
      // Buscar pagamento local
      const payment = await db.get(
        `SELECT p.* FROM payments p WHERE p.transaction_id = ?`,
        transactionId
      );

      if (!payment) {
        logger.warn('Payment not found for bank reconciliation', { transactionId });
        return { status: 'not_found' };
      }

      // REAL API INTEGRATION POINTS (for future implementation):
      // 1. Banco do Brasil: https://api.bb.com.br/v1/pix/status/{transactionId}
      // 2. Itaú: https://api.itau.com.br/pix/v1/transaction/{transactionId}
      // 3. Caixa: https://api.caixa.gov.br/pix/status/{transactionId}
      // 4. Bradesco: https://api.bradesco.com.br/pix/status/{transactionId}

      // For now: check local database state + timeout logic
      const createdAt = new Date(payment.created_at);
      const now = new Date();
      const diffMinutes = (now - createdAt) / (1000 * 60);

      // QR codes PIX têm validade de 10 minutos
      if (diffMinutes > 10 && payment.status !== 'confirmed') {
        logger.info('PIX payment expired (no confirmation within 10 minutes)', { transactionId });
        return { status: 'expired' };
      }

      // Return local status (in real implementation, would query bank API)
      return { status: payment.status };
    } catch (error) {
      logger.error('Error checking bank status', { transactionId, error: error.message });
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Obter histórico de reconciliações
   */
  async getHistory(limit = 100) {
    try {
      const history = await db.all(
        `SELECT * FROM [REDACTED_TOKEN] 
         ORDER BY checked_at DESC 
         LIMIT ?`,
        limit
      );
      return history || [];
    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error.message);
      return [];
    }
  }

  /**
   * Obter estatísticas de reconciliação
   */
  async getStats() {
    try {
      const stats = await db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN reconciled = 1 THEN 1 ELSE 0 END) as reconciled,
          SUM(CASE WHEN reconciled = 0 THEN 1 ELSE 0 END) as pending
         FROM [REDACTED_TOKEN]`
      );

      return stats || { total: 0, reconciled: 0, pending: 0 };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Limpar eventos antigos (mais de 30 dias)
   */
  async cleanupOldRecords(daysAgo = 30) {
    try {
      const result = await db.run(
        `DELETE FROM [REDACTED_TOKEN] 
         WHERE checked_at < datetime('now', '-' || ? || ' days')`,
        daysAgo
      );

      console.log(`🧹 Limpeza executada: ${result.changes || 0} registros antigos removidos`);
      return { success: true, removedRecords: result.changes || 0 };
    } catch (error) {
      console.error('❌ Erro ao limpar registros:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new [REDACTED_TOKEN]();

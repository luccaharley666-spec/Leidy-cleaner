/**
 * Payment Controller
 * Gerencia pagamentos e transações
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const StripeService = require('../services/StripeService');

const DB_PATH = path.join(__dirname, '../../backend_data/limpeza.db');

const getDb = () => new sqlite3.Database(DB_PATH);
const runAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

class PaymentController {
  /**
   * Processar pagamento
   */
  async processPayment(req, res) {
    const db = getDb();
    try {
      const { bookingId, amount, paymentMethod } = req.body;

      // Validar dados
      if (!bookingId || !amount || !paymentMethod) {
        db.close();
        return res.status(400).json({ error: 'Dados de pagamento incompletos' });
      }

      // Verificar se booking existe
      const booking = await getAsync(db, 'SELECT * FROM bookings WHERE id = ?', [bookingId]);
      if (!booking) {
        db.close();
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Processar pagamento via StripeService (recebe paymentMethod token do client)
      const paymentResult = await StripeService.processPayment(paymentMethod, amount, bookingId);

      if (!paymentResult.success) {
        db.close();
        return res.status(402).json({ error: paymentResult.error || 'Falha no processamento do pagamento' });
      }

      // Salvar transação no banco (apenas dados não sensíveis)
      const result = await runAsync(db,
        `INSERT INTO transactions (booking_id, user_id, amount, payment_method, status, transaction_id, stripe_id, last_four)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, booking.user_id, amount, paymentMethod, paymentResult.status, crypto.randomBytes(8).toString('hex'), paymentResult.id, paymentResult.last4]
      );

      // Atualizar status do agendamento para confirmado
      await runAsync(db,
        'UPDATE bookings SET status = ?, paid = ? WHERE id = ?',
        ['confirmed', 1, bookingId]
      );

      const transaction = await getAsync(db, 'SELECT * FROM transactions WHERE id = ?', [result.lastID]);

      db.close();
      res.json({ 
        success: true, 
        transaction,
        message: 'Pagamento processado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Gerar código PIX
   */
  async generatePixQRCode(amount) {
    try {
      // Simulação de geração de PIX
      return {
        qrCode: 'data:image/png;base64,...',
        pix_key: '51 98033 0422',
        amount,
        company: {
          name: 'Leidy Cleaner',
          phone: '+55 51 98030-3740',
          pix: '51 98033 0422',
        }
      };
    } catch (error) {
      throw new Error('Erro ao gerar código PIX');
    }
  }

  /**
   * Obter histórico de pagamentos
   */
  async getPaymentHistory(req, res) {
    const db = getDb();
    try {
      const { userId } = req.params;
      
      const payments = await allAsync(db,
        `SELECT t.*, b.date as booking_date, b.address as booking_address, s.name as service_name
         FROM transactions t
         LEFT JOIN bookings b ON t.booking_id = b.id
         LEFT JOIN services s ON b.service_id = s.id
         WHERE t.user_id = ?
         ORDER BY t.created_at DESC`,
        [userId]
      );

      db.close();
      res.json({ success: true, payments });
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Processar reembolso
   */
  async processRefund(req, res) {
    const db = getDb();
    try {
      const { transactionId, reason } = req.body;

      // Buscar transação
      const transaction = await getAsync(db, 'SELECT * FROM transactions WHERE id = ?', [transactionId]);
      if (!transaction) {
        db.close();
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      // Atualizar status para refunded
      await runAsync(db,
        'UPDATE transactions SET status = ?, notes = ? WHERE id = ?',
        ['refunded', reason || '', transactionId]
      );

      const updatedTransaction = await getAsync(db, 'SELECT * FROM transactions WHERE id = ?', [transactionId]);

      db.close();
      res.json({ 
        success: true, 
        message: 'Reembolso processado com sucesso!',
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PaymentController();

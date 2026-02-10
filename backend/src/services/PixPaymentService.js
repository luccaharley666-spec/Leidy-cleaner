/**
 * PixPaymentService.js
 * Serviço para gerenciar pagamentos PIX
 * - Criar QR Code
 * - Verificar status
 * - Receber webhooks
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class PixPaymentService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Criar novo pagamento PIX
   * @param {number} bookingId - ID do agendamento
   * @param {number} amount - Valor em reais
   * @param {string} userId - ID do usuário
   * @returns {object} Dados do pagamento (transaction_id, qr_code, br_code, expires_at)
   */
  async createPixPayment(bookingId, amount, userId) {
    try {
      // Gerar IDs únicos
      const transactionId = uuidv4();
      const pixKey = process.env.PIX_KEY || 'fransmalifra@gmail.com';
      
      // Expiração: 10 minutos a partir de agora
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Gerar QR Code (base64) e BR Code
      const qrCodeData = await this.generateQRCode(transactionId, amount, pixKey);
      const brCode = this.generateBRCode(amount, pixKey, transactionId);

      // Salvar no banco de dados
      const result = await this.db.run(
        `INSERT INTO payments 
        (booking_id, amount, method, status, transaction_id, qr_code, br_code, expires_at, user_id, pix_key, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        bookingId,
        amount,
        'pix',
        'waiting',
        transactionId,
        qrCodeData,
        brCode,
        expiresAt,
        userId,
        pixKey
      );

      return {
        success: true,
        data: {
          id: transactionId,
          transactionId,
          qrCode: qrCodeData,
          brCode,
          expiresAt,
          amount,
          status: 'waiting',
          bookingId
        }
      };
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Error creating PIX payment', { bookingId: this?.bookingId, error: error.message });
      throw new Error('Failed to create PIX payment: ' + error.message);
    }
  }

  /**
   * Gerar QR Code como imagem base64
   * @param {string} transactionId - ID da transação
   * @param {number} amount - Valor em reais
   * @param {string} pixKey - PIX key
   * @returns {string} QR Code em base64
   */
  async generateQRCode(transactionId, amount, pixKey) {
    try {
      const QRCode = require('qrcode');
      
      // BR Code (Código de Barras PIX)
      const brCode = this.generateBRCode(amount, pixKey, transactionId);
      
      // Gerar imagem PNG em base64
      const qrImage = await QRCode.toDataURL(brCode, {
        [REDACTED_TOKEN]: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrImage;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      // Retornar QR code de fallback/placeholder
      return this.[REDACTED_TOKEN]();
    }
  }

  /**
   * Gerar BR Code (string numérica PIX)
   * Este é um BR Code simplificado
   * Em produção, usar library como `brcode-js`
   * @param {number} amount - Valor em reais
   * @param {string} pixKey - PIX key
   * @param {string} transactionId - ID único da transação
   * @returns {string} BR Code
   */
  generateBRCode(amount, pixKey, transactionId) {
    // Usar library brcode para gerar BR Code real
    // Por enquanto, retornar formato simplificado
    // Formato: 00020126360014br.gov.bcb.pix...
    
    try {
      const brcode = require('brcode-js');
      
      const pixData = {
        pixKey: pixKey,
        amount: parseFloat(amount).toFixed(2),
        description: `Agendamento PIX ${transactionId.substring(0, 8)}`,
        reference: transactionId.substring(0, 25),
        merchantName: 'Leidy Cleaner',
        merchantCity: 'Porto Alegre',
        countryCode: '5891' // Brasil
      };

      return brcode.encode(pixData);
    } catch (error) {
      console.error('Erro ao gerar BR Code:', error);
      // Retornar BR Code fake para teste
      return `00020126360014br.gov.bcb.pix0136${transactionId}[REDACTED_TOKEN].00`;
    }
  }

  /**
   * Obter status do pagamento
   * @param {string} transactionId - ID da transação
   * @returns {object} Status do pagamento
   */
  async getPaymentStatus(transactionId) {
    try {
      const payment = await this.db.get(
        `SELECT * FROM payments WHERE transaction_id = ?`,
        transactionId
      );

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      return {
        success: true,
        data: {
          id: payment.transaction_id,
          bookingId: payment.booking_id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          createdAt: payment.created_at,
          confirmedAt: payment.confirmed_at,
          expiresAt: payment.expires_at,
          paidAt: payment.confirmed_at
        }
      };
    } catch (error) {
      console.error('Erro ao obter status:', error);
      throw new Error('Falha ao obter status do pagamento: ' + error.message);
    }
  }

  /**
   * Processar webhook do banco
   * @param {object} webhookBody - Body do webhook
   * @param {string} signature - Assinatura HMAC
   * @returns {object} Resultado do processamento
   */
  async processWebhook(webhookBody, signature) {
    // nova assinatura: processWebhook(parsedBody, rawBody, signature, timestamp, headers)
    try {
      const parsed = webhookBody || {};
      const raw = arguments[1] || JSON.stringify(parsed);
      const sig = signature || arguments[2];
      const timestamp = arguments[3];

      const secret = process.env.[REDACTED_TOKEN];

      // Validar timestamp (tolerância 5 minutos)
      if (timestamp) {
        const ts = Date.parse(timestamp);
        if (isNaN(ts)) {
          throw new Error('Timestamp inválido no header');
        }
        const diff = Math.abs(Date.now() - ts);
        if (diff > 5 * 60 * 1000) {
          throw new Error('Webhook fora da janela de tempo aceitável');
        }
      }

      // Validar assinatura usando body bruto
      if (!this.[REDACTED_TOKEN](raw, sig, secret)) {
        throw new Error('Assinatura de webhook inválida');
      }

      // Idempotency: registrar evento único
      const eventId = (parsed && (parsed.id || parsed.eventId || parsed.transactionId)) || null;
      if (!eventId) {
        throw new Error('Evento de webhook sem id');
      }

      // Checar se evento já foi processado
      const existing = await this.db.get(`SELECT * FROM webhook_events WHERE event_id = ?`, eventId);
      if (existing) {
        // Já processado — retornar sem erro
        return { success: true, message: 'Evento já processado', data: { eventId } };
      }

      // Inserir evento na tabela para bloquear replays
      await this.db.run(
        `INSERT INTO webhook_events (event_id, source, payload, signature, received_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        eventId,
        'bank',
        raw,
        sig
      );

      // Extrair dados do webhook
      const transactionId = parsed.transactionId || parsed.id;
      const newStatus = this.mapWebhookStatus(parsed.status);

      // Buscar pagamento
      const payment = await this.db.get(`SELECT * FROM payments WHERE transaction_id = ?`, transactionId);
      if (!payment) {
        throw new Error('Pagamento não encontrado para webhook');
      }

      // Atualizar status do pagamento
      await this.db.run(
        `UPDATE payments SET status = ?, confirmed_at = ?, webhook_response = ?, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?`,
        newStatus,
        newStatus === 'confirmed' ? new Date().toISOString() : null,
        raw,
        transactionId
      );

      // Se confirmed, atualizar booking também
      if (newStatus === 'confirmed') {
        await this.db.run(`UPDATE bookings SET status = 'confirmed', [REDACTED_TOKEN] = CURRENT_TIMESTAMP WHERE id = ?`, payment.booking_id);
        await this.[REDACTED_TOKEN](payment);
      }

      return { success: true, message: 'Webhook processado com sucesso', data: { transactionId, newStatus, bookingId: payment.booking_id } };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  // Validar assinatura HMAC usando body bruto (string)
  [REDACTED_TOKEN](rawBodyString, signature, secret) {
    try {
      if (!secret || !signature) return false;
      const hash = crypto.createHmac('sha256', secret).update(rawBodyString).digest('hex');
      return hash === signature;
    } catch (err) {
      console.error('Erro [REDACTED_TOKEN]:', err);
      return false;
    }
  }

  /**
   * Validar assinatura HMAC-SHA256 do webhook
   * @param {object} body - Body da requisição
   * @param {string} signature - Assinatura enviada
   * @param {string} secret - Secret do webhook
   * @returns {boolean} True se válido
   */
  validateSignature(body, signature, secret) {
    const bodyString = JSON.stringify(body);
    const hash = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Mapear status do webhook para nosso formato
   * @param {string} webhookStatus - Status do webhook
   * @returns {string} Status mapeado
   */
  mapWebhookStatus(webhookStatus) {
    const mapping = {
      'received': 'received',
      'processing': 'processing',
      'confirmed': 'confirmed',
      'failed': 'failed',
      'expired': 'expired',
      'paid': 'confirmed'
    };
    return mapping[webhookStatus] || 'received';
  }

  /**
   * Notificar usuário que pagamento foi confirmado
   * @param {object} payment - Dados do pagamento
   */
  async [REDACTED_TOKEN](payment) {
    try {
      // Aqui você pode disparar:
      // - Email ao usuário
      // - SMS via Twilio
      // - Notificação push
      
      console.log(`Pagamento confirmado para booking ${payment.booking_id}`);
      
      // Exemplo: Enviar email (implementar EmailService depois)
      // await EmailService.[REDACTED_TOKEN](payment);
    } catch (error) {
      console.error('Erro ao notificar pagamento:', error);
      // Não rejeitar o webhook por causa de erro de notificação
    }
  }

  /**
   * Cancelar/Expirar pagamento PIX
   * @param {string} transactionId - ID da transação
   * @returns {object} Resultado
   */
  async expirePayment(transactionId) {
    try {
      const payment = await this.db.get(
        `SELECT * FROM payments WHERE transaction_id = ?`,
        transactionId
      );

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      if (payment.status === 'confirmed') {
        throw new Error('Não é possível expirar pagamento já confirmado');
      }

      await this.db.run(
        `UPDATE payments SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?`,
        transactionId
      );

      return {
        success: true,
        message: 'Pagamento expirado',
        data: { transactionId }
      };
    } catch (error) {
      console.error('Erro ao expirar pagamento:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de pagamentos do usuário
   * @param {number} userId - ID do usuário
   * @returns {array} Lista de pagamentos
   */
  async getUserPayments(userId) {
    try {
      const payments = await this.db.all(
        `SELECT p.*, b.service_type, b.scheduled_date, b.address
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT 50`,
        userId
      );

      return {
        success: true,
        data: payments
      };
    } catch (error) {
      console.error('Erro ao obter pagamentos do usuário:', error);
      throw error;
    }
  }

  /**
   * Retornar QR Code placeholder (SVG base64)
   * Usado quando a geração falha
   */
  [REDACTED_TOKEN]() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="300" height="300" fill="white"/>
      <text x="150" y="150" font-size="20" text-anchor="middle" dominant-baseline="middle">
        QR Code unavailable
      </text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

module.exports = PixPaymentService;

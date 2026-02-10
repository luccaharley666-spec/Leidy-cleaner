/**
 * PixService.js - Integração PIX via Brcode
 * Gera QR codes e valida pagamentos PIX
 */

const logger = require('../utils/logger');
const crypto = require('crypto');
const db = require('../db');

class PixService {
  /**
   * Gerar QR Code PIX dinâmico
   * @param {number} amount - Valor em reais
   * @param {string} orderId - ID do agendamento/transação
   * @param {string} description - Descrição do pagamento
   */
  static async generateQRCode(amount, orderId, description = 'Limpeza Pro') {
    try {
      // Como não temos dependência de brcode, vamos gerar o formato manual
      // Format: 00020126580014br.gov.bcb.pix...
      
      const pixKey = process.env.PIX_KEY || 'limpezapro@pix.com';
      const merchantName = 'LIMPEZA PRO LTDA';
      const merchantCity = 'SAO PAULO';
      
      // Braz QR Code (Simplified format)
      const brCode = this.generateBRCode({
        pixKey,
        amount,
        merchantName,
        merchantCity,
        description,
        orderId
      });

      // Salvar PIX pendente no BD
      const pixTransactionId = crypto.randomUUID();
      await db.run(
        `INSERT INTO pix_transactions (id, amount, status, order_id, br_code, expires_at)
         VALUES (?, ?, 'pending', ?, ?, datetime('now', '+30 minutes'))`,
        pixTransactionId, amount, orderId, brCode
      );

      logger.info('PIX QR Code generated', { pixTransactionId, amount });

      return {
        success: true,
        pixTransactionId,
        brCode,
        amount,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        message: 'Escaneie o código QR com seu banco'
      };
    } catch (err) {
      logger.error('PIX generation failed', err);
      return { 
        success: false, 
        error: 'Erro ao gerar QR Code PIX',
        code: '[REDACTED_TOKEN]'
      };
    }
  }

  /**
   * Verificar se PIX foi pago
   * Em produção, usar API do banco (Banco do Brasil, Bradesco, etc)
   */
  static async verifyPayment(pixTransactionId) {
    try {
      const pix = await db.get(
        'SELECT * FROM pix_transactions WHERE id = ?',
        pixTransactionId
      );

      if (!pix) {
        return { success: false, error: 'Transação PIX não encontrada' };
      }

      if (pix.status === 'paid') {
        return { success: true, status: 'paid', amount: pix.amount };
      }

      // Se houver uma API bancária configurada, tentar verificar o status
      const bankApiUrl = process.env.PIX_BANK_API_URL; // ex: https://bank.example.com/api
      if (bankApiUrl) {
        try {
          const fetchFn = global.fetch || (async (...args) => { const nf = require('node-fetch'); return nf(...args); });
          // Endpoint esperado: GET {PIX_BANK_API_URL}/payments/:pixTransactionId
          const res = await fetchFn(`${bankApiUrl.replace(/\/$/, '')}/payments/${encodeURIComponent(pixTransactionId)}`);
          if (res.ok) {
            const body = await res.json();
            // body esperado: { status: 'paid'|'pending'|'failed', bankTransactionId?: string, amount?: number }
            if (body.status === 'paid') {
              // Atualizar DB local
              await db.run(
                "UPDATE pix_transactions SET status = 'paid', bank_transaction_id = ? WHERE id = ?",
                body.bankTransactionId || null,
                pixTransactionId
              );
              if (pix.order_id) {
                await db.run(
                  "UPDATE bookings SET status = 'confirmed', paid = 1 WHERE id = ?",
                  pix.order_id
                );
              }
              return { success: true, status: 'paid', amount: body.amount || pix.amount };
            }
            // Se não estiver pago, retornar status atual vindo do banco
            return { success: true, status: body.status || pix.status, amount: body.amount || pix.amount, expiresAt: pix.expires_at };
          } else {
            logger.warn('Bank API returned non-ok status for PIX verification', { pixTransactionId, status: res.status });
          }
        } catch (err) {
          logger.error('Error contacting bank API for PIX verification', err);
        }
      }

      // Fallback: usar webhook quando chegar pagamento ou estado local
      return { 
        success: true, 
        status: pix.status, 
        amount: pix.amount,
        expiresAt: pix.expires_at
      };
    } catch (err) {
      logger.error('PIX verification failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Confirmar pagamento PIX (via webhook do banco)
   */
  static async confirmPayment(pixTransactionId, bankTransactionId) {
    try {
      const pix = await db.get(
        'SELECT * FROM pix_transactions WHERE id = ?',
        pixTransactionId
      );

      if (!pix) {
        return { success: false, error: 'PIX não encontrado' };
      }

      // Atualizar status
      await db.run(
        'UPDATE pix_transactions SET status = \'paid\', bank_transaction_id = ? WHERE id = ?',
        bankTransactionId, pixTransactionId
      );

      // Atualizar booking relacionado
      if (pix.order_id) {
        await db.run(
          'UPDATE bookings SET status = \'confirmed\', paid = 1 WHERE id = ?',
          pix.order_id
        );
      }

      logger.info('PIX payment confirmed', { pixTransactionId, bankTransactionId });

      return { success: true, message: 'Pagamento PIX confirmado' };
    } catch (err) {
      logger.error('PIX confirmation failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Gerar BRCode completo seguindo padrão ABNT brasileiro
   * Implementação completa sem dependências externas
   */
  static generateBRCode(data) {
    const { pixKey, amount, merchantName, merchantCity, description, orderId } = data;
    
    // ID do Payload Format Indicator
    let payload = '000201';
    
    // Merchant Account Information
    const merchantAccount = this.[REDACTED_TOKEN](pixKey);
    payload += '26' + String(merchantAccount.length).padStart(2, '0') + merchantAccount;
    
    // Merchant Category Code (limpeza doméstica = 7230)
    payload += '52047230';
    
    // Transaction Currency (986 = BRL)
    payload += '5303986';
    
    // Transaction Amount
    if (amount > 0) {
      const amountStr = amount.toFixed(2);
      payload += '54' + String(amountStr.length).padStart(2, '0') + amountStr;
    }
    
    // Country Code
    payload += '5802BR';
    
    // Merchant Name
    const name = merchantName.substring(0, 25).toUpperCase();
    payload += '59' + String(name.length).padStart(2, '0') + name;
    
    // Merchant City
    const city = merchantCity.substring(0, 15).toUpperCase();
    payload += '60' + String(city.length).padStart(2, '0') + city;
    
    // Additional Data Field
    const additionalData = this.[REDACTED_TOKEN](description, orderId);
    payload += '62' + String(additionalData.length).padStart(2, '0') + additionalData;
    
    // CRC16
    const crc = this.calculateCRC16(payload + '6304');
    payload += '6304' + crc;
    
    return payload;
  }

  /**
   * Construir Merchant Account Information (ID 26)
   */
  static [REDACTED_TOKEN](pixKey) {
    // GUI
    let mai = '0014br.gov.bcb.pix';
    
    // Chave PIX
    mai += '01' + String(pixKey.length).padStart(2, '0') + pixKey;
    
    return mai;
  }

  /**
   * Construir Additional Data Field (ID 62)
   */
  static [REDACTED_TOKEN](description, orderId) {
    let adf = '';
    
    // Reference Label (ID do pedido)
    if (orderId) {
      adf += '05' + String(orderId.length).padStart(2, '0') + orderId;
    }
    
    // Additional Data (descrição)
    if (description) {
      adf += '99' + String(description.length).padStart(2, '0') + description;
    }
    
    return adf;
  }

  /**
   * Calcular CRC16-CCITT (padrão brasileiro para PIX)
   * Polinômio: 0x1021, inicialização: 0xFFFF
   */
  static calculateCRC16(data) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    
    for (let i = 0; i < data.length; i++) {
      const byte = data.charCodeAt(i);
      crc ^= (byte << 8);
      
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF; // Manter 16 bits
      }
    }
    
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}

module.exports = PixService;

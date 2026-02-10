const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.whatsappFrom = process.env.[REDACTED_TOKEN];

    this.initializeClient();
  }

  initializeClient() {
    const logger = require('../utils/logger');
    if (!this.accountSid || !this.authToken) {
      logger.warn('Twilio not configured: missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');\n      return;
    }

    try {
      this.client = twilio(this.accountSid, this.authToken);
      logger.info('Twilio initialized successfully');
    } catch (error) {
      logger.error('Error initializing Twilio', error.message);
      this.client = null;
    }
  }

  async sendSMS(phoneNumber, message) {
    if (!this.client || !this.phoneNumber) {
      console.warn('⚠️  SMS desabilitado: Twilio não configurado ou número ausente');
      return { success: false, message: 'Twilio não configurado' };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: phoneNumber
      });

      console.log('✅ SMS enviado:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ Erro ao enviar SMS:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsApp(phoneNumber, message) {
    if (!this.client || !this.whatsappFrom) {
      console.warn('⚠️  WhatsApp desabilitado: Twilio não configurado ou WhatsApp não ativado');
      return { success: false, message: 'WhatsApp não configurado' };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.whatsappFrom,
        to: `whatsapp:${phoneNumber}`
      });

      console.log('✅ WhatsApp enviado:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error.message);
      return { success: false, error: error.message };
    }
  }

  async [REDACTED_TOKEN](phoneNumber, bookingDetails, channel = 'sms') {
    const { bookingId, serviceName, date, time, address, finalPrice } = bookingDetails;

    const message = `
✨ Leidy Cleaner - Confirmação de Agendamento

Olá! Seu agendamento foi confirmado.

📅 Data: ${date}
🕐 Horário: ${time}
📍 Local: ${address}
💰 Valor: R$ ${(finalPrice || 0).toFixed(2)}

Acompanhe em: ${process.env.APP_URL || 'https://app.example.com'}
    `.trim();

    if (channel === 'whatsapp') {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  async [REDACTED_TOKEN](phoneNumber, paymentDetails, channel = 'sms') {
    const { bookingId, amount, method, transactionId } = paymentDetails;

    const message = `
✅ Leidy Cleaner - Pagamento Confirmado

Seu pagamento foi processado com sucesso!

Agendamento: #${bookingId}
Valor: R$ ${(amount || 0).toFixed(2)}
Método: ${method}
Transação: ${transactionId || 'N/A'}

Obrigado!
    `.trim();

    if (channel === 'whatsapp') {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  async sendReminder(phoneNumber, bookingDetails, channel = 'sms') {
    const { serviceName, date, time, address } = bookingDetails;

    const message = `
⏰ Leidy Cleaner - Lembrete de Agendamento

Seu agendamento ${serviceName} será em:

📅 ${date}
🕐 ${time}
📍 ${address}

Estamos preparados para atender você!
    `.trim();

    if (channel === 'whatsapp') {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  async [REDACTED_TOKEN](phoneNumber, oldBooking, newBooking, channel = 'sms') {
    const message = `
🔄 Leidy Cleaner - Agendamento Reagendado

Seu agendamento foi alterado com sucesso!

❌ Data/Horário antigo: ${oldBooking.date} às ${oldBooking.time}
✅ Nova data/horário: ${newBooking.date} às ${newBooking.time}

Local: ${newBooking.address}

Confirme em: ${process.env.APP_URL || 'https://app.example.com'}
    `.trim();

    if (channel === 'whatsapp') {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  async sendAlert(phoneNumber, alertMessage) {
    const message = `⚠️  [ALERTA] ${alertMessage}`;
    return this.sendSMS(phoneNumber, message);
  }
}

module.exports = new TwilioService();

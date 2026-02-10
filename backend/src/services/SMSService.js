/**
 * SMS Service - Twilio
 * Envia SMS de lembrança, confirmação, etc
 */

const twilio = require('twilio');

class SMSService {
  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Enviar SMS de confirmação
   */
  async [REDACTED_TOKEN](phone, clientName, bookingData) {
    try {
      const message = await this.client.messages.create({
        body: `✅ ${clientName}, seu agendamento foi confirmado! 📅 ${new Date(bookingData.date).toLocaleDateString('pt-BR')} às ${bookingData.time}. Local: ${bookingData.address.substring(0, 30)}... Valor: R$ ${parseFloat(bookingData.finalPrice).toFixed(2)}`,
        from: this.twilioNumber,
        to: phone
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS de confirmação:', error);
      return false;
    }
  }

  /**
   * Enviar SMS de lembrança (1 hora antes)
   */
  async [REDACTED_TOKEN](phone, clientName, time, address) {
    try {
      const message = await this.client.messages.create({
        body: `⏰ ${clientName}, lembrança! Seu agendamento é em 1 HORA (${time}). Local: ${address.substring(0, 40)}... Se não puder comparecer, avise logo!`,
        from: this.twilioNumber,
        to: phone
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS de lembrança:', error);
      return false;
    }
  }

  /**
   * Enviar SMS para funcionária (novo agendamento)
   */
  async [REDACTED_TOKEN](phone, clientName, date, time, address, duration) {
    try {
      const message = await this.client.messages.create({
        body: `📌 Novo agendamento! Cliente: ${clientName}, Data: ${new Date(date).toLocaleDateString('pt-BR')}, Hora: ${time}, Duração: ${duration}h, Local: ${address.substring(0, 30)}...`,
        from: this.twilioNumber,
        to: phone
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS para funcionária:', error);
      return false;
    }
  }

  /**
   * Enviar SMS de bônus desbloqueado
   */
  async [REDACTED_TOKEN](phone, clientName, bonusAmount) {
    try {
      const message = await this.client.messages.create({
        body: `🎉 ${clientName}, parabéns! Você desbloqueou R$ ${bonusAmount.toFixed(2)} de bônus! Use no próximo agendamento. 🎁`,
        from: this.twilioNumber,
        to: phone
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS de bônus:', error);
      return false;
    }
  }

  /**
   * Enviar SMS genérico
   */
  async sendMessage(phone, message) {
    try {
      await this.client.messages.create({
        body: message,
        from: this.twilioNumber,
        to: phone
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar SMS:', error);
      return false;
    }
  }
}

module.exports = new SMSService();

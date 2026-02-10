/**
 * WhatsApp Service
 * Integração com WhatsApp Business API
 */

class WhatsAppService {
  /**
   * Enviar mensagem WhatsApp
   * ✅ CORRIGIDO: Integração real com Twilio
   */
  async sendMessage(phoneNumber, message) {
    try {
      // ✅ CORRIGIDO: Ativar integração Twilio se credenciais existirem
      if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
        const twilio = require('twilio')(
          process.env.TWILIO_SID,
          process.env.TWILIO_TOKEN
        );
        
        const result = await twilio.messages.create({
          body: message,
          from: `whatsapp:${process.env.[REDACTED_TOKEN]}`,
          to: `whatsapp:${phoneNumber}`
        });
        
        logger?.info(`WhatsApp message sent to ${phoneNumber}`);
        return { success: true, messageId: result.sid };
      } else {
        // Modo mock se não tiver credenciais
        logger?.warn('Twilio not configured');
        logger?.debug(`[MOCK] WhatsApp sent to ${phoneNumber}`);
        return { success: true, mock: true };
      }
    } catch (error) {
      logger?.error('WhatsApp send error:', error);
      throw new Error('Falha ao enviar mensagem WhatsApp');
    }
  }

  /**
   * Enviar confirmação de agendamento
   */
  async [REDACTED_TOKEN](booking, user) {
    const message = `
Olá ${user.name}! 🎉

Seu agendamento foi confirmado!

📅 Data: ${booking.date}
📍 Local: ${booking.address}
🧹 Serviço: ${booking.services.map(s => s.name).join(', ')}

Código: ${booking.id}

Obrigado por escolher LimpezaPro!
    `;
    
    return this.sendMessage(user.phone, message);
  }

  /**
   * Enviar lembrete
   */
  async sendReminder(booking, user) {
    const message = `
Olá ${user.name}! 👋

Não se esqueça! Seu agendamento é amanhã.

📅 Hora: ${booking.date}
📍 Local: ${booking.address}

Nos vemos amanhã! ✨
    `;
    
    return this.sendMessage(user.phone, message);
  }
}

module.exports = new WhatsAppService();

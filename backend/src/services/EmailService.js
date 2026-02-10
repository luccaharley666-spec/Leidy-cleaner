/**
 * Email Service - Nodemailer
 * Envia emails de confirmação, lembrança, etc
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurar transporter Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'seu_email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua_senha_app'
      }
    });
  }

  /**
   * Enviar confirmação de agendamento
   */
  async [REDACTED_TOKEN](clientEmail, clientName, bookingData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '✅ Agendamento Confirmado - Leidy Cleaner',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                .detail { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #667eea; }
                .price { font-size: 24px; font-weight: bold; color: #667eea; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✨ Leidy Cleaner</h1>
                  <p>Seu agendamento foi confirmado!</p>
                </div>
                <div class="content">
                  <p>Olá <strong>${clientName}</strong>,</p>
                  
                  <p>Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:</p>
                  
                  <div class="detail">
                    <strong>📅 Data:</strong> ${new Date(bookingData.date).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div class="detail">
                    <strong>🕐 Horário:</strong> ${bookingData.time}
                  </div>
                  
                  <div class="detail">
                    <strong>📍 Local:</strong> ${bookingData.address}
                  </div>
                  
                  <div class="detail">
                    <strong>⏱️ Duração:</strong> ${bookingData.durationHours} hora(s)
                  </div>
                  
                  <div class="detail">
                    <strong>💰 Valor:</strong> <span class="price">R$ ${parseFloat(bookingData.finalPrice).toFixed(2)}</span>
                  </div>
                  
                  <p style="margin-top: 20px;">
                    Uma funcionária chegará no horário combinado. Se tiver dúvidas, entre em contato conosco.
                  </p>
                  
                  <a href="${process.env.APP_URL || 'http://localhost:3001'}" class="button">Acompanhe seu Agendamento</a>
                  
                  <div class="footer">
                    <p>Leidy Cleaner © 2025 - Todos os direitos reservados</p>
                    <p>Não reply para este email</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Enviar lembrança de agendamento
   */
  async sendBookingReminder(clientEmail, clientName, bookingData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '⏰ Lembrança: Seu Agendamento com Leidy Cleaner',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; }
                .details { background: #f0f0f0; padding: 15px; margin-top: 15px; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>⏰ Lembrança de Agendamento</h2>
                
                <div class="alert">
                  <strong>Atenção!</strong> Seu agendamento com a Leidy Cleaner está marcado para hoje!
                </div>
                
                <div class="details">
                  <p><strong>Horário:</strong> ${bookingData.time}</p>
                  <p><strong>Local:</strong> ${bookingData.address}</p>
                  <p><strong>Telefone para contato:</strong> ${bookingData.phone}</p>
                </div>
                
                <p style="margin-top: 20px;">
                  Tenha certeza de estar no local no horário combinado. A funcionária chegará em breve!
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                  Se você não conseguir estar presente, cancele o agendamento com antecedência.
                </p>
              </div>
            </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar lembrança:', error);
      return false;
    }
  }

  /**
   * Enviar avaliação após serviço
   */
  async sendRatingRequest(clientEmail, clientName, bookingData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '⭐ Como foi o seu serviço? Deixe uma Avaliação!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .stars { font-size: 36px; text-align: center; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>⭐ Como foi o nosso serviço?</h2>
                
                <p>Olá ${clientName},</p>
                
                <p>O agendamento de hoje foi concluído! Adoraríamos saber sua opinião sobre o trabalho realizado.</p>
                
                <p style="text-align: center;">
                  <a href="${process.env.APP_URL || 'http://localhost:3001'}/rating/${bookingData.bookingId}" class="button">
                    ⭐ Deixe sua Avaliação
                  </a>
                </p>
                
                <p style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <strong>🎁 Dica:</strong> Cada avaliação 5⭐ o aproxima do seu bônus de R$ 100!
                </p>
              </div>
            </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de avaliação:', error);
      return false;
    }
  }

  /**
   * Enviar notificação de bônus desbloqueado
   */
  async sendBonusUnlocked(clientEmail, clientName, bonusAmount) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '🎉 Parabéns! Você Desbloqueou um Bônus!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .bonus-box { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 30px; border-radius: 10px; text-align: center; color: #333; }
                .bonus-amount { font-size: 48px; font-weight: bold; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2 style="text-align: center;">🎉 Parabéns, ${clientName}!</h2>
                
                <div class="bonus-box">
                  <p>Você completou 10 avaliações 5⭐ seguidas!</p>
                  <div class="bonus-amount">R$ ${bonusAmount.toFixed(2)}</div>
                  <p>Este desconto será aplicado automaticamente no seu próximo agendamento!</p>
                </div>
                
                <p style="margin-top: 30px; text-align: center;">
                  <a href="${process.env.APP_URL || 'http://localhost:3001'}" class="button">
                    Novo Agendamento com Desconto
                  </a>
                </p>
              </div>
            </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de bônus:', error);
      return false;
    }
  }

  /**
   * Enviar email de boas-vindas para newsletter
   */
  async [REDACTED_TOKEN](email, name = 'Leitor') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: email,
        subject: '✨ Bem-vindo à Newsletter - Leidy Cleaner',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; line-height: 1.6; }
                .cta { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🧹 Leidy Cleaner</h1>
                  <p>Bem-vindo à nossa Newsletter!</p>
                </div>
                <div class="content">
                  <p>Olá <strong>${name}</strong>,</p>
                  
                  <p>Obrigado por se inscrever na Newsletter da Leidy Cleaner!</p>
                  
                  <p>A partir de agora você receberá:</p>
                  <ul>
                    <li>✨ Dicas de limpeza e organização</li>
                    <li>📢 Promoções exclusivas para inscritos</li>
                    <li>🆕 Novos serviços e funcionalidades</li>
                    <li>💡 Conselhos profissionais</li>
                  </ul>
                  
                  <p>Fique atento para as próximas novidades!</p>
                  
                  <p style="margin-top: 30px;">
                    Qualquer dúvida, <a href="mailto:${process.env.EMAIL_USER || 'contato@leidycleaner.com'}">entre em contato</a> conosco.
                  </p>
                </div>
                <div class="footer">
                  <p>Você está recebendo este email porque se inscreveu na newsletter.</p>
                  <p>Pode <a href="https://seu-dominio.com/newsletter/unsubscribe?email=${email}">desinscrever-se</a> a qualquer momento.</p>
                  <p>&copy; 2024 Leidy Cleaner. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      throw error;
    }
  }

  /**
   * Enviar email em massa para newsletter
   */
  async sendBulkNewsletter(email, name, subject, htmlContent, textContent) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: email,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; line-height: 1.6; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🧹 Leidy Cleaner</h2>
                </div>
                <div class="content">
                  ${htmlContent}
                </div>
                <div class="footer">
                  <p>Pode <a href="https://seu-dominio.com/newsletter/unsubscribe?email=${email}">desinscrever-se</a> a qualquer momento.</p>
                  <p>&copy; 2024 Leidy Cleaner. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: textContent
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar newsletter para ${email}:`, error);
      throw error;
    }
  }

  /**
   * Enviar confirmação de pagamento
   */
  async [REDACTED_TOKEN](clientEmail, clientName, paymentData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '💳 Pagamento Confirmado - Leidy Cleaner',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
                .detail { margin: 10px 0; padding: 10px; background: #f0f0f0; border-left: 4px solid #667eea; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Pagamento Confirmado</h1>
                </div>
                <div class="success">
                  <strong>✓ Seu pagamento foi processado com sucesso!</strong>
                </div>
                <div style="background: white; padding: 20px;">
                  <p>Olá ${clientName},</p>
                  
                  <h3>Detalhes do Pagamento:</h3>
                  <div class="detail">
                    <strong>ID da Transação:</strong> ${paymentData.transactionId || 'N/A'}
                  </div>
                  <div class="detail">
                    <strong>Método:</strong> ${paymentData.method || 'Cartão de Crédito'}
                  </div>
                  <div class="detail">
                    <strong>Valor:</strong> R$ ${parseFloat(paymentData.amount).toFixed(2)}
                  </div>
                  <div class="detail">
                    <strong>Data:</strong> ${new Date(paymentData.date).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <p style="margin-top: 20px; color: #666;">
                    Você receberá em breve uma confirmação do seu agendamento.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar confirmação de pagamento:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de reembolso
   */
  async [REDACTED_TOKEN](clientEmail, clientName, refundData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '💰 Reembolso Processado - Leidy Cleaner',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .refund-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💰 Reembolso Processado</h1>
                </div>
                <div class="refund-box">
                  <p><strong>Seu reembolso foi processado com sucesso!</strong></p>
                  <p style="font-size: 20px; margin: 10px 0;">R$ ${parseFloat(refundData.amount).toFixed(2)}</p>
                  <p>O valor será creditado em sua conta em até 5-7 dias úteis.</p>
                </div>
                <div style="background: white; padding: 20px;">
                  <p>Olá ${clientName},</p>
                  
                  <p><strong>Motivo do Reembolso:</strong> ${refundData.reason || 'Não especificado'}</p>
                  <p><strong>Data do Reembolso:</strong> ${new Date(refundData.date).toLocaleDateString('pt-BR')}</p>
                  <p><strong>ID da Transação:</strong> ${refundData.refundId || 'N/A'}</p>
                  
                  <p style="margin-top: 20px;">
                    Se tiver dúvidas ou se o reembolso não aparecer em sua conta, <a href="mailto:suporte@leidycleaner.com">entre em contato conosco</a>.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de reembolso:', error);
      throw error;
    }
  }

  /**
   * Enviar solicitação de avaliação (alias para sendRatingRequest)
   */
  async sendReviewRequest(clientEmail, clientName, reviewData) {
    return this.sendRatingRequest(clientEmail, clientName, reviewData);
  }

  /**
   * Enviar email genérico
   */
  async sendGenericEmail(to, subject, htmlContent) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                ${htmlContent}
              </div>
            </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao enviar email para ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailService();

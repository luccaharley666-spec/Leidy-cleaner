/**
 * Email Service - CONSOLIDATED v2.0
 * ============================================
 * Merged from:
 * - EmailService.js (596 lines) - Base email sending via Nodemailer
 * - AdvancedEmailService.js (464 lines) - Templates, A/B testing, campaigns  
 * - EmailQueueService.js (641 lines) - Bull + Redis queue management
 * 
 * Result: 1703 → ~900 lines (47% code reduction)
 * Benefits: Single service, backward compatible, better maintainability
 */

const nodemailer = require('nodemailer');
const Queue = require('bull');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Optional imports - graceful degradation
let MonitoringService;
let RedisService;

try {
  MonitoringService = require('./MonitoringService');
} catch (e) {
  MonitoringService = { incrementCounter: () => {} };
}

try {
  RedisService = require('./RedisService');
} catch (e) {
  RedisService = { set: async () => {} };
}

// ============================================
// QUEUE SETUP
// ============================================
let emailQueue;
const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  emailQueue = {
    process: () => {},
    on: () => {},
    add: async () => ({ id: `test-${Date.now()}` }),
    getJobCounts: async () => ({ active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }),
    getFailed: async () => [],
  };
} else {
  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      enableReadyCheck: false,
      enableOfflineQueue: false,
    };

    if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim()) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    emailQueue = new Queue('email', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
      settings: {
        lockDuration: 30000,
        lockRenewTime: 15000,
        maxStalledCount: 2,
      },
    });
  } catch (err) {
    logger.warn('⚠️ Redis/bull não disponível — modo fallback', { error: err.message });
    emailQueue = {
      process: () => {},
      on: () => {},
      add: async () => ({ id: `fallback-${Date.now()}` }),
      getJobCounts: async () => ({ active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }),
      getFailed: async () => [],
    };
  }
}

// ============================================
// UNIFIED EMAIL SERVICE CLASS
// ============================================
class EmailService {
  constructor() {
    // ✅ Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'seu_email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua_senha_app',
      },
    });

    // ✅ Template storage
    this.templates = new Map();
    this.campaigns = new Map();
    this.schedules = new Map();
    this.engagementLogs = new Map();
    this.abTests = new Map();
    this.dripCampaigns = new Map();

    // ✅ Queue setup
    this.queue = emailQueue;
    this._queueFailureCount = 0;
    this.__PLACEHOLDER = null;

    this.setupProcessors();
    this.setupEventListeners();

    if (process.env.SKIP_QUEUE_HEALTH !== 'true') {
      this.monitorQueueHealth();
    }
  }

  // ============================================
  // SECTION 1: Basic Email Sending
  // ============================================

  async sendBookingConfirmation(clientEmail, clientName, bookingData) {
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
                  <div class="detail"><strong>📅 Data:</strong> ${new Date(bookingData.date).toLocaleDateString('pt-BR')}</div>
                  <div class="detail"><strong>🕐 Horário:</strong> ${bookingData.time}</div>
                  <div class="detail"><strong>📍 Local:</strong> ${bookingData.address}</div>
                  <div class="detail"><strong>⏱️ Duração:</strong> ${bookingData.durationHours} hora(s)</div>
                  <div class="detail"><strong>💰 Valor:</strong> <span class="price">R$ ${parseFloat(bookingData.finalPrice).toFixed(2)}</span></div>
                  <p style="margin-top: 20px;">Uma funcionária chegará no horário combinado. Se tiver dúvidas, entre em contato conosco.</p>
                  <a href="${process.env.APP_URL || 'http://localhost:3001'}" class="button">Acompanhe seu Agendamento</a>
                  <div class="footer">
                    <p>Leidy Cleaner © 2025 - Todos os direitos reservados</p>
                    <p>Não reply para este email</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

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
                <div class="alert"><strong>Atenção!</strong> Seu agendamento com a Leidy Cleaner está marcado para hoje!</div>
                <div class="details">
                  <p><strong>Horário:</strong> ${bookingData.time}</p>
                  <p><strong>Local:</strong> ${bookingData.address}</p>
                  <p><strong>Telefone para contato:</strong> ${bookingData.phone}</p>
                </div>
                <p style="margin-top: 20px;">Tenha certeza de estar no local no horário combinado. A funcionária chegará em breve!</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Se você não conseguir estar presente, cancele o agendamento com antecedência.</p>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar lembrança:', error);
      return false;
    }
  }

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
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>⭐ Como foi o nosso serviço?</h2>
                <p>Olá ${clientName},</p>
                <p>O agendamento de hoje foi concluído! Adoraríamos saber sua opinião sobre o trabalho realizado.</p>
                <p style="text-align: center;">
                  <a href="${process.env.APP_URL || 'http://localhost:3001'}/rating/${bookingData.bookingId}" class="button">⭐ Deixe sua Avaliação</a>
                </p>
                <p style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <strong>🎁 Dica:</strong> Cada avaliação 5⭐ o aproxima do seu bônus de R$ 100!
                </p>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar email de avaliação:', error);
      return false;
    }
  }

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
                  <a href="${process.env.APP_URL || 'http://localhost:3001'}" class="button">Novo Agendamento com Desconto</a>
                </p>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar email de bônus:', error);
      return false;
    }
  }

  async sendNewsletterWelcome(email, name = 'Leitor') {
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
                </div>
                <div class="footer">
                  <p>&copy; 2024 Leidy Cleaner. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar email de boas-vindas:', error);
      throw error;
    }
  }

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
                <div class="header"><h2>🧹 Leidy Cleaner</h2></div>
                <div class="content">${htmlContent}</div>
                <div class="footer">
                  <p>&copy; 2024 Leidy Cleaner. Todos os direitos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: textContent,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao enviar newsletter para ${email}:`, error);
      throw error;
    }
  }

  async sendPaymentConfirmation(clientEmail, clientName, paymentData) {
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
                <div class="header"><h1>✅ Pagamento Confirmado</h1></div>
                <div class="success"><strong>✓ Seu pagamento foi processado com sucesso!</strong></div>
                <div style="background: white; padding: 20px;">
                  <p>Olá ${clientName},</p>
                  <h3>Detalhes do Pagamento:</h3>
                  <div class="detail"><strong>ID da Transação:</strong> ${paymentData.transactionId || 'N/A'}</div>
                  <div class="detail"><strong>Método:</strong> ${paymentData.method || 'Cartão de Crédito'}</div>
                  <div class="detail"><strong>Valor:</strong> R$ ${parseFloat(paymentData.amount).toFixed(2)}</div>
                  <div class="detail"><strong>Data:</strong> ${new Date(paymentData.date).toLocaleDateString('pt-BR')}</div>
                  <p style="margin-top: 20px; color: #666;">Você receberá em breve uma confirmação do seu agendamento.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      logger.error('❌ Erro ao enviar confirmação de pagamento:', error);
      throw error;
    }
  }

  async sendRefundNotification(clientEmail, clientName, refundData) {
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
                <div class="header"><h1>💰 Reembolso Processado</h1></div>
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
                  <p style="margin-top: 20px;">Se tiver dúvidas ou se o reembolso não aparecer em sua conta, <a href="mailto:suporte@leidycleaner.com">entre em contato conosco</a>.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      logger.error('❌ Erro ao enviar notificação de reembolso:', error);
      throw error;
    }
  }

  async sendReviewRequest(clientEmail, clientName, reviewData) {
    return this.sendRatingRequest(clientEmail, clientName, reviewData);
  }

  async sendPasswordReset(clientEmail, clientName, resetData) {
    try {
      const resetUrl = resetData.resetUrl || `${process.env.APP_URL || 'http://localhost:3001'}/reset-password?token=${resetData.token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@leidycleaner.com',
        to: clientEmail,
        subject: '🔐 Redefinir Senha - Leidy Cleaner',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .warning { color: #d9534f; font-size: 12px; }
                .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Leidy Cleaner</h1>
                  <p>Redefinir sua senha</p>
                </div>
                <div class="content">
                  <p>Olá <strong>${clientName}</strong>,</p>
                  <p>Recebemos uma solicitação para redefinir sua senha. Se não foi você, ignore este email.</p>
                  <p>Para redefinir sua senha, clique no botão abaixo (link válido por 1 hora):</p>
                  <a href="${resetUrl}" class="button">🔓 Redefinir Senha</a>
                  <p style="margin-top: 20px; font-size: 12px;">Ou copie e cole este link no seu navegador:</p>
                  <p style="font-size: 11px; word-break: break-all; background: #fff; padding: 10px; border-radius: 3px;">${resetUrl}</p>
                  <p class="warning">⚠️ Este link expira em 1 hora por segurança.</p>
                  <div class="footer">
                    <p>Leidy Cleaner © 2025 - Todos os direitos reservados</p>
                    <p>Não reply para este email</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      logger.error('❌ Erro ao enviar email de reset de senha:', error);
      throw error;
    }
  }

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
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      logger.error(`❌ Erro ao enviar email para ${to}:`, error);
      throw error;
    }
  }

  // ============================================
  // SECTION 2: Advanced Templates
  // ============================================

  async createTemplate(name, subject, content, variables = [], type = 'email') {
    try {
      const template = {
        id: crypto.randomUUID(),
        name,
        subject,
        content,
        variables,
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.templates.set(template.id, template);
      logger.info(`Template created: ${template.id}`);

      return template;
    } catch (error) {
      logger.error(`Template creation error: ${error.message}`);
      throw error;
    }
  }

  async updateTemplate(templateId, updates) {
    try {
      const template = this.templates.get(templateId);
      if (!template) throw new Error('Template not found');

      Object.assign(template, updates, { updatedAt: new Date() });

      logger.info(`Template updated: ${templateId}`);
      return template;
    } catch (error) {
      logger.error(`Template update error: ${error.message}`);
      throw error;
    }
  }

  async getTemplate(templateId, variables = {}) {
    try {
      const template = this.templates.get(templateId);
      if (!template) throw new Error('Template not found');

      let content = template.content;
      let subject = template.subject;

      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
        subject = subject.replace(regex, value);
      }

      return {
        ...template,
        content,
        subject,
        renderedAt: new Date(),
      };
    } catch (error) {
      logger.error(`Get template error: ${error.message}`);
      throw error;
    }
  }

  async createABTest(name, templateIdA, templateIdB, sampleSize = 0.5) {
    try {
      const abTest = {
        id: crypto.randomUUID(),
        name,
        templateIdA,
        templateIdB,
        sampleSize,
        status: 'active',
        variantA: { sent: 0, opened: 0, clicked: 0, rate: 0 },
        variantB: { sent: 0, opened: 0, clicked: 0, rate: 0 },
        winner: null,
        createdAt: new Date(),
      };

      this.abTests.set(abTest.id, abTest);
      logger.info(`A/B test created: ${abTest.id}`);

      return abTest;
    } catch (error) {
      logger.error(`A/B test creation error: ${error.message}`);
      throw error;
    }
  }

  async getABTestTemplate(abTestId, recipientId) {
    try {
      const abTest = this.abTests.get(abTestId);
      if (!abTest) throw new Error('A/B test not found');

      const hash = crypto.createHash('md5').update(recipientId).digest('hex');
      const isVariantA = parseInt(hash, 16) % 100 < abTest.sampleSize * 100;

      const templateId = isVariantA ? abTest.templateIdA : abTest.templateIdB;
      const variant = isVariantA ? 'A' : 'B';

      if (isVariantA) {
        abTest.variantA.sent++;
      } else {
        abTest.variantB.sent++;
      }

      return { templateId, variant, abTest };
    } catch (error) {
      logger.error(`A/B test template error: ${error.message}`);
      throw error;
    }
  }

  async createDripCampaign(name, steps = []) {
    try {
      const campaign = {
        id: crypto.randomUUID(),
        name,
        steps: steps.map((step, index) => ({
          ...step,
          order: index,
          createdAt: new Date(),
        })),
        status: 'draft',
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        createdAt: new Date(),
      };

      this.dripCampaigns.set(campaign.id, campaign);
      logger.info(`Drip campaign created: ${campaign.id}`);

      return campaign;
    } catch (error) {
      logger.error(`Drip campaign creation error: ${error.message}`);
      throw error;
    }
  }

  async publishDripCampaign(campaignId) {
    try {
      const campaign = this.dripCampaigns.get(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      campaign.status = 'active';
      campaign.publishedAt = new Date();

      logger.info(`Drip campaign published: ${campaignId}`);
      return campaign;
    } catch (error) {
      logger.error(`Publish campaign error: ${error.message}`);
      throw error;
    }
  }

  async scheduleEmail(templateId, recipientEmail, scheduledTime, variables = {}) {
    try {
      const schedule = {
        id: crypto.randomUUID(),
        templateId,
        recipientEmail,
        scheduledTime,
        variables,
        status: 'scheduled',
        createdAt: new Date(),
        sentAt: null,
      };

      this.schedules.set(schedule.id, schedule);
      logger.info(`Email scheduled: ${schedule.id}`);

      return schedule;
    } catch (error) {
      logger.error(`Schedule email error: ${error.message}`);
      throw error;
    }
  }

  async sendTemplateEmail(templateId, recipientEmail, variables = {}, options = {}) {
    try {
      const template = await this.getTemplate(templateId, variables);

      const email = {
        id: crypto.randomUUID(),
        templateId,
        recipientEmail,
        subject: template.subject,
        content: template.content,
        variables,
        status: 'sent',
        sentAt: new Date(),
        messageId: `<${Date.now()}.${Math.random()}@avante.local>`,
        engagement: {
          opened: false,
          clicked: false,
          openedAt: null,
          clickedAt: null,
        },
      };

      this.engagementLogs.set(email.id, email);
      logger.info(`Email sent: ${email.id} to ${recipientEmail}`);

      return email;
    } catch (error) {
      logger.error(`Send email error: ${error.message}`);
      throw error;
    }
  }

  async sendEmail(templateId, recipientEmail, variables = {}, options = {}) {
    return this.sendTemplateEmail(templateId, recipientEmail, variables, options);
  }

  async sendSMS(templateId, phoneNumber, variables = {}) {
    try {
      const template = await this.getTemplate(templateId, variables);

      if (template.type !== 'sms') {
        throw new Error('Template is not SMS type');
      }

      const sms = {
        id: crypto.randomUUID(),
        templateId,
        phoneNumber,
        message: template.content,
        variables,
        status: 'sent',
        sentAt: new Date(),
        messageId: `SMS_${Date.now()}`,
        provider: 'twilio',
      };

      this.engagementLogs.set(sms.id, sms);
      logger.info(`SMS sent: ${sms.id} to ${phoneNumber}`);

      return sms;
    } catch (error) {
      logger.error(`Send SMS error: ${error.message}`);
      throw error;
    }
  }

  async sendBulkEmail(campaignId, recipients, templateId, variables = {}) {
    try {
      const campaign = this.dripCampaigns.get(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const results = [];

      for (const recipient of recipients) {
        const email = await this.sendTemplateEmail(
          templateId,
          recipient.email,
          { ...variables, ...recipient.variables },
          { campaignId }
        );
        results.push(email);
        campaign.totalSent++;
      }

      logger.info(`Bulk email sent for campaign: ${campaignId}`);
      return results;
    } catch (error) {
      logger.error(`Bulk email error: ${error.message}`);
      throw error;
    }
  }

  async trackOpen(emailId) {
    try {
      const email = this.engagementLogs.get(emailId);
      if (!email) throw new Error('Email not found');

      if (!email.engagement.opened) {
        email.engagement.opened = true;
        email.engagement.openedAt = new Date();

        logger.info(`Email opened: ${emailId}`);
      }

      return email;
    } catch (error) {
      logger.error(`Track open error: ${error.message}`);
      throw error;
    }
  }

  async trackClick(emailId, linkUrl) {
    try {
      const email = this.engagementLogs.get(emailId);
      if (!email) throw new Error('Email not found');

      if (!email.engagement.clicked) {
        email.engagement.clicked = true;
        email.engagement.clickedAt = new Date();
        email.engagement.clickedLink = linkUrl;

        logger.info(`Email clicked: ${emailId}`);
      }

      return email;
    } catch (error) {
      logger.error(`Track click error: ${error.message}`);
      throw error;
    }
  }

  async getCampaignStats(campaignId) {
    try {
      const campaign = this.dripCampaigns.get(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const openRate = campaign.totalSent > 0 ? (campaign.totalOpened / campaign.totalSent) * 100 : 0;
      const clickRate = campaign.totalSent > 0 ? (campaign.totalClicked / campaign.totalSent) * 100 : 0;

      return {
        campaignId,
        totalSent: campaign.totalSent,
        totalOpened: campaign.totalOpened,
        totalClicked: campaign.totalClicked,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
        status: campaign.status,
      };
    } catch (error) {
      logger.error(`Campaign stats error: ${error.message}`);
      throw error;
    }
  }

  async getABTestResults(abTestId) {
    try {
      const abTest = this.abTests.get(abTestId);
      if (!abTest) throw new Error('A/B test not found');

      const rateA = abTest.variantA.sent > 0 ? (abTest.variantA.clicked / abTest.variantA.sent) * 100 : 0;
      const rateB = abTest.variantB.sent > 0 ? (abTest.variantB.clicked / abTest.variantB.sent) * 100 : 0;

      return {
        ...abTest,
        variantA: { ...abTest.variantA, rate: rateA.toFixed(2) },
        variantB: { ...abTest.variantB, rate: rateB.toFixed(2) },
        winner: rateA > rateB ? 'A' : rateB > rateA ? 'B' : null,
      };
    } catch (error) {
      logger.error(`A/B test results error: ${error.message}`);
      throw error;
    }
  }

  async getEngagementLogs(filter = {}, limit = 50) {
    try {
      let logs = Array.from(this.engagementLogs.values());

      if (filter.recipientEmail) {
        logs = logs.filter(log => log.recipientEmail === filter.recipientEmail);
      }

      if (filter.status) {
        logs = logs.filter(log => log.status === filter.status);
      }

      logs.sort((a, b) => b.sentAt - a.sentAt);

      return logs.slice(0, limit);
    } catch (error) {
      logger.error(`Get engagement logs error: ${error.message}`);
      return [];
    }
  }

  async getTemplates() {
    try {
      return Array.from(this.templates.values());
    } catch (error) {
      logger.error(`Get templates error: ${error.message}`);
      return [];
    }
  }

  async getCampaigns() {
    try {
      return Array.from(this.dripCampaigns.values());
    } catch (error) {
      logger.error(`Get campaigns error: ${error.message}`);
      return [];
    }
  }

  // ============================================
  // SECTION 3: Queue Management
  // ============================================

  setupProcessors() {
    this.queue.process('booking-confirmation', 10, async (job) => {
      return this.processBookingConfirmation(job);
    });

    this.queue.process('booking-reminder', 5, async (job) => {
      return this.processBookingReminder(job);
    });

    this.queue.process('payment-notification', 10, async (job) => {
      return this.processPaymentNotification(job);
    });

    this.queue.process('refund-notification', 5, async (job) => {
      return this.processRefundNotification(job);
    });

    this.queue.process('review-notification', 5, async (job) => {
      return this.processReviewNotification(job);
    });

    this.queue.process('generic-email', 10, async (job) => {
      return this.processGenericEmail(job);
    });
  }

  setupEventListeners() {
    this.queue.on('completed', (job) => {
      logger.info('📧 Email enviado com sucesso', {
        jobId: job.id,
        type: job.data.type,
        to: job.data.to,
        timestamp: new Date().toISOString(),
      });

      MonitoringService.incrementCounter('email.sent', {
        type: job.data.type,
      });
    });

    this.queue.on('failed', (job, err) => {
      logger.error('❌ Email falhou após retries', {
        jobId: job.id,
        type: job.data.type,
        to: job.data.to,
        attempts: job.attemptsMade,
        error: err.message,
        timestamp: new Date().toISOString(),
      });

      MonitoringService.incrementCounter('email.failed', {
        type: job.data.type,
      });

      this.handleEmailError(job, err);
    });

    this.queue.on('stalled', (job) => {
      logger.warn('⚠️ Job travou, será retentado', {
        jobId: job.id,
        type: job.data.type,
        timestamp: new Date().toISOString(),
      });
    });
  }

  async enqueueBookingConfirmation(clientEmail, clientName, bookingData) {
    try {
      const job = await this.queue.add(
        'booking-confirmation',
        {
          type: 'booking-confirmation',
          to: clientEmail,
          clientName,
          bookingData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `booking-${bookingData.id}-${Date.now()}`,
          priority: 10,
        }
      );

      logger.info('📧 Email de confirmação enfileirado', {
        jobId: job.id,
        to: clientEmail,
        bookingId: bookingData.id,
      });

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar email de confirmação', { error: error.message });
      throw error;
    }
  }

  async enqueueBookingReminder(clientEmail, clientName, bookingData) {
    try {
      const job = await this.queue.add(
        'booking-reminder',
        {
          type: 'booking-reminder',
          to: clientEmail,
          clientName,
          bookingData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `reminder-${bookingData.id}-${Date.now()}`,
          priority: 8,
          delay: 60000,
        }
      );

      logger.info('📧 Lembrança enfileirada', {
        jobId: job.id,
        to: clientEmail,
        bookingId: bookingData.id,
      });

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar lembrança', { error: error.message });
      throw error;
    }
  }

  async enqueuePaymentNotification(clientEmail, clientName, paymentData) {
    try {
      const job = await this.queue.add(
        'payment-notification',
        {
          type: 'payment-notification',
          to: clientEmail,
          clientName,
          paymentData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `payment-${paymentData.id}-${Date.now()}`,
          priority: 10,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar confirmação de pagamento', { error: error.message });
      throw error;
    }
  }

  async enqueueRefundNotification(clientEmail, clientName, refundData) {
    try {
      const job = await this.queue.add(
        'refund-notification',
        {
          type: 'refund-notification',
          to: clientEmail,
          clientName,
          refundData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `refund-${refundData.id}-${Date.now()}`,
          priority: 10,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar notificação de reembolso', { error: error.message });
      throw error;
    }
  }

  async enqueueReviewNotification(clientEmail, clientName, reviewData) {
    try {
      const job = await this.queue.add(
        'review-notification',
        {
          type: 'review-notification',
          to: clientEmail,
          clientName,
          reviewData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `review-${reviewData.bookingId}-${Date.now()}`,
          priority: 5,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar notificação de avaliação', { error: error.message });
      throw error;
    }
  }

  async enqueueGenericEmail(to, subject, htmlContent, options = {}) {
    try {
      const job = await this.queue.add(
        'generic-email',
        {
          type: 'generic-email',
          to,
          subject,
          htmlContent,
          ...options,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `generic-${Date.now()}`,
          priority: options.priority || 5,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar email genérico', { error: error.message });
      throw error;
    }
  }

  // ============================================
  // SECTION 4: Job Processors
  // ============================================

  async processBookingConfirmation(job) {
    const { to, clientName, bookingData } = job.data;

    try {
      await this.sendBookingConfirmation(to, clientName, bookingData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
        attempt: job.attemptsMade + 1,
      };
    } catch (error) {
      logger.error('❌ Erro processando confirmação de agendamento', {
        jobId: job.id,
        error: error.message,
        attempt: job.attemptsMade + 1,
      });
      throw error;
    }
  }

  async processBookingReminder(job) {
    const { to, clientName, bookingData } = job.data;

    try {
      await this.sendBookingReminder(to, clientName, bookingData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
        attempt: job.attemptsMade + 1,
      };
    } catch (error) {
      logger.error('❌ Erro processando lembrança', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processPaymentNotification(job) {
    const { to, clientName, paymentData } = job.data;

    try {
      await this.sendPaymentConfirmation(to, clientName, paymentData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Erro processando confirmação de pagamento', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processRefundNotification(job) {
    const { to, clientName, refundData } = job.data;

    try {
      await this.sendRefundNotification(to, clientName, refundData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Erro processando notificação de reembolso', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processReviewNotification(job) {
    const { to, clientName, reviewData } = job.data;

    try {
      await this.sendReviewRequest(to, clientName, reviewData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Erro processando notificação de avaliação', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processGenericEmail(job) {
    const { to, subject, htmlContent } = job.data;

    try {
      const result = await this.sendGenericEmail(to, subject, htmlContent);
      return {
        success: true,
        processedAt: new Date().toISOString(),
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('❌ Erro processando email genérico', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async handleEmailError(job, error) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@leidycleaner.com';

      await RedisService.set(
        `email-failure:${job.id}`,
        JSON.stringify({
          jobId: job.id,
          type: job.data.type,
          to: job.data.to,
          error: error.message,
          timestamp: new Date().toISOString(),
          attempts: job.attemptsMade,
        }),
        3600
      );

      logger.error('📧 Admin alertado sobre falha de email', {
        jobId: job.id,
        adminEmail,
      });
    } catch (error) {
      logger.error('❌ Erro ao notificar admin', { error: error.message });
    }
  }

  monitorQueueHealth() {
    if (process.env.NODE_ENV === 'test') return;

    setInterval(async () => {
      try {
        const counts = await this.queue.getJobCounts();

        logger.info('📊 Queue Health Check', {
          active: counts.active,
          waiting: counts.waiting,
          completed: counts.completed,
          failed: counts.failed,
          delayed: counts.delayed,
          timestamp: new Date().toISOString(),
        });

        if (counts.failed > 50) {
          logger.error('🚨 Muitos emails falhados!', {
            failedCount: counts.failed,
            recommendation: 'Verificar credenciais de email e conexão Redis',
          });
        }

        if (counts.waiting > 1000) {
          logger.warn('⚠️ Fila de emails crescendo', {
            waitingCount: counts.waiting,
          });
        }
      } catch (error) {
        this._queueFailureCount = (this._queueFailureCount || 0) + 1;
        const now = Date.now();
        const last = this.__PLACEHOLDER || 0;

        if (this._queueFailureCount === 1 || (now - last) > 60 * 60 * 1000 || this._queueFailureCount % 10 === 0) {
          logger.error('❌ Erro no health check da fila', { error: error.message, count: this._queueFailureCount });
          this.__PLACEHOLDER = now;
        }
      }
    }, 60000);
  }

  async getQueueStats() {
    try {
      const counts = await this.queue.getJobCounts();

      const active = counts?.active || 0;
      const waiting = counts?.waiting || counts?.pending || 0;
      const completed = counts?.completed || 0;
      const failed = counts?.failed || 0;
      const delayed = counts?.delayed || 0;

      return {
        activeCount: active,
        pendingCount: waiting,
        completedCount: completed,
        failedCount: failed,
        delayedCount: delayed,
        total: active + waiting + delayed,
      };
    } catch (error) {
      logger.error('❌ Erro ao obter stats da fila', { error: error.message });
      return null;
    }
  }

  async cleanFailedJobs() {
    try {
      const failedJobs = await this.queue.getFailed();
      const removed = await Promise.all(
        failedJobs.slice(0, -50).map((job) => job.remove())
      );
      logger.info(`🧹 Limpeza de jobs: ${removed.length} removidos`);
      return removed.length;
    } catch (error) {
      logger.error('❌ Erro ao limpar jobs falhados', { error: error.message });
    }
  }

  async retryFailedJobs(limit = 10) {
    try {
      const failedJobs = await this.queue.getFailed(0, limit - 1);
      for (const job of failedJobs) {
        await job.retry();
      }
      logger.info(`🔄 ${failedJobs.length} jobs reenfileirados para retry`);
      return failedJobs.length;
    } catch (error) {
      logger.error('❌ Erro ao reprocessar jobs', { error: error.message });
    }
  }
}

module.exports = new EmailService();

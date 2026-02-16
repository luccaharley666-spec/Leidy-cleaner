/**
 * Advanced Email & SMS Service
 * WYSIWYG templates, A/B testing, drip campaigns, scheduling
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

class AdvancedEmailService_Auto_164 {
  constructor() {
    this.templates = new Map();
    this.campaigns = new Map();
    this.schedules = new Map();
    this.engagementLogs = new Map();
    this.abTests = new Map();
    this.dripCampaigns = new Map();
  }

  /**
   * Create email template
   */
  async createTemplate(name, subject, content, variables = [], type = 'email') {
    try {
      const template = {
        id: crypto.randomUUID(),
        name,
        subject,
        content,
        variables,
        type, // email or sms
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.templates.set(template.id, template);
      logger.info(`Template created: ${template.id}`);

      return template;
    } catch (error) {
      logger.error(`Template creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update template
   */
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

  /**
   * Get template with variable interpolation
   */
  async getTemplate(templateId, variables = {}) {
    try {
      const template = this.templates.get(templateId);
      if (!template) throw new Error('Template not found');

      let content = template.content;
      let subject = template.subject;

      // Replace variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
        subject = subject.replace(regex, value);
      }

      return {
        ...template,
        content,
        subject,
        renderedAt: new Date()
      };
    } catch (error) {
      logger.error(`Get template error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create A/B test
   */
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
        createdAt: new Date()
      };

      this.abTests.set(abTest.id, abTest);
      logger.info(`A/B test created: ${abTest.id}`);

      return abTest;
    } catch (error) {
      logger.error(`A/B test creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get next template for A/B test
   */
  async getABTestTemplate(abTestId, recipientId) {
    try {
      const abTest = this.abTests.get(abTestId);
      if (!abTest) throw new Error('A/B test not found');

      // Deterministic split by recipient ID
      const hash = crypto.createHash('md5').update(recipientId).digest('hex');
      const isVariantA = parseInt(hash, 16) % 100 < (abTest.sampleSize * 100);

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

  /**
   * Create drip campaign
   */
  async createDripCampaign(name, steps = []) {
    try {
      const campaign = {
        id: crypto.randomUUID(),
        name,
        steps: steps.map((step, index) => ({
          ...step,
          order: index,
          createdAt: new Date()
        })),
        status: 'draft',
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        createdAt: new Date()
      };

      this.dripCampaigns.set(campaign.id, campaign);
      logger.info(`Drip campaign created: ${campaign.id}`);

      return campaign;
    } catch (error) {
      logger.error(`Drip campaign creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish drip campaign
   */
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

  /**
   * Schedule email
   */
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
        sentAt: null
      };

      this.schedules.set(schedule.id, schedule);
      logger.info(`Email scheduled: ${schedule.id}`);

      return schedule;
    } catch (error) {
      logger.error(`Schedule email error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send email immediately
   */
  async sendEmail(templateId, recipientEmail, variables = {}, options = {}) {
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
          clickedAt: null
        }
      };

      this.engagementLogs.set(email.id, email);
      logger.info(`Email sent: ${email.id} to ${recipientEmail}`);

      return email;
    } catch (error) {
      logger.error(`Send email error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send SMS
   */
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
        provider: 'twilio' // or other SMS provider
      };

      this.engagementLogs.set(sms.id, sms);
      logger.info(`SMS sent: ${sms.id} to ${phoneNumber}`);

      return sms;
    } catch (error) {
      logger.error(`Send SMS error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send bulk email with drip campaign
   */
  async sendBulkEmail(campaignId, recipients, templateId, variables = {}) {
    try {
      const campaign = this.dripCampaigns.get(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const results = [];

      for (const recipient of recipients) {
        const email = await this.sendEmail(
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

  /**
   * Track email open
   */
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

  /**
   * Track email click
   */
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

  /**
   * Get campaign statistics
   */
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
        status: campaign.status
      };
    } catch (error) {
      logger.error(`Campaign stats error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get A/B test results
   */
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
        winner: rateA > rateB ? 'A' : rateB > rateA ? 'B' : null
      };
    } catch (error) {
      logger.error(`A/B test results error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get engagement logs
   */
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

  /**
   * Get all templates
   */
  async getTemplates() {
    try {
      return Array.from(this.templates.values());
    } catch (error) {
      logger.error(`Get templates error: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all campaigns
   */
  async getCampaigns() {
    try {
      return Array.from(this.dripCampaigns.values());
    } catch (error) {
      logger.error(`Get campaigns error: ${error.message}`);
      return [];
    }
  }
}

module.exports = new AdvancedEmailService_Auto_164();

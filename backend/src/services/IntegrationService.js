/**
 * External Integrations Service
 * Google Calendar, WhatsApp, Slack, Telegram, Google Maps
 */

const logger = require('../utils/logger');

class IntegrationService {
  constructor() {
    this.integrations = new Map();
    this.syncLog = new Map();
  }

  /**
   * Google Calendar Sync
   */
  async syncGoogleCalendar(userId, accessToken, bookingData) {
    try {
      const event = {
        summary: bookingData.serviceName,
        description: `Service Booking - ${bookingData.serviceId}`,
        start: {
          dateTime: bookingData.scheduledTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: new Date(bookingData.scheduledTime.getTime() + bookingData.duration * 60000).toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        attendees: [
          { email: bookingData.customerEmail },
          { email: bookingData.professionalEmail }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      // In production, use Google Calendar API
      // For now, mock the integration
      const integration = {
        type: 'google_calendar',
        userId,
        eventId: `gcal_${bookingData.bookingId}`,
        bookingId: bookingData.bookingId,
        syncedAt: new Date(),
        status: 'synced'
      };

      this.integrations.set(bookingData.bookingId, integration);
      logger.info(`Google Calendar sync: ${bookingData.bookingId}`);

      return { success: true, eventId: integration.eventId };
    } catch (error) {
      logger.error(`Google Calendar sync error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Outlook Calendar Sync
   */
  async syncOutlookCalendar(userId, accessToken, bookingData) {
    try {
      const event = {
        subject: bookingData.serviceName,
        bodyPreview: `Service Booking - ${bookingData.serviceId}`,
        start: {
          dateTime: bookingData.scheduledTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: new Date(bookingData.scheduledTime.getTime() + bookingData.duration * 60000).toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        attendees: [
          { emailAddress: { address: bookingData.customerEmail }, type: 'required' },
          { emailAddress: { address: bookingData.professionalEmail }, type: 'required' }
        ],
        [REDACTED_TOKEN]: 15
      };

      const integration = {
        type: 'outlook_calendar',
        userId,
        eventId: `outlook_${bookingData.bookingId}`,
        bookingId: bookingData.bookingId,
        syncedAt: new Date(),
        status: 'synced'
      };

      this.integrations.set(bookingData.bookingId, integration);
      logger.info(`Outlook Calendar sync: ${bookingData.bookingId}`);

      return { success: true, eventId: integration.eventId };
    } catch (error) {
      logger.error(`Outlook sync error: ${error.message}`);
      throw error;
    }
  }

  /**
   * WhatsApp Notification
   */
  async [REDACTED_TOKEN](phoneNumber, message, templateId = null) {
    try {
      const notification = {
        id: `whatsapp_${Date.now()}`,
        phoneNumber,
        message,
        templateId,
        sentAt: new Date(),
        status: 'sent'
      };

      // In production, integrate with WhatsApp Business API
      logger.info(`WhatsApp notification sent to ${phoneNumber}`);

      return { success: true, messageId: notification.id };
    } catch (error) {
      logger.error(`WhatsApp notification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Slack Team Notification
   */
  async [REDACTED_TOKEN](channelId, message, options = {}) {
    try {
      const notification = {
        id: `slack_${Date.now()}`,
        channelId,
        message,
        blocks: options.blocks,
        sentAt: new Date(),
        status: 'sent'
      };

      // In production, integrate with Slack API
      logger.info(`Slack notification sent to ${channelId}`);

      return { success: true, messageId: notification.id };
    } catch (error) {
      logger.error(`Slack notification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Telegram Bot Notification
   */
  async [REDACTED_TOKEN](chatId, message, options = {}) {
    try {
      const notification = {
        id: `telegram_${Date.now()}`,
        chatId,
        message,
        parseMode: options.parseMode || 'HTML',
        sentAt: new Date(),
        status: 'sent'
      };

      // In production, integrate with Telegram Bot API
      logger.info(`Telegram notification sent to ${chatId}`);

      return { success: true, messageId: notification.id };
    } catch (error) {
      logger.error(`Telegram notification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Google Maps Search
   */
  async searchGoogleMaps(query, location, radius = 5000) {
    try {
      const result = {
        query,
        location,
        radius,
        results: [
          {
            name: `Service Location ${Math.random()}`,
            latitude: location.lat,
            longitude: location.lng,
            address: 'Sample Address',
            distance: Math.random() * radius
          }
        ],
        searchedAt: new Date()
      };

      // In production, use Google Maps Places API
      logger.info(`Google Maps search: ${query} near ${location}`);

      return result;
    } catch (error) {
      logger.error(`Google Maps search error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Zapier Integration
   */
  async sendToZapier(webhookUrl, data) {
    try {
      const payload = {
        data,
        timestamp: new Date(),
        source: 'avante'
      };

      // In production, make HTTP POST to Zapier webhook
      logger.info('Zapier integration triggered');

      return { success: true, eventId: `zapier_${Date.now()}` };
    } catch (error) {
      logger.error(`Zapier integration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * List user integrations
   */
  async getUserIntegrations(userId) {
    try {
      const userIntegrations = [];
      for (const [key, integration] of this.integrations.entries()) {
        if (integration.userId === userId) {
          userIntegrations.push(integration);
        }
      }
      return userIntegrations;
    } catch (error) {
      logger.error(`Error getting integrations: ${error.message}`);
      return [];
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(integrationId, limit = 50) {
    try {
      const logs = this.syncLog.get(integrationId) || [];
      return logs.slice(-limit);
    } catch (error) {
      logger.error(`Error getting sync logs: ${error.message}`);
      return [];
    }
  }

  /**
   * Integration statistics
   */
  async getIntegrationStats() {
    try {
      const typeCount = {};
      for (const [, integration] of this.integrations.entries()) {
        typeCount[integration.type] = (typeCount[integration.type] || 0) + 1;
      }

      return {
        totalIntegrations: this.integrations.size,
        byType: typeCount,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Error getting integration stats: ${error.message}`);
      return {};
    }
  }
}

module.exports = new IntegrationService();

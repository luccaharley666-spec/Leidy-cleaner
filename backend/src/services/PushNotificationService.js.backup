/**
 * Push Notification Service
 * Web Push, Mobile Push, Notification Center
 */

const logger = require('../utils/logger');

class PushNotificationService_Auto_209 {
  constructor() {
    this.notifications = new Map();
    this.subscriptions = new Map();
    this.deliveryLog = [];
  }

  /**
   * Registrar subscription push
   */
  async PushNotificationService_Auto_209(userId, subscription) {
    try {
      const subscriptionId = `sub_${Date.now()}`;
      const sub = {
        id: subscriptionId,
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        deviceType: subscription.deviceType || 'web',
        createdAt: new Date(),
        active: true
      };

      this.subscriptions.set(subscriptionId, sub);

      logger.log({
        level: 'info',
        message: 'Push subscription registered',
        userId,
        deviceType: sub.deviceType
      });

      return sub;
    } catch (error) {
      logger.error('Subscription registration failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Enviar notificação push
   */
  async PushNotificationService_Auto_209(userId, payload) {
    try {
      const {
        title,
        body,
        icon,
        badge,
        tag = 'notification',
        requireInteraction = false
      } = payload;

      const notificationId = `notif_${Date.now()}`;
      const notification = {
        id: notificationId,
        userId,
        title,
        body,
        icon,
        badge,
        tag,
        requireInteraction,
        sentAt: new Date(),
        status: 'sent',
        deliveries: []
      };

      // Encontrar subscriptions
      const userSubscriptions = Array.from(this.subscriptions.values())
        .filter(s => s.userId === userId && s.active);

      // Enviar para cada subscription
      const deliveries = userSubscriptions.map(sub => {
        const delivery = {
          subscriptionId: sub.id,
          deviceType: sub.deviceType,
          sentAt: new Date(),
          status: 'sent'
        };
        notification.deliveries.push(delivery);
        return delivery;
      });

      this.notifications.set(notificationId, notification);
      this.deliveryLog.push({
        notificationId,
        userId,
        deliveryCount: deliveries.length,
        timestamp: new Date()
      });

      logger.log({
        level: 'info',
        message: 'Push notification sent',
        userId,
        notificationId,
        deliveries: deliveries.length
      });

      return notification;
    } catch (error) {
      logger.error('Push notification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Enviar notificação para múltiplos usuários
   */
  async PushNotificationService_Auto_209(userIds, payload) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.PushNotificationService_Auto_209(userId, payload);
      results.push(result);
    }
    return {
      broadcast: true,
      recipients: userIds.length,
      notifications: results
    };
  }

  /**
   * Notificar sobre novo booking
   */
  async notifyNewBooking(userId, bookingData) {
    return this.PushNotificationService_Auto_209(userId, {
      title: '🎉 Novo Agendamento!',
      body: `${bookingData.serviceName} confirmado para ${bookingData.date}`,
      icon: 'https://api.example.com/icons/booking.png',
      tag: 'booking',
      requireInteraction: true
    });
  }

  /**
   * Notificar sobre preço reduzido
   */
  async notifyPriceDrop(userId, serviceData) {
    return this.PushNotificationService_Auto_209(userId, {
      title: '💰 Preço Reduzido!',
      body: `${serviceData.serviceName} agora por R$ ${serviceData.newPrice}`,
      icon: 'https://api.example.com/icons/discount.png',
      tag: 'price_alert'
    });
  }

  /**
   * Notificar próxima data agendada
   */
  async PushNotificationService_Auto_209(userId, bookingData) {
    const hoursUntil = Math.floor((new Date(bookingData.date) - new Date()) / 3600000);
    return this.PushNotificationService_Auto_209(userId, {
      title: '⏰ Lembrete de Agendamento',
      body: `Seu compromisso é em ${hoursUntil} horas`,
      icon: 'https://api.example.com/icons/reminder.png',
      tag: 'reminder'
    });
  }

  /**
   * Notificar review do cliente
   */
  async notifyNewReview(userId, reviewData) {
    return this.PushNotificationService_Auto_209(userId, {
      title: '⭐ Nova Avaliação!',
      body: `${reviewData.authorName} deixou uma ${reviewData.rating}⭐ avaliação`,
      icon: 'https://api.example.com/icons/review.png',
      tag: 'review'
    });
  }

  /**
   * Desinscrever dispositivo
   */
  async unsubscribeDevice(subscriptionId) {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) {
      sub.active = false;
      sub.unsubscribedAt = new Date();
    }
    return { unsubscribed: true };
  }

  /**
   * Obter preferências de notificação
   */
  async PushNotificationService_Auto_209(userId) {
    return {
      userId,
      preferences: {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        categories: {
          bookings: true,
          priceAlerts: true,
          reviews: true,
          promotions: true,
          reminders: true
        }
      }
    };
  }

  /**
   * Atualizar preferências
   */
  async PushNotificationService_Auto_209(userId, preferences) {
    logger.log({
      level: 'info',
      message: 'Notification preferences updated',
      userId,
      preferences
    });
    return { updated: true, preferences };
  }

  /**
   * Histórico de notificações
   */
  async PushNotificationService_Auto_209(userId, limit = 50) {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice(0, limit);

    return {
      userId,
      notifications: userNotifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        sentAt: n.sentAt,
        sentDate: n.sentAt.toLocaleDateString('pt-BR')
      })),
      count: userNotifications.length
    };
  }

  /**
   * Estatísticas de entrega
   */
  async getDeliveryStats() {
    const total = this.deliveryLog.length;
    const last24h = this.deliveryLog.filter(
      d => new Date() - d.timestamp < 86400000
    );

    return {
      totalDeliveries: total,
      last24Hours: last24h.length,
      successRate: 98.5,
      averageDevices: this.subscriptions.size / Math.max(1, Array.from(this.subscriptions.values()).map(s => s.userId).length),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new PushNotificationService_Auto_209();

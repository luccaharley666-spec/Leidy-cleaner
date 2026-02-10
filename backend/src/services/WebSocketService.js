/**
 * WebSocket Service
 * Notificações real-time via Socket.io
 */

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class WebSocketService {
  constructor(server, corsOrigin) {
    this.io = socketIo(server, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.userSockets = new Map(); // userId -> socket.id
    this.roomSubscriptions = new Map(); // room -> Set<userId>

    this.[REDACTED_TOKEN]();
    this.[REDACTED_TOKEN]();
  }

  /**
   * Middleware de autenticação para Socket.io
   */
  [REDACTED_TOKEN]() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: token missing'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId || decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Authentication error: invalid token'));
      }
    });
  }

  /**
   * Inicializa event handlers
   */
  [REDACTED_TOKEN]() {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket connected: ${socket.id} (user: ${socket.userId})`);

      // Armazenar socket para rápido lookup
      this.userSockets.set(socket.userId, socket.id);

      // ===== EVENT: Booking updates =====
      socket.on('subscribe:booking', (bookingId) => {
        const room = `booking:${bookingId}`;
        socket.join(room);

        if (!this.roomSubscriptions.has(room)) {
          this.roomSubscriptions.set(room, new Set());
        }
        this.roomSubscriptions.get(room).add(socket.userId);

        logger.info(`User ${socket.userId} subscribed to booking ${bookingId}`);
      });

      socket.on('unsubscribe:booking', (bookingId) => {
        const room = `booking:${bookingId}`;
        socket.leave(room);

        const subscribers = this.roomSubscriptions.get(room);
        if (subscribers) {
          subscribers.delete(socket.userId);
        }
      });

      // ===== EVENT: Payment status =====
      socket.on('subscribe:payment', (paymentId) => {
        const room = `payment:${paymentId}`;
        socket.join(room);
        logger.info(`User ${socket.userId} subscribed to payment ${paymentId}`);
      });

      // ===== EVENT: Notifications =====
      socket.on('subscribe:notifications', () => {
        const room = `user:${socket.userId}:notifications`;
        socket.join(room);
      });

      // ===== EVENT: Admin dashboard =====
      if (socket.userRole === 'admin') {
        socket.on('subscribe:admin', () => {
          const room = 'admin:dashboard';
          socket.join(room);
          logger.info(`Admin ${socket.userId} subscribed to dashboard`);
        });
      }

      // ===== EVENT: Disconnect =====
      socket.on('disconnect', () => {
        this.userSockets.delete(socket.userId);
        logger.info(`WebSocket disconnected: ${socket.id} (user: ${socket.userId})`);
      });

      // ===== EVENT: Error handling =====
      socket.on('error', (error) => {
        logger.error(`WebSocket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Notificar usuário sobre novo booking
   */
  [REDACTED_TOKEN](bookingId, userId, bookingData) {
    const room = `booking:${bookingId}`;
    this.io.to(room).emit('booking:created', {
      bookingId,
      ...bookingData,
      timestamp: new Date()
    });

    logger.info(`Notified users about booking ${bookingId}`);
  }

  /**
   * Notificar sobre pagamento confirmado
   */
  [REDACTED_TOKEN](paymentId, bookingId, amount) {
    const room = `payment:${paymentId}`;
    this.io.to(room).emit('payment:confirmed', {
      paymentId,
      bookingId,
      amount,
      timestamp: new Date()
    });

    logger.info(`Notified users about payment ${paymentId} confirmation`);
  }

  /**
   * Notificar usuário específico
   */
  notifyUser(userId, eventName, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(eventName, {
        ...data,
        timestamp: new Date()
      });

      logger.info(`Notified user ${userId} about ${eventName}`);
    }
  }

  /**
   * Broadcast para admin (dashboard)
   */
  broadcastToAdmin(eventName, data) {
    this.io.to('admin:dashboard').emit(eventName, {
      ...data,
      timestamp: new Date()
    });

    logger.info(`Broadcast to admin: ${eventName}`);
  }

  /**
   * Enviar notificação para sala (room)
   */
  sendToRoom(room, eventName, data) {
    this.io.to(room).emit(eventName, {
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Obter número de usuarios conectados
   */
  getConnectedUsers() {
    return this.userSockets.size;
  }

  /**
   * Obter usuários em uma sala
   */
  getRoomSubscribers(room) {
    return this.roomSubscriptions.get(room)?.size || 0;
  }

  /**
   * Shutdown gracioso
   */
  async shutdown() {
    this.io.disconnectSockets();
    await new Promise((resolve) => this.io.close(resolve));
    logger.info('WebSocket server shut down');
  }
}

module.exports = WebSocketService;

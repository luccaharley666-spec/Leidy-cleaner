/**
 * Main API Routes
 * Rotas principais da API
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// garantir pasta uploads (usar backend_data, que é gravável no container de dev)
const uploadDir = path.join(__dirname, '..', '..', 'backend_data', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

// ✅ CORRIGIDO: Validação robusta de upload
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 8 // Máximo 8 arquivos
  },
  fileFilter: (req, file, cb) => {
    // ✅ CORRIGIDO: Validar MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP allowed'));
    }
    cb(null, true);
  }
});

// Controllers
const BookingController = require('../controllers/BookingController');
const PaymentController = require('../controllers/PaymentController');
const ReviewController = require('../controllers/ReviewController');
const AdminController = require('../controllers/AdminController');
const StaffController = require('../controllers/StaffController');
const PhotosController = require('../controllers/PhotosController');
const AutoPlaceholderController = require('../../src/controllers/AutoPlaceholderController');
const ChatController = require('../controllers/ChatController');
const CDNAssetController = require('../controllers/CDNAssetController');
const AuthController = require('../controllers/AuthController');
const ProfileController = require('../controllers/ProfileController');
const db = require('../db');
const logger = require('../utils/logger');
// other controllers with masked names now route to AutoPlaceholderController

// Middleware
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateBookingData, validatePaymentData, validateReviewData } = require('../middleware/validation');
const { limiters, logRateLimitWarning } = require('../middleware/rateLimited');
const { validateSchema } = require('../utils/joiSchemas');
const { bookingSchemas, reviewSchemas, paymentSchemas, userSchemas } = require('../utils/joiSchemas');

// ===== HEALTH CHECKS (Públicas, sem autenticação) =====
router.get('/health', (req, res) => {
  AutoPlaceholderController.getDetailedHealth(req, res);
});

router.get('/health/live', (req, res) => {
  AutoPlaceholderController.getLiveness(req, res);
});

router.get('/health/ready', (req, res) => {
  AutoPlaceholderController.getReadiness(req, res);
});

router.get('/health/db', (req, res) => {
  AutoPlaceholderController.getDatabaseReady(req, res);
});

router.get('/health/queue', (req, res) => {
  AutoPlaceholderController.getQueueStatus(req, res);
});
// ===== BOOKINGS =====
// ===== AUTH =====

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, phone]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: Validação falhou
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/auth/register', limiters.register, validateSchema(userSchemas.register), (req, res) => {
  AuthController.register(req, res);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/auth/login', limiters.login, validateSchema(userSchemas.login), (req, res) => {
  AuthController.login(req, res);
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token renovado
 */
router.post('/auth/refresh', (req, res) => {
  AuthController.refreshToken(req, res);
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 userId: { type: integer }
 *                 user: { $ref: '#/components/schemas/User' }
 */
router.get('/auth/verify', authenticateToken, (req, res) => {
  // retornar informações do usuário a partir do token
  res.json({ success: true, userId: req.user.userId, user: req.user });
});

router.post('/auth/logout', authenticateToken, (req, res) => {
  AuthController.logout(req, res);
});

// ✅ NEW: 2FA (Two-Factor Authentication) Routes
const TwoFactorRoutes = require('./twoFactorRoutes');
router.use('/2fa', authenticateToken, TwoFactorRoutes);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Criar novo agendamento
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, serviceId, date, time, address, phone]
 *             properties:
 *               userId: { type: integer }
 *               serviceId: { type: integer }
 *               date: { type: string, format: date }
 *               time: { type: string, format: time }
 *               address: { type: string }
 *               phone: { type: string }
 *               durationHours: { type: integer, default: 2 }
 *     responses:
 *       201:
 *         description: Agendamento criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/BookingResponse' }
 */
router.post('/bookings', authenticateToken, limiters.createBooking, validateSchema(bookingSchemas.create), (req, res) => {
  BookingController.createBooking(req, res);
});

// Upload de arquivos (fotos)
/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload de fotos
 *     tags: [Files]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Fotos enviadas com sucesso
 */
router.post('/uploads', authenticateToken, limiters.upload, upload.array('photos', 8), (req, res) => {
  const files = req.files || [];
  const urls = files.map(f => ({ filename: f.filename, url: `${process.env.BASE_URL || ''}/uploads/${f.filename}` }));
  res.json({ success: true, files: urls });
});

/**
 * @swagger
 * /bookings/{userId}:
 *   get:
 *     summary: Listar agendamentos do usuário
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 */
router.get('/bookings/:userId', authenticateToken, (req, res) => {
  BookingController.getUserBookings(req, res);
});

/**
 * @swagger
 * /bookings/{bookingId}:
 *   put:
 *     summary: Atualizar agendamento
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Agendamento atualizado
 *   delete:
 *     summary: Cancelar agendamento
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Agendamento cancelado
 */
router.put('/bookings/:bookingId', authenticateToken, limiters.general, validateSchema(bookingSchemas.update), (req, res) => {
  BookingController.updateBooking(req, res);
});

router.delete('/bookings/:bookingId', authenticateToken, (req, res) => {
  BookingController.cancelBooking(req, res);
});

// ===== PAYMENTS =====

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Processar pagamento
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId: { type: integer }
 *               amount: { type: number }
 *               method: { type: string, enum: [stripe, pix, cash] }
 *     responses:
 *       200:
 *         description: Pagamento processado
 */
router.post('/payments', authenticateToken, limiters.payment, validateSchema(paymentSchemas.process), (req, res) => {
  PaymentController.processPayment(req, res);
});

/**
 * @swagger
 * /payments/{userId}:
 *   get:
 *     summary: Histórico de pagamentos
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 */
router.get('/payments/:userId', authenticateToken, (req, res) => {
  PaymentController.getPaymentHistory(req, res);
});

router.post('/refunds', authenticateToken, limiters.refund, authorizeRole(['admin']), validateSchema(paymentSchemas.refund), (req, res) => {
  PaymentController.processRefund(req, res);
});

// PIX Payments
router.get('/payments/pix/:pixTransactionId', authenticateToken, (req, res) => {
  PaymentController.verifyPixPayment(req, res);
});

// Compatibilidade com frontend antigo: endpoints /api/pix/*
const PixService = require('../services/PixService');
const crypto = require('crypto');

/**
 * POST /api/pix/create
 * Gera QR Code PIX para frontend (compatível com PixQRCodeCheckout)
 */
router.post('/pix/create', authenticateToken, async (req, res) => {
  try {
    const { bookingId, amount, orderId, description } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, error: 'bookingId e amount obrigatórios' });
    }

    const result = await PixService.generateQRCode(parseFloat(amount), bookingId, description || `Agendamento ${bookingId}`);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error || 'Erro ao gerar PIX' });
    }

    // Salvar transação leve em transactions para rastreamento
    const transactionId = crypto.randomUUID();
    await db.run(
      `INSERT INTO transactions (id, booking_id, user_id, amount, payment_method, status, pix_transaction_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      transactionId, bookingId, userId, parseFloat(amount), 'pix', 'pending', result.pixTransactionId
    );

    return res.json({
      success: true,
      data: {
        brCode: result.brCode,
        qrCodeImage: null,
        transactionId: result.pixTransactionId,
        expiresAt: result.expiresAt,
        amount: parseFloat(amount)
      }
    });
  } catch (err) {
    logger.error('Error creating PIX', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Notification test endpoints (DEV)
router.post('/notifications/test-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, template, data } = req.body;
    const NotificationService = require('../services/NotificationService');
    const notif = new NotificationService(require('../db'));

    const emailTpls = require('../utils/emailTemplates');
    const tpl = emailTpls[template || 'bookingConfirmation'];
    let html = '';
    let subj = subject || 'Teste de Email';
    if (tpl) {
      const rendered = tpl.template ? tpl.template(data || {}, { name: data?.userName || 'Cliente' }) : tpl;
      html = rendered.html || rendered;
      subj = tpl.subject || subj;
    } else {
      html = `<p>Test email</p>`;
    }

    const result = await notif.sendEmail(to, subj, html);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/notifications/test-sms', authenticateToken, async (req, res) => {
  try {
    const { phone, message } = req.body;
    const NotificationService = require('../services/NotificationService');
    const notif = new NotificationService(require('../db'));
    const result = await notif.sendSMS(phone, message || 'Teste SMS');
    res.json({ success: true, result });
  } catch (err) {
    console.error('Test sms error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/pix/status/:pixTransactionId
 * Retorna status do PIX (pending|received|confirmed|failed)
 */
router.get('/pix/status/:pixTransactionId', authenticateToken, async (req, res) => {
  try {
    const { pixTransactionId } = req.params;
    if (!pixTransactionId) return res.status(400).json({ success: false, error: 'pixTransactionId required' });

    const pixResult = await PixService.verifyPayment(pixTransactionId);

    // Mapear status para frontend
    let frontendStatus = 'waiting';
    if (!pixResult.success) {
      return res.json({ success: false, error: pixResult.error });
    }
    if (pixResult.status === 'paid') frontendStatus = 'confirmed';
    else if (pixResult.status === 'pending') frontendStatus = 'received';
    else if (pixResult.status === 'failed') frontendStatus = 'expired';

    res.json({ success: true, data: { status: frontendStatus, amount: pixResult.amount, expiresAt: pixResult.expiresAt } });
  } catch (err) {
    logger.error('Error fetching PIX status', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== REVIEWS =====
router.post('/reviews', authenticateToken, limiters.createReview, validateSchema(reviewSchemas.create), (req, res) => {
  ReviewController.createReview(req, res);
});

router.get('/reviews', (req, res) => {
  ReviewController.getPublicReviews(req, res);
});

router.get('/reviews/stats', (req, res) => {
  ReviewController.getRatingStats(req, res);
});

router.post('/reviews/:reviewId/response', authenticateToken, authorizeRole(['admin']), (req, res) => {
  ReviewController.respondToReview(req, res);
});

// ===== ADMIN DASHBOARD =====
router.get('/admin/dashboard', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getDashboard(req, res);
});

router.get('/admin/revenue-chart', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getRevenueChart(req, res);
});

router.get('/admin/bookings-list', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getBookingsList(req, res);
});

router.get('/admin/users-stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getUsersStats(req, res);
});

router.get('/admin/reviews-stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getReviewsStats(req, res);
});

router.get('/admin/upcoming-bookings', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getUpcomingBookings(req, res);
});

router.get('/admin/staff-earnings/:staffId?', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AdminController.getStaffEarnings(req, res);
});

// ===== STAFF DASHBOARD =====
router.get('/staff/dashboard', authenticateToken, authorizeRole(['staff']), (req, res) => {
  StaffController.getDashboard(req, res);
});

router.get('/staff/dashboard/:staffId', authenticateToken, authorizeRole(['admin']), (req, res) => {
  StaffController.getDashboard(req, res);
});

router.get('/staff/bookings-history', authenticateToken, authorizeRole(['staff']), (req, res) => {
  StaffController.getBookingHistory(req, res);
});

router.get('/staff/earnings-by-period', authenticateToken, authorizeRole(['staff']), (req, res) => {
  StaffController.getEarningsByPeriod(req, res);
});

router.post('/staff/bookings/:bookingId/confirm', authenticateToken, authorizeRole(['staff']), (req, res) => {
  StaffController.confirmBooking(req, res);
});

router.post('/staff/bookings/:bookingId/complete', authenticateToken, authorizeRole(['staff']), (req, res) => {
  StaffController.completeBooking(req, res);
});

router.get('/staff/payment-report', authenticateToken, authorizeRole(['staff']), (req, res) => {
  StaffController.getPaymentReport(req, res);
});

// ===== FOTOS =====
router.post('/bookings/:bookingId/photos', authenticateToken, upload.array('photos', 8), (req, res) => {
  PhotosController.uploadPhotos(req, res);
});

router.get('/bookings/:bookingId/photos', authenticateToken, (req, res) => {
  PhotosController.getBookingPhotos(req, res);
});

router.get('/gallery', (req, res) => {
  PhotosController.getGallery(req, res);
});

router.delete('/photos/:photoId', authenticateToken, (req, res) => {
  PhotosController.deletePhoto(req, res);
});

// ===== AVALIAÇÕES PÚBLICAS =====
router.get('/public-reviews', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/reviews-stats/public', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/reviews/service/:serviceId', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/reviews/public/:bookingId/respond', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== NOTIFICAÇÕES PUSH =====
router.post('/notifications/subscribe', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/notifications/unsubscribe', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/notifications/send-test', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/reviews/filter', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== PROFILE & COMPANY =====
// const ProfileController = require('../controllers/ProfileController');

// Profile routes
router.get('/profile/current', authenticateToken, async (req, res) => {
  try {
    req.params.userId = req.user.id;
    await ProfileController.getProfile(req, res);
  } catch (err) {
    logger.error('Error in profile/current route:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

router.get('/profile/:userId', (req, res) => {
  ProfileController.getProfile(req, res);
});

router.put('/profile/update', authenticateToken, (req, res) => {
  ProfileController.updateProfile(req, res);
});

// Avatar routes
router.post('/avatar/upload', authenticateToken, upload.single('avatar'), (req, res) => {
  ProfileController.uploadAvatar(req, res);
});

router.delete('/avatar', authenticateToken, (req, res) => {
  ProfileController.deleteAvatar(req, res);
});

// Company routes
router.get('/company/info', (req, res) => {
  ProfileController.getCompanyInfo(req, res);
});

router.get('/company/banking', authenticateToken, authorizeRole(['admin']), (req, res) => {
  ProfileController.getBankingInfo(req, res);
});

router.put('/company/info', authenticateToken, authorizeRole(['admin']), (req, res) => {
  ProfileController.updateCompanyInfo(req, res);
});

// ===== NEWSLETTER =====
// Newsletter controller was removed as placeholder; use fallback handlers
router.post('/newsletter/subscribe', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/newsletter/unsubscribe', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/newsletter/subscribers', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/newsletter/send-all', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/newsletter/stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== 2FA (Two-Factor Authentication) =====
// const twoFactorRoutes = require('./twoFactorRoutes');
// // // // // router.use('/auth/2fa', twoFactorRoutes);

// ===== CALENDAR & AVAILABILITY =====
// const availabilityRoutes = require('./availabilityRoutes');
// // // router.use('/availability', availabilityRoutes);

// ===== REVIEWS & RATINGS =====
// const reviewRoutes = require('./reviewRoutes');
// // // router.use('/reviews', reviewRoutes);

// ===== AFFILIATES & REFERRAL PROGRAM =====
// const affiliateRoutes = require('./affiliateRoutes');
// // // router.use('/affiliates', authenticateToken, affiliateRoutes);

// ===== PAYMENTS (Stripe) =====
// // const paymentRoutes = require('./paymentRoutes');
// // // // router.use('/payments', paymentRoutes);

// ===== CHAT MESSAGES & HISTORY =====
// const chatMessagesRoutes = require('./chatMessagesRoutes');
// // // router.use('/chat', chatMessagesRoutes);

// ===== CHAT (Encrypted Messaging) =====
router.post('/chat/messages', authenticateToken, (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/chat/messages/:conversationId', authenticateToken, (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/chat/upload-encrypted', authenticateToken, upload.single('file'), (req, res) => {
  ChatController.uploadEncryptedFile(req, res);
});

router.get('/chat/download-encrypted/:fileId', authenticateToken, (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/chat/message-hash/:messageId', authenticateToken, (req, res) => {
  ChatController.getMessageHash(req, res);
});

router.delete('/chat/conversations/:conversationId', authenticateToken, (req, res) => {
  ChatController.deleteConversation(req, res);
});

// ===== DATABASE OPTIMIZATION =====
router.get('/db/query-report', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/db/slow-queries', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/db/analyze-query', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/db/suggest-indices', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/db/index-usage', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/db/integrity-check', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/db/vacuum', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/db/optimize', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/db/table-sizes', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/db/stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.post('/db/reset-stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== CDN & ASSET OPTIMIZATION =====
router.post('/cdn/optimize-image', authenticateToken, (req, res) => {
  CDNAssetController.optimizeImage(req, res);
});

router.get('/cdn/responsive-image', authenticateToken, (req, res) => {
  CDNAssetController.getResponsiveImage(req, res);
});

router.get('/cdn/placeholder', authenticateToken, (req, res) => {
  CDNAssetController.getPlaceholder(req, res);
});

router.get('/cdn/bandwidth-savings', authenticateToken, authorizeRole(['admin']), (req, res) => {
  CDNAssetController.getBandwidthSavings(req, res);
});

router.get('/cdn/manifest', authenticateToken, authorizeRole(['admin']), (req, res) => {
  CDNAssetController.getAssetManifest(req, res);
});

router.get('/cdn/cache-headers', authenticateToken, (req, res) => {
  CDNAssetController.getCacheHeaders(req, res);
});

router.post('/cdn/preload-resources', authenticateToken, (req, res) => {
  CDNAssetController.generatePreloadTags(req, res);
});

router.post('/cdn/image-sitemap', authenticateToken, authorizeRole(['admin']), (req, res) => {
  CDNAssetController.getImageSitemap(req, res);
});

router.get('/cdn/image-performance/:imageId', authenticateToken, (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

router.get('/cdn/optimization-report', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== PHASE 2: ADVANCED FEATURES =====

// ===== SEARCH & DISCOVERY =====
// const SearchController = require('../controllers/SearchController');
// // // router.use('/search', SearchController);

// ===== ANALYTICS DASHBOARD =====
// const AnalyticsController = require('../controllers/AnalyticsController');
// Permitimos também managers e partners a acessar analytics
// router.use('/analytics', authenticateToken, authorizeRole(['admin','manager','partner']), AnalyticsController);

// ===== RECURRING BOOKINGS =====
// placeholder controller removed; using fallback route handlers
router.use('/bookings/recurring', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== PRICE HISTORY & FORECASTING =====
router.use('/prices', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== PERSONALIZED RECOMMENDATIONS =====
// As rotas de recomendações são definidas mais abaixo com handlers explícitos.

// ===== PAYMENT INTEGRATION (Stripe + PIX) =====
router.use('/payments', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== SMART PUSH NOTIFICATIONS =====
router.use('/push-notifications', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== SMS / WHATSAPP NOTIFICATIONS (Preferences & History) =====
// const NotificationService = require('../services/NotificationService');
// const notificationService = new NotificationService(require('../db'));
// const notificationRoutes = require('./notificationRoutes');
// // // router.use('/notifications', notificationRoutes(require('../db'), notificationService));

// ===== REFERRAL PROGRAM =====
// // const ReferralController = require('../controllers/ReferralController');
// // // router.use('/referrals', authenticateToken, ReferralController);

// ===== AUTO-SCHEDULING & ROUTE OPTIMIZATION =====
router.use('/scheduling', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== SEO & MARKETING =====
router.use('/seo', (req, res) => AutoPlaceholderController.__fallback(req, res));
router.use('/marketing', authenticateToken, authorizeRole(['admin']), (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== BACKUP & DISASTER RECOVERY =====
// // const BackupController = require('../controllers/BackupController');
// // router.use('/backup', authenticateToken, authorizeRole(['admin']), BackupController);

// ===== REVIEW IMAGES & GALLERY =====
router.use('/reviews', (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== REPORTS & EXPORTS =====
// // const ReportsController = require('../controllers/ReportsController');
// // router.use('/reports', authenticateToken, authorizeRole(['admin']), ReportsController);

// ===== SMART NOTIFICATIONS =====
router.use('/smart-notifications', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== ADMIN DASHBOARD =====
// const adminRoutes = require('./adminRoutes');
// router.use('/admin', authenticateToken, authorizeRole(['admin']), adminRoutes);

// ===== BACKGROUND JOBS =====
// const backgroundJobRoutes = require('./backgroundJobRoutes');
// router.use('/admin/background-jobs', authenticateToken, authorizeRole(['admin']), backgroundJobRoutes);

// ===== BLOG =====
// const blogRoutes = require('./blogRoutes');
// // // // // router.use('/blog', blogRoutes);

// ===== OAUTH 2.0 AUTHENTICATION =====
// const OAuthController = require('../controllers/OAuthController');
// // // // // // router.use('/auth', OAuthController);

// ===== SWAGGER DOCUMENTATION =====
// // const swaggerRoutes = require('./swagger');
// // // // router.use('/', swaggerRoutes);

// ===== WEBHOOKS (Phase 3B) =====
// // const WebhookController = require('../controllers/WebhookController');
// // // // router.use('/webhooks', authenticateToken, WebhookController);

// ===== INTEGRATIONS (Phase 3B) =====
router.use('/integrations', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== ADVANCED PAYMENTS - Boleto, Apple Pay, Google Pay, PayPal, Subscriptions (Phase 3B) =====
router.use('/payments/advanced', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== ADVANCED EMAIL & SMS - Templates, Campaigns, A/B Testing (Phase 3B) =====
router.use('/email', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== ADVANCED 2FA - Biometric, WebAuthn, Recovery Codes, Trusted Devices (Phase 3B) =====
router.use('/2fa', (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== STAFF AVAILABILITY - Real-time availability widget =====
router.use('/staff', (req, res) => AutoPlaceholderController.__fallback(req, res));

// ===== DYNAMIC PRICING =====
// const PricingController = require('../controllers/PricingController');
router.post('/pricing/calculate', (req, res) => {
//   PricingController.calculatePrice(req, res);
});
router.get('/pricing/simulate', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== HOUR PACKAGING (Novos Endpoints Pagamento em Horas) =====
// const hourPricingRoutes = require('./hourPricingRoutes');
// router.use('/pricing', hourPricingRoutes);

// ===== INTELLIGENT RECOMMENDATIONS (CROSS-SELLING) =====
router.get('/recommendations/smart', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});
router.get('/recommendations/popular', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});
router.get('/recommendations/upsell', (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});
router.get('/recommendations/at-risk', authenticateToken, authorizeRole(['admin']), (req, res) => {
  AutoPlaceholderController.__fallback(req, res);
});

// ===== NEW FEATURES (12 Premium Services) =====
// LOYALTY & REWARDS
// const loyaltyRoutes = require('./loyaltyRoutes');
// // // router.use('/loyalty', loyaltyRoutes);

// ADD-ONS & MARKETPLACE
// const addonsRoutes = require('./addonsRoutes');
// router.use('/addons', addonsRoutes);

// SUBSCRIPTIONS
// const subscriptionRoutes = require('./subscriptionRoutes');
// router.use('/subscriptions', subscriptionRoutes);

// GEOLOCATION
// const geolocationRoutes = require('./geolocationRoutes');
// router.use('/geolocation', geolocationRoutes);

// HOURLY BOOKING
// const hourlyBookingRoutes = require('./hourlyBookingRoutes');
// // // router.use('/hourly', hourlyBookingRoutes);

// PROFESSIONAL RATINGS (Admin)
router.use('/PLACEHOLDER', (req, res) => AutoPlaceholderController.__fallback(req, res));

// CANCELLATIONS & REFUNDS
// const cancellationRoutes = require('./cancellationRoutes');
// // router.use('/cancellations', cancellationRoutes);

// RECEIPTS & INVOICES
// const receiptRoutes = require('./receiptRoutes');
// router.use('/receipts', receiptRoutes);

// ===== PIX PAYMENT =====
// const createPixRoutes = require('./pixRoutes');
// const pixRoutes = createPixRoutes(require('../db/sqlite').getDb());
// router.use('/pix', pixRoutes);

// ===== ADMIN DASHBOARD =====
const { getDb } = require('../db/sqlite');
router.use('/admin/dashboard', (req, res) => AutoPlaceholderController.__fallback(req, res));

// module.exports = router;

// ===== EXTRA FEATURES (6 Bonus Services) =====
// ANALYTICS DASHBOARD
// const analyticsRoutes = require('./analyticsRoutes');
// // router.use('/analytics', authenticateToken, analyticsRoutes);

// COUPONS & DISCOUNTS
// const couponRoutes = require('./couponRoutes');
// router.use('/coupons', couponRoutes);

// RECURRING BOOKINGS
router.use('/recurring-bookings', authenticateToken, (req, res) => AutoPlaceholderController.__fallback(req, res));

// REPORTS & PDF
// const reportRoutes = require('./reportRoutes');
// // router.use('/reports', reportRoutes);

// SMS & WHATSAPP
// const smsRoutes = require('./smsRoutes');
// router.use('/sms', smsRoutes);

// REFERRAL PROGRAM
// const referralRoutes = require('./referralRoutes');
// // router.use('/referrals', authenticateToken, referralRoutes);

// ===== SMART FEATURES (5 Advanced Features) =====
// Feature #1: Smart Availability Widget
// Feature #2: Dynamic Pricing Engine
// Feature #3: Intelligent Cross-Selling
// Feature #4: Advanced Analytics Dashboard
// Feature #5: Intelligent Staff Optimization
const smartFeaturesRoutes = require('./smartFeaturesRoutes');
router.use('/smart', smartFeaturesRoutes);

module.exports = router;

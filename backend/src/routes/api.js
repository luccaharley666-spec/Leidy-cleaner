/**
 * Main API Routes
 * Rotas principais da API
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// garantir pasta uploads
const uploadDir = path.join(__dirname, '..', '..', 'backend', 'uploads');
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
const PublicReviewsController = require('../controllers/PublicReviewsController');
const ChatController = require('../controllers/ChatController');
const DatabaseOptimizationController = require('../controllers/DatabaseOptimizationController');
const CDNAssetController = require('../controllers/CDNAssetController');
const AuthController = require('../controllers/AuthController');
const NotificationsController = require('../controllers/NotificationsController');
const HealthCheckController = require('../controllers/HealthCheckController');

// Middleware
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateBookingData, validatePaymentData, validateReviewData } = require('../middleware/validation');
const { limiters, logRateLimitViolation } = require('../middleware/rateLimited');
const { validateSchema } = require('../utils/joiSchemas');
const { bookingSchemas, reviewSchemas, paymentSchemas, userSchemas } = require('../utils/joiSchemas');

// ===== HEALTH CHECKS (Públicas, sem autenticação) =====
router.get('/health', (req, res) => {
  HealthCheckController.getDetailedHealth(req, res);
});

router.get('/health/live', (req, res) => {
  HealthCheckController.getLiveness(req, res);
});

router.get('/health/ready', (req, res) => {
  HealthCheckController.getReadiness(req, res);
});

router.get('/health/db', (req, res) => {
  HealthCheckController.getDatabaseReady(req, res);
});

router.get('/health/queue', (req, res) => {
  HealthCheckController.getQueueStatus(req, res);
});

// ===== BOOKINGS =====
// ===== AUTH =====
router.post('/auth/register', limiters.register, validateSchema(userSchemas.register), (req, res) => {
  AuthController.register(req, res);
});

router.post('/auth/login', limiters.login, validateSchema(userSchemas.login), (req, res) => {
  AuthController.login(req, res);
});

router.post('/auth/refresh', (req, res) => {
  AuthController.refreshToken(req, res);
});

router.get('/auth/verify', authenticateToken, (req, res) => {
  // retornar informações do usuário a partir do token
  res.json({ success: true, userId: req.user.userId, user: req.user });
});

router.post('/auth/logout', authenticateToken, (req, res) => {
  AuthController.logout(req, res);
});

router.post('/bookings', authenticateToken, limiters.createBooking, validateSchema(bookingSchemas.create), (req, res) => {
  BookingController.createBooking(req, res);
});

// Upload de arquivos (fotos)
router.post('/uploads', authenticateToken, limiters.upload, upload.array('photos', 8), (req, res) => {
  const files = req.files || [];
  const urls = files.map(f => ({ filename: f.filename, url: `${process.env.BASE_URL || ''}/uploads/${f.filename}` }));
  res.json({ success: true, files: urls });
});

router.get('/bookings/:userId', authenticateToken, (req, res) => {
  BookingController.getUserBookings(req, res);
});

router.put('/bookings/:bookingId', authenticateToken, limiters.general, validateSchema(bookingSchemas.update), (req, res) => {
  BookingController.updateBooking(req, res);
});

router.delete('/bookings/:bookingId', authenticateToken, (req, res) => {
  BookingController.cancelBooking(req, res);
});

// ===== PAYMENTS =====
router.post('/payments', authenticateToken, limiters.payment, validateSchema(paymentSchemas.process), (req, res) => {
  PaymentController.processPayment(req, res);
});

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
  PublicReviewsController.getPublicReviews(req, res);
});

router.get('/reviews-stats/public', (req, res) => {
  PublicReviewsController.getReviewsStats(req, res);
});

router.get('/reviews/service/:serviceId', (req, res) => {
  PublicReviewsController.getReviewsByService(req, res);
});

router.post('/reviews/public/:bookingId/respond', authenticateToken, authorizeRole(['admin']), (req, res) => {
  PublicReviewsController.respondToReview(req, res);
});

// ===== NOTIFICAÇÕES PUSH =====
router.post('/notifications/subscribe', (req, res) => {
  NotificationsController.subscribe(req, res);
});

router.post('/notifications/unsubscribe', (req, res) => {
  NotificationsController.unsubscribe(req, res);
});

router.post('/notifications/send-test', authenticateToken, authorizeRole(['admin']), (req, res) => {
  NotificationsController.sendTest(req, res);
});

router.get('/reviews/filter', (req, res) => {
  PublicReviewsController.filterReviews(req, res);
});

// ===== PROFILE & COMPANY =====
const ProfileController = require('../controllers/ProfileController');

// Profile routes
router.get('/profile/current', authenticateToken, (req, res) => {
  req.params.userId = req.user.id;
  ProfileController.getProfile(req, res);
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
const NewsletterController = require('../controllers/NewsletterController');

router.post('/newsletter/subscribe', (req, res) => {
  NewsletterController.subscribe(req, res);
});

router.post('/newsletter/unsubscribe', (req, res) => {
  NewsletterController.unsubscribe(req, res);
});

router.get('/newsletter/subscribers', authenticateToken, authorizeRole(['admin']), (req, res) => {
  NewsletterController.getSubscribers(req, res);
});

router.post('/newsletter/send-all', authenticateToken, authorizeRole(['admin']), (req, res) => {
  NewsletterController.sendToAll(req, res);
});

router.get('/newsletter/stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  NewsletterController.getStats(req, res);
});

// ===== 2FA (Two-Factor Authentication) =====
const twoFactorRoutes = require('./twoFactorRoutes');
router.use('/auth/2fa', twoFactorRoutes);

// ===== CHAT (Encrypted Messaging) =====
router.post('/chat/messages', authenticateToken, (req, res) => {
  ChatController.sendEncryptedMessage(req, res);
});

router.get('/chat/messages/:conversationId', authenticateToken, (req, res) => {
  ChatController.getEncryptedMessages(req, res);
});

router.post('/chat/upload-encrypted', authenticateToken, upload.single('file'), (req, res) => {
  ChatController.uploadEncryptedFile(req, res);
});

router.get('/chat/download-encrypted/:fileId', authenticateToken, (req, res) => {
  ChatController.downloadEncryptedFile(req, res);
});

router.get('/chat/message-hash/:messageId', authenticateToken, (req, res) => {
  ChatController.getMessageHash(req, res);
});

router.delete('/chat/conversations/:conversationId', authenticateToken, (req, res) => {
  ChatController.deleteConversation(req, res);
});

// ===== DATABASE OPTIMIZATION =====
router.get('/db/query-report', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.getQueryReport(req, res);
});

router.get('/db/slow-queries', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.getSlowQueries(req, res);
});

router.post('/db/analyze-query', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.analyzeQuery(req, res);
});

router.get('/db/suggest-indices', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.suggestIndices(req, res);
});

router.get('/db/index-usage', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.analyzeIndexUsage(req, res);
});

router.get('/db/integrity-check', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.validateIntegrity(req, res);
});

router.post('/db/vacuum', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.vacuumDatabase(req, res);
});

router.post('/db/optimize', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.optimizeTables(req, res);
});

router.get('/db/table-sizes', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.getTableSizes(req, res);
});

router.get('/db/stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.getDatabaseStats(req, res);
});

router.post('/db/reset-stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
  DatabaseOptimizationController.resetStatistics(req, res);
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
  CDNAssetController.measureImagePerformance(req, res);
});

router.get('/cdn/optimization-report', authenticateToken, authorizeRole(['admin']), (req, res) => {
  CDNAssetController.getOptimizationReport(req, res);
});

// ===== PHASE 2: ADVANCED FEATURES =====

// ===== SEARCH & DISCOVERY =====
const SearchController = require('../controllers/SearchController');
router.use('/search', SearchController);

// ===== ANALYTICS DASHBOARD =====
const AnalyticsController = require('../controllers/AnalyticsController');
// Permitimos também managers e partners a acessar analytics
router.use('/analytics', authenticateToken, authorizeRole(['admin','manager','partner']), AnalyticsController);

// ===== RECURRING BOOKINGS =====
const RecurringBookingController = require('../controllers/RecurringBookingController');
router.use('/bookings/recurring', authenticateToken, RecurringBookingController);

// ===== PRICE HISTORY & FORECASTING =====
const PriceHistoryController = require('../controllers/PriceHistoryController');
router.use('/prices', authenticateToken, PriceHistoryController);

// ===== PERSONALIZED RECOMMENDATIONS =====
// As rotas de recomendações são definidas mais abaixo com handlers explícitos.

// ===== PAYMENT INTEGRATION (Stripe + PIX) =====
const PaymentIntegrationController = require('../controllers/PaymentIntegrationController');
router.use('/payments', authenticateToken, PaymentIntegrationController);

// ===== SMART PUSH NOTIFICATIONS =====
const PushNotificationController = require('../controllers/PushNotificationController');
router.use('/push-notifications', authenticateToken, PushNotificationController);

// ===== REFERRAL PROGRAM =====
const ReferralController = require('../controllers/ReferralController');
router.use('/referrals', authenticateToken, ReferralController);

// ===== AUTO-SCHEDULING & ROUTE OPTIMIZATION =====
const AutoSchedulingController = require('../controllers/AutoSchedulingController');
router.use('/scheduling', authenticateToken, authorizeRole(['admin', 'staff']), AutoSchedulingController);

// ===== SEO & MARKETING =====
const SEOMarketingController = require('../controllers/SEOMarketingController');
router.use('/seo', SEOMarketingController);
router.use('/marketing', authenticateToken, authorizeRole(['admin']), SEOMarketingController);

// ===== BACKUP & DISASTER RECOVERY =====
const BackupController = require('../controllers/BackupController');
router.use('/backup', authenticateToken, authorizeRole(['admin']), BackupController);

// ===== REVIEW IMAGES & GALLERY =====
const ReviewImageController = require('../controllers/ReviewImageController');
router.use('/reviews', ReviewImageController);

// ===== REPORTS & EXPORTS =====
const ReportsController = require('../controllers/ReportsController');
router.use('/reports', authenticateToken, authorizeRole(['admin']), ReportsController);

// ===== SMART NOTIFICATIONS =====
const SmartNotificationController = require('../controllers/SmartNotificationController');
router.use('/smart-notifications', authenticateToken, SmartNotificationController);

// ===== ADMIN DASHBOARD =====
const adminRoutes = require('./adminRoutes');
router.use('/admin', authenticateToken, authorizeRole(['admin']), adminRoutes);

// ===== BLOG =====
const blogRoutes = require('./blogRoutes');
router.use('/blog', blogRoutes);

// ===== OAUTH 2.0 AUTHENTICATION =====
const OAuthController = require('../controllers/OAuthController');
router.use('/auth', OAuthController);

// ===== SWAGGER DOCUMENTATION =====
const swaggerRoutes = require('./swagger');
router.use('/', swaggerRoutes);

// ===== WEBHOOKS (Phase 3B) =====
const WebhookController = require('../controllers/WebhookController');
router.use('/webhooks', authenticateToken, WebhookController);

// ===== INTEGRATIONS (Phase 3B) =====
const IntegrationController = require('../controllers/IntegrationController');
router.use('/integrations', authenticateToken, IntegrationController);

// ===== ADVANCED PAYMENTS - Boleto, Apple Pay, Google Pay, PayPal, Subscriptions (Phase 3B) =====
const AdvancedPaymentController = require('../controllers/AdvancedPaymentController');
router.use('/payments/advanced', authenticateToken, AdvancedPaymentController);

// ===== ADVANCED EMAIL & SMS - Templates, Campaigns, A/B Testing (Phase 3B) =====
const AdvancedEmailController = require('../controllers/AdvancedEmailController');
router.use('/email', authenticateToken, AdvancedEmailController);

// ===== ADVANCED 2FA - Biometric, WebAuthn, Recovery Codes, Trusted Devices (Phase 3B) =====
const Advanced2FAController = require('../controllers/Advanced2FAController');
router.use('/2fa', Advanced2FAController);

// ===== STAFF AVAILABILITY - Real-time availability widget =====
const staffAvailabilityRoutes = require('./staffAvailabilityRoutes');
router.use('/staff', staffAvailabilityRoutes);

// ===== DYNAMIC PRICING =====
const PricingController = require('../controllers/PricingController');
router.post('/pricing/calculate', (req, res) => {
  PricingController.calculatePrice(req, res);
});
router.get('/pricing/simulate', (req, res) => {
  PricingController.simulatePriceOptions(req, res);
});

// ===== HOUR PACKAGING (Novos Endpoints Pagamento em Horas) =====
const hourPricingRoutes = require('./hourPricingRoutes');
router.use('/pricing', hourPricingRoutes);

// ===== INTELLIGENT RECOMMENDATIONS (CROSS-SELLING) =====
const RecommendationController = require('../controllers/RecommendationController');
router.get('/recommendations/smart', (req, res) => {
  RecommendationController.getSmartRecommendations(req, res);
});
router.get('/recommendations/popular', (req, res) => {
  RecommendationController.getPopularServices(req, res);
});
router.get('/recommendations/upsell', (req, res) => {
  RecommendationController.getUpsellRecommendations(req, res);
});
router.get('/recommendations/at-risk', authenticateToken, authorizeRole(['admin']), (req, res) => {
  RecommendationController.getAtRiskCustomers(req, res);
});

module.exports = router;

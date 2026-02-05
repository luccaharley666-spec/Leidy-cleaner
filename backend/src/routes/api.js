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
const AuthController = require('../controllers/AuthController');
const NotificationsController = require('../controllers/NotificationsController');

// Middleware
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateBookingData, validatePaymentData, validateReviewData } = require('../middleware/validation');

// ===== BOOKINGS =====
// ===== AUTH =====
router.post('/auth/register', (req, res) => {
  AuthController.register(req, res);
});

router.post('/auth/login', (req, res) => {
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

router.post('/bookings', authenticateToken, validateBookingData, (req, res) => {
  BookingController.createBooking(req, res);
});

// Upload de arquivos (fotos)
router.post('/uploads', authenticateToken, upload.array('photos', 8), (req, res) => {
  const files = req.files || [];
  const urls = files.map(f => ({ filename: f.filename, url: `${process.env.BASE_URL || ''}/uploads/${f.filename}` }));
  res.json({ success: true, files: urls });
});

router.get('/bookings/:userId', authenticateToken, (req, res) => {
  BookingController.getUserBookings(req, res);
});

router.put('/bookings/:bookingId', authenticateToken, (req, res) => {
  BookingController.updateBooking(req, res);
});

router.delete('/bookings/:bookingId', authenticateToken, (req, res) => {
  BookingController.cancelBooking(req, res);
});

// ===== PAYMENTS =====
router.post('/payments', authenticateToken, validatePaymentData, (req, res) => {
  PaymentController.processPayment(req, res);
});

router.get('/payments/:userId', authenticateToken, (req, res) => {
  PaymentController.getPaymentHistory(req, res);
});

router.post('/refunds', authenticateToken, authorizeRole(['admin']), (req, res) => {
  PaymentController.processRefund(req, res);
});

// PIX Payments
router.get('/payments/pix/:pixTransactionId', authenticateToken, (req, res) => {
  PaymentController.verifyPixPayment(req, res);
});

// ===== REVIEWS =====
router.post('/reviews', authenticateToken, validateReviewData, (req, res) => {
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

// ===== ADMIN DASHBOARD =====
const adminRoutes = require('./adminRoutes');
router.use('/admin', authenticateToken, authorizeRole(['admin']), adminRoutes);

// ===== BLOG =====
const blogRoutes = require('./blogRoutes');
router.use('/blog', blogRoutes);

module.exports = router;

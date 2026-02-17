/**
 * Example: How to integrate rate limits in Express routes
 */

const express = require('express');
const limiters = require('../middleware/applyRateLimits');

const router = express.Router();

// AUTH ROUTES WITH RATE LIMITS
router.post('/auth/login', limiters.loginLimiter, (req, res) => {
  // Handler code...
});

router.post('/auth/register', limiters.registerLimiter, (req, res) => {
  // Handler code...
});

router.post('/auth/reset-password', limiters.resetPasswordLimiter, (req, res) => {
  // Handler code...
});

// API ROUTES WITH RATE LIMITS
router.get('/api/users', limiters.apiReadLimiter, (req, res) => {
  // Handler code...
});

router.post('/api/users', limiters.apiWriteLimiter, (req, res) => {
  // Handler code...
});

router.get('/api/search', limiters.searchLimiter, (req, res) => {
  // Handler code...
});

// PAYMENT ROUTES WITH RATE LIMITS
router.post('/api/payments/checkout', limiters.checkoutLimiter, (req, res) => {
  // Handler code...
});

router.post('/api/webhooks/stripe', limiters.webhookLimiter, (req, res) => {
  // Handler code...
});

// ADMIN ROUTES
router.get('/admin/dashboard', limiters.adminLimiter, (req, res) => {
  // Handler code...
});

module.exports = router;

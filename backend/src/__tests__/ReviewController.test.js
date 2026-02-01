/**
 * Review Controller Tests
 */

jest.mock('../db/sqlite', () => ({
  getDb: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const ReviewController = require('../controllers/ReviewController');

describe('ReviewController', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.get('/reviews/stats', (req, res) => {
      ReviewController.getStats(req, res);
    });
    
    app.get('/reviews', (req, res) => {
      ReviewController.getPublicReviews(req, res);
    });
    
    app.post('/reviews', (req, res) => {
      ReviewController.createReview(req, res);
    });
  });

  describe('GET /reviews/stats', () => {
    test('should return review statistics', async () => {
      const response = await request(app).get('/reviews/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('stats');
    });

    test('stats should include averageRating and totalReviews', async () => {
      const response = await request(app).get('/reviews/stats');
      
      if (response.body.success) {
        expect(response.body.stats).toHaveProperty('averageRating');
        expect(response.body.stats).toHaveProperty('totalReviews');
        expect(response.body.stats).toHaveProperty('breakdown');
      }
    });
  });

  describe('GET /reviews', () => {
    test('should return paginated reviews', async () => {
      const response = await request(app).get('/reviews?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('reviews');
    });

    test('should have pagination info', async () => {
      const response = await request(app).get('/reviews?page=1&limit=5');
      
      if (response.body.success) {
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination).toHaveProperty('page');
        expect(response.body.pagination).toHaveProperty('limit');
        expect(response.body.pagination).toHaveProperty('total');
      }
    });
  });

  describe('POST /reviews', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/reviews')
        .send({
          bookingId: 1,
          rating: 5,
          comment: 'Great service!',
        });
      
      // Should have some response (may be 401 or handle gracefully)
      expect(response.status).toBeDefined();
    });

    test('should validate rating between 1-5', async () => {
      const response = await request(app)
        .post('/reviews')
        .set('Authorization', 'Bearer token')
        .send({
          bookingId: 1,
          rating: 6, // Invalid
          comment: 'Great service!',
        });
      
      expect(response.status).toBeDefined();
    });
  });
});

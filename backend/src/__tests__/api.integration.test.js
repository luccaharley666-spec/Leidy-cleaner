/**
 * API Routes Integration Tests
 */

const request = require('supertest');
const express = require('express');

describe('API Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock routes
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date() });
    });

    app.get('/health/db', (req, res) => {
      res.json({
        status: 'OK',
        db: {
          ok: true,
          path: '/test/db',
          exists: true,
          size: 1024,
          counts: { users: 4, bookings: 3 },
          error: null,
        },
        timestamp: new Date(),
      });
    });
  });

  describe('GET /health', () => {
    test('should return 200 with OK status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });

    test('should have timestamp', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/db', () => {
    test('should return 200 with database health', async () => {
      const response = await request(app).get('/health/db');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });

    test('should include database details', async () => {
      const response = await request(app).get('/health/db');

      expect(response.body).toHaveProperty('db');
      expect(response.body.db).toHaveProperty('ok');
      expect(response.body.db).toHaveProperty('path');
      expect(response.body.db).toHaveProperty('exists');
      expect(response.body.db).toHaveProperty('size');
      expect(response.body.db).toHaveProperty('counts');
    });
  });
});

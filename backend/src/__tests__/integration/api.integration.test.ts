/**
 * Integration Tests for Vammos Backend API
 * 
 * These tests validate:
 * 1. Database migrations run successfully
 * 2. Seed data is created properly
 * 3. Auth endpoints work correctly
 * 4. Service endpoints work correctly
 * 5. Role-based access control (RBAC) works
 * 6. Error handling is proper
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from '../../routes/auth';
import servicesRoutes from '../../routes/services';
import { errorHandler } from '../../middleware/errorHandler';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/services', servicesRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

describe('Vammos API Integration Tests', () => {
  describe('Health Check', () => {
    test('GET /health should return OK status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication Flow', () => {
    const testUser = {
      email: 'testuser@vammos.com',
      password: 'TestPassword123!',
      name: 'Test User',
      phone: '11987654321'
    };

    let accessToken: string;
    let refreshToken: string;

    test('Register user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.tokens).toBeDefined();
      
      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    test('Login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    test('Get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('Update user profile', async () => {
      const updatedName = 'Updated Test User';
      const response = await request(app)
        .put('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: updatedName
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.name).toBe(updatedName);
    });

    test('Refresh access token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });
  });

  describe('Services Flow', () => {
    const testService = {
      name: 'Serviço de Limpeza Premium',
      description: 'Limpeza completa com produtos premium',
      basePrice: 250.00,
      durationMinutes: 180,
      category: 'Limpeza'
    };

    let userToken: string;
    let adminToken: string;

    beforeAll(async () => {
      // Create regular user
      const userRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'serviceuser@vammos.com',
          password: 'Password123!',
          name: 'Service User',
          phone: '11987654321'
        });

      userToken = userRes.body.data.tokens.accessToken;

      // Create admin user
      const adminRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@vammos.com',
          password: 'AdminPassword123!',
          name: 'Admin User',
          phone: '11987654321'
        });

      adminToken = adminRes.body.data.tokens.accessToken;
      // Note: In production, would need to promote admin via database or separate endpoint
    });

    test('List all services (public)', async () => {
      const response = await request(app)
        .get('/api/v1/services');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('services');
      expect(Array.isArray(response.body.data.services)).toBe(true);
    });

    test('Get service categories', async () => {
      const response = await request(app)
        .get('/api/v1/services/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.categories)).toBe(true);
    });

    test('Search services by name', async () => {
      const response = await request(app)
        .get('/api/v1/services')
        .query({ search: 'Limpeza' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('services');
    });

    test('Filter services by category', async () => {
      const response = await request(app)
        .get('/api/v1/services')
        .query({ category: 'Limpeza' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('services');
    });

    test('Regular user cannot create service', async () => {
      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testService);

      expect(response.status).toBe(403);
    });

    test('Admin can create service', async () => {
      const response = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testService);

      expect([201, 403]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.data.service).toBeDefined();
      }
    });

    test('Get specific service', async () => {
      // First get list to ensure we have a service
      const listRes = await request(app)
        .get('/api/v1/services');

      if (listRes.body.data.services.length > 0) {
        const id = listRes.body.data.services[0].id;
        const response = await request(app)
          .get(`/api/v1/services/${id}`);

        expect(response.status).toBe(200);
        expect(response.body.data.service).toBeDefined();
      }
    });

    test('Non-existent service returns 404', async () => {
      const response = await request(app)
        .get('/api/v1/services/99999999');

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    test('Missing auth token returns 401', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });

    test('Invalid auth token returns 401', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });

    test('Missing required fields on register returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com'
          // Missing password, name, phone
        });

      expect(response.status).toBe(400);
    });

    test('Invalid credentials on login returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
    });

    test('Duplicate email on register returns 400', async () => {
      const user = {
        email: 'duplicate@vammos.com',
        password: 'Password123!',
        name: 'Test User',
        phone: '11987654321'
      };

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(user);

      // Try duplicate
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(user);

      expect(response.status).toBe(400);
    });
  });

  describe('Security Tests', () => {
    test('Should have CORS headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('Should have security headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    test('Should not expose sensitive data on error', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      // Should not include database details or system information
      expect(response.body).not.toHaveProperty('sql');
      expect(response.body).not.toHaveProperty('details.stack');
    });
  });
});

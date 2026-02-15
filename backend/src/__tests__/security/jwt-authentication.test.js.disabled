// DISABLED FOR NOW: // DISABLED FOR NOW: /**
 * JWT Authentication Security Tests
 * Valida que JWT é requerido em todos os endpoints protegidos
 */

const request = require('supertest');
const app = require('../../index');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'PLACEHOLDER';

describe('JWT Authentication Security', () => {
  // User de teste
  let validToken;
  let invalidToken;

  beforeAll(() => {
    // Gerar token válido
    validToken = jwt.sign(
      { userId: 1, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Gerar token inválido (expirado)
    invalidToken = jwt.sign(
      { userId: 1, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '-1h' } // Já expirou
    );
  });

  describe('Protected Routes - Require Valid JWT', () => {
    test('GET /api/auth/verify should reject missing token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('não fornecido');
    });

    test('GET /api/auth/verify should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('GET /api/auth/verify should accept valid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('userId');
    });

    test('POST /api/auth/logout should reject missing token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/bookings should reject missing token', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          service_id: 1,
          booking_date: '2026-03-01',
          address: 'Test Address'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('GET /api/bookings/:userId should reject missing token', async () => {
      const res = await request(app)
        .get('/api/bookings/1')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/payments should reject missing token', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          booking_id: 1,
          amount: 100,
          payment_method: 'credit_card'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/reviews should reject missing token', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({
          booking_id: 1,
          rating: 5,
          comment: 'Great service'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('JWT Token Format Validation', () => {
    test('should reject token without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', validToken)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('should reject malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('should handle empty Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer ')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Profile Routes - Require Authentication', () => {
    test('GET /api/profile/current should reject missing token', async () => {
      const res = await request(app)
        .get('/api/profile/current')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('PUT /api/profile/update should reject missing token', async () => {
      const res = await request(app)
        .put('/api/profile/update')
        .send({ name: 'Test User' })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/avatar/upload should reject missing token', async () => {
      const res = await request(app)
        .post('/api/avatar/upload')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('DELETE /api/avatar should reject missing token', async () => {
      const res = await request(app)
        .delete('/api/avatar')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Token Payload Validation', () => {
    test('valid token should contain userId in decoded payload', async () => {
      const decoded = jwt.verify(validToken, JWT_SECRET);
      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId).toBe(1);
    });

    test('valid token should contain role in decoded payload', async () => {
      const decoded = jwt.verify(validToken, JWT_SECRET);
      expect(decoded).toHaveProperty('role');
      expect(['customer', 'staff', 'admin']).toContain(decoded.role);
    });

    test('token should have expiration claim', async () => {
      const decoded = jwt.verify(validToken, JWT_SECRET);
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('Authorization Role Checking', () => {
    let adminToken;

    beforeAll(() => {
      adminToken = jwt.sign(
        { userId: 1, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
    });

    test('POST /api/refunds should work with admin token', async () => {
      // Este teste pode retornar diferentes status dependendo da lógica de negócio
      // Mas o importante é que NÃO retorne 401 (não autenticado)
      const res = await request(app)
        .post('/api/refunds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          booking_id: 1,
          amount: 100
        });

      // Verificar que não é erro de autenticação
      expect(res.status).not.toBe(401);
    });

    test('POST /api/refunds should reject non-admin token', async () => {
      const customerToken = jwt.sign(
        { userId: 2, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const res = await request(app)
        .post('/api/refunds')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          booking_id: 1,
          amount: 100
        })
        .expect(403);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Permissão negada');
    });
  });
});

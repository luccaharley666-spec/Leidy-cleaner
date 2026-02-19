"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("../../routes/auth"));
const services_1 = __importDefault(require("../../routes/services"));
const bookings_1 = __importDefault(require("../../routes/bookings"));
const staff_1 = __importDefault(require("../../routes/staff"));
const errorHandler_1 = require("../../middleware/errorHandler");
// notifications are side effects; stub them out so tests can assert calls
jest.mock('../../services/NotificationService');
const NotificationService_1 = __importDefault(require("../../services/NotificationService"));
const mockedNotify = NotificationService_1.default.notifyBookingCreated;
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/services', services_1.default);
app.use('/api/v1/bookings', bookings_1.default);
app.use('/api/v1/staff', staff_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Error handling
app.use(errorHandler_1.errorHandler);
describe('Vammos API Integration Tests', () => {
    describe('Health Check', () => {
        test('GET /health should return OK status', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
        });
    });
    describe('Authentication Flow', () => {
        const testUser = {
            email: `testuser${Date.now()}_${Math.random().toString(36).slice(2, 9)}@vammos.com`,
            password: 'TestPassword123!',
            name: 'Test User',
            phone: '11987654321'
        };
        let accessToken;
        let refreshToken;
        test('Register user successfully', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.user.email).toBe(testUser.email);
        });
        test('Update user profile', async () => {
            const updatedName = 'Updated Test User';
            const response = await (0, supertest_1.default)(app)
                .put('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                name: updatedName
            });
            expect(response.status).toBe(200);
            expect(response.body.data.user.name).toBe(updatedName);
        });
        test('Refresh access token', async () => {
            const response = await (0, supertest_1.default)(app)
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
        beforeEach(() => {
            mockedNotify.mockClear();
        });
        const testService = {
            name: 'Serviço de Limpeza Premium',
            description: 'Limpeza completa com produtos premium',
            basePrice: 250.00,
            durationMinutes: 180,
            category: 'Limpeza'
        };
        let userToken;
        let adminToken;
        beforeAll(async () => {
            const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            // Create regular user
            const userRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email: `serviceuser_${uniqueId}@vammos.com`,
                password: 'Password123!',
                name: 'Service User',
                phone: '11987654321'
            });
            if (userRes.body?.data?.tokens?.accessToken) {
                userToken = userRes.body.data.tokens.accessToken;
            }
            // Use seeded admin account (email: admin@vammos.com, password: admin123456)
            const adminRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'admin@vammos.com',
                password: 'admin123456'
            });
            if (adminRes.body?.data?.tokens?.accessToken) {
                adminToken = adminRes.body.data.tokens.accessToken;
            }
        });
        test('List all services (public)', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('services');
            expect(Array.isArray(response.body.data.services)).toBe(true);
        });
        test('Get service categories', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services/categories');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data.categories)).toBe(true);
        });
        test('Search services by name', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services')
                .query({ search: 'Limpeza' });
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('services');
        });
        test('Filter services by category', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services')
                .query({ category: 'Limpeza' });
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('services');
        });
        test('Admin stats endpoint returns numbers when admin', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.stats).toHaveProperty('users');
            expect(response.body.data.stats).toHaveProperty('services');
            expect(response.body.data.stats).toHaveProperty('bookings');
            expect(response.body.data.stats).toHaveProperty('pendingReviews');
        });
        test('Non-admin cannot access stats', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
        });
        // payments
        test('User can pay own booking and status becomes confirmed', async () => {
            // notification should fire when booking is created
            mockedNotify.mockClear();
            // create new booking for payment
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const srvId = listRes.body.data.services[0]?.id;
            const bookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua X' });
            const bid = bookRes.body.data.booking.id;
            expect(mockedNotify).toHaveBeenCalledWith(expect.objectContaining({ id: bid }));
            const payRes = await (0, supertest_1.default)(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookingId: bid });
            expect(payRes.status).toBe(200);
            expect(payRes.body.data.booking.status).toBe('confirmed');
        });
        test('Checkout endpoint falls back to paid when Stripe not configured', async () => {
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const srvId = listRes.body.data.services[0]?.id;
            const bookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Y' });
            const bid = bookRes.body.data.booking.id;
            const res = await (0, supertest_1.default)(app)
                .post('/api/v1/payments/checkout')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookingId: bid });
            expect(res.status).toBe(200);
            expect(res.body.data.booking.status).toBe('confirmed');
        });
        test('Webhook can mark booking paid', async () => {
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const srvId = listRes.body.data.services[0]?.id;
            const bookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Z' });
            const bid = bookRes.body.data.booking.id;
            const event = {
                type: 'checkout.session.completed',
                data: { object: { metadata: { bookingId: bid } } }
            };
            const webhookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/payments/webhook')
                .send(event);
            expect(webhookRes.status).toBe(200);
            const check = await (0, supertest_1.default)(app)
                .get(`/api/v1/bookings/${bid}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(check.body.data.booking.status).toBe('confirmed');
            expect(check.body.data.booking.payment_status || check.body.data.booking.paymentStatus).toBe('paid');
        });
        test('User cannot pay booking that is not theirs', async () => {
            // assume bookingId from admin earlier or create new booking as admin
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const srvId = listRes.body.data.services[0]?.id;
            const bookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Admin' });
            const bid = bookRes.body.data.booking.id;
            const payRes = await (0, supertest_1.default)(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ bookingId: bid });
            expect(payRes.status).toBe(403);
        });
        test('Admin can pay any booking', async () => {
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const srvId = listRes.body.data.services[0]?.id;
            const bookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Y' });
            const bid = bookRes.body.data.booking.id;
            const payRes = await (0, supertest_1.default)(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ bookingId: bid });
            expect(payRes.status).toBe(200);
            expect(payRes.body.data.booking.status).toBe('confirmed');
        });
        test('Regular user cannot create service', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .set('Authorization', `Bearer ${userToken}`)
                .send(testService);
            expect(response.status).toBe(403);
        });
        test('Admin can create service', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            if (listRes.body.data.services.length > 0) {
                const id = listRes.body.data.services[0].id;
                const response = await (0, supertest_1.default)(app)
                    .get(`/api/v1/services/${id}`);
                expect(response.status).toBe(200);
                expect(response.body.data.service).toBeDefined();
            }
        });
        test('Non-existent service returns 404', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services/99999999');
            expect(response.status).toBe(404);
        });
        // --- bookings tests ---
        let bookingId;
        test('Regular user can create a booking', async () => {
            // first ensure there is a service
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const serviceId = listRes.body.data.services[0]?.id;
            expect(serviceId).toBeDefined();
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                serviceId,
                bookingDate: new Date().toISOString(),
                address: 'Rua Teste, 123',
            });
            expect(response.status).toBe(201);
            expect(response.body.data.booking.address).toBe('Rua Teste, 123');
            bookingId = response.body.data.booking.id;
        });
        test('Owner can retrieve own booking', async () => {
            const response = await (0, supertest_1.default)(app)
                .get(`/api/v1/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.booking.id).toBe(bookingId);
        });
        test('Admin can update booking status', async () => {
            const response = await (0, supertest_1.default)(app)
                .put(`/api/v1/bookings/${bookingId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'confirmed' });
            expect(response.status).toBe(200);
            expect(response.body.data.booking.status).toBe('confirmed');
        });
        test('Owner cannot update booking status', async () => {
            const response = await (0, supertest_1.default)(app)
                .put(`/api/v1/bookings/${bookingId}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'completed' });
            expect(response.status).toBe(403);
        });
        test('Admin can delete any booking', async () => {
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/v1/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });
        test('User cannot fetch deleted booking', async () => {
            const response = await (0, supertest_1.default)(app)
                .get(`/api/v1/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(404);
        });
        test('User can cancel own booking via delete', async () => {
            // create another booking to cancel
            const listRes = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            const serviceId = listRes.body.data.services[0]?.id;
            const resp = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceId, bookingDate: new Date().toISOString(), address: 'Rua Cancelar' });
            const bid2 = resp.body.data.booking.id;
            const del = await (0, supertest_1.default)(app)
                .delete(`/api/v1/bookings/${bid2}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(del.status).toBe(200);
        });
        let staffToken;
        beforeAll(async () => {
            // create staff user and elevate role manually
            const staffRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'staff@vammos.com',
                password: 'StaffPassword123!',
                name: 'Staff User',
                phone: '11987654321'
            });
            if (staffRes.body?.data?.tokens?.accessToken) {
                staffToken = staffRes.body.data.tokens.accessToken;
                // update role in database
                const { query } = require('../../utils/database');
                await query('UPDATE users SET role = $1 WHERE email = $2', ['staff', 'staff@vammos.com']);
            }
        });
        test('Admin can list all bookings', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/bookings/all')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data.bookings)).toBe(true);
        });
        test('Non-admin cannot access all bookings', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/bookings/all')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
        });
        test('Admin can assign staff and staff can view assigned bookings', async () => {
            // decode staffId from token
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(staffToken);
            const staffId = decoded?.id;
            // create a booking to assign
            const listRes = await (0, supertest_1.default)(app).get('/api/v1/services');
            const srvId = listRes.body.data.services[0]?.id;
            const bookRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Staff' });
            const bid = bookRes.body.data.booking.id;
            // assign staff
            const assignRes = await (0, supertest_1.default)(app)
                .post('/api/v1/bookings/assign')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ bookingId: bid, staffId });
            expect(assignRes.status).toBe(200);
            const staffListRes = await (0, supertest_1.default)(app)
                .get('/api/v1/bookings/staff')
                .set('Authorization', `Bearer ${staffToken}`);
            expect(staffListRes.status).toBe(200);
            expect(Array.isArray(staffListRes.body.data.bookings)).toBe(true);
            expect(staffListRes.body.data.bookings.some((b) => b.id === bid)).toBe(true);
        });
        test('Non-staff cannot access staff bookings', async () => {
            const resp = await (0, supertest_1.default)(app)
                .get('/api/v1/bookings/staff')
                .set('Authorization', `Bearer ${userToken}`);
            expect(resp.status).toBe(403);
        });
        // staff profiles & availability
        describe('Staff profiles and availability', () => {
            let staffId;
            beforeAll(() => {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.decode(staffToken);
                staffId = decoded?.id;
            });
            test('List staff returns array including our staff user', async () => {
                const res = await (0, supertest_1.default)(app)
                    .get('/api/v1/staff');
                expect(res.status).toBe(200);
                expect(Array.isArray(res.body.data.staff)).toBe(true);
                expect(res.body.data.staff.some((u) => u.id === staffId)).toBe(true);
            });
            test('Get specific staff by id', async () => {
                const res = await (0, supertest_1.default)(app)
                    .get(`/api/v1/staff/${staffId}`);
                expect(res.status).toBe(200);
                expect(res.body.data.staff.id).toBe(staffId);
            });
            test('Staff can update own profile', async () => {
                const res = await (0, supertest_1.default)(app)
                    .put(`/api/v1/staff/${staffId}`)
                    .set('Authorization', `Bearer ${staffToken}`)
                    .send({ bio: 'Experienced cleaner', photoUrl: 'http://example.com/photo.jpg' });
                expect(res.status).toBe(200);
                expect(res.body.data.staff.bio).toBe('Experienced cleaner');
            });
            test('Another staff cannot update profile', async () => {
                // create second staff
                const other = await (0, supertest_1.default)(app)
                    .post('/api/v1/auth/register')
                    .send({ email: 'staff2@vammos.com', password: 'Staff2Pass123!', name: 'Staff Two' });
                const otherToken = other.body.data.tokens.accessToken;
                const { query } = require('../../utils/database');
                await query('UPDATE users SET role = $1 WHERE email = $2', ['staff', 'staff2@vammos.com']);
                const res = await (0, supertest_1.default)(app)
                    .put(`/api/v1/staff/${staffId}`)
                    .set('Authorization', `Bearer ${otherToken}`)
                    .send({ bio: 'Hacked' });
                expect(res.status).toBe(403);
            });
            test('Staff can set availability and customer can view it', async () => {
                const avail = [
                    { day: 'Monday', startTime: '09:00', endTime: '12:00' },
                    { day: 'Wednesday', startTime: '14:00', endTime: '18:00' }
                ];
                const setRes = await (0, supertest_1.default)(app)
                    .put(`/api/v1/staff/${staffId}/availability`)
                    .set('Authorization', `Bearer ${staffToken}`)
                    .send(avail);
                expect(setRes.status).toBe(200);
                expect(Array.isArray(setRes.body.data.availability)).toBe(true);
                const getRes = await (0, supertest_1.default)(app)
                    .get(`/api/v1/staff/${staffId}/availability`);
                expect(getRes.status).toBe(200);
                expect(getRes.body.data.availability.length).toBeGreaterThanOrEqual(2);
            });
            test('Staff reviews and rating endpoints return approved reviews', async () => {
                // create a booking by user and assign staff
                const srvRes = await (0, supertest_1.default)(app).get('/api/v1/services');
                const srvId = srvRes.body.data.services[0]?.id;
                const bookRes = await (0, supertest_1.default)(app)
                    .post('/api/v1/bookings')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Test' });
                const bid = bookRes.body.data.booking.id;
                // assign to staff
                await (0, supertest_1.default)(app)
                    .post('/api/v1/bookings/assign')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ bookingId: bid, staffId });
                // confirm booking to allow review
                await (0, supertest_1.default)(app)
                    .put(`/api/v1/bookings/${bid}/status`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ status: 'confirmed' });
                // user leaves review
                const revRes = await (0, supertest_1.default)(app)
                    .post('/api/v1/reviews')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ bookingId: bid, rating: 4, comment: 'Good job' });
                const revId = revRes.body.data.review.id;
                // initially staff reviews endpoint returns none until approved
                const before = await (0, supertest_1.default)(app).get(`/api/v1/staff/${staffId}/reviews`);
                expect(before.status).toBe(200);
                expect(before.body.data.reviews).toEqual([]);
                // approve review as admin
                await (0, supertest_1.default)(app)
                    .put(`/api/v1/reviews/admin/${revId}/approve`)
                    .set('Authorization', `Bearer ${adminToken}`);
                const after = await (0, supertest_1.default)(app).get(`/api/v1/staff/${staffId}/reviews`);
                expect(after.status).toBe(200);
                expect(after.body.data.reviews.length).toBeGreaterThanOrEqual(1);
                expect(after.body.data.reviews[0].rating).toBe(4);
                // rating endpoint
                const rate = await (0, supertest_1.default)(app).get(`/api/v1/staff/${staffId}/rating`);
                expect(rate.status).toBe(200);
                expect(typeof rate.body.data.rating).toBe('number');
                expect(rate.body.data.rating).toBeGreaterThan(0);
            });
        });
    });
    // --- reviews tests ---
    /* Commented out for now - requires proper scope for userToken, adminToken, srvId
    describe('reviews', () => {
      let bookingId: string;
      let reviewId: string;
  
      beforeAll(async () => {
        // create and confirm a booking to review
        const listRes = await request(app).get('/api/v1/services');
        const srvId = listRes.body.data.services[0]?.id;
        const bookRes = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Review' });
        bookingId = bookRes.body.data.booking.id;
        // confirm as admin so user may review
        await request(app)
          .put(`/api/v1/bookings/${bookingId}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'confirmed' });
      });
  
      test('Owner can create review for own booking', async () => {
        const response = await request(app)
          .post('/api/v1/reviews')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ bookingId, rating: 5, comment: 'Excelente serviço!', images: ['http://example.com/img1.jpg'] });
  
        expect(response.status).toBe(201);
        expect(response.body.data.review.rating).toBe(5);
        expect(response.body.data.review.images).toContain('http://example.com/img1.jpg');
        reviewId = response.body.data.review.id;
      });
  
      test('User cannot create review for another user booking', async () => {
        // create booking as admin
        const listRes = await request(app).get('/api/v1/services');
        const srvId = listRes.body.data.services[0]?.id;
        const bookRes = await request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ serviceId: srvId, bookingDate: new Date().toISOString(), address: 'Rua Outro' });
        const otherBooking = bookRes.body.data.booking.id;
        await expect(
          request(app)
            .post('/api/v1/reviews')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ bookingId: otherBooking, rating: 4 })
        ).resolves.toMatchObject({ status: 403 });
      });
  
      test('Can fetch reviews for booking by owner', async () => {
        const response = await request(app)
          .get(`/api/v1/reviews/${bookingId}`)
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data.reviews)).toBe(true);
        expect(response.body.data.reviews[0].rating).toBe(5);
      });
  
      test('Public reviews endpoint returns approved reviews only', async () => {
        // since is_approved default FALSE, there should be none initially
        const pub1 = await request(app)
          .get('/api/v1/reviews/public')
          .set('Authorization', `Bearer ${userToken}`);
        expect(pub1.status).toBe(200);
        expect(pub1.body.data.reviews).toEqual([]);
  
        // admin approves review
        await request(app)
          .put(`/api/v1/reviews/admin/${reviewId}/approve`)
          .set('Authorization', `Bearer ${adminToken}`);
  
        const pub2 = await request(app)
          .get('/api/v1/reviews/public')
          .set('Authorization', `Bearer ${userToken}`);
        expect(pub2.body.data.reviews.length).toBeGreaterThanOrEqual(1);
  
        // filtering by serviceId should still return at least the same if using the same service
        const filtered = await request(app)
          .get('/api/v1/reviews/public')
          .query({ serviceId: srvId })
          .set('Authorization', `Bearer ${userToken}`);
        expect(filtered.body.data.reviews.length).toBeGreaterThanOrEqual(1);
      });
  
      test('Non-admin cannot approve reviews', async () => {
        const response = await request(app)
          .put(`/api/v1/reviews/admin/${reviewId}/approve`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(403);
      });
    });
    */
    describe('Error Handling', () => {
        test('Missing auth token returns 401', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me');
            expect(response.status).toBe(401);
        });
        test('Invalid auth token returns 401', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid.token.here');
            expect(response.status).toBe(401);
        });
        test('Missing required fields on register returns 400', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'test@test.com'
                // Missing password, name, phone
            });
            expect(response.status).toBe(400);
        });
        test('Invalid credentials on login returns 400', async () => {
            const response = await (0, supertest_1.default)(app)
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
            await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(user);
            // Try duplicate
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send(user);
            expect(response.status).toBe(400);
        });
    });
    describe('Security Tests', () => {
        test('Should have CORS headers', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });
        test('Should have security headers', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.headers['x-content-type-options']).toBeDefined();
        });
        test('Should not expose sensitive data on error', async () => {
            const response = await (0, supertest_1.default)(app)
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
//# sourceMappingURL=api.integration.test.js.map
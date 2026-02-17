import request from 'supertest';
import express from 'express';
import authRoutes from '../auth';
import { errorHandler } from '../../middleware/errorHandler';
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);
describe('Auth Routes', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'newemail@test.com',
                password: 'password123',
                name: 'Test User',
                phone: '11999999999'
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('tokens');
            expect(response.body.data.tokens).toHaveProperty('accessToken');
            expect(response.body.data.tokens).toHaveProperty('refreshToken');
        });
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'test@test.com',
                password: 'password123'
            });
            expect(response.status).toBe(400);
        });
        it('should return 400 for duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'duplicate@test.com',
                password: 'password123',
                name: 'Test User',
                phone: '11999999999'
            });
            // Second registration with same email
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'duplicate@test.com',
                password: 'password123',
                name: 'Test User 2',
                phone: '11999999999'
            });
            expect(response.status).toBe(400);
        });
    });
    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create a user for login tests
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'login@test.com',
                password: 'password123',
                name: 'Login User',
                phone: '11999999999'
            });
        });
        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'login@test.com',
                password: 'password123'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('tokens');
            expect(response.body.data.tokens).toHaveProperty('accessToken');
            expect(response.body.data.tokens).toHaveProperty('refreshToken');
        });
        it('should return 400 for wrong password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'login@test.com',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(400);
        });
        it('should return 400 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'nonexistent@test.com',
                password: 'password123'
            });
            expect(response.status).toBe(400);
        });
    });
    describe('POST /api/v1/auth/refresh-token', () => {
        let refreshToken;
        beforeEach(async () => {
            // Create a user and get refresh token
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'refresh@test.com',
                password: 'password123',
                name: 'Refresh User',
                phone: '11999999999'
            });
            refreshToken = response.body.data.tokens.refreshToken;
        });
        it('should refresh token successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({
                refreshToken
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('tokens');
            expect(response.body.data.tokens).toHaveProperty('accessToken');
            expect(response.body.data.tokens).toHaveProperty('refreshToken');
        });
        it('should return 401 for invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({
                refreshToken: 'invalid_token'
            });
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/v1/auth/me', () => {
        let accessToken;
        beforeEach(async () => {
            // Create a user and get access token
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'profile@test.com',
                password: 'password123',
                name: 'Profile User',
                phone: '11999999999'
            });
            accessToken = response.body.data.tokens.accessToken;
        });
        it('should get user profile successfully', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('user');
        });
        it('should return 401 for missing access token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');
            expect(response.status).toBe(401);
        });
        it('should return 401 for invalid access token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid_token');
            expect(response.status).toBe(401);
        });
    });
    describe('PUT /api/v1/auth/me', () => {
        let accessToken;
        beforeEach(async () => {
            // Create a user and get access token
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'update@test.com',
                password: 'password123',
                name: 'Update User',
                phone: '11999999999'
            });
            accessToken = response.body.data.tokens.accessToken;
        });
        it('should update user profile successfully', async () => {
            const response = await request(app)
                .put('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                name: 'Updated Name'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.user.name).toBe('Updated Name');
        });
        it('should return 401 for missing access token', async () => {
            const response = await request(app)
                .put('/api/v1/auth/me')
                .send({
                name: 'Updated Name'
            });
            expect(response.status).toBe(401);
        });
    });
});
//# sourceMappingURL=auth.test.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../auth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/v1/auth', auth_1.default);
app.use(errorHandler_1.errorHandler);
const uniqueSuffix = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
describe('Auth Routes', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const email = `newemail+${uniqueSuffix()}@test.com`;
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email,
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
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email: 'test@test.com',
                password: 'password123'
            });
            expect(response.status).toBe(400);
        });
        it('should return 400 for duplicate email', async () => {
            const email = `duplicate+${uniqueSuffix()}@test.com`;
            // First registration
            await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email,
                password: 'password123',
                name: 'Test User',
                phone: '11999999999'
            });
            // Second registration with same email
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email,
                password: 'password123',
                name: 'Test User 2',
                phone: '11999999999'
            });
            expect(response.status).toBe(400);
        });
    });
    describe('POST /api/v1/auth/login', () => {
        let loginEmail;
        beforeEach(async () => {
            // Create a user for login tests
            loginEmail = `login+${uniqueSuffix()}@test.com`;
            await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email: loginEmail,
                password: 'password123',
                name: 'Login User',
                phone: '11999999999'
            });
        });
        it('should login successfully with correct credentials', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: loginEmail,
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
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/login')
                .send({
                email: 'login@test.com',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(400);
        });
        it('should return 400 for non-existent email', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const email = `refresh+${uniqueSuffix()}@test.com`;
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email,
                password: 'password123',
                name: 'Refresh User',
                phone: '11999999999'
            });
            refreshToken = response.body.data.tokens.refreshToken;
        });
        it('should refresh token successfully', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
            const email = `profile+${uniqueSuffix()}@test.com`;
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email,
                password: 'password123',
                name: 'Profile User',
                phone: '11999999999'
            });
            accessToken = response.body.data.tokens.accessToken;
        });
        it('should get user profile successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('user');
        });
        it('should return 401 for missing access token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me');
            expect(response.status).toBe(401);
        });
        it('should return 401 for invalid access token', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid_token');
            expect(response.status).toBe(401);
        });
    });
    describe('PUT /api/v1/auth/me', () => {
        let accessToken;
        beforeEach(async () => {
            // Create a user and get access token
            const email = `update+${uniqueSuffix()}@test.com`;
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/register')
                .send({
                email,
                password: 'password123',
                name: 'Update User',
                phone: '11999999999'
            });
            accessToken = response.body.data.tokens.accessToken;
        });
        it('should update user profile successfully', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .put('/api/v1/auth/me')
                .send({
                name: 'Updated Name'
            });
            expect(response.status).toBe(401);
        });
    });
});
//# sourceMappingURL=auth.test.js.map
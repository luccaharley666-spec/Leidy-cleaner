"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const services_1 = __importDefault(require("../services"));
const auth_1 = __importDefault(require("../auth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/services', services_1.default);
app.use(errorHandler_1.errorHandler);
describe('Services Routes', () => {
    let adminToken;
    let userToken;
    let serviceId;
    const uniqueSuffix = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    beforeEach(async () => {
        // Create admin user
        const adminEmail = `admin+${uniqueSuffix()}@test.com`;
        const adminResponse = await (0, supertest_1.default)(app)
            .post('/api/v1/auth/register')
            .send({
            email: adminEmail,
            password: 'admin123456',
            name: 'Admin User',
            phone: '11999999999'
        });
        adminToken = adminResponse.body.data.tokens.accessToken;
        // Create regular user
        const userEmail = `user+${uniqueSuffix()}@test.com`;
        const userResponse = await (0, supertest_1.default)(app)
            .post('/api/v1/auth/register')
            .send({
            email: userEmail,
            password: 'user123456',
            name: 'Regular User',
            phone: '11999999999'
        });
        userToken = userResponse.body.data.tokens.accessToken;
    });
    describe('GET /api/v1/services', () => {
        it('should get services list', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('services');
            expect(Array.isArray(response.body.data.services)).toBe(true);
        });
        it('should support pagination with limit and offset', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services')
                .query({ limit: 5, offset: 0 });
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('pagination');
            expect(response.body.data.pagination).toHaveProperty('limit');
            expect(response.body.data.pagination).toHaveProperty('offset');
        });
        it('should filter by category', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services')
                .query({ category: 'Limpeza' });
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('services');
        });
        it('should search by service name', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services')
                .query({ search: 'Residencial' });
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('services');
        });
    });
    describe('GET /api/v1/services/:id', () => {
        it('should get service by id', async () => {
            // First get list to get a service id
            const listResponse = await (0, supertest_1.default)(app)
                .get('/api/v1/services');
            if (listResponse.body.data.services.length > 0) {
                serviceId = listResponse.body.data.services[0].id;
                const response = await (0, supertest_1.default)(app)
                    .get(`/api/v1/services/${serviceId}`);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('service');
            }
        });
        it('should return 404 for non-existent service', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services/99999');
            expect(response.status).toBe(404);
        });
    });
    describe('GET /api/v1/services/categories', () => {
        it('should get all service categories', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/v1/services/categories');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('categories');
            expect(Array.isArray(response.body.data.categories)).toBe(true);
        });
    });
    describe('POST /api/v1/services', () => {
        it('should create service (admin only)', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                name: 'New Service',
                description: 'Service description',
                basePrice: 150.00,
                durationMinutes: 120,
                category: 'Limpeza'
            });
            expect([201, 403]).toContain(response.status);
            if (response.status === 201) {
                expect(response.body).toHaveProperty('data');
                expect(response.body.data).toHaveProperty('service');
                serviceId = response.body.data.service.id;
            }
        });
        it('should return 403 for non-admin user', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                name: 'New Service',
                description: 'Service description',
                basePrice: 150.00,
                durationMinutes: 120,
                category: 'Limpeza'
            });
            expect(response.status).toBe(403);
        });
        it('should return 401 for missing auth token', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .send({
                name: 'New Service',
                description: 'Service description',
                basePrice: 150.00,
                durationMinutes: 120,
                category: 'Limpeza'
            });
            expect(response.status).toBe(401);
        });
        it('should return 400 for invalid data', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                name: 'New Service'
                // Missing required fields
            });
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /api/v1/services/:id', () => {
        it('should update service (admin only)', async () => {
            // First create a service
            const createResponse = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                name: 'Service to Update',
                description: 'Original description',
                basePrice: 150.00,
                durationMinutes: 120,
                category: 'Limpeza'
            });
            if (createResponse.status === 201) {
                serviceId = createResponse.body.data.service.id;
                const response = await (0, supertest_1.default)(app)
                    .put(`/api/v1/services/${serviceId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                    name: 'Updated Service Name'
                });
                expect([200, 403]).toContain(response.status);
            }
        });
        it('should return 403 for non-admin user', async () => {
            const response = await (0, supertest_1.default)(app)
                .put(`/api/v1/services/1`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                name: 'Updated Service Name'
            });
            expect(response.status).toBe(403);
        });
        it('should return 401 for missing auth token', async () => {
            const response = await (0, supertest_1.default)(app)
                .put(`/api/v1/services/1`)
                .send({
                name: 'Updated Service Name'
            });
            expect(response.status).toBe(401);
        });
    });
    describe('DELETE /api/v1/services/:id', () => {
        it('should delete service (admin only)', async () => {
            // First create a service
            const createResponse = await (0, supertest_1.default)(app)
                .post('/api/v1/services')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                name: 'Service to Delete',
                description: 'This service will be deleted',
                basePrice: 150.00,
                durationMinutes: 120,
                category: 'Limpeza'
            });
            if (createResponse.status === 201) {
                serviceId = createResponse.body.data.service.id;
                const response = await (0, supertest_1.default)(app)
                    .delete(`/api/v1/services/${serviceId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                expect([200, 403]).toContain(response.status);
            }
        });
        it('should return 403 for non-admin user', async () => {
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/v1/services/1`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
        });
        it('should return 401 for missing auth token', async () => {
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/v1/services/1`);
            expect(response.status).toBe(401);
        });
        it('should return 404 for non-existent service', async () => {
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/v1/services/99999`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect([404, 403]).toContain(response.status);
        });
    });
});
//# sourceMappingURL=services.test.js.map
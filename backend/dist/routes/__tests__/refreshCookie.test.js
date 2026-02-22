"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("../auth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/v1/auth', auth_1.default);
app.use(errorHandler_1.errorHandler);
const uniqueSuffix = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
describe('Auth refresh via HttpOnly cookie', () => {
    it('should set HttpOnly cookie on register/login and refresh using cookie', async () => {
        const agent = supertest_1.default.agent(app);
        const email = `cookie+${uniqueSuffix()}@test.com`;
        // Register - should set cookie
        const regRes = await agent.post('/api/v1/auth/register').send({
            email,
            password: 'password123',
            name: 'Cookie User',
            phone: '11999999999'
        });
        expect(regRes.status).toBe(201);
        // Agent should store cookie; now call refresh endpoint without body
        const refreshRes = await agent.post('/api/v1/auth/refresh-token').send();
        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body).toHaveProperty('data');
        expect(refreshRes.body.data.tokens).toHaveProperty('accessToken');
        expect(refreshRes.body.data.tokens).toHaveProperty('refreshToken');
    });
    it('should accept refresh token from body when cookie absent', async () => {
        const email = `cookiebody+${uniqueSuffix()}@test.com`;
        // Create a plain app without cookie parser to simulate cookie absent
        const appNoCookie = (0, express_1.default)();
        appNoCookie.use(express_1.default.json());
        appNoCookie.use('/api/v1/auth', auth_1.default);
        appNoCookie.use(errorHandler_1.errorHandler);
        // Register to get tokens
        const reg = await (0, supertest_1.default)(appNoCookie).post('/api/v1/auth/register').send({
            email,
            password: 'password123',
            name: 'Cookie Body User',
            phone: '11999999999'
        });
        expect(reg.status).toBe(201);
        const refreshToken = reg.body.data.tokens.refreshToken;
        const res = await (0, supertest_1.default)(appNoCookie).post('/api/v1/auth/refresh-token').send({ refreshToken });
        expect(res.status).toBe(200);
        expect(res.body.data.tokens).toHaveProperty('accessToken');
        expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });
});
//# sourceMappingURL=refreshCookie.test.js.map
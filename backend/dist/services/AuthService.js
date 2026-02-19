"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../utils/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    static async register(email, password, name, phone) {
        // Check if user already exists
        const existingUsers = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUsers.length > 0) {
            throw (0, errorHandler_1.ApiError)('User with this email already exists', 400);
        }
        // Determine role: first registered user becomes admin when no admin exists
        const adminCheck = await (0, database_1.query)("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const roleToAssign = adminCheck[0].count === '0' || adminCheck[0].count === 0
            ? 'admin'
            : 'user';
        // Hash password
        const passwordHash = await (0, password_1.hashPassword)(password);
        // Create user
        const result = await (0, database_1.query)(`INSERT INTO users (email, password_hash, full_name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, full_name, phone, role, created_at`, [email, passwordHash, name, phone || null, roleToAssign]);
        const user = result[0];
        // Generate tokens
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(payload);
        logger_1.logger.info(`✅ User registered: ${email}`);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                phone: user.phone,
                role: user.role,
                bio: user.bio,
                photoUrl: user.photo_url,
            },
            accessToken,
            refreshToken,
        };
    }
    static async login(email, password) {
        // Get user by email
        const users = await (0, database_1.query)('SELECT id, email, full_name, phone, role, password_hash, bio, photo_url FROM users WHERE email = $1', [email]);
        if (users.length === 0) {
            throw (0, errorHandler_1.ApiError)('Invalid email or password', 400);
        }
        const user = users[0];
        // Verify password
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.ApiError)('Invalid email or password', 400);
        }
        // Generate tokens
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(payload);
        logger_1.logger.info(`✅ User logged in: ${email}`);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                phone: user.phone,
                role: user.role,
                bio: user.bio,
                photoUrl: user.photo_url,
            },
            accessToken,
            refreshToken,
        };
    }
    static async refreshToken(refreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.generateTokens)({
            id: payload.id,
            email: payload.email,
            role: payload.role,
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    static async getUserById(id) {
        const result = await (0, database_1.query)('SELECT id, email, full_name, phone, role, bio, photo_url, created_at, updated_at FROM users WHERE id = $1', [id]);
        return result.length > 0 ? result[0] : null;
    }
    static async updateUser(id, updates) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (updates.name) {
            fields.push(`full_name = $${paramCount++}`);
            values.push(updates.name);
        }
        if (updates.phone) {
            fields.push(`phone = $${paramCount++}`);
            values.push(updates.phone);
        }
        if (updates.bio !== undefined) {
            fields.push(`bio = $${paramCount++}`);
            values.push(updates.bio);
        }
        if (updates.photoUrl !== undefined) {
            fields.push(`photo_url = $${paramCount++}`);
            values.push(updates.photoUrl);
        }
        if (fields.length === 0) {
            return this.getUserById(id);
        }
        fields.push(`updated_at = NOW()`);
        values.push(id);
        const query_str = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await (0, database_1.query)(query_str, values);
        return result.length > 0 ? result[0] : null;
    }
    static async getUsersByRole(role) {
        const result = await (0, database_1.query)('SELECT id, email, full_name as name, phone, role, bio, photo_url as "photoUrl", created_at FROM users WHERE role = $1', [role]);
        return result;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map
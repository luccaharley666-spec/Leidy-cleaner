"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../utils/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const crypto_1 = __importDefault(require("crypto"));
const jwt_2 = require("../utils/jwt");
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
            : 'customer';
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
        // persist refresh token for revocation support
        await AuthService.saveRefreshToken(user.id, refreshToken);
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
        // persist refresh token
        await AuthService.saveRefreshToken(user.id, refreshToken);
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
        // verify token signature first
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // ensure token is not revoked
        const revoked = await AuthService.isRefreshTokenRevoked(refreshToken);
        if (revoked) {
            throw (0, errorHandler_1.ApiError)('Invalid refresh token', 401);
        }
        const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.generateTokens)({
            id: payload.id,
            email: payload.email,
            role: payload.role,
        });
        // save new refresh token and revoke old one
        await AuthService.saveRefreshToken(String(payload.id), newRefreshToken);
        await AuthService.revokeRefreshToken(refreshToken);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    static hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    static async saveRefreshToken(userId, token) {
        const tokenHash = AuthService.hashToken(token);
        const decoded = (0, jwt_2.decodeToken)(token) || {};
        const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;
        try {
            await (0, database_1.query)('INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked, created_at) VALUES ($1, $2, $3, false, NOW())', [userId, tokenHash, expiresAt]);
        }
        catch (err) {
            // ignore duplicate inserts
            logger_1.logger.debug('saveRefreshToken: insert error (possibly duplicate)', err);
        }
    }
    static async revokeRefreshToken(token) {
        const tokenHash = AuthService.hashToken(token);
        await (0, database_1.query)('UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1', [tokenHash]);
    }
    static async isRefreshTokenRevoked(token) {
        const tokenHash = AuthService.hashToken(token);
        const rows = await (0, database_1.query)('SELECT revoked, expires_at FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
        if (!rows || rows.length === 0)
            return true; // unknown tokens treated as revoked
        const row = rows[0];
        if (row.revoked)
            return true;
        if (row.expires_at) {
            const exp = new Date(row.expires_at);
            if (exp.getTime() < Date.now())
                return true;
        }
        return false;
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
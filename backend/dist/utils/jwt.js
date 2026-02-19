"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyRefreshToken = exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
const errorHandler_1 = require("../middleware/errorHandler");
const JWT_SECRET = (process.env.JWT_SECRET || 'dev_secret_key');
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret');
const JWT_EXPIRE = (process.env.JWT_EXPIRE || '24h');
const JWT_REFRESH_EXPIRE = (process.env.JWT_REFRESH_EXPIRE || '7d');
const generateTokens = (payload) => {
    try {
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRE,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRE,
        });
        return { accessToken, refreshToken };
    }
    catch (error) {
        logger_1.logger.error('Error generating tokens:', error);
        throw new Error('Failed to generate tokens');
    }
};
exports.generateTokens = generateTokens;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        logger_1.logger.error('Token verification failed:', error);
        throw (0, errorHandler_1.ApiError)('Invalid token', 401);
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    }
    catch (error) {
        logger_1.logger.error('Refresh token verification failed:', error);
        throw (0, errorHandler_1.ApiError)('Invalid refresh token', 401);
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        logger_1.logger.error('Error decoding token:', error);
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.js.map
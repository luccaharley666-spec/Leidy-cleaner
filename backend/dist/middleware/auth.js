"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.authorizeRole = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("./errorHandler");
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            throw (0, errorHandler_1.ApiError)('No token provided', 401);
        }
        const user = (0, jwt_1.verifyToken)(token);
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.warn('Authentication failed:', error);
        const err = error;
        res.status(err.status || 401).json({
            error: {
                message: err.message || 'Authentication failed',
                status: err.status || 401,
            },
        });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
            });
        }
        return next();
    };
};
exports.authorizeRole = authorizeRole;
exports.authenticate = exports.authenticateToken;
//# sourceMappingURL=auth.js.map
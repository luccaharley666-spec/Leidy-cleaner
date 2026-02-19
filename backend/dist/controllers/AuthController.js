"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const AuthService_1 = require("../services/AuthService");
const schemas_1 = require("../utils/schemas");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = schemas_1.registerSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    const { email, password, name, phone } = value;
    const result = await AuthService_1.AuthService.register(email, password, name, phone);
    res.status(201).json({
        message: 'User registered successfully',
        data: {
            user: result.user,
            tokens: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        },
    });
});
AuthController.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = schemas_1.loginSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    const { email, password } = value;
    const result = await AuthService_1.AuthService.login(email, password);
    res.status(200).json({
        message: 'User logged in successfully',
        data: {
            user: result.user,
            tokens: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        },
    });
});
AuthController.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = schemas_1.refreshTokenSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    const { refreshToken } = value;
    const tokens = await AuthService_1.AuthService.refreshToken(refreshToken);
    res.status(200).json({
        message: 'Token refreshed successfully',
        data: { tokens },
    });
});
AuthController.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    }
    const user = await AuthService_1.AuthService.getUserById(req.user.id);
    if (!user) {
        throw (0, errorHandler_1.ApiError)('User not found', 404);
    }
    // Map full_name to name for response
    const userResponse = {
        ...user,
        name: user.full_name,
    };
    delete userResponse.full_name;
    res.status(200).json({
        message: 'User profile retrieved',
        data: { user: userResponse },
    });
});
AuthController.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    }
    const { name, phone } = req.body;
    const user = await AuthService_1.AuthService.updateUser(req.user.id, { name, phone });
    if (!user) {
        throw (0, errorHandler_1.ApiError)('User not found', 404);
    }
    // Map full_name to name for response
    const userResponse = {
        ...user,
        name: user.full_name,
    };
    delete userResponse.full_name;
    res.status(200).json({
        message: 'User profile updated',
        data: { user: userResponse },
    });
});
// admin helper: list users by role (e.g. staff)
AuthController.listByRole = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can list users', 403);
    }
    const role = req.query.role || '';
    if (!role) {
        throw (0, errorHandler_1.ApiError)('Role query parameter required', 400);
    }
    const users = await AuthService_1.AuthService.getUsersByRole(role);
    res.status(200).json({ message: 'Users retrieved', data: { users } });
});
//# sourceMappingURL=AuthController.js.map
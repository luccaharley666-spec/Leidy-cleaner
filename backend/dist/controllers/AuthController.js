var _a;
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { AuthService } from '../services/AuthService';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/schemas';
export class AuthController {
}
_a = AuthController;
AuthController.register = asyncHandler(async (req, res) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
        throw ApiError(error.details[0].message, 400);
    }
    const { email, password, name, phone } = value;
    const result = await AuthService.register(email, password, name, phone);
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
AuthController.login = asyncHandler(async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        throw ApiError(error.details[0].message, 400);
    }
    const { email, password } = value;
    const result = await AuthService.login(email, password);
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
AuthController.refreshToken = asyncHandler(async (req, res) => {
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
        throw ApiError(error.details[0].message, 400);
    }
    const { refreshToken } = value;
    const tokens = await AuthService.refreshToken(refreshToken);
    res.status(200).json({
        message: 'Token refreshed successfully',
        data: { tokens },
    });
});
AuthController.getProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw ApiError('Not authenticated', 401);
    }
    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
        throw ApiError('User not found', 404);
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
AuthController.updateProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw ApiError('Not authenticated', 401);
    }
    const { name, phone } = req.body;
    const user = await AuthService.updateUser(req.user.id, { name, phone });
    if (!user) {
        throw ApiError('User not found', 404);
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
//# sourceMappingURL=AuthController.js.map
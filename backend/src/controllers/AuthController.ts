import { Response } from 'express';
import { AuthRequest, asyncHandler, ApiError } from '../middleware/errorHandler';
import { AuthService } from '../services/AuthService';
import { registerSchema, loginSchema } from '../utils/schemas';

export class AuthController {
  static register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      throw ApiError(error.details[0].message, 400);
    }

    const { email, password, name, phone } = value;

    const result = await AuthService.register(email, password, name, phone);

    // Set refresh token as HttpOnly cookie (also return tokens in body for backwards compatibility)
    const refreshCookieMaxAge = Number(process.env.JWT_REFRESH_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000; // 7 days default
    const cookieOptionsReg: any = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: (process.env.COOKIE_SAMESITE || 'lax') as any,
      maxAge: refreshCookieMaxAge,
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: process.env.COOKIE_PATH || '/',
    };
    res.cookie('refreshToken', result.refreshToken, cookieOptionsReg);

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

  static login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      throw ApiError(error.details[0].message, 400);
    }

    const { email, password } = value;

    const result = await AuthService.login(email, password);

    const refreshCookieMaxAge = Number(process.env.JWT_REFRESH_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000; // 7 days default
    const cookieOptionsLogin: any = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: (process.env.COOKIE_SAMESITE || 'lax') as any,
      maxAge: refreshCookieMaxAge,
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: process.env.COOKIE_PATH || '/',
    };
    res.cookie('refreshToken', result.refreshToken, cookieOptionsLogin);

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

  static refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Accept refresh token from body or HttpOnly cookie
    const refreshToken = (req.body && (req.body as any).refreshToken) || (req.cookies && (req.cookies as any).refreshToken);

    if (!refreshToken) {
      throw ApiError('Refresh token required', 400);
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    const refreshCookieMaxAge = Number(process.env.JWT_REFRESH_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000; // 7 days default
    const cookieOptionsRefresh: any = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: (process.env.COOKIE_SAMESITE || 'lax') as any,
      maxAge: refreshCookieMaxAge,
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: process.env.COOKIE_PATH || '/',
    };
    res.cookie('refreshToken', tokens.refreshToken, cookieOptionsRefresh);

    res.status(200).json({
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  });

  static logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Accept refresh token from body or HttpOnly cookie
    const refreshToken = (req.body && (req.body as any).refreshToken) || (req.cookies && (req.cookies as any).refreshToken);

    if (refreshToken) {
      try {
        await AuthService.revokeRefreshToken(refreshToken);
      } catch (err) {
        // ignore revoke errors
      }
    }

    // clear cookie
    const cookieOptionsLogout: any = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: (process.env.COOKIE_SAMESITE || 'lax') as any,
      maxAge: 0,
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: process.env.COOKIE_PATH || '/',
    };
    res.clearCookie('refreshToken', cookieOptionsLogout);

    res.status(200).json({ message: 'Logged out' });
  });

  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      name: (user as any).full_name,
    };
    delete (userResponse as any).full_name;

    res.status(200).json({
      message: 'User profile retrieved',
      data: { user: userResponse },
    });
  });

  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      name: (user as any).full_name,
    };
    delete (userResponse as any).full_name;

    res.status(200).json({
      message: 'User profile updated',
      data: { user: userResponse },
    });
  });

  // admin helper: list users by role (e.g. staff)
  static listByRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      throw ApiError('Only admins can list users', 403);
    }
    const role = (req.query.role as string) || '';
    if (!role) {
      throw ApiError('Role query parameter required', 400);
    }
    const users = await AuthService.getUsersByRole(role);
    res.status(200).json({ message: 'Users retrieved', data: { users } });
  });
}

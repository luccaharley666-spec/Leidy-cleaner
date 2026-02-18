import { query } from '../utils/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';
import { User, UserResponse, JWTPayload } from '../types/auth';

export class AuthService {
  static async register(
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUsers.length > 0) {
      throw ApiError('User with this email already exists', 400);
    }

    // Determine role: first registered user becomes admin when no admin exists
    const adminCheck = await query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const roleToAssign = ((adminCheck as any[])[0] as any).count === '0' || ((adminCheck as any[])[0] as any).count === 0
      ? 'admin'
      : 'user';

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, full_name, phone, role, created_at`,
      [email, passwordHash, name, phone || null, roleToAssign]
    );

    const user = result[0];

    // Generate tokens
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    logger.info(`✅ User registered: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    // Get user by email
    const users = await query(
      'SELECT id, email, full_name, phone, role, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      throw ApiError('Invalid email or password', 400);
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw ApiError('Invalid email or password', 400);
    }

    // Generate tokens
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    logger.info(`✅ User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = verifyRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );

    return result.length > 0 ? result[0] : null;
  }

  static async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.phone) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query_str = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(query_str, values);
    return result.length > 0 ? result[0] : null;
  }
}

import AuthService from '../services/AuthService';
import * as database from '../utils/database';
import * as password from '../utils/password';
import * as jwt from '../utils/jwt';

// Mock dependencies
jest.mock('../utils/database');
jest.mock('../utils/password');
jest.mock('../utils/jwt');

describe('AuthService', () => {
  const mockQuery = database.query as jest.MockedFunction<typeof database.query>;
  const mockHashPassword = password.hashPassword as jest.MockedFunction<typeof password.hashPassword>;
  const mockComparePassword = password.comparePassword as jest.MockedFunction<typeof password.comparePassword>;
  const mockGenerateTokens = jwt.generateTokens as jest.MockedFunction<typeof jwt.generateTokens>;
  const mockVerifyRefreshToken = jwt.verifyRefreshToken as jest.MockedFunction<typeof jwt.verifyRefreshToken>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '+55 11 98765-4321'
      };

      const hashedPassword = 'hashed_password_hash';
      const newUser = {
        id: 1,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: 'customer'
      };

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      };

      mockHashPassword.mockResolvedValueOnce(hashedPassword);
      mockQuery.mockResolvedValueOnce({ rows: [newUser] });
      mockGenerateTokens.mockReturnValueOnce(tokens);

      const result = await AuthService.register(userData.email, userData.password, userData.full_name, userData.phone);

      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockGenerateTokens).toHaveBeenCalled();
      expect(result).toEqual({
        user: newUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '+55 11 98765-4321'
      };

      // Check for existing user
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, email: userData.email }] });

      const result = AuthService.register(userData.email, userData.password, userData.full_name, userData.phone);

      // The service should check for existing user first
      await expect(result).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should return user and tokens on successful login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = {
        id: 1,
        email: credentials.email,
        password_hash: 'hashed_password_hash',
        full_name: 'Test User',
        role: 'customer'
      };

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      };

      mockQuery.mockResolvedValueOnce({ rows: [user] });
      mockComparePassword.mockResolvedValueOnce(true);
      mockGenerateTokens.mockReturnValueOnce(tokens);

      const result = await AuthService.login(credentials.email, credentials.password);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [credentials.email]
      );
      expect(mockComparePassword).toHaveBeenCalledWith(credentials.password, user.password_hash);
      expect(mockGenerateTokens).toHaveBeenCalled();
      expect(result).toEqual({
        user: expect.objectContaining({ email: credentials.email }),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    });

    it('should throw error if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = AuthService.login('nonexistent@example.com', 'password123');

      await expect(result).rejects.toThrow();
    });

    it('should throw error if password is incorrect', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password_hash',
        full_name: 'Test User',
        role: 'customer'
      };

      mockQuery.mockResolvedValueOnce({ rows: [user] });
      mockComparePassword.mockResolvedValueOnce(false);

      const result = AuthService.login('test@example.com', 'wrongpassword');

      await expect(result).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token from refresh token', async () => {
      const refreshToken = 'refresh_token';
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };

      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };

      mockVerifyRefreshToken.mockReturnValueOnce(payload);
      mockGenerateTokens.mockReturnValueOnce(newTokens);

      const result = await AuthService.refreshToken(refreshToken);

      expect(mockVerifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockGenerateTokens).toHaveBeenCalled();
      expect(result).toEqual(newTokens);
    });

    it('should throw error if refresh token is invalid', async () => {
      mockVerifyRefreshToken.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = AuthService.refreshToken('invalid_token');

      await expect(result).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '+55 11 98765-4321',
        role: 'customer'
      };

      mockQuery.mockResolvedValueOnce({ rows: [user] });

      const result = await AuthService.getUserById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await AuthService.getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const userId = 1;
      const updates = {
        full_name: 'Updated Name',
        phone: '+55 11 91234-5678'
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        full_name: updates.full_name,
        phone: updates.phone,
        role: 'customer'
      };

      mockQuery.mockResolvedValueOnce({ rows: [updatedUser] });

      const result = await AuthService.updateUser(userId, updates.full_name, updates.phone);

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });
  });
});

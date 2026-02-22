import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', authenticateToken, AuthController.getProfile);
router.put('/me', authenticateToken, AuthController.updateProfile);

// Admin route to list users by role (e.g. ?role=staff)
router.get('/users', authenticateToken, AuthController.listByRole);

export default router;

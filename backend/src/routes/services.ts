import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ServiceController.getAll);
router.get('/categories', ServiceController.getCategories);
router.get('/:id', ServiceController.getById);

// Protected routes (admin only)
router.post('/', authenticateToken, ServiceController.create);
router.put('/:id', authenticateToken, ServiceController.update);
router.delete('/:id', authenticateToken, ServiceController.delete);

export default router;

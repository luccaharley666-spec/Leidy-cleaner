import { Router } from 'express';
import CompanyController from '../controllers/CompanyController';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Public endpoint for company info
router.get('/', CompanyController.getInfo);

// Admin endpoint to update company information
router.put('/', authenticate, authorizeRole('admin'), CompanyController.upsert);

export default router;

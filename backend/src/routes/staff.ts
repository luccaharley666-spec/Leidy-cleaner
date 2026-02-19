import { Router } from 'express';
import { StaffController } from '../controllers/StaffController';
import { authenticate } from '../middleware/auth';

const router = Router();

// public listing
router.get('/', StaffController.list);
router.get('/:id', StaffController.getById);

// protected profile updates and availability
router.put('/:id', authenticate, StaffController.updateProfile);
router.get('/:id/availability', authenticate, StaffController.getAvailability);
router.put('/:id/availability', authenticate, StaffController.setAvailability);

// reviews & rating (public)
router.get('/:id/reviews', StaffController.getReviews);
router.get('/:id/rating', StaffController.getRating);

export default router;

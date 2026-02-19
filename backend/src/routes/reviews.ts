import { Router, Request } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

// configure multer storage
const storage = multer.diskStorage({
  destination: function (_req: Request, _file: any, cb: any) {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'reviews'));
  },
  filename: function (_req: Request, _file: any, cb: any) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(_file.originalname);
    cb(null, _file.fieldname + '-' + unique + ext);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// public routes (no authentication needed)
router.get('/public', ReviewController.getPublic);

// all routes below require authentication
router.use(authenticate);

router.post('/', ReviewController.create);
router.get('/:bookingId', ReviewController.getByBooking);

// allow image uploads for a given review id (owner or admin)
router.post('/:id/images', upload.array('images', 5), ReviewController.uploadImages);

// admin only
router.get('/admin/all', ReviewController.listAll);
router.put('/admin/:id/approve', ReviewController.approve);
router.delete('/admin/:id', ReviewController.delete);

export default router;

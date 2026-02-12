/**
 * Review Image Controller
 * Endpoints para upload de imagens em reviews
 */

const express = require('express');
const router = express.Router();
const ReviewImageService = require('../services/ReviewImageService');
const multer = require('multer');

// Configurar multer para upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas JPG, PNG e WebP são permitidos'));
    }
  }
});

// POST /api/reviews/images/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { reviewId } = req.body;
    const imageFile = {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    };

    const image = await ReviewImageService.uploadReviewImage(reviewId, imageFile);
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/reviews/:reviewId/images
router.get('/:reviewId/images', async (req, res) => {
  try {
    const images = await ReviewImageService.getReviewImages(req.params.reviewId);
    res.json(images);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/reviews/images/:imageId
router.delete('/images/:imageId', async (req, res) => {
  try {
    const result = await ReviewImageService.deleteReviewImage(req.params.imageId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reviews/:reviewId/images/reorder
router.post('/:reviewId/images/reorder', async (req, res) => {
  try {
    const { imageOrder } = req.body;
    const result = await ReviewImageService.reorderImages(req.params.reviewId, imageOrder);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/services/:serviceId/gallery
router.get('/gallery/:serviceId', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const gallery = await ReviewImageService.getServiceGallery(req.params.serviceId, parseInt(limit));
    res.json(gallery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/services/:serviceId/gallery/before-after
router.get('/gallery/:serviceId/before-after', async (req, res) => {
  try {
    const gallery = await ReviewImageService.getBeforeAfterGallery(req.params.serviceId);
    res.json(gallery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/reviews/images/stats/:serviceId
router.get('/stats/:serviceId', async (req, res) => {
  try {
    const stats = await ReviewImageService.getImageStats(req.params.serviceId);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

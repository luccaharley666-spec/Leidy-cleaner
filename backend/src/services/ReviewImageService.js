/**
 * Review Image Service
 * Gerenciar imagens em reviews, validação, processamento, galeria
 */

const logger = require('../utils/logger');

class ReviewImageService {
  constructor() {
    this.reviewImages = new Map();
    this.imageProcessing = new Map();
    this.galleries = new Map();
  }

  /**
   * Upload de imagem para review
   */
  async uploadReviewImage(reviewId, imageFile) {
    try {
      const {
        filename,
        mimetype,
        size,
        buffer
      } = imageFile;

      // Validar tipo e tamanho
      if (!this.isValidImageType(mimetype)) {
        throw new Error('Tipo de arquivo inválido. Use JPG, PNG ou WebP');
      }

      if (size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Arquivo muito grande. Máximo 10MB');
      }

      const imageId = `img_${Date.now()}`;
      const image = {
        id: imageId,
        reviewId,
        originalFilename: filename,
        mimetype,
        size,
        uploadedAt: new Date(),
        status: 'processing',
        versions: {
          original: {
            url: `/uploads/reviews/${imageId}/original.${this.getFileExtension(mimetype)}`,
            width: 0,
            height: 0
          },
          thumbnail: {
            url: `/uploads/reviews/${imageId}/thumbnail.webp`,
            width: 150,
            height: 150
          },
          optimized: {
            url: `/uploads/reviews/${imageId}/optimized.webp`,
            width: 800,
            height: 600
          }
        }
      };

      this.reviewImages.set(imageId, image);

      // Iniciar processamento
      this.processImage(imageId, buffer);

      logger.log({
        level: 'info',
        message: 'Review image uploaded',
        reviewId,
        imageId,
        size: `${(size / 1024 / 1024).toFixed(2)}MB`
      });

      return image;
    } catch (error) {
      logger.error('Image upload failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Processar imagem (redimensionar, otimizar)
   */
  async processImage(imageId, buffer) {
    const image = this.reviewImages.get(imageId);
    if (!image) return;

    try {
      // Simular processamento
      const processing = {
        imageId,
        startedAt: new Date(),
        status: 'in_progress'
      };

      this.imageProcessing.set(imageId, processing);

      // Simulado: em produção usar Sharp ou ImageMagick
      setTimeout(() => {
        image.status = 'completed';
        image.processedAt = new Date();
        image.versions.original = {
          ...image.versions.original,
          width: 4000,
          height: 3000,
          size: buffer.length
        };
        image.versions.thumbnail.size = Math.floor(buffer.length / 10);
        image.versions.optimized.size = Math.floor(buffer.length / 5);

        processing.status = 'completed';
        processing.completedAt = new Date();

        logger.log({
          level: 'info',
          message: 'Image processing completed',
          imageId,
          duration: 'auto'
        });
      }, 500);
    } catch (error) {
      logger.error('Image processing failed', { error: error.message });
      image.status = 'failed';
    }
  }

  /**
   * Obter imagens de um review
   */
  async getReviewImages(reviewId) {
    const images = Array.from(this.reviewImages.values())
      .filter(img => img.reviewId === reviewId)
      .map(img => ({
        id: img.id,
        status: img.status,
        uploadedAt: img.uploadedAt,
        urls: img.versions
      }));

    return {
      reviewId,
      images,
      count: images.length
    };
  }

  /**
   * Deletar imagem de review
   */
  async deleteReviewImage(imageId) {
    const image = this.reviewImages.get(imageId);
    if (!image) throw new Error('Imagem não encontrada');

    image.deletedAt = new Date();
    image.status = 'deleted';

    logger.log({
      level: 'info',
      message: 'Review image deleted',
      imageId
    });

    return { deleted: true };
  }

  /**
   * Reordenar imagens
   */
  async reorderImages(reviewId, imageOrder) {
    return {
      reviewId,
      order: imageOrder,
      reorderedAt: new Date().toISOString()
    };
  }

  /**
   * Obter galeria de serviço (reviews com imagens)
   */
  async getServiceGallery(serviceId, limit = 20) {
    // Simulado
    const galleryId = `gal_${serviceId}`;
    const gallery = {
      id: galleryId,
      serviceId,
      images: [
        {
          id: 'img_1',
          thumbnailUrl: '/uploads/reviews/img_1/thumbnail.webp',
          fullUrl: '/uploads/reviews/img_1/optimized.webp',
          reviewerName: 'João Silva',
          rating: 5,
          uploadedAt: new Date()
        },
        {
          id: 'img_2',
          thumbnailUrl: '/uploads/reviews/img_2/thumbnail.webp',
          fullUrl: '/uploads/reviews/img_2/optimized.webp',
          reviewerName: 'Maria Santos',
          rating: 4,
          uploadedAt: new Date()
        }
      ],
      totalImages: 2,
      coverImage: 'img_1'
    };

    this.galleries.set(galleryId, gallery);
    return gallery;
  }

  /**
   ✅ NOVO: Obter galeria antes/depois
   */
  async [REDACTED_TOKEN](serviceId) {
    return {
      serviceId,
      beforeAfterPairs: [
        {
          id: 'pair_1',
          before: {
            url: '/uploads/reviews/before_1/optimized.webp',
            uploadedAt: new Date(Date.now() - 86400000)
          },
          after: {
            url: '/uploads/reviews/after_1/optimized.webp',
            uploadedAt: new Date()
          },
          reviewerName: 'João Silva',
          serviceDate: '2024-01-15'
        },
        {
          id: 'pair_2',
          before: {
            url: '/uploads/reviews/before_2/optimized.webp'
          },
          after: {
            url: '/uploads/reviews/after_2/optimized.webp'
          },
          reviewerName: 'Maria Santos',
          serviceDate: '2024-01-20'
        }
      ]
    };
  }

  /**
   * Validar tipo de arquivo
   */
  isValidImageType(mimetype) {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype);
  }

  /**
   * Obter extensão de arquivo
   */
  getFileExtension(mimetype) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    return extensions[mimetype] || 'jpg';
  }

  /**
   * Obter estatísticas de imagens
   */
  async getImageStats(serviceId) {
    const images = Array.from(this.reviewImages.values());
    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);

    return {
      serviceId,
      totalImages: images.length,
      totalStorage: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      averageSize: `${(totalSize / Math.max(1, images.length) / 1024 / 1024).toFixed(2)}MB`,
      statusBreakdown: {
        completed: images.filter(i => i.status === 'completed').length,
        processing: images.filter(i => i.status === 'processing').length,
        failed: images.filter(i => i.status === 'failed').length
      }
    };
  }
}

module.exports = new ReviewImageService();

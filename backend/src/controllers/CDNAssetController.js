/**
 * CDN Asset Controller
 * Endpoints para otimização de assets e geração de URLs otimizadas
 */

const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

class CDNAssetController {
  /**
   * POST /api/cdn/optimize-image
   * Gerar URL otimizada para imagem
   */
  static async optimizeImage(req, res) {
    try {
      const { imagePath, width, height, quality, format } = req.body;

      if (!imagePath) {
        return res.status(400).json({ error: 'imagePath é obrigatória' });
      }

      const optimizedUrl = [REDACTED_TOKEN].[REDACTED_TOKEN](
        imagePath,
        { width, height, quality, format }
      );

      return res.json({
        success: true,
        original: imagePath,
        optimized: optimizedUrl,
        sizes: {
          responsive: [REDACTED_TOKEN].[REDACTED_TOKEN](imagePath),
          placeholder: [REDACTED_TOKEN].generateLQIPUrl(imagePath)
        }
      });
    } catch (error) {
      logger.error('Error optimizing image', { error: error.message });
      return res.status(500).json({ error: 'Falha ao otimizar imagem' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/responsive-image
   * Gerar responsive image set com srcset
   */
  static async getResponsiveImage(req, res) {
    try {
      const { imagePath } = req.query;

      if (!imagePath) {
        return res.status(400).json({ error: 'imagePath é obrigatória' });
      }

      const responsiveSet = [REDACTED_TOKEN].[REDACTED_TOKEN](imagePath);

      return res.json({
        success: true,
        image: {
          srcset: responsiveSet.srcset,
          sizes: responsiveSet.sizes,
          src: responsiveSet.defaultSrc,
          alt: req.query.alt || 'Image'
        },
        htmlTag: [REDACTED_TOKEN].[REDACTED_TOKEN](
          imagePath,
          req.query.alt || 'Image'
        )
      });
    } catch (error) {
      logger.error('Error generating responsive image', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar imagem responsiva' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/placeholder
   * Gerar LQIP (Low Quality Image Placeholder)
   */
  static async getPlaceholder(req, res) {
    try {
      const { imagePath } = req.query;

      if (!imagePath) {
        return res.status(400).json({ error: 'imagePath é obrigatória' });
      }

      const placeholder = [REDACTED_TOKEN].generateLQIPUrl(imagePath);

      return res.json({
        success: true,
        placeholder,
        message: 'Use this as data-placeholder while loading full image'
      });
    } catch (error) {
      logger.error('Error generating placeholder', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar placeholder' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/bandwidth-savings
   * Calcular economia de banda
   */
  static async getBandwidthSavings(req, res) {
    try {
      const savings = [REDACTED_TOKEN].[REDACTED_TOKEN]();

      return res.json({
        success: true,
        data: savings
      });
    } catch (error) {
      logger.error('Error calculating bandwidth savings', { error: error.message });
      return res.status(500).json({ error: 'Falha ao calcular economia' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/manifest
   * Obter manifesto de todos os assets
   */
  static async getAssetManifest(req, res) {
    try {
      const publicPath = process.env.PUBLIC_PATH || './public';
      const manifest = await [REDACTED_TOKEN].[REDACTED_TOKEN](publicPath);

      return res.json({
        success: true,
        manifest
      });
    } catch (error) {
      logger.error('Error generating asset manifest', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar manifesto' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/cache-headers
   * Obter headers recomendados de cache
   */
  static async getCacheHeaders(req, res) {
    try {
      const { fileType = 'image' } = req.query;
      const headers = [REDACTED_TOKEN].getCacheHeaders(fileType);

      return res.json({
        success: true,
        fileType,
        headers,
        ttl: {
          image: '1 year',
          stylesheet: '30 days',
          script: '7 days'
        }
      });
    } catch (error) {
      logger.error('Error getting cache headers', { error: error.message });
      return res.status(500).json({ error: 'Falha ao obter headers' });
    }
  }

  /**
   ✅ NOVO: POST /api/cdn/preload-resources
   * Gerar tags de preload para recursos críticos
   */
  static async generatePreloadTags(req, res) {
    try {
      const { assets } = req.body;

      if (!Array.isArray(assets)) {
        return res.status(400).json({ error: 'assets deve ser um array' });
      }

      const preloadTags = [REDACTED_TOKEN].generatePreloadTags(assets);

      return res.json({
        success: true,
        html: preloadTags,
        note: 'Include these tags in your HTML <head> section'
      });
    } catch (error) {
      logger.error('Error generating preload tags', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar tags' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/image-sitemap
   * Gerar image sitemap para SEO
   */
  static async getImageSitemap(req, res) {
    try {
      const assets = req.body.assets || [];
      const sitemap = await [REDACTED_TOKEN].[REDACTED_TOKEN](assets);

      res.setHeader('Content-Type', 'application/xml');
      return res.send(JSON.stringify(sitemap, null, 2));
    } catch (error) {
      logger.error('Error generating image sitemap', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar sitemap' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/image-performance/:imageId
   * Medir performance de imagem
   */
  static async [REDACTED_TOKEN](req, res) {
    try {
      const { imageId } = req.params;
      const imageUrl = `/images/${imageId}`;

      const performance = await [REDACTED_TOKEN].[REDACTED_TOKEN](imageUrl);

      return res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error('Error measuring image performance', { error: error.message });
      return res.status(500).json({ error: 'Falha ao medir performance' });
    }
  }

  /**
   ✅ NOVO: GET /api/cdn/optimization-report
   * Obter relatório completo de otimização
   */
  static async [REDACTED_TOKEN](req, res) {
    try {
      const report = [REDACTED_TOKEN].[REDACTED_TOKEN]();

      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error generating optimization report', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar relatório' });
    }
  }
}

module.exports = CDNAssetController;

/**
 * CDN & Asset Optimizer Service
 * Compressão de imagens, WebP, lazy loading, e integração com CDN
 */

const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class [REDACTED_TOKEN] {
  constructor() {
    this.cdnUrl = process.env.CDN_URL || 'https://cdn.example.com';
    this.assetCache = new Map();
    this.compressionStats = {
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      filesProcessed: 0,
      averageCompression: 0
    };
  }

  /**
   * Validate CDN URL
   */
  validateCdnUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   ✅ NOVO: Gerar URL otimizada para imagem
   * Suporta width, height, format (webp, jpeg, png), quality
   */
  [REDACTED_TOKEN](imagePath, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover'
    } = options;

    // Construir query string para CDN
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('f', format);
    params.append('fit', fit);

    const optimizedUrl = `${this.cdnUrl}${imagePath}?${params.toString()}`;
    
    logger.log({
      level: 'info',
      message: 'Optimized image URL generated',
      original: imagePath,
      optimized: optimizedUrl
    });

    return optimizedUrl;
  }

  /**
   ✅ NOVO: Gerar srcset para responsive images
   */
  [REDACTED_TOKEN](imagePath, options = {}) {
    const sizes = [320, 640, 1024, 1920];
    const qualityBySize = {
      320: 70,  // Mobile
      640: 75,  // Tablet
      1024: 80, // Desktop
      1920: 85  // High res
    };

    const srcset = sizes
      .map(size => {
        const url = this.[REDACTED_TOKEN](imagePath, {
          width: size,
          quality: qualityBySize[size],
          format: 'webp'
        });
        return `${url} ${size}w`;
      })
      .join(',\n');

    return {
      srcset,
      sizes: '(max-width: 320px) 100vw, (max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
      defaultSrc: this.[REDACTED_TOKEN](imagePath, { quality: 80 })
    };
  }

  /**
   ✅ NOVO: Gerar placeholder (LQIP - Low Quality Image Placeholder)
   */
  generateLQIPUrl(imagePath) {
    // Gerar versão ultra-comprimida para placeholder
    return this.[REDACTED_TOKEN](imagePath, {
      width: 50,
      height: 50,
      quality: 20,
      format: 'webp'
    });
  }

  /**
   ✅ NOVO: Calcular economia de banda
   */
  [REDACTED_TOKEN]() {
    if (this.compressionStats.filesProcessed === 0) {
      return {
        savings: 0,
        percentage: 0,
        filesProcessed: 0
      };
    }

    const savings = this.compressionStats.totalOriginalSize - 
                   this.compressionStats.totalCompressedSize;
    const percentage = (savings / this.compressionStats.totalOriginalSize) * 100;

    return {
      originalSize: `${(this.compressionStats.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`,
      compressedSize: `${(this.compressionStats.totalCompressedSize / 1024 / 1024).toFixed(2)} MB`,
      savings: `${(savings / 1024 / 1024).toFixed(2)} MB`,
      savingsPercentage: `${percentage.toFixed(2)}%`,
      filesProcessed: this.compressionStats.filesProcessed,
      averageCompression: `${this.compressionStats.averageCompression.toFixed(2)}%`
    };
  }

  /**
   ✅ NOVO: Gerar tag HTML com lazy loading
   */
  [REDACTED_TOKEN](imagePath, alt = '', options = {}) {
    const responsive = this.[REDACTED_TOKEN](imagePath, options);
    const lqip = this.generateLQIPUrl(imagePath);

    return `
      <picture>
        <source 
          srcset="${responsive.srcset}"
          sizes="${responsive.sizes}"
          type="image/webp">
        <img 
          src="${responsive.defaultSrc}"
          alt="${alt}"
          loading="lazy"
          decoding="async"
          data-placeholder="${lqip}"
          class="lazy-load-image">
      </picture>
    `;
  }

  /**
   ✅ NOVO: Gerar manifesto de assets
   */
  async [REDACTED_TOKEN](publicPath) {
    try {
      const manifest = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        assets: [],
        cdn: this.cdnUrl,
        stats: this.compressionStats
      };

      // Ler diretório de assets
      try {
        const files = await fs.readdir(publicPath, { recursive: true });
        
        for (const file of files) {
          if (file.endsWith('.png') || file.endsWith('.jpg') || 
              file.endsWith('.webp') || file.endsWith('.svg')) {
            const filePath = path.join(publicPath, file);
            const stat = await fs.stat(filePath);
            
            manifest.assets.push({
              path: `/${file}`,
              size: stat.size,
              mtime: stat.mtime,
              optimizedUrl: this.[REDACTED_TOKEN](`/${file}`, {
                format: 'webp',
                quality: 80
              })
            });
          }
        }
      } catch (error) {
        logger.warn('Could not read asset directory', { error: error.message });
      }

      return manifest;
    } catch (error) {
      logger.error('Failed to generate asset manifest', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Configurar headers de cache
   */
  getCacheHeaders(fileType) {
    const headers = {
      'Cache-Control': 'public, max-age=31536000, immutable',
      '[REDACTED_TOKEN]': 'nosniff'
    };

    if (fileType === 'image') {
      headers['CDN-Cache-Control'] = 'max-age=31536000';
    } else if (fileType === 'stylesheet') {
      headers['CDN-Cache-Control'] = 'max-age=2592000';
    } else if (fileType === 'script') {
      headers['CDN-Cache-Control'] = 'max-age=604800';
    }

    return headers;
  }

  /**
   ✅ NOVO: Pré-carregar recursos críticos
   */
  generatePreloadTags(assets) {
    return assets
      .map(asset => {
        if (asset.type === 'image') {
          return `<link rel="preload" as="image" href="${asset.url}" />`;
        } else if (asset.type === 'font') {
          return `<link rel="preload" as="font" href="${asset.url}" crossorigin />`;
        } else if (asset.type === 'script') {
          return `<link rel="preload" as="script" href="${asset.url}" />`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  /**
   ✅ NOVO: Gerar sitemap de imagens (para SEO)
   */
  async [REDACTED_TOKEN](assets) {
    const urls = assets
      .filter(asset => asset.type === 'image')
      .map(asset => ({
        loc: asset.url,
        lastmod: new Date().toISOString(),
        title: asset.alt || asset.path
      }));

    return {
      '?xml': { version: '1.0', encoding: 'UTF-8' },
      urlset: {
        '@xmlns': 'http://www.google.com/schemas/sitemap-image/1.1',
        '@xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
        url: urls.map(u => ({
          loc: u.loc,
          lastmod: u.lastmod,
          'image:image': {
            'image:loc': u.loc,
            'image:title': u.title
          }
        }))
      }
    };
  }

  /**
   ✅ NOVO: Medir performance de imagem
   */
  async [REDACTED_TOKEN](imageUrl) {
    return {
      url: imageUrl,
      metrics: {
        [REDACTED_TOKEN]: 'depends on user connection',
        [REDACTED_TOKEN]: 'depends on image dimensions',
        firstInputDelay: 'not affected if lazy-loaded',
        recommendations: [
          'Use responsive images with srcset',
          'Implement lazy loading',
          'Use WebP format when possible',
          'Optimize quality based on device pixel ratio',
          'Consider using AVIF format for modern browsers'
        ]
      }
    };
  }

  /**
   ✅ NOVO: Gerar política de cache
   */
  generateCachePolicy() {
    return {
      imageAssets: {
        maxAge: '1 year',
        description: 'Immutable images (content-hash in filename)',
        example: '/images/product-abc123def.webp'
      },
      cssAndJs: {
        maxAge: '30 days',
        description: 'Updated regularly',
        example: '/css/main-v2.css'
      },
      htmlPages: {
        maxAge: '1 hour',
        description: 'Pages with dynamic content'
      },
      apiFetches: {
        maxAge: '5 minutes',
        description: 'Dynamic API responses',
        cacheKey: 'Query-based cache busting'
      }
    };
  }

  /**
   ✅ NOVO: Gerar report de otimização
   */
  [REDACTED_TOKEN]() {
    return {
      bandwidthSavings: this.[REDACTED_TOKEN](),
      cachePolicy: this.generateCachePolicy(),
      recommendations: [
        'Use WebP format with JPEG fallback',
        'Implement lazy loading for images',
        'Use CDN for global distribution',
        'Minify CSS and JavaScript',
        'Use HTTP/2 for parallel downloads',
        'Implement AVIF for next-gen browsers',
        'Use critical CSS inlining',
        'Consider service worker for offline caching'
      ],
      nextSteps: [
        'Enable Gzip compression at server level',
        'Implement edge caching at CDN',
        'Set up automated WebP conversion pipeline',
        'Configure cache headers per file type',
        'Monitor Image performance with Web Vitals'
      ]
    };
  }
}

module.exports = new [REDACTED_TOKEN]();

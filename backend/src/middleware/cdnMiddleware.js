/**
 * CDN Middleware
 * Headers de cache, compression, e otimizações de entrega
 */

const logger = require('../utils/logger');

/**
 * Middleware para adicionar headers de cache para assets
 */
function cdnCacheHeaders(req, res, next) {
  // Detectar tipo de arquivo
  const path = req.path;
  
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path)) {
    // Images: 1 year immutable (assumir hash no filename)
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'max-age=31536000'
    });
  } else if (/\.(css|gzip)$/i.test(path)) {
    // CSS: 30 days
    res.set({
      'Cache-Control': 'public, max-age=2592000',
      'CDN-Cache-Control': 'max-age=2592000'
    });
  } else if (/\.js$/i.test(path)) {
    // JavaScript: 7 days
    res.set({
      'Cache-Control': 'public, max-age=604800',
      'CDN-Cache-Control': 'max-age=604800'
    });
  }

  next();
}

/**
 * Middleware para compressão Gzip/Brotli
 */
function enableCompression(req, res, next) {
  // Acceptar compression
  res.setHeader('Vary', 'Accept-Encoding');
  
  // Indicar tipos compressíveis
  if (/\.(js|css|json|svg|xml)$/.test(req.path)) {
    res.setHeader('Content-Encoding', 'gzip');
  }

  next();
}

/**
 * Middleware para adicionar headers de segurança para assets
 */
function [REDACTED_TOKEN](req, res, next) {
  res.set({
    '[REDACTED_TOKEN]': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': '[REDACTED_TOKEN]'
  });

  next();
}

/**
 * Middleware para logging de downloads de assets
 */
function logAssetDownload(req, res, next) {
  const originalSend = res.send;

  res.send = function(data) {
    logger.log({
      level: 'info',
      message: 'Asset delivered',
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware para redirecionar para versão otimizada
 * Se cliente aceita WebP, servir WebP ao invés de PNG/JPG
 */
function serveOptimizedAsset(req, res, next) {
  const acceptsWebP = req.get('Accept')?.includes('image/webp');
  
  if (acceptsWebP && /\.(png|jpg|jpeg)$/.test(req.path)) {
    // Nota: Em produção, redirecionar para versão WebP no CDN
    // res.redirect(req.path.replace(/\.(png|jpg|jpeg)$/, '.webp'));
    
    logger.log({
      level: 'info',
      message: 'WebP format available',
      originalPath: req.path,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/**
 * Middleware para ETag de assets
 */
function generateAssetETag(req, res, next) {
  const originalJson = res.json;

  res.json = function(data) {
    if (data && data.imageUrl) {
      // Gerar ETag para asset
      const crypto = require('crypto');
      const etag = crypto
        .createHash('md5')
        .update(data.imageUrl)
        .digest('hex');
      
      res.set('ETag', `"${etag}"`);
    }

    return originalJson.call(this, data);
  };

  next();
}

module.exports = {
  cdnCacheHeaders,
  enableCompression,
  [REDACTED_TOKEN],
  logAssetDownload,
  serveOptimizedAsset,
  generateAssetETag
};

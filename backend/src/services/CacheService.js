/**
 * Cache Service
 * Sistema de cache in-memory com TTL e estadísticas
 * ✅ Otimiza performance, reduz queries DB
 */

const logger = require('../utils/logger');

class CacheService {
  static store = new Map();
  static stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  /**
   * Obter valor do cache
   */
  static get(key) {
    const item = this.store.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Verificar TTL
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      logger.debug(`Cache hit expired: ${key}`);
      return null;
    }

    this.stats.hits++;
    item.accessCount = (item.accessCount || 0) + 1;
    item.lastAccess = Date.now();
    
    return item.value;
  }

  /**
   * Adicionar valor ao cache
   */
  static set(key, value, ttlSeconds = 300) {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0
    });

    this.stats.sets++;
    logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`);

    return this;
  }

  /**
   * Deletar do cache
   */
  static delete(key) {
    if (this.store.has(key)) {
      this.store.delete(key);
      this.stats.deletes++;
      logger.debug(`Cache delete: ${key}`);
    }
    return this;
  }

  /**
   * Limpar versão (pattern matching)
   * Ex: invalidatePattern('user:*') deleta user:1, user:2, etc
   */
  static invalidatePattern(pattern) {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    let deleted = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deleted++;
      }
    }

    if (deleted > 0) {
      logger.debug(`Cache invalidate pattern: ${pattern} (${deleted} items)`);
    }
    return deleted;
  }

  /**
   * Obter ou computar (padrão comum)
   */
  static async remember(key, ttlSeconds, callback) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await callback();
      this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      logger.error('Cache remember error', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Cache decorator para funções
   */
  static memoize(fn, ttlSeconds = 300, keyGenerator = null) {
    return async function(...args) {
      const key = keyGenerator ? keyGenerator(...args) : `${fn.name}:${JSON.stringify(args)}`;
      
      return CacheService.remember(key, ttlSeconds, () => fn.apply(this, args));
    };
  }

  /**
   * Limpar tudo
   */
  static flush() {
    const size = this.store.size;
    this.store.clear();
    logger.info(`Cache flushed: ${size} items removed`);
    return size;
  }

  /**
   * Limpar expirados
   */
  static cleanup() {
    const now = Date.now();
    let deleted = 0;

    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.store.delete(key);
        deleted++;
      }
    }

    if (deleted > 0) {
      logger.debug(`Cache cleanup: ${deleted} expired items removed`);
    }
    return deleted;
  }

  /**
   * Obter estatísticas
   */
  static getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      storeSize: this.store.size,
      memoryUsage: this.[REDACTED_TOKEN]()
    };
  }

  /**
   * Calcular uso de memória (aproximado)
   */
  static [REDACTED_TOKEN]() {
    let bytes = 0;
    for (const [key, item] of this.store.entries()) {
      bytes += key.length * 2; // UTF-16
      bytes += JSON.stringify(item.value).length * 2;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  /**
   * Cache Keys comuns
   */
  static KEYS = {
    // Usuários
    USER: (id) => `user:${id}`,
    USER_BOOKINGS: (userId) => `user:${userId}:bookings`,
    USER_REVIEWS: (userId) => `user:${userId}:reviews`,
    
    // Agendamentos
    BOOKING: (id) => `booking:${id}`,
    BOOKINGS_DATE: (date) => `bookings:date:${date}`,
    
    // Serviços
    SERVICE: (id) => `service:${id}`,
    SERVICES_LIST: 'services:list',
    
    // Reviews
    REVIEWS_PUBLIC: (page = 1) => `reviews:public:${page}`,
    REVIEWS_BOOKING: (bookingId) => `reviews:booking:${bookingId}`,
    
    // Admin
    ADMIN_DASHBOARD: (period = 'day') => `admin:dashboard:${period}`,
    ADMIN_STATS: (type) => `admin:stats:${type}`,
    
    // Company
    COMPANY_INFO: 'company:info',
    COMPANY_BANKING: 'company:banking' // Cuidado com segurança
  };

  /**
   * TTL Presets
   */
  static TTL = {
    SHORT: 60,      // 1 minuto
    MEDIUM: 300,    // 5 minutos
    LONG: 1800,     // 30 minutos
    VERY_LONG: 3600 // 1 hora
  };
}

// Cleanup automático a cada 10 minutos
setInterval(() => {
  CacheService.cleanup();
}, 10 * 60 * 1000);

module.exports = CacheService;

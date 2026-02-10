/**
 * Validation Service
 * Validações robustas centralizadas para toda aplicação
 * ✅ Sanitização, type checking, business logic
 */

const logger = require('../utils/logger');
const sanitizeHtml = require('sanitize-html');

class ValidationService {
  /**
   * Validar string (não vazia, tamanho)
   */
  static validateString(value, fieldName, minLength = 1, maxLength = 1000) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} deve ser texto`);
    }
    if (value.trim().length < minLength) {
      throw new Error(`${fieldName} mínimo ${minLength} caracteres`);
    }
    if (value.length > maxLength) {
      throw new Error(`${fieldName} máximo ${maxLength} caracteres`);
    }
    return value.trim();
  }

  /**
   * Validar email
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
    return email.toLowerCase().trim();
  }

  /**
   * Validar telefone brasileiro
   */
  static validatePhoneBR(phone) {
    const phoneRegex = /^(?:\+55)?[\s(]?(?:\d{2})[\s)]?[\s]?(?:9[\s]?)?(?:\d{4})[\s]?(?:\d{4})$/;
    if (!phone || !phoneRegex.test(phone.replace(/\D/g, ''))) {
      throw new Error('Telefone brasileiro inválido');
    }
    return phone.replace(/\D/g, '');
  }

  /**
   * Validar data (deve ser futura e formato correto)
   */
  static validateFutureDate(dateString) {
    if (!dateString) {
      throw new Error('Data é obrigatória');
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Formato de data inválido');
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Ignorar hour/min/sec
    
    if (date < now) {
      throw new Error('Data não pode ser no passado');
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Validar hora (formato HH:MM)
   */
  static validateTime(timeString) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeString || !timeRegex.test(timeString)) {
      throw new Error('Hora deve estar no formato HH:MM (00:00-23:59)');
    }
    return timeString;
  }

  /**
   * Validar número positivo (price, duration, etc)
   */
  static [REDACTED_TOKEN](value, fieldName, max = Number.MAX_SAFE_INTEGER) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      throw new Error(`${fieldName} deve ser um número positivo`);
    }
    if (num > max) {
      throw new Error(`${fieldName} não pode ser maior que ${max}`);
    }
    return num;
  }

  /**
   * Validar inteiro positivo (IDs, quantities)
   */
  static [REDACTED_TOKEN](value, fieldName, max = Number.MAX_SAFE_INTEGER) {
    const num = this.[REDACTED_TOKEN](value, fieldName, max);
    if (!Number.isInteger(num)) {
      throw new Error(`${fieldName} deve ser um número inteiro`);
    }
    return num;
  }

  /**
   * Validar rating (1-5)
   */
  static validateRating(value) {
    const num = this.[REDACTED_TOKEN](value, 'Rating', 5);
    if (num < 1 || num > 5) {
      throw new Error('Rating deve ser entre 1 e 5');
    }
    return num;
  }

  /**
   * Validar endereço
   */
  static validateAddress(address) {
    const addr = this.validateString(address, 'Endereço', 5, 500);
    if (!/\d/.test(addr)) {
      throw new Error('Endereço deve conter número');
    }
    return addr;
  }

  /**
   * Validar senha (segurança robusta)
   */
  static validatePassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Senha mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Senha deve ter letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Senha deve ter letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Senha deve ter número');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      throw new Error('Senha deve ter caractere especial (!@#$%^&*)');
    }
    return password;
  }

  /**
   * Sanitizar HTML (segurança contra XSS)
   */
  static sanitizeHtml(html) {
    return sanitizeHtml(html, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href', 'title']
      }
    });
  }

  /**
   * Sanitizar input comum
   */
  static sanitizeInput(value) {
    if (!value) return '';
    return String(value).trim().replace(/[<>]/g, '');
  }

  /**
   * Validar objeto com schema
   */
  static validateSchema(data, schema) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      try {
        if (rules.required && !data[field]) {
          throw new Error(`${field} é obrigatório`);
        }
        
        if (rules.type && typeof data[field] !== rules.type) {
          throw new Error(`${field} deve ser ${rules.type}`);
        }
        
        if (rules.min && data[field]?.length < rules.min) {
          throw new Error(`${field} mínimo ${rules.min} caracteres`);
        }
        
        if (rules.max && data[field]?.length > rules.max) {
          throw new Error(`${field} máximo ${rules.max} caracteres`);
        }
        
        if (rules.validator && typeof rules.validator === 'function') {
          rules.validator(data[field]);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Validação falhou: ${errors.join(', ')}`);
    }
    
    return data;
  }

  /**
   * Validar dados de agendamento
   */
  static validateBookingData(booking) {
    const schema = {
      userId: {
        required: true,
        type: 'number',
        validator: (v) => this.[REDACTED_TOKEN](v, 'userId')
      },
      serviceId: {
        required: true,
        type: 'number',
        validator: (v) => this.[REDACTED_TOKEN](v, 'serviceId')
      },
      date: {
        required: true,
        validator: (v) => this.validateFutureDate(v)
      },
      time: {
        required: true,
        validator: (v) => this.validateTime(v)
      },
      address: {
        required: true,
        validator: (v) => this.validateAddress(v)
      },
      phone: {
        required: true,
        validator: (v) => this.validatePhoneBR(v)
      },
      durationHours: {
        validator: (v) => v ? this.[REDACTED_TOKEN](v, 'durationHours', 24) : 2
      }
    };
    
    return this.validateSchema(booking, schema);
  }

  /**
   * Validar dados de review
   */
  static validateReviewData(review) {
    const schema = {
      bookingId: {
        required: true,
        type: 'number',
        validator: (v) => this.[REDACTED_TOKEN](v, 'bookingId')
      },
      userId: {
        required: true,
        type: 'number',
        validator: (v) => this.[REDACTED_TOKEN](v, 'userId')
      },
      rating: {
        required: true,
        validator: (v) => this.validateRating(v)
      },
      comment: {
        validator: (v) => v ? this.validateString(v, 'comment', 0, 1000) : ''
      }
    };
    
    return this.validateSchema(review, schema);
  }

  /**
   * Validar dados de pagamento
   */
  static validatePaymentData(payment) {
    const schema = {
      bookingId: {
        required: true,
        type: 'number',
        validator: (v) => this.[REDACTED_TOKEN](v, 'bookingId')
      },
      amount: {
        required: true,
        validator: (v) => this.[REDACTED_TOKEN](v, 'amount', 99999.99)
      },
      paymentMethod: {
        required: true,
        validator: (v) => {
          const method = this.sanitizeInput(v);
          if (!['card', 'pix', 'bank_transfer'].includes(method)) {
            throw new Error('Método de pagamento inválido');
          }
        }
      }
    };
    
    return this.validateSchema(payment, schema);
  }

  /**
   * Log validação para auditoria
   */
  static logValidation(fieldName, result, userId = null) {
    logger.info('Validation', {
      field: fieldName,
      result,
      userId,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ValidationService;

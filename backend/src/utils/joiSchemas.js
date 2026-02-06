/**
 * Joi Validation Schemas
 * ✅ Schemas reutilizáveis para toda aplicação
 * Garante type-safety e documentação automática
 */

const Joi = require('joi');

/**
 * Schemas primitivos reutilizáveis
 */
const primitives = {
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),

  phone: Joi.string()
    .pattern(/^(?:\+55)?[\s(]?(?:\d{2})[\s)]?[\s]?(?:9[\s]?)?(?:\d{4})[\s]?(?:\d{4})$/)
    .required()
    .messages({
      'string.pattern.base': 'Telefone inválido (use formato: (11) 99999-9999)',
      'any.required': 'Telefone é obrigatório'
    }),

  date: Joi.string()
    .isoDate()
    .required()
    .custom((value, helpers) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return helpers.error('date.past');
      }
      return value;
    })
    .messages({
      'date.isoDate': 'Data deve estar no formato ISO (YYYY-MM-DD)',
      'date.past': 'Data não pode ser no passado',
      'any.required': 'Data é obrigatória'
    }),

  time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Hora deve estar no formato HH:MM (00:00-23:59)',
      'any.required': 'Hora é obrigatória'
    }),

  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome mínimo 2 caracteres',
      'string.max': 'Nome máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[!@#$%^&*]/)
    .required()
    .messages({
      'string.min': 'Senha mínimo 8 caracteres',
      'string.pattern.base': 'Senha requer: maiúscula, número, caractere especial',
      'any.required': 'Senha é obrigatória'
    }),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Avaliação mínima: 1',
      'number.max': 'Avaliação máxima: 5',
      'any.required': 'Avaliação é obrigatória'
    }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.min': 'Endereço mínimo 5 caracteres',
      'string.max': 'Endereço máximo 255 caracteres',
      'any.required': 'Endereço é obrigatório'
    }),

  duration: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .default(2)
    .messages({
      'number.min': 'Duração mínima: 1 hora',
      'number.max': 'Duração máxima: 8 horas'
    })
};

/**
 * BOOKING SCHEMAS
 */
const bookingSchemas = {
  /**
   * Criar novo agendamento
   */
  create: Joi.object({
    userId: Joi.number().integer().required(),
    serviceId: Joi.number().integer().required(),
    date: primitives.date,
    time: primitives.time,
    address: primitives.address,
    phone: primitives.phone,
    durationHours: primitives.duration,
    hasStaff: Joi.boolean().default(true),
    isPostWork: Joi.boolean().default(false),
    hasExtraQuarter: Joi.boolean().default(false),
    notes: Joi.string().trim().max(500).allow('')
  }),

  /**
   * Atualizar agendamento
   */
  update: Joi.object({
    date: primitives.date.optional(),
    time: primitives.time.optional(),
    address: primitives.address.optional(),
    phone: primitives.phone.optional(),
    status: Joi.string()
      .valid('pending', 'confirmed', 'completed', 'cancelled')
      .optional(),
    notes: Joi.string().trim().max(500).allow('')
  }),

  /**
   * Filtrar agendamentos
   */
  filter: Joi.object({
    userId: Joi.number().integer().optional(),
    serviceId: Joi.number().integer().optional(),
    status: Joi.string()
      .valid('pending', 'confirmed', 'completed', 'cancelled')
      .optional(),
    dateFrom: primitives.date.optional(),
    dateTo: primitives.date.optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0)
  })
};

/**
 * REVIEW SCHEMAS
 */
const reviewSchemas = {
  /**
   * Criar review/avaliação
   */
  create: Joi.object({
    bookingId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    rating: primitives.rating,
    comment: Joi.string().trim().max(500).allow('')
  }),

  /**
   * Filtrar reviews
   */
  filter: Joi.object({
    serviceId: Joi.number().integer().optional(),
    minRating: Joi.number().integer().min(1).max(5).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0)
  })
};

/**
 * USER SCHEMAS
 */
const userSchemas = {
  /**
   * Registrar novo usuário
   */
  register: Joi.object({
    email: primitives.email,
    name: primitives.name,
    phone: primitives.phone.optional(),
    password: primitives.password
  }),

  /**
   * Login
   */
  login: Joi.object({
    email: primitives.email,
    password: Joi.string().required()
  }),

  /**
   * Atualizar perfil
   */
  updateProfile: Joi.object({
    name: primitives.name.optional(),
    phone: primitives.phone.optional(),
    avatar_url: Joi.string().uri().optional(),
    bio: Joi.string().trim().max(500).allow('')
  }),

  /**
   * Alterar senha
   */
  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: primitives.password
  })
};

/**
 * SERVICE SCHEMAS
 */
const serviceSchemas = {
  /**
   * Criar serviço (admin)
   */
  create: Joi.object({
    name: primitives.name,
    description: Joi.string().trim().max(500).required(),
    category: Joi.string().trim().required(),
    basePrice: Joi.number().min(0).required(),
    duration: primitives.duration,
    is_active: Joi.boolean().default(true)
  }),

  /**
   * Atualizar serviço
   */
  update: Joi.object({
    name: primitives.name.optional(),
    description: Joi.string().trim().max(500).optional(),
    basePrice: Joi.number().min(0).optional(),
    duration: primitives.duration.optional(),
    is_active: Joi.boolean().optional()
  })
};

/**
 * PAYMENT SCHEMAS
 */
const paymentSchemas = {
  /**
   * Processar pagamento
   */
  process: Joi.object({
    bookingId: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    method: Joi.string()
      .valid('credit_card', 'debit_card', 'pix', 'bank_transfer')
      .required(),
    cardToken: Joi.string().optional(),
    paymentIntentId: Joi.string().optional()
  }),

  /**
   * Processar reembolso
   */
  refund: Joi.object({
    paymentId: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    reason: Joi.string().trim().max(255).required()
  })
};

/**
 * Middleware validador genérico
 */
function validateSchema(schema, options = {}) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove campos não esperados
      ...options
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          type: e.type
        }))
      });
    }

    // Dados validados e sanitizados
    req.validated = value;
    next();
  };
}

module.exports = {
  primitives,
  bookingSchemas,
  reviewSchemas,
  userSchemas,
  serviceSchemas,
  paymentSchemas,
  validateSchema
};

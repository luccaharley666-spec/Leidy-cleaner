/**
 * Zod Input Validation Schemas
 * ✅ Validação segura de requests para prevenir SQL injection e dados inválidos
 * 
 * Usage:
 * const { validateSchema } = require('./zodSchemas');
 * router.post('/endpoint', validateSchema(teamCreateSchema), handler);
 */

const { z } = require('zod');

// ============================================
// HELPER: Middleware para validação
// ============================================
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validated = validated;
      next();
    } catch (error) {
      const message = error.errors?.[0]?.message || error.message;
      return res.status(422).json({
        success: false,
        error: `Validação falhou: ${message}`,
        details: error.errors || []
      });
    }
  };
};

// ============================================
// ADMIN ROUTES - TEAMS
// ============================================

const teamCreateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  description: z.string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido (ex: #FF0000)')
    .optional()
    .nullable(),
  manager_id: z.number()
    .int('Manager ID deve ser um número inteiro')
    .positive('Manager ID deve ser positivo'),
});

const teamUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .optional(),
  description: z.string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido')
    .optional()
    .nullable(),
  is_active: z.boolean('is_active deve ser true/false').optional(),
});

// ============================================
// ADMIN ROUTES - SERVICES
// ============================================

const serviceCreateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  description: z.string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional()
    .nullable(),
  category: z.string()
    .min(2, 'Categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Categoria não pode exceder 50 caracteres'),
  base_price: z.number()
    .positive('Preço deve ser positivo')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais'),
  duration_minutes: z.number()
    .int('Duração deve ser um inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 480 minutos (8 horas)')
    .optional()
    .default(60),
  image_url: z.string().url('Image URL deve ser uma URL válida').optional().nullable(),
});

const serviceUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .optional(),
  description: z.string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional()
    .nullable(),
  base_price: z.number()
    .positive('Preço deve ser positivo')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais')
    .optional(),
  duration_minutes: z.number()
    .int('Duração deve ser um inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(480, 'Duração máxima é 480 minutos')
    .optional(),
  is_active: z.boolean('is_active deve ser true/false').optional(),
});

// ============================================
// BOOKINGS
// ============================================

const bookingCreateSchema = z.object({
  service_id: z.number()
    .int('Service ID deve ser um inteiro')
    .positive('Service ID deve ser positivo'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine(date => new Date(date) > new Date(), 'Data não pode ser no passado'),
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
  duration_hours: z.number()
    .int('Duração deve ser inteira')
    .min(1, 'Duração mínima é 1 hora')
    .max(8, 'Duração máxima é 8 horas')
    .optional()
    .default(2),
  address: z.string()
    .min(5, 'Endereço de deve ter pelo menos 5 caracteres')
    .max(200, 'Endereço não pode exceder 200 caracteres'),
  phone: z.string()
    .regex(/^\(?(\d{2})\)? ?(\d{4,5})-(\d{4})$/, 'Telefone inválido (ex: (11) 99999-9999)'),
  notes: z.string()
    .max(500, 'Notas não podem exceder 500 caracteres')
    .optional()
    .nullable(),
});

const bookingUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
    error_map: () => ({ message: 'Status deve ser: pending, confirmed, completed ou cancelled' })
  }).optional(),
  notes: z.string()
    .max(500, 'Notas não podem exceder 500 caracteres')
    .optional()
    .nullable(),
});

// ============================================
// PAYMENTS
// ============================================

const paymentCreateSchema = z.object({
  booking_id: z.number()
    .int('Booking ID deve ser um inteiro')
    .positive('Booking ID deve ser positivo'),
  method: z.enum(['stripe', 'pix', 'cash'], {
    error_map: () => ({ message: 'Método deve ser: stripe, pix ou cash' })
  }),
  amount: z.number()
    .positive('Valor deve ser positivo')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais'),
});

// ============================================
// AUTH
// ============================================

const loginSchema = z.object({
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  phone: z.string()
    .regex(/^\(?(\d{2})\)? ?(\d{4,5})-(\d{4})$/, 'Telefone inválido'),
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  validateSchema,
  
  // Teams
  teamCreateSchema,
  teamUpdateSchema,
  
  // Services
  serviceCreateSchema,
  serviceUpdateSchema,
  
  // Bookings
  bookingCreateSchema,
  bookingUpdateSchema,
  
  // Payments
  paymentCreateSchema,
  
  // Auth
  loginSchema,
  registerSchema,
};

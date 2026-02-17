import Joi from 'joi';

// Auth schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Service schemas
export const serviceSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().optional(),
  basePrice: Joi.number().positive().required(),
  durationMinutes: Joi.number().positive().required(),
  category: Joi.string().required(),
});

// Booking schemas
export const bookingSchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  bookingDate: Joi.date().iso().required(),
  address: Joi.string().required(),
  notes: Joi.string().optional(),
  metragem: Joi.number().positive().optional(),
  frequency: Joi.string().valid('once', 'weekly', 'biweekly', 'monthly').default('once'),
  urgency: Joi.string().valid('low', 'normal', 'high').default('normal'),
});

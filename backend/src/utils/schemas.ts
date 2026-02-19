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

// Update schema: all fields optional for partial updates
export const serviceUpdateSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  description: Joi.string().optional(),
  basePrice: Joi.number().positive().optional(),
  durationMinutes: Joi.number().positive().optional(),
  category: Joi.string().optional(),
});

// Booking schemas
const numericString = Joi.string().pattern(/^[0-9]+$/);

export const bookingSchema = Joi.object({
  serviceId: Joi.alternatives()
    .try(Joi.string().uuid(), Joi.number().integer(), numericString)
    .required(),
  bookingDate: Joi.date().iso().required(),
  address: Joi.string().required(),
  notes: Joi.string().optional(),
  staffId: Joi.alternatives().try(Joi.string().uuid(), Joi.number().integer(), numericString).optional(),
  metragem: Joi.number().positive().optional(),
  frequency: Joi.string().valid('once', 'weekly', 'biweekly', 'monthly').default('once'),
  urgency: Joi.string().valid('low', 'normal', 'high').default('normal'),
});

// Review schema
export const reviewSchema = Joi.object({
  bookingId: Joi.alternatives().try(Joi.string().uuid(), Joi.number().integer(), numericString).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

// Staff assignment schema (admin)
export const assignStaffSchema = Joi.object({
  bookingId: Joi.alternatives().try(Joi.string().uuid(), Joi.number().integer(), numericString).required(),
  staffId: Joi.alternatives().try(Joi.string().uuid(), Joi.number().integer(), numericString).required(),
});

// Profile update schema (used by staff themselves or admin)
export const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  phone: Joi.string().optional(),
  bio: Joi.string().max(1000).optional().allow(null),
  photoUrl: Joi.string().uri().optional().allow(null),
});

// Availability slot schema
export const availabilitySlotSchema = Joi.object({
  day: Joi.string().valid('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday').required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
});

export const availabilityArraySchema = Joi.array().items(availabilitySlotSchema);

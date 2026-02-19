"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityArraySchema = exports.availabilitySlotSchema = exports.profileUpdateSchema = exports.assignStaffSchema = exports.reviewSchema = exports.bookingSchema = exports.serviceUpdateSchema = exports.serviceSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Auth schemas
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    name: joi_1.default.string().min(2).required(),
    phone: joi_1.default.string().optional(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required(),
});
// Service schemas
exports.serviceSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    description: joi_1.default.string().optional(),
    basePrice: joi_1.default.number().positive().required(),
    durationMinutes: joi_1.default.number().positive().required(),
    category: joi_1.default.string().required(),
});
// Update schema: all fields optional for partial updates
exports.serviceUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional(),
    description: joi_1.default.string().optional(),
    basePrice: joi_1.default.number().positive().optional(),
    durationMinutes: joi_1.default.number().positive().optional(),
    category: joi_1.default.string().optional(),
});
// Booking schemas
const numericString = joi_1.default.string().pattern(/^[0-9]+$/);
exports.bookingSchema = joi_1.default.object({
    serviceId: joi_1.default.alternatives()
        .try(joi_1.default.string().uuid(), joi_1.default.number().integer(), numericString)
        .required(),
    bookingDate: joi_1.default.date().iso().required(),
    address: joi_1.default.string().required(),
    notes: joi_1.default.string().optional(),
    staffId: joi_1.default.alternatives().try(joi_1.default.string().uuid(), joi_1.default.number().integer(), numericString).optional(),
    metragem: joi_1.default.number().positive().optional(),
    frequency: joi_1.default.string().valid('once', 'weekly', 'biweekly', 'monthly').default('once'),
    urgency: joi_1.default.string().valid('low', 'normal', 'high').default('normal'),
});
// Review schema
exports.reviewSchema = joi_1.default.object({
    bookingId: joi_1.default.alternatives().try(joi_1.default.string().uuid(), joi_1.default.number().integer(), numericString).required(),
    rating: joi_1.default.number().integer().min(1).max(5).required(),
    comment: joi_1.default.string().optional(),
    images: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
});
// Staff assignment schema (admin)
exports.assignStaffSchema = joi_1.default.object({
    bookingId: joi_1.default.alternatives().try(joi_1.default.string().uuid(), joi_1.default.number().integer(), numericString).required(),
    staffId: joi_1.default.alternatives().try(joi_1.default.string().uuid(), joi_1.default.number().integer(), numericString).required(),
});
// Profile update schema (used by staff themselves or admin)
exports.profileUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional(),
    phone: joi_1.default.string().optional(),
    bio: joi_1.default.string().max(1000).optional().allow(null),
    photoUrl: joi_1.default.string().uri().optional().allow(null),
});
// Availability slot schema
exports.availabilitySlotSchema = joi_1.default.object({
    day: joi_1.default.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
    startTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
    endTime: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
});
exports.availabilityArraySchema = joi_1.default.array().items(exports.availabilitySlotSchema);
//# sourceMappingURL=schemas.js.map
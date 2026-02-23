/**
 * Application constants and enums
 */

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  STAFF = 'staff',
}

/**
 * Booking status values
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Payment status values
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Service categories
 */
export enum ServiceCategory {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  SPECIALIZED = 'specialized',
  MAINTENANCE = 'maintenance',
}

/**
 * Booking frequency options
 */
export enum BookingFrequency {
  ONCE = 'once',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

/**
 * Booking urgency levels
 */
export enum BookingUrgency {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

/**
 * Days of the week (for staff availability)
 */
export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

/**
 * Application configuration constants
 */
export const APP_CONFIG = {
  // JWT
  JWT_ACCESS_EXPIRES: '24h',
  JWT_REFRESH_EXPIRES: '7d',

  // Pricing
  BASE_PRICE_BRL: 40,
  HOURLY_RATE_BRL: 20,
  BOOKING_FEE_PERCENT: 40,

  // Rate limiting (in requests)
  AUTH_RATE_LIMIT_MAX: 5,
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 min

  USER_RATE_LIMIT_MAX: 100,
  USER_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 min

  API_RATE_LIMIT_MAX: 200,
  API_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 min

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File uploads
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_REVIEW: 5,

  // Cache
  SERVICE_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
};

/**
 * Get human-readable label for enum value
 */
export function getEnumLabel(value: string, enumType: any): string {
  const keys = Object.keys(enumType);
  const key = keys.find(k => enumType[k] === value);
  return key ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : value;
}

/**
 * Validate if a value is a valid UserRole
 */
export function isValidRole(role: any): role is UserRole {
  return Object.values(UserRole).includes(role);
}

/**
 * Validate if a value is a valid BookingStatus
 */
export function isValidBookingStatus(status: any): status is BookingStatus {
  return Object.values(BookingStatus).includes(status);
}

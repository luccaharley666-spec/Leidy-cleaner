/**
 * Request/Response Data Transfer Objects (DTOs)
 * Padronizam formatos de entrada/saída
 */

/**
 * Base Response DTO
 */
class ApiResponse {
  constructor(success, data, message = null, code = null) {
    this.success = success;
    this.data = data;
    if (message) this.message = message;
    if (code) this.code = code;
    this.timestamp = new Date().toISOString();
  }

  static ok(data, message = null) {
    return new ApiResponse(true, data, message);
  }

  static error(message, code = 'ERROR', data = null) {
    return new ApiResponse(false, data, message, code);
  }
}

/**
 * Pagination DTO
 */
class PaginationDto {
  constructor(page, limit, total, data) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.data = data;
  }

  static from(page, limit, total, data) {
    return new PaginationDto(page, limit, total, data);
  }
}

/**
 * Auth DTOs
 */
class LoginRequestDto {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  validate() {
    const errors = [];
    if (!this.email || !this.email.includes('@')) errors.push('Invalid email');
    if (!this.password || this.password.length < 8) errors.push('Password too short');
    return { valid: errors.length === 0, errors };
  }
}

class RegisterRequestDto {
  constructor(name, email, password, phone, role = 'user') {
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.role = role;
  }

  validate() {
    const errors = [];
    if (!this.name || this.name.length < 2) errors.push('Invalid name');
    if (!this.email || !this.email.includes('@')) errors.push('Invalid email');
    if (!this.password || this.password.length < 8) errors.push('Password must be at least 8 characters');
    if (!this.phone || this.phone.length < 10) errors.push('Invalid phone');
    return { valid: errors.length === 0, errors };
  }
}

class AuthResponseDto {
  constructor(user, token, refreshToken = null) {
    this.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    this.token = token;
    if (refreshToken) this.refreshToken = refreshToken;
    this.expiresIn = '7d';
  }
}

/**
 * Booking DTOs
 */
class [REDACTED_TOKEN] {
  constructor(professionalId, date, time, serviceId, amount = null) {
    this.professionalId = professionalId;
    this.date = date;
    this.time = time;
    this.serviceId = serviceId;
    this.amount = amount;
  }

  validate() {
    const errors = [];
    if (!this.professionalId) errors.push('Professional ID required');
    if (!this.date || new Date(this.date) <= new Date()) errors.push('Invalid date');
    if (!this.time) errors.push('Time required');
    if (!this.serviceId) errors.push('Service ID required');
    return { valid: errors.length === 0, errors };
  }
}

class BookingResponseDto {
  constructor(booking) {
    this.id = booking.id;
    this.date = booking.date;
    this.time = booking.time;
    this.service = booking.service;
    this.amount = booking.amount;
    this.status = booking.status;
    this.professional = {
      id: booking.professional_id,
      name: booking.professional_name
    };
    this.payment = booking.payment_status || null;
    this.createdAt = booking.created_at;
  }
}

/**
 * Payment DTOs
 */
class [REDACTED_TOKEN] {
  constructor(bookingId, amount) {
    this.bookingId = bookingId;
    this.amount = amount;
  }

  validate() {
    const errors = [];
    if (!this.bookingId) errors.push('Booking ID required');
    if (!this.amount || this.amount <= 0) errors.push('Invalid amount');
    return { valid: errors.length === 0, errors };
  }
}

class [REDACTED_TOKEN] {
  constructor(payment) {
    this.id = payment.id;
    this.transactionId = payment.transaction_id;
    this.bookingId = payment.booking_id;
    this.amount = payment.amount;
    this.qrCode = payment.qr_code;
    this.qrCodeUrl = payment.qr_code_url;
    this.status = payment.status;
    this.expiresAt = payment.expires_at;
    this.copyPaste = payment.copy_paste_key;
    this.createdAt = payment.created_at;
  }
}

/**
 * Review DTOs
 */
class [REDACTED_TOKEN] {
  constructor(bookingId, rating, comment = null, photos = []) {
    this.bookingId = bookingId;
    this.rating = rating;
    this.comment = comment;
    this.photos = photos;
  }

  validate() {
    const errors = [];
    if (!this.bookingId) errors.push('Booking ID required');
    if (!this.rating || this.rating < 1 || this.rating > 5) errors.push('Rating must be 1-5');
    return { valid: errors.length === 0, errors };
  }
}

class ReviewResponseDto {
  constructor(review) {
    this.id = review.id;
    this.bookingId = review.booking_id;
    this.rating = review.rating;
    this.comment = review.comment;
    this.photos = review.photos || [];
    this.user = {
      id: review.user_id,
      name: review.user_name,
      avatar: review.user_avatar
    };
    this.professional = {
      id: review.professional_id,
      name: review.professional_name
    };
    this.createdAt = review.created_at;
  }
}

/**
 * Error Response DTO
 */
class ErrorResponseDto {
  constructor(message, code, errorId, details = null) {
    this.success = false;
    this.error = message;
    this.code = code;
    this.errorId = errorId;
    this.timestamp = new Date().toISOString();
    if (details) this.details = details;
  }
}

/**
 * Middleware para converter request em DTO
 */
function dtoMiddleware(DtoClass) {
  return (req, res, next) => {
    try {
      const dto = new DtoClass(...Object.values(req.body));
      const validation = dto.validate();
      
      if (!validation.valid) {
        return res.status(400).json(
          ApiResponse.error('Validation failed', 'VALIDATION_ERROR', { errors: validation.errors })
        );
      }
      
      req.dto = dto;
      next();
    } catch (error) {
      res.status(400).json(
        ApiResponse.error('Invalid request format', 'INVALID_FORMAT')
      );
    }
  };
}

module.exports = {
  ApiResponse,
  PaginationDto,
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponseDto,
  [REDACTED_TOKEN],
  BookingResponseDto,
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  ReviewResponseDto,
  ErrorResponseDto,
  dtoMiddleware
};

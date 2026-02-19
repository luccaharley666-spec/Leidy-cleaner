"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = require("../utils/database");
const BookingService_1 = __importDefault(require("../services/BookingService"));
// helper to convert snake_case keys to camelCase recursively
function camelize(obj) {
    if (Array.isArray(obj))
        return obj.map(camelize);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => {
            const camelKey = k.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
            return [camelKey, camelize(v)];
        }));
    }
    return obj;
}
class BookingController {
}
exports.BookingController = BookingController;
_a = BookingController;
BookingController.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    // validate input with Joi schema
    const { bookingSchema } = require('../utils/schemas');
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    const { serviceId, bookingDate, address, notes, staffId } = value;
    // if staffId provided validate role
    if (staffId) {
        const existing = await (0, database_1.query)('SELECT role FROM users WHERE id = $1', [staffId]);
        if (existing.length === 0 || existing[0].role !== 'staff') {
            throw (0, errorHandler_1.ApiError)('Invalid staff member', 400);
        }
    }
    // compute price using service data
    const { ServiceService } = require('../services/ServiceService');
    const service = await ServiceService.getById(serviceId);
    if (!service) {
        throw (0, errorHandler_1.ApiError)('Service not found', 404);
    }
    // service.base_price from DB (snake_case) or service.basePrice (camelized)
    const totalPrice = Number(service.basePrice || service.base_price || 0);
    const booking = await BookingService_1.default.createBooking(req.user.id, serviceId, bookingDate, totalPrice, address, notes, staffId);
    // fire off notifications asynchronously (don't block response)
    const NotificationService = require('../services/NotificationService').default;
    NotificationService.notifyBookingCreated(booking).catch(() => { });
    res.status(201).json({ message: 'Booking created', data: { booking: camelize(booking) } });
});
BookingController.listByUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    const bookings = await BookingService_1.default.getBookingsByUser(req.user.id);
    res.status(200).json({ message: 'Bookings retrieved', data: { bookings: camelize(bookings) } });
});
BookingController.getById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const booking = await BookingService_1.default.getById(id);
    if (!booking)
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    // Only owner or admin can view
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        throw (0, errorHandler_1.ApiError)('Insufficient permissions', 403);
    }
    const respBooking = camelize(booking);
    res.status(200).json({ message: 'Booking retrieved', data: { booking: respBooking } });
});
BookingController.updateStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    if (req.user.role !== 'admin')
        throw (0, errorHandler_1.ApiError)('Only admins can update bookings', 403);
    const booking = await BookingService_1.default.updateStatus(id, status);
    if (!booking)
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    res.status(200).json({ message: 'Booking status updated', data: { booking: camelize(booking) } });
});
BookingController.remove = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    // allow owner or admin to delete
    const booking = await BookingService_1.default.getById(id);
    if (!booking)
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        throw (0, errorHandler_1.ApiError)('Insufficient permissions', 403);
    }
    await BookingService_1.default.delete(id);
    res.status(200).json({ message: 'Booking deleted' });
});
// admin endpoint: retrieve all bookings
BookingController.listAll = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can view all bookings', 403);
    }
    const bookings = await BookingService_1.default.getAllBookings();
    res.status(200).json({ message: 'Bookings retrieved', data: { bookings: camelize(bookings) } });
});
// staff endpoints
BookingController.assignStaff = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user?.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can assign staff', 403);
    }
    const { assignStaffSchema } = require('../utils/schemas');
    const { error, value } = assignStaffSchema.validate(req.body);
    if (error)
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    const { bookingId, staffId } = value;
    const updated = await BookingService_1.default.assignStaff(bookingId, staffId);
    if (!updated) {
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    }
    res.status(200).json({ message: 'Staff assigned', data: { booking: camelize(updated) } });
});
BookingController.listByStaff = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    // staff or admin can use this
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only staff can view their bookings', 403);
    }
    const staffId = req.user.id;
    const bookings = await BookingService_1.default.getBookingsByStaff(staffId);
    res.status(200).json({ message: 'Bookings retrieved', data: { bookings: camelize(bookings) } });
});
exports.default = BookingController;
//# sourceMappingURL=BookingController.js.map
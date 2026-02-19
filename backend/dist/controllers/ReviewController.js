"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const ReviewService_1 = require("../services/ReviewService");
const schemas_1 = require("../utils/schemas");
// helper to camelize
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
class ReviewController {
}
exports.ReviewController = ReviewController;
_a = ReviewController;
ReviewController.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error, value } = schemas_1.reviewSchema.validate(req.body);
    if (error) {
        throw (0, errorHandler_1.ApiError)(error.details[0].message, 400);
    }
    const userId = req.user.id;
    // ensure booking exists and belongs to user (unless admin)
    const { BookingService } = await Promise.resolve().then(() => __importStar(require('../services/BookingService')));
    const booking = await BookingService.getById(value.bookingId);
    if (!booking) {
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    }
    if (req.user.role !== 'admin' && booking.user_id !== userId) {
        throw (0, errorHandler_1.ApiError)('Cannot review another user\'s booking', 403);
    }
    const review = await ReviewService_1.ReviewService.createReview(userId, value.bookingId, value.rating, value.comment, value.images);
    res.status(201).json({ message: 'Review created', data: { review: camelize(review) } });
});
ReviewController.getByBooking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bookingId } = req.params;
    const reviews = await ReviewService_1.ReviewService.getByBooking(bookingId);
    // if not admin, ensure user owns booking
    if (req.user.role !== 'admin') {
        const { BookingService } = await Promise.resolve().then(() => __importStar(require('../services/BookingService')));
        const bookingData = await BookingService.getById(bookingId);
        if (!bookingData || bookingData.user_id !== req.user.id) {
            throw (0, errorHandler_1.ApiError)('Not authorized', 403);
        }
    }
    res.status(200).json({ message: 'Reviews fetched', data: { reviews: camelize(reviews) } });
});
ReviewController.getPublic = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { serviceId } = req.query;
    const reviews = await ReviewService_1.ReviewService.getPublic(serviceId);
    res.status(200).json({ message: 'Public reviews', data: { reviews: camelize(reviews) } });
});
ReviewController.listAll = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can view all reviews', 403);
    }
    const reviews = await ReviewService_1.ReviewService.getAll();
    res.status(200).json({ message: 'All reviews', data: { reviews: camelize(reviews) } });
});
ReviewController.approve = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can approve', 403);
    }
    const { id } = req.params;
    const review = await ReviewService_1.ReviewService.approve(id);
    if (!review) {
        throw (0, errorHandler_1.ApiError)('Review not found', 404);
    }
    res.status(200).json({ message: 'Review approved', data: { review: camelize(review) } });
});
ReviewController.uploadImages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    if (!files || files.length === 0) {
        throw (0, errorHandler_1.ApiError)('No files uploaded', 400);
    }
    const review = await ReviewService_1.ReviewService.getById(id);
    if (!review) {
        throw (0, errorHandler_1.ApiError)('Review not found', 404);
    }
    // only owner or admin
    if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
        throw (0, errorHandler_1.ApiError)('Not authorized', 403);
    }
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const urls = files.map(f => `${baseUrl}/uploads/reviews/${f.filename}`);
    const updated = await ReviewService_1.ReviewService.addImages(id, urls);
    res.status(200).json({ message: 'Images uploaded', data: { review: camelize(updated) } });
});
ReviewController.delete = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'admin') {
        throw (0, errorHandler_1.ApiError)('Only admins can delete reviews', 403);
    }
    await ReviewService_1.ReviewService.delete(id);
    res.status(200).json({ message: 'Review deleted' });
});
//# sourceMappingURL=ReviewController.js.map
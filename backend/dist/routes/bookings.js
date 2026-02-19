"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookingController_1 = __importDefault(require("../controllers/BookingController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Create booking (authenticated users)
router.post('/', auth_1.authenticateToken, BookingController_1.default.create);
// List bookings for current user (or all if admin query later)
router.get('/', auth_1.authenticateToken, BookingController_1.default.listByUser);
// Admin: list all bookings
router.get('/all', auth_1.authenticateToken, BookingController_1.default.listAll);
// Admin assign staff
router.post('/assign', auth_1.authenticateToken, BookingController_1.default.assignStaff);
// Staff: list own bookings
router.get('/staff', auth_1.authenticateToken, BookingController_1.default.listByStaff);
// Get specific booking
router.get('/:id', auth_1.authenticateToken, BookingController_1.default.getById);
// Admin updates booking status
router.put('/:id/status', auth_1.authenticateToken, BookingController_1.default.updateStatus);
// Delete booking (owner or admin)
router.delete('/:id', auth_1.authenticateToken, BookingController_1.default.remove);
exports.default = router;
//# sourceMappingURL=bookings.js.map
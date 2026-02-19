"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const PaymentService_1 = __importDefault(require("../services/PaymentService"));
const BookingService_1 = __importDefault(require("../services/BookingService"));
const stripe_1 = __importDefault(require("stripe"));
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new stripe_1.default(stripeSecret, { apiVersion: '2022-11-15' });
// helper to convert raw body buffer to string
function bufferToString(buffer) {
    return buffer.toString('utf8');
}
class PaymentController {
}
exports.PaymentController = PaymentController;
_a = PaymentController;
// legacy/pay-in-place handler (used when Stripe not configured)
PaymentController.payBooking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    const { bookingId } = req.body;
    if (!bookingId)
        throw (0, errorHandler_1.ApiError)('bookingId is required', 400);
    const booking = await BookingService_1.default.getById(bookingId);
    if (!booking)
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    // only owner or admin can pay
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        throw (0, errorHandler_1.ApiError)('Insufficient permissions', 403);
    }
    const updated = await PaymentService_1.default.markBookingPaid(bookingId);
    if (!updated)
        throw (0, errorHandler_1.ApiError)('Failed to update booking', 500);
    res.status(200).json({ message: 'Booking paid', data: { booking: updated } });
});
// create Stripe checkout session
PaymentController.checkoutSession = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        throw (0, errorHandler_1.ApiError)('Not authenticated', 401);
    const { bookingId } = req.body;
    if (!bookingId)
        throw (0, errorHandler_1.ApiError)('bookingId is required', 400);
    const booking = await BookingService_1.default.getById(bookingId);
    if (!booking)
        throw (0, errorHandler_1.ApiError)('Booking not found', 404);
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        throw (0, errorHandler_1.ApiError)('Insufficient permissions', 403);
    }
    if (!stripeSecret) {
        // stripe not configured, fallback to legacy
        const updated = await PaymentService_1.default.markBookingPaid(bookingId);
        return res.status(200).json({ message: 'Booking paid (fallback)', data: { booking: updated } });
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'brl',
                    product_data: {
                        name: `Booking ${booking.id}`,
                    },
                    unit_amount: Math.round(Number(booking.total_price) * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${bookingId}?paid=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${bookingId}`,
        metadata: { bookingId },
    });
    return res.status(200).json({ message: 'Session created', data: { url: session.url } });
});
// webhook endpoint
PaymentController.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;
    try {
        if (webhookSecret && sig) {
            const buf = bufferToString(req.body);
            event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
        }
        else {
            // if no secret provided, parse JSON directly (testing)
            event = req.body;
        }
    }
    catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
            await PaymentService_1.default.markBookingPaid(bookingId);
        }
    }
    return res.status(200).json({ received: true });
};
exports.default = PaymentController;
//# sourceMappingURL=PaymentController.js.map
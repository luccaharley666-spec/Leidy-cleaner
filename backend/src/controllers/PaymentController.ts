import { Response, Request } from 'express';
import { AuthRequest, asyncHandler, ApiError } from '../middleware/errorHandler';
import PaymentService from '../services/PaymentService';
import BookingService from '../services/BookingService';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' });

// helper to convert raw body buffer to string
function bufferToString(buffer: Buffer) {
  return buffer.toString('utf8');
}

export class PaymentController {
  // legacy/pay-in-place handler (used when Stripe not configured)
  static payBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw ApiError('Not authenticated', 401);

    const { bookingId } = req.body;
    if (!bookingId) throw ApiError('bookingId is required', 400);

    const booking = await BookingService.getById(bookingId);
    if (!booking) throw ApiError('Booking not found', 404);

    // only owner or admin can pay
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      throw ApiError('Insufficient permissions', 403);
    }

    const updated = await PaymentService.markBookingPaid(bookingId);
    if (!updated) throw ApiError('Failed to update booking', 500);

    res.status(200).json({ message: 'Booking paid', data: { booking: updated } });
  });

  // create Stripe checkout session
  static checkoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw ApiError('Not authenticated', 401);
    const { bookingId } = req.body;
    if (!bookingId) throw ApiError('bookingId is required', 400);
    const booking = await BookingService.getById(bookingId);
    if (!booking) throw ApiError('Booking not found', 404);

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      throw ApiError('Insufficient permissions', 403);
    }

    if (!stripeSecret) {
      // stripe not configured, fallback to legacy
      const updated = await PaymentService.markBookingPaid(bookingId);
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
  static webhook = async (req: Request, res: Response): Promise<any> => {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;

    try {
      if (webhookSecret && sig) {
        const buf = bufferToString(req.body as Buffer);
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
      } else {
        // if no secret provided, parse JSON directly (testing)
        event = req.body;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId as string;
      if (bookingId) {
        await PaymentService.markBookingPaid(bookingId);
      }
    }

    return res.status(200).json({ received: true });
  };
}

export default PaymentController;

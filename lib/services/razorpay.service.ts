import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ValidationError } from '../errors';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export class RazorpayService {
  /**
   * Create a Razorpay order
   * @param amount - Amount in currency units (will be converted to paise)
   * @param currency - Currency code (default: INR)
   * @returns Order details including order_id
   */
  async createOrder(amount: number, currency: string = 'INR') {
    if (!amount || amount <= 0) {
      throw new ValidationError('Invalid amount');
    }

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise (same as Stripe cents)
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          created_at: new Date().toISOString(),
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      };
    } catch (error: any) {
      console.error('Razorpay order creation error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   * @param razorpayOrderId - Order ID from Razorpay
   * @param razorpayPaymentId - Payment ID from Razorpay
   * @param razorpaySignature - Signature from Razorpay
   * @returns Boolean indicating if signature is valid
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    try {
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest('hex');

      return expectedSignature === razorpaySignature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Handle Razorpay webhook events
   * @param payload - Raw webhook payload
   * @param signature - Razorpay signature from x-razorpay-signature header
   * @returns Processed webhook event data
   */
  async handleWebhook(payload: string, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not defined');
    }

    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new ValidationError('Invalid webhook signature');
      }

      const event = JSON.parse(payload);

      switch (event.event) {
        case 'payment.captured':
          return {
            type: 'payment_success',
            paymentId: event.payload.payment.entity.id,
            orderId: event.payload.payment.entity.order_id,
            amount: event.payload.payment.entity.amount / 100,
            status: event.payload.payment.entity.status,
          };

        case 'payment.failed':
          return {
            type: 'payment_failed',
            paymentId: event.payload.payment.entity.id,
            orderId: event.payload.payment.entity.order_id,
            errorCode: event.payload.payment.entity.error_code,
            errorDescription: event.payload.payment.entity.error_description,
          };

        case 'order.paid':
          return {
            type: 'order_paid',
            orderId: event.payload.order.entity.id,
            amount: event.payload.order.entity.amount / 100,
          };

        default:
          return {
            type: 'unknown',
            eventType: event.event,
          };
      }
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Webhook processing error:', error);
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param paymentId - Razorpay payment ID
   * @returns Payment details
   */
  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        id: payment.id,
        orderId: payment.order_id,
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000),
      };
    } catch (error: any) {
      console.error('Failed to fetch payment:', error);
      throw new Error(`Failed to fetch payment details: ${error.message}`);
    }
  }
}

export default new RazorpayService();

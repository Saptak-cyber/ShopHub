import Stripe from 'stripe';
import { ValidationError } from '../errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export class StripeService {
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    if (!amount || amount <= 0) {
      throw new ValidationError('Invalid amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          return {
            type: 'payment_success',
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
          };

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          return {
            type: 'payment_failed',
            paymentIntentId: failedPayment.id,
          };

        default:
          return {
            type: 'unknown',
            eventType: event.type,
          };
      }
    } catch (error) {
      throw new ValidationError('Invalid webhook signature');
    }
  }
}

export default new StripeService();

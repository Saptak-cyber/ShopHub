import { NextRequest, NextResponse } from 'next/server';
import razorpayService from '@/lib/services/razorpay.service';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    const payload = await request.text();

    const result = await razorpayService.handleWebhook(payload, signature);

    // Log webhook event for debugging
    console.log('Razorpay webhook event:', result);

    // Here you can handle different webhook events
    // For example, mark order as paid when payment.captured event is received
    if (result.type === 'payment_success') {
      // TODO: Update order status in database if needed
      console.log('Payment captured:', result.paymentId);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Webhook processing failed',
      },
      { status: 400 }
    );
  }
}

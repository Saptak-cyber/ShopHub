import { NextRequest, NextResponse } from 'next/server';
import stripeService from '@/lib/services/stripe.service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing stripe-signature header',
        },
        { status: 400 }
      );
    }

    const body = await request.arrayBuffer();
    const payload = Buffer.from(body);

    const result = await stripeService.handleWebhook(payload, signature);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

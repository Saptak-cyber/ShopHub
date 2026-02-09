import { NextRequest, NextResponse } from 'next/server';
import stripeService from '@/lib/services/stripe.service';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
    const body = await request.json();
    const { amount } = body;

    const result = await stripeService.createPaymentIntent(amount);

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

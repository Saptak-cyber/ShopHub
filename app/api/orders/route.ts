import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/order.service';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    if (user.isAdmin) {
      const filters = status ? { status } : undefined;
      const orders = await orderService.getAllOrders(filters);

      return NextResponse.json({
        success: true,
        data: orders,
      });
    } else {
      const orders = await orderService.getUserOrders(user.id);

      return NextResponse.json({
        success: true,
        data: orders,
      });
    }
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

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { items, shippingAddress, stripePaymentId } = body;

    const order = await orderService.createOrder({
      userId: user.id,
      items,
      shippingAddress,
      stripePaymentId,
    });

    return NextResponse.json({
      success: true,
      data: order,
    }, { status: 201 });
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

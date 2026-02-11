import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/order.service';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { EmailService } from '@/lib/services/email.service';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    if (session.user.isAdmin) {
      const filters = status ? { status } : undefined;
      const orders = await orderService.getAllOrders(filters);

      return NextResponse.json({
        success: true,
        data: orders,
      });
    } else {
      const orders = await orderService.getUserOrders(session.user.id);

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
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    const order = await orderService.verifyAndCreateOrder({
      userId: session.user.id,
      items,
      shippingAddress,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    // Send order confirmation email (don't wait for it)
    if (session.user.email) {
      EmailService.sendOrderConfirmation(session.user.email, {
        orderId: order.id,
        total: Number(order.total),
        items: order.items.map((item: any) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        shippingAddress: order.shippingAddress
      }).catch((error) => {
        console.error("Failed to send order confirmation email:", error);
      });
    }

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

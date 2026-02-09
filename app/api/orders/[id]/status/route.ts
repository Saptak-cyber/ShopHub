import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/order.service';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { EmailService } from '@/lib/services/email.service';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const order = await orderService.updateOrderStatus(id, status);

    // Send shipping notification email for relevant status changes
    if (status === 'processing' || status === 'shipped' || status === 'delivered') {
      const orderWithUser = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: { email: true }
          }
        }
      });

      if (orderWithUser?.user.email) {
        EmailService.sendShippingNotification(orderWithUser.user.email, {
          orderId: order.id,
          status: order.status
        }).catch((error) => {
          console.error("Failed to send shipping notification email:", error);
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
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

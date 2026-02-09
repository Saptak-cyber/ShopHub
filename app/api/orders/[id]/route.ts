import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/order.service';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const userId = session.user.isAdmin ? undefined : session.user.id;
    const order = await orderService.getOrderById(id, userId);

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

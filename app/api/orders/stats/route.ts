import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/order.service';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const stats = await orderService.getOrderStats();

    return NextResponse.json({
      success: true,
      data: stats,
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

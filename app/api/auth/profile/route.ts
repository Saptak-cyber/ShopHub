import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/services/auth.service';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const profile = await authService.getUserById(user.id);

    return NextResponse.json({
      success: true,
      data: profile,
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

export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { name, email } = body;

    const updatedUser = await authService.updateUser(user.id, { name, email });

    return NextResponse.json({
      success: true,
      data: updatedUser,
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

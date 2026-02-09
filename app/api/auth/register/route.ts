import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/services/auth.service';
import { AppError } from '@/lib/errors';
import { EmailService } from '@/lib/services/email.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const result = await authService.register(email, password, name);

    // Send welcome email (don't wait for it)
    EmailService.sendWelcomeEmail(email, name).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    return NextResponse.json({
      success: true,
      data: result,
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

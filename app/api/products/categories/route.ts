import { NextResponse } from 'next/server';
import productService from '@/lib/services/product.service';
import { AppError } from '@/lib/errors';

export async function GET() {
  try {
    const categories = await productService.getCategories();

    return NextResponse.json({
      success: true,
      data: categories,
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

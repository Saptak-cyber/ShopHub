import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/lib/services/review.service";

// GET /api/products/[id]/reviews/stats - Get review statistics for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stats = await ReviewService.getProductReviewStats(params.id);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error("Get review stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get review statistics"
      },
      { status: error.statusCode || 500 }
    );
  }
}

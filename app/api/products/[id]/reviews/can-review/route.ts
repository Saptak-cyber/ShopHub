import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/lib/services/review.service";
import { auth } from "@/lib/auth";

// GET /api/products/[id]/reviews/can-review - Check if user can review a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await ReviewService.canUserReview(session.user.id, params.id);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Check can review error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to check review eligibility"
      },
      { status: error.statusCode || 500 }
    );
  }
}

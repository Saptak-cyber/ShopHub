import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/lib/services/review.service";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(10).max(1000).optional(),
  images: z.array(z.string().url()).optional()
});

// PATCH /api/reviews/[id] - Update a review
export async function PATCH(
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

    const body = await request.json();
    const validatedData = updateReviewSchema.parse(body);

    const review = await ReviewService.updateReview(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review updated successfully"
    });
  } catch (error: any) {
    console.error("Update review error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update review"
      },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
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

    const result = await ReviewService.deleteReview(
      params.id,
      session.user.id,
      session.user.isAdmin
    );

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error: any) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete review"
      },
      { status: error.statusCode || 500 }
    );
  }
}

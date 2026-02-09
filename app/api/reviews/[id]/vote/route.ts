import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/lib/services/review.service";
import { auth } from "@/lib/auth";
import { z } from "zod";

const voteSchema = z.object({
  helpful: z.boolean()
});

// POST /api/reviews/[id]/vote - Vote on a review
export async function POST(
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
    const { helpful } = voteSchema.parse(body);

    const vote = await ReviewService.voteReview(
      params.id,
      session.user.id,
      helpful
    );

    return NextResponse.json({
      success: true,
      data: vote,
      message: "Vote recorded successfully"
    });
  } catch (error: any) {
    console.error("Vote review error:", error);

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
        message: error.message || "Failed to record vote"
      },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE /api/reviews/[id]/vote - Remove vote from a review
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

    const result = await ReviewService.removeVote(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Vote removed successfully"
    });
  } catch (error: any) {
    console.error("Remove vote error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove vote"
      },
      { status: error.statusCode || 500 }
    );
  }
}

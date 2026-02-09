import { NextRequest, NextResponse } from "next/server";
import { ReviewService } from "@/lib/services/review.service";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Validation schema for creating a review
const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, "Title is required").max(100),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
  images: z.array(z.string().url()).optional()
});

// GET /api/reviews - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const sortBy = searchParams.get("sortBy") as any || "newest";
    const rating = searchParams.get("rating");
    const verified = searchParams.get("verified");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await ReviewService.getProductReviews(productId, {
      sortBy,
      rating: rating ? parseInt(rating) : undefined,
      verified: verified === "true" ? true : verified === "false" ? false : undefined,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get reviews"
      },
      { status: error.statusCode || 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    const review = await ReviewService.createReview({
      ...validatedData,
      userId: session.user.id
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review created successfully"
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create review error:", error);

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
        message: error.message || "Failed to create review"
      },
      { status: error.statusCode || 500 }
    );
  }
}

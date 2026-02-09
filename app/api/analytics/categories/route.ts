import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET /api/analytics/categories - Get revenue by category
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const categoryData = await AnalyticsService.getRevenueByCategory();

    return NextResponse.json({
      success: true,
      data: categoryData
    });
  } catch (error: any) {
    console.error("Get category analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get category analytics"
      },
      { status: error.statusCode || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET /api/analytics/revenue - Get revenue over time
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const revenue = await AnalyticsService.getRevenueOverTime(days);

    return NextResponse.json({
      success: true,
      data: revenue
    });
  } catch (error: any) {
    console.error("Get revenue error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get revenue data"
      },
      { status: error.statusCode || 500 }
    );
  }
}

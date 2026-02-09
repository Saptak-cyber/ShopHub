import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET /api/analytics/stats - Get overall statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const stats = await AnalyticsService.getOverallStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get statistics"
      },
      { status: error.statusCode || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET /api/analytics/products - Get product analytics
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
    const type = searchParams.get("type") || "top"; // top, performance, lowstock
    const limit = parseInt(searchParams.get("limit") || "10");

    let data;

    switch (type) {
      case "top":
        data = await AnalyticsService.getTopProducts(limit);
        break;
      case "performance":
        data = await AnalyticsService.getProductPerformance(limit);
        break;
      case "lowstock":
        data = await AnalyticsService.getLowStockProducts(limit);
        break;
      default:
        data = await AnalyticsService.getTopProducts(limit);
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error("Get product analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get product analytics"
      },
      { status: error.statusCode || 500 }
    );
  }
}

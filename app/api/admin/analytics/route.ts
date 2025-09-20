import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getRecentActivity,
  getPerformanceMetrics,
} from "@/_actions/_analytics";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "dashboard";
    const period = searchParams.get("period") as "7d" | "30d" | "90d" | "1y" || "30d";

    let result;

    switch (type) {
      case "dashboard":
        result = await getDashboardStats();
        break;
      case "sales":
        result = await getSalesAnalytics(period);
        break;
      case "products":
        result = await getProductAnalytics();
        break;
      case "customers":
        result = await getCustomerAnalytics();
        break;
      case "activity":
        result = await getRecentActivity();
        break;
      case "performance":
        result = await getPerformanceMetrics();
        break;
      case "all":
        // Get all analytics data for comprehensive dashboard
        const [dashboard, sales, products, customers, activity, performance] = await Promise.all([
          getDashboardStats(),
          getSalesAnalytics(period),
          getProductAnalytics(),
          getCustomerAnalytics(),
          getRecentActivity(),
          getPerformanceMetrics(),
        ]);

        if (!dashboard.success || !sales.success || !products.success || 
            !customers.success || !activity.success || !performance.success) {
          return NextResponse.json(
            { error: "Failed to fetch some analytics data" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          dashboard: dashboard.data,
          sales: sales.data,
          products: products.data,
          customers: customers.data,
          activity: activity.data,
          performance: performance.data,
        });
      default:
        return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

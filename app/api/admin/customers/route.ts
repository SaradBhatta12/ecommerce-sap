import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/customers - Get customers with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Handle special endpoints
    if (searchParams.get("stats") === "true") {
      const totalCustomers = await User.countDocuments({ role: { $ne: "superadmin" } });
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          totalCustomers,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
      });
    }

    if (searchParams.get("export") === "true") {
      const customers = await User.find({ role: { $ne: "superadmin" } })
        .select("name email role createdAt")
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        customers,
      });
    }

    // Regular customer list with pagination and filters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = { role: { $ne: "superadmin" } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role !== "all") {
      filter.role = role;
    }

    // Get customers with basic info
    const customers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get order statistics for each customer
    const customerIds = customers.map(c => c._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ]);

    // Create a map for quick lookup
    const statsMap = new Map();
    orderStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        totalOrders: stat.totalOrders,
        totalSpent: stat.totalSpent,
        lastOrderDate: stat.lastOrderDate
      });
    });

    // Enhance customers with order statistics
    const enhancedCustomers = customers.map(customer => {
      const stats = statsMap.get(customer._id.toString()) || {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null
      };

      return {
        ...customer,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
        // Add status based on activity
        status: stats.lastOrderDate && 
          new Date(stats.lastOrderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          ? "active" : "inactive"
      };
    });

    const totalCustomers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit);

    return NextResponse.json({
      success: true,
      customers: enhancedCustomers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
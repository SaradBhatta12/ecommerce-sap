"use server";

import dbConnect from "@/lib/db-connect";
import Order from "@/models/order";
import Product from "@/models/product";
import User from "@/models/user";
import Category from "@/models/category";
import Brand from "@/models/brand";

// Dashboard Overview Stats
export async function getDashboardStats() {
  try {
    await dbConnect();

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalCategories,
      totalBrands,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: { $ne: "admin" } }),
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "completed" }),
      Category.countDocuments(),
      Brand.countDocuments(),
    ]);

    return {
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        completedOrders,
        totalCategories,
        totalBrands,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
    };
  }
}

// Sales Analytics
export async function getSalesAnalytics(period: string = "30d") {
  try {
    await dbConnect();

    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Revenue by category
    const categoryRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return {
      success: true,
      data: {
        salesData,
        categoryRevenue,
      },
    };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return {
      success: false,
      error: "Failed to fetch sales analytics",
    };
  }
}

// Product Analytics
export async function getProductAnalytics() {
  try {
    await dbConnect();

    const [topSellingProducts, lowStockProducts, categoryDistribution] = await Promise.all([
      // Top selling products
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            name: "$product.name",
            image: "$product.images.0",
            totalSold: 1,
            revenue: 1,
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),

      // Low stock products
      Product.find({ stock: { $lt: 10 } })
        .select("name images stock")
        .limit(10)
        .lean(),

      // Category distribution
      Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $group: {
            _id: "$category.name",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      success: true,
      data: {
        topSellingProducts,
        lowStockProducts,
        categoryDistribution,
      },
    };
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    return {
      success: false,
      error: "Failed to fetch product analytics",
    };
  }
}

// Customer Analytics
export async function getCustomerAnalytics(period: string = "30d") {
  try {
    await dbConnect();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newCustomers, customerGrowth, topCustomers, customerOrders] = await Promise.all([
      // New customers this month
      User.countDocuments({
        role: { $ne: "admin" },
        createdAt: { $gte: thirtyDaysAgo },
      }),

      // Customer growth over time
      User.aggregate([
        {
          $match: {
            role: { $ne: "admin" },
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // Top customers by order value
      Order.aggregate([
        {
          $group: {
           _id: "$user",
           totalSpent: { $sum: "$totalAmount" },
           orderCount: { $sum: 1 },
         },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            name: "$user.name",
            email: "$user.email",
            totalSpent: 1,
            orderCount: 1,
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
      ]),

      // Customer order distribution
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      success: true,
      data: {
        newCustomers,
        customerGrowth,
        topCustomers,
        customerOrders,
      },
    };
  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    return {
      success: false,
      error: "Failed to fetch customer analytics",
    };
  }
}

// Recent Activity
export async function getRecentActivity() {
  try {
    await dbConnect();

    const [recentOrders, recentUsers, recentProducts] = await Promise.all([
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt")
        .lean(),

      Product.find()
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name images category createdAt")
        .lean(),
    ]);

    return {
      success: true,
      data: {
        recentOrders,
        recentUsers,
        recentProducts,
      },
    };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return {
      success: false,
      error: "Failed to fetch recent activity",
    };
  }
}

// Performance Metrics
export async function getPerformanceMetrics(period: string = "30d") {
  try {
    await dbConnect();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [currentPeriod, previousPeriod] = await Promise.all([
      // Current 30 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$totalAmount" },
          },
        },
      ]),

      // Previous 30 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$totalAmount" },
          },
        },
      ]),
    ]);

    const current = currentPeriod[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const previous = previousPeriod[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    // Calculate percentage changes with proper validation and rounding
    const revenueChange = previous.totalRevenue > 0 && typeof previous.totalRevenue === 'number' && !isNaN(previous.totalRevenue)
      ? Math.round(((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 * 100) / 100
      : 0;

    const ordersChange = previous.totalOrders > 0 && typeof previous.totalOrders === 'number' && !isNaN(previous.totalOrders)
      ? Math.round(((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 * 100) / 100
      : 0;

    const avgOrderChange = previous.avgOrderValue > 0 && typeof previous.avgOrderValue === 'number' && !isNaN(previous.avgOrderValue)
      ? Math.round(((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100 * 100) / 100
      : 0;

    return {
      success: true,
      data: {
        current,
        previous,
        changes: {
          revenue: revenueChange,
          orders: ordersChange,
          avgOrderValue: avgOrderChange,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return {
      success: false,
      error: "Failed to fetch performance metrics",
    };
  }
}
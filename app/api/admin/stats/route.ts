import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Order from "@/models/order"
import Product from "@/models/product"
import User from "@/models/user"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Get current date and date 30 days ago
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date(now)
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    // Get total revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0

    // Get revenue from last 30 days
    const revenueLastMonthResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])
    const revenueLastMonth = revenueLastMonthResult.length > 0 ? revenueLastMonthResult[0].total : 0

    // Get revenue from 30-60 days ago
    const revenuePreviousMonthResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])
    const revenuePreviousMonth = revenuePreviousMonthResult.length > 0 ? revenuePreviousMonthResult[0].total : 0

    // Calculate revenue change percentage
    const revenueChange =
      revenuePreviousMonth === 0
        ? 100
        : Math.round(((revenueLastMonth - revenuePreviousMonth) / revenuePreviousMonth) * 100)

    // Get total orders
    const totalOrders = await Order.countDocuments()

    // Get orders from last 30 days
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get orders from 30-60 days ago
    const ordersPreviousMonth = await Order.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    })

    // Calculate orders change percentage
    const ordersChange =
      ordersPreviousMonth === 0
        ? 100
        : Math.round(((ordersLastMonth - ordersPreviousMonth) / ordersPreviousMonth) * 100)

    // Get total products
    const totalProducts = await Product.countDocuments()

    // Get products created in last 30 days
    const productsLastMonth = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get products created 30-60 days ago
    const productsPreviousMonth = await Product.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    })

    // Calculate products change percentage
    const productsChange =
      productsPreviousMonth === 0
        ? 100
        : Math.round(((productsLastMonth - productsPreviousMonth) / productsPreviousMonth) * 100)

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: "user" })

    // Get customers created in last 30 days
    const customersLastMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get customers created 30-60 days ago
    const customersPreviousMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    })

    // Calculate customers change percentage
    const customersChange =
      customersPreviousMonth === 0
        ? 100
        : Math.round(((customersLastMonth - customersPreviousMonth) / customersPreviousMonth) * 100)

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueChange,
      ordersChange,
      productsChange,
      customersChange,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}

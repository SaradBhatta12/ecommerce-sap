import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Order from "@/models/order"
import User from "@/models/user"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get("detailed") === "true"

    // Connect to database
    await dbConnect()

    // Get current date
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Create data for the last 6 months
    const data = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1)
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0)

      const monthName = month.toLocaleString("default", { month: "short" })

      // Get revenue for this month
      const revenueResult = await Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: month, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])
      const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0

      if (detailed) {
        // Get order count for this month
        const orderCount = await Order.countDocuments({
          createdAt: { $gte: month, $lte: monthEnd },
        })

        // Get new customers for this month
        const customerCount = await User.countDocuments({
          role: "user",
          createdAt: { $gte: month, $lte: monthEnd },
        })

        data.push({
          name: monthName,
          revenue: revenue,
          orders: orderCount * 1000, // Scale for visualization
          customers: customerCount * 2000, // Scale for visualization
        })
      } else {
        data.push({
          name: monthName,
          total: revenue,
        })
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

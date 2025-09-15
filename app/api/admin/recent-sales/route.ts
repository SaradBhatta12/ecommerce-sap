import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Order from "@/models/order"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get recent orders
    const recentOrders = await Order.find({ status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean()

    // Format the sales data
    const sales = await Promise.all(
      recentOrders.map(async (order) => {
        let customer = {
          name: "Guest User",
          email: "guest@example.com",
          initials: "GU",
        }

        if (order.user) {
          const user = order.user
          const nameParts = user.name.split(" ")
          const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : user.name.substring(0, 2)

          customer = {
            name: user.name,
            email: user.email,
            initials: initials.toUpperCase(),
          }
        }

        return {
          id: order._id.toString(),
          customer,
          amount: order.total,
          date: order.createdAt,
        }
      }),
    )

    return NextResponse.json({ sales })
  } catch (error) {
    console.error("Error fetching recent sales:", error)
    return NextResponse.json({ error: "Failed to fetch recent sales" }, { status: 500 })
  }
}

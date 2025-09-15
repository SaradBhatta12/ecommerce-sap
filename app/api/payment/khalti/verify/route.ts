import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Order from "@/models/order"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, transactionId, amount } = await request.json()

    if (!orderId || !transactionId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Find order
    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify order belongs to user
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update order payment status
    order.paymentStatus = "paid"
    order.paymentDetails = {
      transactionId,
      provider: "khalti",
      amount: Number.parseFloat(amount),
      date: new Date(),
    }

    // Add to timeline
    order.timeline.push({
      status: "Payment Confirmed",
      date: new Date(),
      description: "Payment has been confirmed via Khalti.",
    })

    // Save order
    await order.save()

    return NextResponse.json({
      message: "Payment verified successfully",
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

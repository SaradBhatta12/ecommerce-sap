import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Discount from "@/models/discount"

export async function POST(request: Request) {
  try {
    const { discountId } = await request.json()

    if (!discountId) {
      return NextResponse.json({ error: "Discount ID is required" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Increment usage count
    const discount = await Discount.findByIdAndUpdate(discountId, { $inc: { usedCount: 1 } }, { new: true })

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Discount applied successfully",
      discount: {
        _id: discount._id,
        code: discount.code,
        usedCount: discount.usedCount,
      },
    })
  } catch (error) {
    console.error("Error applying discount:", error)
    return NextResponse.json({ error: "Failed to apply discount" }, { status: 500 })
  }
}

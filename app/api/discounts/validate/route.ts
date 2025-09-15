import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Discount from "@/models/discount"

export async function POST(request: Request) {
  try {
    const { code, cartTotal, items } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Discount code is required" }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Find discount by code
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).lean()

    if (!discount) {
      return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 404 })
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return NextResponse.json({ error: "Discount usage limit reached" }, { status: 400 })
    }

    // Check minimum purchase
    if (discount.minPurchase && cartTotal < discount.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase amount of NPR ${discount.minPurchase} required`,
        },
        { status: 400 },
      )
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discount.type === "percentage") {
      discountAmount = (cartTotal * discount.value) / 100

      // Apply maximum discount if set
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount
      }
    } else {
      discountAmount = discount.value

      // Don't allow discount greater than cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal
      }
    }

    return NextResponse.json({
      valid: true,
      discount: {
        _id: discount._id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: Math.round(discountAmount),
      },
    })
  } catch (error) {
    console.error("Error validating discount:", error)
    return NextResponse.json({ error: "Failed to validate discount" }, { status: 500 })
  }
}

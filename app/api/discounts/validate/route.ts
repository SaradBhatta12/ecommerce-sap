import { NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Discount from "@/models/discount"

export async function POST(request: Request) {
  try {
    const { code, cartTotal, cartItems } = await request.json()

    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        message: "Discount code is required" 
      }, { status: 400 })
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
      return NextResponse.json({ 
        valid: false, 
        message: "Invalid or expired discount code" 
      }, { status: 404 })
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json({ 
        valid: false, 
        message: "This discount code has reached its usage limit" 
      }, { status: 400 })
    }

    // Check minimum purchase
    if (discount.minPurchase && cartTotal < discount.minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum purchase of Rs. ${discount.minPurchase.toLocaleString()} required for this discount`,
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
        minPurchase: discount.minPurchase,
        maxDiscount: discount.maxDiscount,
        usageCount: discount.usageCount,
        usageLimit: discount.usageLimit,
      },
      discountAmount: Math.round(discountAmount),
      message: "Discount code applied successfully",
    })
  } catch (error) {
    console.error("Error validating discount:", error)
    return NextResponse.json({ 
      valid: false, 
      message: "Failed to validate discount code" 
    }, { status: 500 })
  }
}

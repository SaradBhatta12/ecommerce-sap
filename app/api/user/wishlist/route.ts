import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Wishlist from "@/models/wishlist"
import mongoose from "mongoose"

// Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const wishlistItems = await Wishlist.find({ user: new mongoose.Types.ObjectId(session.user.id as string) })
      .populate({
        path: "product",
        select: "_id name slug price discountPrice images category rating reviewCount description inStock originalPrice",
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if item already exists in wishlist
    const existingItem = await Wishlist.findOne({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: productId,
    })

    if (existingItem) {
      return NextResponse.json({ message: "Item already in wishlist" })
    }

    // Add item to wishlist
    const wishlistItem = await Wishlist.create({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: new mongoose.Types.ObjectId(productId),
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to get productId from URL params first, then from request body
    const { searchParams } = new URL(request.url)
    let productId = searchParams.get("productId")
    
    // If not in URL params, try to get from request body
    if (!productId) {
      try {
        const body = await request.json()
        productId = body.productId
      } catch (error) {
        // If JSON parsing fails, productId remains null
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await dbConnect()

    const deletedItem = await Wishlist.findOneAndDelete({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: new mongoose.Types.ObjectId(productId),
    })

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from wishlist" })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

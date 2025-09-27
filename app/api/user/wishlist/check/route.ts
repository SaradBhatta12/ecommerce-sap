import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Wishlist from "@/models/wishlist"
import mongoose from "mongoose"

// Check if product is in user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await dbConnect()

    const wishlistItem = await Wishlist.findOne({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: new mongoose.Types.ObjectId(productId),
    })

    return NextResponse.json({ 
      isInWishlist: !!wishlistItem,
      wishlistItemId: wishlistItem?._id || null
    })
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
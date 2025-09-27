import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Wishlist from "@/models/wishlist"
import mongoose from "mongoose"

// Clear user's wishlist
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const result = await Wishlist.deleteMany({ user: new mongoose.Types.ObjectId(session.user.id as string) })

    return NextResponse.json({ 
      message: "Wishlist cleared successfully",
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error("Error clearing wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

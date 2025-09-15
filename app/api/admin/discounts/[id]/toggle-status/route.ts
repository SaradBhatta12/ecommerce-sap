import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Discount from "@/models/discount"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { isActive } = await request.json()

    // Connect to database
    await dbConnect()

    // Update discount status
    const discount = await Discount.findByIdAndUpdate(id, { isActive }, { new: true })

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: `Discount ${isActive ? "activated" : "deactivated"} successfully`,
      discount,
    })
  } catch (error) {
    console.error("Error updating discount status:", error)
    return NextResponse.json({ error: "Failed to update discount status" }, { status: 500 })
  }
}

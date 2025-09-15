import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Discount from "@/models/discount"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Connect to database
    await dbConnect()

    // Find discount by ID
    const discount = await Discount.findById(id).lean()

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({ discount })
  } catch (error) {
    console.error("Error fetching discount:", error)
    return NextResponse.json({ error: "Failed to fetch discount" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const updateData = await request.json()

    // Connect to database
    await dbConnect()

    // Check if discount code already exists (if code is being changed)
    if (updateData.code) {
      const existingDiscount = await Discount.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      })

      if (existingDiscount) {
        return NextResponse.json({ error: "Discount code already exists" }, { status: 409 })
      }

      // Ensure code is uppercase
      updateData.code = updateData.code.toUpperCase()
    }

    // Update discount
    const discount = await Discount.findByIdAndUpdate(id, updateData, { new: true })

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Discount updated successfully",
      discount,
    })
  } catch (error) {
    console.error("Error updating discount:", error)
    return NextResponse.json({ error: "Failed to update discount" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Connect to database
    await dbConnect()

    // Delete discount
    const discount = await Discount.findByIdAndDelete(id)

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Discount deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting discount:", error)
    return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 })
  }
}

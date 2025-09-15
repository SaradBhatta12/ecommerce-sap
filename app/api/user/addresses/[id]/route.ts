import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import User from "@/models/user"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addressId = params.id
    const addressData = await request.json()

    // Connect to database
    await dbConnect()

    // Get user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find address index
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // If setting as default, update all other addresses
    if (addressData.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false
      })
    }

    // Update address
    user.addresses[addressIndex] = { ...user.addresses[addressIndex].toObject(), ...addressData }

    // Save user
    await user.save()

    return NextResponse.json({
      message: "Address updated successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addressId = params.id

    // Connect to database
    await dbConnect()

    // Get user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find address index
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault

    // Remove address
    user.addresses.splice(addressIndex, 1)

    // If it was the default address and there are other addresses, set the first one as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    // Save user
    await user.save()

    return NextResponse.json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}

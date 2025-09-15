import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import User from "@/models/user"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Get user profile
    const user = await User.findById(session.user.id).select("-password").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await request.json()
    const { currentPassword, newPassword, ...updateData } = userData

    // Connect to database
    await dbConnect()

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const user = await User.findById(session.user.id)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)

      if (!isPasswordMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(session.user.id, updateData, {
      new: true,
    }).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}

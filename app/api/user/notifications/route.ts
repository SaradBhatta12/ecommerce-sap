import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import User from "@/models/user"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Get user's notification preferences
    const user = await User.findById(session.user.id).select("notificationPreferences").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Default notification preferences if not set
    const defaultPreferences = {
      email: true,
      marketing: false,
      orderUpdates: true,
      newProducts: false,
      wishlistReminders: true,
      priceDropAlerts: false,
      stockAlerts: true,
      reviewReminders: true,
    }

    const preferences = user.notificationPreferences || defaultPreferences

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json({ error: "Failed to fetch notification preferences" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await request.json()

    // Validate preferences structure
    const validKeys = [
      "email",
      "marketing",
      "orderUpdates",
      "newProducts",
      "wishlistReminders",
      "priceDropAlerts",
      "stockAlerts",
      "reviewReminders",
    ]

    const filteredPreferences = {}
    for (const key of validKeys) {
      if (typeof preferences[key] === "boolean") {
        filteredPreferences[key] = preferences[key]
      }
    }

    // Connect to database
    await dbConnect()

    // Update user's notification preferences
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { notificationPreferences: filteredPreferences } },
      { new: true, upsert: true }
    ).select("notificationPreferences")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      preferences: updatedUser.notificationPreferences,
    })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ error: "Failed to update notification preferences" }, { status: 500 })
  }
}
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import { getCurrentSession } from "@/lib/auth-utils";

// GET all users for an admin
export async function GET() {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find all users except superadmins
    const users = await User.find({
      role: { $ne: "superadmin" },
    }).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new user (admin only)
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role = "user" } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role,
      provider: "credentials",
    });

    await newUser.save();

    // Remove password from response
    const { password: _, ...userResponse } = newUser.toObject();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

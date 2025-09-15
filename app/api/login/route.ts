import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper: Set auth cookies
function setAuthCookies(
  response: NextResponse,
  token: string,
  sessionData: any
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };

  // Auth token
  response.cookies.set("token", token, cookieOptions);

  // Session cookie
  response.cookies.set(
    "session",
    JSON.stringify(sessionData),
    cookieOptions
  );
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        userType: existingUser.userType,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Session payload
    const sessionData = {
      userId: existingUser._id.toString(),
      role: existingUser.role,
      userType: existingUser.userType,
      lastAccess: new Date().toISOString(),
    };

    // Response with cookies
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        userType: existingUser.userType,
      },
    });

    setAuthCookies(response, token, sessionData);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

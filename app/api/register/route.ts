import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, domain } = data;

    await dbConnect();

    const StoreExist = await User.findOne({ domain });
    if (!StoreExist) {
      return NextResponse.json(
        { error: "Store not exist. Unauthorized user." },
        { status: 409 }
      );
    }

    const StoreId = StoreExist._id;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check if this user already exists for the same domain
    const existingUser = await User.findOne({ email, userOf: StoreId });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists for this domain" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData: any = {
      name,
      email,
      password: hashedPassword,
      userType: "user",
      role: "user",
      provider: "credentials",
      userOf: new mongoose.Types.ObjectId(StoreId),
    };

    const newUser = new User(userData);
    await newUser.save();

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

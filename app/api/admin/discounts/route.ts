import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db-connect";
import Discount from "@/models/discount";
import { getCurrentUserId } from "@/lib/auth-utils";
import mongoose from "mongoose";
import user from "@/models/user";

export async function GET() {
  try {
    await dbConnect();

    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database

    // Get all discounts created by the current admin, sorted by creation date
    const discounts = await Discount.find({
      createdBy: new mongoose.Types.ObjectId(adminId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = await user.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Connect to database
    await dbConnect();

    // Check if discount code already exists
    const existingDiscount = await Discount.findOne({
      code: data.code.toUpperCase(),
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 409 }
      );
    }

    // Ensure code is uppercase
    data.code = data.code.toUpperCase();

    // Create discount
    const discount = await Discount.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(adminId),
      updatedBy: new mongoose.Types.ObjectId(adminId),
    });

    return NextResponse.json(
      {
        message: "Discount created successfully",
        discount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}

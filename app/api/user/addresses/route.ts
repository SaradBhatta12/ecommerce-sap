import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import mongoose from "mongoose";
import { getCurrentUserId } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();
    const userid = session.user.id;
    // Get user's addresses
    const user = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userid) },
      },
      {
        $project: { addresses: 1 },
      },
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ addresses: user[0].addresses || [] });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      fullName,
      phone,
      city,
      province,
      postalCode,
      landmark,
      coordinates,
      isDefault,
      locality,
    } = body;

    // Validation
    if (!fullName || !phone || !city || !province) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build new address
    const newAddress = {
      fullName,
      phone,
      city,
      province,
      postalCode,
      landmark,
      locality,
      coordinates,
      isDefault,
      address: `${locality}, ${city}, ${province}, ${postalCode}`,
    };

    // Reset default if required
    if (isDefault || user.addresses.length === 0) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.addresses.push(newAddress);
    user.markModified("addresses");

    await user.save();

    return NextResponse.json(
      {
        message: "Address added successfully",
        addresses: user.addresses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}

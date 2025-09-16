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
      alternatePhone,
      district,
      province,
      locality,
      postalCode,
      landmark,
      addressType = 'home',
      coordinates,
      isDefault = false,
      deliveryInstructions,
    } = body;

    // Enhanced validation
    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^(9[678]\d{8})$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Nepali phone number (98xxxxxxxx)" },
        { status: 400 }
      );
    }

    // Validate alternate phone if provided
    if (alternatePhone && !phoneRegex.test(alternatePhone)) {
      return NextResponse.json(
        { error: "Please enter a valid alternate phone number (98xxxxxxxx)" },
        { status: 400 }
      );
    }

    // Validate postal code if provided
    if (postalCode && !/^\d{5}$/.test(postalCode)) {
      return NextResponse.json(
        { error: "Postal code must be 5 digits" },
        { status: 400 }
      );
    }

    // Validate address type
    if (!['home', 'office', 'other'].includes(addressType)) {
      return NextResponse.json(
        { error: "Address type must be home, office, or other" },
        { status: 400 }
      );
    }

    // Validate coordinates if provided
    if (coordinates) {
      const { lat, lng } = coordinates;
      if (lat && (lat < -90 || lat > 90)) {
        return NextResponse.json(
          { error: "Latitude must be between -90 and 90" },
          { status: 400 }
        );
      }
      if (lng && (lng < -180 || lng > 180)) {
        return NextResponse.json(
          { error: "Longitude must be between -180 and 180" },
          { status: 400 }
        );
      }
    }

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build full address string
    const addressParts = [locality, district, province, postalCode].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    // Build new address object
    const newAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone?.trim(),
      district: district?.trim(),
      province: province?.trim(),
      locality: locality?.trim(),
      postalCode: postalCode?.trim(),
      landmark: landmark?.trim(),
      addressType,
      coordinates: coordinates || undefined,
      isDefault,
      isActive: true,
      deliveryInstructions: deliveryInstructions?.trim(),
      address: fullAddress,
    };

    // Handle default address logic
    if (isDefault || user.addresses.length === 0) {
      // Set all existing addresses to non-default
      user.addresses = user.addresses.map((addr: any) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
      newAddress.isDefault = true;
    }

    // Add new address
    user.addresses.push(newAddress);
    user.markModified("addresses");

    await user.save();

    return NextResponse.json(
      {
        message: "Address added successfully",
        address: newAddress,
        addresses: user.addresses,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding address:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import mongoose from "mongoose";

// GET - Get admin store information
export async function GET() {
  try {
    const user = await getCurrentUserId();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    const store = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user) },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          addresses: 1,
          vendorProfile: 1,
          storeName: 1,
          storeDescription: 1,
          banner: 1,
          logo: 1,
          businessType: 1,
        },
      },
    ]);

    if (!store || store.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found",
        },
        { status: 404 }
      );
    }

    const storeCleanFormat = JSON.parse(JSON.stringify(store[0]));
    return NextResponse.json(
      {
        success: true,
        message: "Store found",
        store: storeCleanFormat,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update store information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { storename, businessType } = body;

    if (!storename || !businessType) {
      return NextResponse.json(
        {
          success: false,
          message: "Store name and business type are required",
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUserId();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    const store = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          "vendorProfile.storeName": storename,
          "vendorProfile.businessType": businessType,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Store updated successfully. you can carry on.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
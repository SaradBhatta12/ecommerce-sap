import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import mongoose from "mongoose";

// GET - Get store info
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

    const storeCleanFormat = JSON.stringify(store[0]);
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

// PUT - Update store info with image upload support
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const description = formData.get("description") as string | null;
    const storename = formData.get("storename") as string | null;
    const businessType = formData.get("businessType") as string | null;

    let imageUrl = null;
    if (image) {
      const uploadFormData = new FormData();
      uploadFormData.append("file", image);
      
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();
      imageUrl = data.url;
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

    // Build the $set object conditionally
    const updateFields: any = {};

    if (storename) updateFields["vendorProfile.storeName"] = storename;
    if (businessType) updateFields["vendorProfile.businessType"] = businessType;
    if (description) updateFields["vendorProfile.storeDescription"] = description;
    if (imageUrl) updateFields["vendorProfile.logo"] = imageUrl;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No data provided to update",
        },
        { status: 400 }
      );
    }

    const store = await User.findByIdAndUpdate(
      user,
      { $set: updateFields },
      { new: true }
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
        message: "Store updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
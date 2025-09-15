import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db-connect";
import Brand from "@/models/brand";
import Product from "@/models/product";
import { getCurrentUserId } from "@/lib/auth-utils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Connect to database
    await dbConnect();

    // Validate if the id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    // Find brand by _id (if valid) or slug
    const brand = await Brand.findOne({
      $or: isValidObjectId ? [{ _id: id }, { slug: id }] : [{ slug: id }],
    }).lean();

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Count products associated with the brand
    const productCount = await Product.countDocuments({ brand: brand._id });

    // Combine brand data with productCount
    const brandWithCount = {
      ...brand,
      productCount,
    };

    return NextResponse.json({ brand: brandWithCount });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const updateData = await request.json();

    // Connect to database
    await dbConnect();

    // Update brand
    const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Brand updated successfully",
      brand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Connect to database
    await dbConnect();

    // Check if brand has products
    const productCount = await Product.countDocuments({ brand: id });
    if (productCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete brand with products. Please reassign or delete the products first.",
        },
        { status: 400 }
      );
    }

    // Delete brand
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";
import mongoose from "mongoose";

// GET - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    await dbConnect();

    const product = await Product.findById(productId)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      category,
      images,
      inventory,
      sku,
      weight,
      dimensions,
      tags,
      isActive,
    } = body;

    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const updatePayload: any = {
      name,
      description,
      price,
      comparePrice,
      images,
      inventory,
      sku,
      weight,
      dimensions,
      tags,
      isActive,
      updatedBy: new mongoose.Types.ObjectId(adminId),
      updatedAt: new Date(),
    };

    if (category) {
      updatePayload.category = new mongoose.Types.ObjectId(category);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatePayload,
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update product",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import Category from "@/models/category";
import mongoose from "mongoose";

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const body = await request.json();
    const { name, description, parent, image, order, isActive } = body;

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
      image,
      order,
      isActive,
      updatedBy: new mongoose.Types.ObjectId(adminId),
      admin: new mongoose.Types.ObjectId(adminId),
      createdBy: new mongoose.Types.ObjectId(adminId),
    };

    // Convert parent if provided
    if (parent !== undefined) {
      updatePayload.parent = parent
        ? new mongoose.Types.ObjectId(parent)
        : null;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update category",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;

    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete category",
      },
      { status: 500 }
    );
  }
}
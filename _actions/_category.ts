"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import Category from "@/models/category";
import product from "@/models/product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

export async function createCategory(formData: {
  name: string;
  description?: string;
  parent?: string;
  image?: string;
  order?: number;
}) {
  try {
    const adminId = await getCurrentUserId();

    await dbConnect();

    const category = await Category.create({
      ...formData,
      parent: formData.parent
        ? new mongoose.Types.ObjectId(formData.parent)
        : null,
      admin: new mongoose.Types.ObjectId(adminId),
    });

    return {
      success: true,
      message: "Category created successfully",
      // category,
    };
  } catch (error: any) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create category",
    };
  }
}

export async function updateCategory(
  categoryId: string,
  updatedData: {
    name?: string;
    description?: string;
    parent?: string | null;
    image?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  try {
    const adminId = await getCurrentUserId();

    if (!adminId) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const updatePayload: any = {
      ...updatedData,
      updatedBy: new mongoose.Types.ObjectId(adminId),
      admin: new mongoose.Types.ObjectId(adminId),
      createdBy: new mongoose.Types.ObjectId(adminId),
    };

    // Convert parent if provided
    if (updatedData.parent !== undefined) {
      updatePayload.parent = updatedData.parent
        ? new mongoose.Types.ObjectId(updatedData.parent)
        : null;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return { success: false, error: "Category not found" };
    }

    return {
      success: true,
      message: "Category updated successfully",
      // category: updatedCategory,
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error?.message || "Failed to update category",
    };
  }
}

interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string | null;
}

export async function getCategoriesByAdmin({
  page = 1,
  limit = 20,
  search = "",
  parent = null,
}: GetCategoriesParams) {
  try {
    const adminId = await getCurrentUserId();
    if (!adminId) {
      return { success: false, error: "Unauthorized" };
    }
    await dbConnect();

    const query: any = { admin: new mongoose.Types.ObjectId(adminId) };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (parent === "null") {
      query.parent = null;
    } else if (parent) {
      query.parent = new mongoose.Types.ObjectId(parent);
    }

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const categoryIds = categories.map((c) => c._id);

    const productCounts = await product.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const categoriesWithCounts = categories.map((category: any) => {
      const match = productCounts.find(
        (pc) => pc._id.toString() === category._id.toString()
      );
      return {
        ...category,
        productCount: match?.count || 0,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      categories: JSON.stringify(categoriesWithCounts),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch categories",
    };
  }
}

export const deleteCategory = async (categoryId: string) => {
  try {
    const adminId = await getCurrentUserId();
    if (!adminId) {
      return { success: false, error: "Unauthorized" };
    }
    await dbConnect();

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, message: "Category deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete category",
    };
  }
};

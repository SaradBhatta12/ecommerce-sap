import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import Category from "@/models/category";
import product from "@/models/product";
import mongoose from "mongoose";

// GET - Get categories by admin with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const parent = searchParams.get("parent");

    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
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

    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parent, image, order } = body;

    const adminId = await getCurrentUserId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const category = await Category.create({
      name,
      description,
      parent: parent ? new mongoose.Types.ObjectId(parent) : null,
      image,
      order,
      admin: new mongoose.Types.ObjectId(adminId),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Server Action Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create category",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db-connect";
import Category from "@/models/category";
import Product from "@/models/product";

export async function GET(request: Request) {
  try {
    // Connect to database
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const UserDetails = await user.findOne();

    let AdminId = null;
    if (!UserDetails) {
      AdminId = await getCurrentUserId();
      if (!AdminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      AdminId = UserDetails._id.toString();
    }

    // Get query parameters
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const parent = searchParams.get("parent") || null;

    // Build query
    const query: any = {
      admin: new mongoose.Types.ObjectId(AdminId),
    };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (parent === "null") {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    // Count total categories
    const total = await Category.countDocuments(query);

    // Get categories with pagination
    const adminId: string = await getCurrentUserId();
    const categories = await Category.find({
      admin: new mongoose.Types.ObjectId(adminId), // Replace with actual user ID if needed
      ...query,
    })
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get product counts for each category
    const categoryIds = categories.map((category) => category._id);
    const productCounts = await Product.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(AdminId),
          category: { $in: categoryIds },
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Add product count to each category
    const categoriesWithCounts = categories.map((category: any) => {
      const productCount = productCounts.find(
        (pc) => pc._id.toString() === category._id.toString()
      );
      return {
        ...category,
        productCount: productCount ? productCount.count : 0,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      categories: categoriesWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

import mongoose from "mongoose";
import { getCurrentUserId } from "@/lib/auth-utils";
import user from "@/models/user";

export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request, ...authOptions });

    // Check if user is admin
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Connect to database
    await dbConnect();

    // Create category
    const category = await Category.create({
      ...data,
      admin: new mongoose.Types.ObjectId(session.user._id),
    });
    if (!category) {
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 400 }
      );
    }
    console.log("Category created:", category);
    return NextResponse.json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

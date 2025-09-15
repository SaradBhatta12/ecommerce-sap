import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";
import mongoose from "mongoose";

// GET - Get all products with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    await dbConnect();

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = new mongoose.Types.ObjectId(category);
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        products,
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
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

    if (!name || !price || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, price, and category are required",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.create({
      name,
      description,
      price,
      comparePrice,
      category: new mongoose.Types.ObjectId(category),
      images,
      inventory,
      sku,
      weight,
      dimensions,
      tags,
      isActive: isActive !== undefined ? isActive : true,
      admin: new mongoose.Types.ObjectId(adminId),
      createdBy: new mongoose.Types.ObjectId(adminId),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}
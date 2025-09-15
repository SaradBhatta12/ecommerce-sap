import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db-connect";
import Brand from "@/models/brand";
import Product from "@/models/product";
import { getCurrentUserId } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    // Connect to database
    const currentUser = await getCurrentUserId();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    // Build query
    const query: any = {
      createdBy: currentUser,
    };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Count total brands
    const total = await Brand.countDocuments(query);

    // Get brands with pagination
    const brands = await Brand.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get product counts for each brand
    const brandIds = brands.map((brand) => brand._id);
    const productCounts = await Product.aggregate([
      { $match: { createdBy: currentUser } },
      { $match: { brand: { $in: brandIds } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);

    // Add product count to each brand/api/brands

    const brandsWithCounts = brands.map((brand) => {
      const productCount = productCounts.find(
        (pc) => pc._id.toString() === (brand._id as string).toString()
      );
      return {
        ...brand,
        productCount: productCount ? productCount.count : 0,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      brands: brandsWithCounts,
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
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentUserId();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();

    // Connect to database
    await dbConnect();

    // Create brand
    const brand = await Brand.create(data);
    if (!brand) {
      console.error("Failed to create brand");
      return NextResponse.json(
        { error: "Failed to create brand" },
        { status: 400 }
      );
    }
    brand.createdBy = admin;
    brand.updatedBy = admin;
    await brand.save();

    return NextResponse.json({
      message: "Brand created successfully",
      brand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}

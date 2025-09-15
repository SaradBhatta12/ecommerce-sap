import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";
import Category from "@/models/category";
import Brand from "@/models/brand";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get featured products (limit 8)
    const featuredProducts = await Product.find({
      status: "published",
      visibility: "public",
      isFeatured: true,
    })
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Get new products (limit 8)
    const newProducts = await Product.find({
      status: "published",
      visibility: "public",
      isNew: true,
    })
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Get on sale products (limit 6)
    const saleProducts = await Product.find({
      status: "published",
      visibility: "public",
      isOnSale: true,
    })
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .sort({ discount: -1 })
      .limit(6)
      .lean();

    // Get top categories (limit 6)
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .limit(6)
      .lean();

    // Get product counts for categories
    const categoryIds = categories.map((cat) => cat._id);
    const productCounts = await Product.aggregate([
      {
        $match: {
          status: "published",
          visibility: "public",
          category: { $in: categoryIds },
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Add product counts to categories
    const categoriesWithCounts = categories.map((category: any) => {
      const productCount = productCounts.find(
        (pc) => pc._id.toString() === category._id.toString()
      );
      return {
        ...category,
        productCount: productCount ? productCount.count : 0,
      };
    });

    // Get hero banner product (most featured or newest)
    const heroBannerProduct = await Product.findOne({
      status: "published",
      visibility: "public",
      $or: [{ isFeatured: true }, { isNew: true }],
    })
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    // Get total product count
    const totalProducts = await Product.countDocuments({
      status: "published",
      visibility: "public",
    });

    // Get brands (limit 8)
    const brands = await Brand.find({ isActive: true })
      .sort({ name: 1 })
      .limit(8)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        featuredProducts,
        newProducts,
        saleProducts,
        categories: categoriesWithCounts,
        heroBannerProduct,
        brands,
        stats: {
          totalProducts,
          totalCategories: categories.length,
          totalBrands: brands.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching home page data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch home page data",
      },
      { status: 500 }
    );
  }
}
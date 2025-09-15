// oxlint-disable
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils";
import { IVariant, IVariantImage } from "@/models/product";

interface ProductData {
  variant?: IVariant[];
  [key: string]: any;
}
import slugify from "slugify";
import mongoose from "mongoose";
import user from "@/models/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);


    // Parse query parameters
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : null;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : null;
    const onSale = searchParams.get("onSale") === "true";
    const sort = searchParams.get("sort") || "featured";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "published";
    const isNew = searchParams.get("isNew") === "true";
    const isFeatured = searchParams.get("isFeatured") === "true";
    const minSustainabilityScore = searchParams.get("minSustainabilityScore")
      ? Number(searchParams.get("minSustainabilityScore"))
      : null;
    const recycledMaterials = searchParams.get("recycledMaterials") === "true";

    // Build query
    const query: any = {};

    // Default to published products for public API
    if (!searchParams.has("status")) {
      query.status = "published";
      query.visibility = "public";
    } else {
      // Check if admin for non-public products
      const isUserAdmin = await isAdmin();
      if (status !== "published" && !isUserAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      query.status = status;
    }

    if (category && category !== "undefined" && category !== "null") {
      // Validate ObjectId format
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      }
    }

    if (brand) {
      query.brand = brand;
    }

    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    if (onSale) {
      query.isOnSale = true;
    }

    if (isNew) {
      query.isNew = true;
    }

    if (isFeatured) {
      query.isFeatured = true;
    }

    if (minSustainabilityScore !== null) {
      query.sustainabilityScore = { $gte: minSustainabilityScore };
    }

    if (recycledMaterials) {
      query.recycledMaterials = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { voiceSearchKeywords: { $in: [new RegExp(search, "i")] } },
        { aiTags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Connect to database
    await dbConnect();

    // Build sort
    const sortOptions: any = {};
    switch (sort) {
      case "price-asc":
        sortOptions.price = 1;
        break;
      case "price-desc":
        sortOptions.price = -1;
        break;
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "rating":
        sortOptions.rating = -1;
        break;
      case "sustainability":
        sortOptions.sustainabilityScore = -1;
        break;
      default:
        sortOptions.isFeatured = -1;
        sortOptions.createdAt = -1;
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.aggregate([
      {
        $match: {
          ...query,
        },
      }, // Apply your filter
      { $sort: sortOptions }, // Sort
      { $skip: skip }, // Pagination skip
      { $limit: limit }, // Pagination limit
      // Populate 'category'
      {
        $lookup: {
          from: "categories", // The MongoDB collection name for Category
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true, // Optional: keeps docs even if no category
        },
      },
      {
        $project: {
          // Include desired product fields (or use `name: 1` style projection as needed)
          name: 1,
          price: 1,
          discountPrice: 1,
          stock: 1,
          images: 1,
          rating: 1,
          reviews: 1,
          isNew: 1,
          isFeatured: 1,
          isOnSale: 1,
          discount: 1,
          sku: 1,
          barcode: 1,
          weight: 1,
          dimensions: 1,
          shippingClass: 1,
          taxClass: 1,
          metaTitle: 1,
          metaDescription: 1,
          metaKeywords: 1,
          status: 1,
          visibility: 1,
          arModel: 1,
          vrExperience: 1,
          threeDModel: 1,
          digitalAssets: 1,
          customizationOptions: 1,
          sustainabilityScore: 1,
          carbonFootprint: 1,
          recycledMaterials: 1,
          aiGeneratedDescription: 1,
          aiTags: 1,
          voiceSearchKeywords: 1,
          relatedProducts: 1,
          bundleProducts: 1,
          subscriptionOptions: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 1,
          slug: 1,

          category: {
            _id: 1,
            name: "$category.name",
            slug: "$category.slug",
          },
        },
      },
      // Populate 'brand'
      {
        $lookup: {
          from: "brands", // The MongoDB collection name for Brand
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: {
          path: "$brand",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          brand: {
            _id: "$brand._id",
            name: "$brand.name",
            slug: "$brand.slug",
          },
        },
      },
    ]);

    const total = await Product.countDocuments(query);
    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        {
          message: "Authentication required",
          success: false,
          status: 401,
        },
        { status: 401 }
      );
    }

    const productData = await request.json();
    console.log(productData);

    await dbConnect();

    const { name, description, price, category, sku } = productData;

    if (!name || !description || !price || !category || !sku) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          success: false,
          status: 400,
        },
        { status: 400 }
      );
    }

    const finalSlug =
      name && name.trim() !== ""
        ? slugify(name.trim(), { lower: true })
        : slugify(name + "-" + crypto.randomUUID(), { lower: true });

    const existingSlug = await Product.findOne({ slug: finalSlug });
    if (existingSlug) {
      return NextResponse.json(
        {
          message: "Product with this slug already exists",
          success: false,
          status: 400,
        },
        { status: 400 }
      );
    }

    const existingSKU = await Product.findOne({ sku });
    if (existingSKU) {
      return NextResponse.json(
        {
          message: "Product with this SKU already exists",
          success: false,
          status: 400,
        },
        { status: 400 }
      );
    }

    // Transform image paths to ensure they're properly formatted
    const formattedData: ProductData = {
      ...productData,
      variant:
        productData.variant?.map((variant: IVariant) => ({
          ...variant,
          image:
            variant.image?.map((img: IVariantImage) => ({
              ...img,
              document: img.document?.toString() || "",
            })) || [],
        })) || [],
    };

    const product = new Product({
      ...formattedData,
      slug: finalSlug,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    // await product.populate("category", "name");
    // await product.populate("brand", "name");
    // await product.populate("createdBy", "name email");

    return NextResponse.json(
      {
        message: "Product created successfully",
        success: true,
        status: 201,
        // product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          message: `Duplicate ${field}. Please use a unique value.`,
          success: false,
          status: 400,
        },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          message: "Validation failed",
          success: false,
          status: 400,
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create product",
        success: false,
        status: 500,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;

    const id = resolvedParams.id;
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const objectIdOrSlug = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { slug: id }] }
      : { slug: id };

    const [product] = await Product.aggregate([
      { $match: objectIdOrSlug },

      // Lookup category
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // Lookup brand
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

      // Lookup related products
      {
        $lookup: {
          from: "products",
          localField: "relatedProducts",
          foreignField: "_id",
          as: "relatedProducts",
        },
      },

      // Lookup bundle products
      {
        $lookup: {
          from: "products",
          localField: "bundleProducts.product",
          foreignField: "_id",
          as: "bundleProductDetails",
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          price: 1,
          discountPrice: 1,
          stock: 1,
          images: 1,
          variant: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
            slug: "$category.slug",
          },
          brand: {
            _id: "$brand._id",
            name: "$brand.name",
            slug: "$brand.slug",
          },
          tags: 1,
          attributes: 1,
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
          createdBy: 1,
          updatedBy: 1,
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
          subscriptionOptions: 1,

          // Map related products
          relatedProducts: {
            $map: {
              input: "$relatedProducts",
              as: "p",
              in: {
                _id: "$$p._id",
                name: "$$p.name",
                slug: "$$p.slug",
                images: "$$p.images",
                price: "$$p.price",
              },
            },
          },

          // Merge bundle product details with quantity & discount
          bundleProducts: {
            $map: {
              input: "$bundleProducts",
              as: "bp",
              in: {
                quantity: "$$bp.quantity",
                discountPercentage: "$$bp.discountPercentage",
                product: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$bundleProductDetails",
                        as: "detail",
                        cond: {
                          $eq: ["$$detail._id", "$$bp.product"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },

          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Restrict access to unpublished/private products
    if (product.status !== "published" || product.visibility !== "public") {
      const isUserAdmin = await isAdmin();
      if (!isUserAdmin) {
        return NextResponse.json(
          { error: "Product not available" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product:", error.message || error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const updateData = await request.json();

    // Add updater info
    updateData.updatedBy = userId;

    // Connect to database
    await dbConnect();

    // Update product
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("Error updating product:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          error: `Duplicate ${field}. Please use a unique value.`,
        },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Connect to database
    await dbConnect();

    // Delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

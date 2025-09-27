import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Wishlist from "@/models/wishlist"
import Product from "@/models/product"
import mongoose from "mongoose"

// Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const wishlistItems = await Wishlist.find({ user: new mongoose.Types.ObjectId(session.user.id as string) })
      .populate({
        path: "product",
        select: "_id name slug price discountPrice images category rating reviews description stock status brand tags isOnSale discount",
        populate: [
          {
            path: "category",
            select: "name slug"
          },
          {
            path: "brand", 
            select: "name slug"
          }
        ]
      })
      .sort({ createdAt: -1 })

    // Filter out items where product might have been deleted
    const validWishlistItems = wishlistItems.filter(item => item.product)

    // Transform the data to match frontend expectations
    const transformedItems = validWishlistItems.map(item => ({
      _id: item._id,
      product: {
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        originalPrice: item.product.discountPrice ? item.product.price : undefined,
        discountPrice: item.product.discountPrice,
        images: item.product.images,
        category: item.product.category?.name || 'Uncategorized',
        brand: item.product.brand?.name || '',
        inStock: item.product.stock > 0 && item.product.status === 'published',
        stock: item.product.stock,
        rating: item.product.rating || 0,
        reviewCount: item.product.reviews || 0,
        description: item.product.description,
        tags: item.product.tags || [],
        isOnSale: item.product.isOnSale || false,
        discount: item.product.discount || 0
      },
      addedAt: item.createdAt
    }))

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Validate product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item already exists in wishlist
    const existingItem = await Wishlist.findOne({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: new mongoose.Types.ObjectId(productId),
    })

    if (existingItem) {
      return NextResponse.json({ 
        message: "Item already in wishlist",
        alreadyExists: true 
      }, { status: 200 })
    }

    // Add item to wishlist
    const wishlistItem = await Wishlist.create({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: new mongoose.Types.ObjectId(productId),
    })

    // Populate the created item for response
    const populatedItem = await Wishlist.findById(wishlistItem._id)
      .populate({
        path: "product",
        select: "_id name slug price discountPrice images category rating reviews description stock status brand tags isOnSale discount",
        populate: [
          {
            path: "category",
            select: "name slug"
          },
          {
            path: "brand", 
            select: "name slug"
          }
        ]
      })

    return NextResponse.json({
      message: "Item added to wishlist successfully",
      item: populatedItem
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to get productId from URL params first, then from request body
    const { searchParams } = new URL(request.url)
    let productId = searchParams.get("productId")
    
    // If not in URL params, try to get from request body
    if (!productId) {
      try {
        const body = await request.json()
        productId = body.productId
      } catch (error) {
        // If JSON parsing fails, productId remains null
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await dbConnect()

    const deletedItem = await Wishlist.findOneAndDelete({
      user: new mongoose.Types.ObjectId(session.user.id as string),
      product: new mongoose.Types.ObjectId(productId),
    })

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Item removed from wishlist successfully",
      removedItem: {
        _id: deletedItem._id,
        productId: deletedItem.product
      }
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

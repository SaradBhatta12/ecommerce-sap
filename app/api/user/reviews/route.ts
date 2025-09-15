import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Review from "@/models/review"
import Product from "@/models/product"

// GET - Get user's reviews
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") // pending, approved, rejected
    const search = searchParams.get("search") || ""

    await dbConnect()

    // Build query
    const query: any = { user: session.user.id }
    if (status) {
      query.status = status
    }

    // Get user's reviews with product info
    const reviews = await Review.find(query)
      .populate({
        path: "product",
        select: "name images price slug",
        match: search ? { name: { $regex: search, $options: "i" } } : {}
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Filter out reviews where product is null (due to search match)
    const filteredReviews = reviews.filter(review => review.product !== null)

    // Get total count
    const totalQuery = search 
      ? await Review.aggregate([
          { $match: query },
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "product"
            }
          },
          { $unwind: "$product" },
          { $match: { "product.name": { $regex: search, $options: "i" } } },
          { $count: "total" }
        ])
      : await Review.countDocuments(query)

    const total = Array.isArray(totalQuery) ? (totalQuery[0]?.total || 0) : totalQuery
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      reviews: filteredReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error("Error fetching user reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST - Create a new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession({ auth: authOptions })

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, rating, title, content, images = [] } = await request.json()

    // Validate input
    if (!productId || !rating || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    await dbConnect()

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: session.user.id,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    // Create review
    const review = new Review({
      product: productId,
      user: session.user.id,
      rating,
      title,
      content,
      images,
      status: "pending" // Reviews need approval
    })

    await review.save()

    // Update product rating
    const allReviews = await Review.find({ product: productId, status: "approved" })
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / allReviews.length

      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        reviews: allReviews.length,
      })
    }

    // Return review with product info
    const populatedReview = await Review.findById(review._id)
      .populate("product", "name images price slug")
      .lean()

    return NextResponse.json(
      {
        message: "Review created successfully",
        review: populatedReview,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
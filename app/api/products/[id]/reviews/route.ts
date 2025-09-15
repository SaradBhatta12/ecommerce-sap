import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Review from "@/models/review"
import Product from "@/models/product"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Connect to database
    await dbConnect()

    // Get reviews for product
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate("user", "name image")
      .lean()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productId = params.id
    const { rating, title, content, images = [] } = await request.json()

    // Validate input
    if (!rating || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
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
    })

    await review.save()

    // Update product rating
    const allReviews = await Review.find({ product: productId })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviews: allReviews.length,
    })

    // Return review with user info
    const populatedReview = await Review.findById(review._id).populate("user", "name image").lean()

    return NextResponse.json(
      {
        message: "Review created successfully",
        review: populatedReview,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

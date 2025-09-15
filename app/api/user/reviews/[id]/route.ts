import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Review from "@/models/review"
import Product from "@/models/product"

// GET - Get specific review
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviewId = params.id

    await dbConnect()

    // Get review with product info
    const review = await Review.findOne({
      _id: reviewId,
      user: session.user.id // Ensure user can only access their own reviews
    })
      .populate("product", "name images price slug")
      .lean()

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 })
  }
}

// PUT - Update review
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviewId = params.id
    const { rating, title, content, images } = await request.json()

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    await dbConnect()

    // Find review and ensure it belongs to the user
    const review = await Review.findOne({
      _id: reviewId,
      user: session.user.id
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Check if review can be edited (only pending or rejected reviews)
    if (review.status === "approved") {
      return NextResponse.json({ error: "Cannot edit approved reviews" }, { status: 400 })
    }

    // Update review fields
    const updateData: any = { updatedAt: new Date() }
    if (rating !== undefined) updateData.rating = rating
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (images !== undefined) updateData.images = images
    
    // Reset status to pending if it was rejected
    if (review.status === "rejected") {
      updateData.status = "pending"
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate("product", "name images price slug")

    // Update product rating if rating changed and review is approved
    if (rating && review.status === "approved") {
      const allReviews = await Review.find({ 
        product: review.product, 
        status: "approved" 
      })
      
      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = totalRating / allReviews.length

        await Product.findByIdAndUpdate(review.product, {
          rating: averageRating,
          reviews: allReviews.length,
        })
      }
    }

    return NextResponse.json({
      message: "Review updated successfully",
      review: updatedReview
    })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

// DELETE - Delete review
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviewId = params.id

    await dbConnect()

    // Find review and ensure it belongs to the user
    const review = await Review.findOne({
      _id: reviewId,
      user: session.user.id
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const productId = review.product

    // Delete review
    await Review.findByIdAndDelete(reviewId)

    // Update product rating after deletion
    const remainingReviews = await Review.find({ 
      product: productId, 
      status: "approved" 
    })
    
    if (remainingReviews.length > 0) {
      const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRating / remainingReviews.length

      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        reviews: remainingReviews.length,
      })
    } else {
      // No reviews left, reset rating
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviews: 0,
      })
    }

    return NextResponse.json({
      message: "Review deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
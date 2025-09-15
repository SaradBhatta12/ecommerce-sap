import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Review from "@/models/review"

export async function POST(request: Request, { params }: { params: { id: string; reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reviewId } = params
    const { isHelpful } = await request.json()

    // Connect to database
    await dbConnect()

    // Find review
    const review = await Review.findById(reviewId)

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Update helpful or unhelpful count
    if (isHelpful) {
      review.helpful += 1
    } else {
      review.unhelpful += 1
    }

    await review.save()

    return NextResponse.json({
      message: "Vote recorded successfully",
      review,
    })
  } catch (error) {
    console.error("Error voting on review:", error)
    return NextResponse.json({ error: "Failed to vote on review" }, { status: 500 })
  }
}

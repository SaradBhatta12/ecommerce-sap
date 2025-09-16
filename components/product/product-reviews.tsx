"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
  })

  const { data: session } = useSession()

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/products/${productId}/reviews`)
        const data = await response.json()
        setReviews(data.reviews || [])
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  const filteredReviews = reviews.filter((review: any) => {
    if (filter === "all") return true
    if (filter === "positive" && review.rating >= 4) return true
    if (filter === "critical" && review.rating <= 3) return true
    return false
  })

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast.warning("Please sign in", {
        description: "You need to be signed in to leave a review.",
      })
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      const data = await response.json()

      // Add the new review to the list
      setReviews([data.review, ...reviews])

      toast.success("Review submitted", {
        description: "Thank you for your review!",
      })

      setIsWritingReview(false)
      setReviewForm({
        rating: 5,
        title: "",
        content: "",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to submit review",
      })
    }
  }

  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!session) {
      toast.warning("Please sign in", {
        description: "You need to be signed in to vote on reviews.",
      })
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHelpful }),
      })

      if (!response.ok) {
        throw new Error("Failed to vote on review")
      }

      // Update the review in the list
      setReviews(
        reviews.map((review: any) => {
          if (review._id === reviewId) {
            return {
              ...review,
              helpful: isHelpful ? review.helpful + 1 : review.helpful,
              unhelpful: !isHelpful ? review.unhelpful + 1 : review.unhelpful,
            }
          }
          return review
        }),
      )

      toast.success("Feedback recorded", {
        description: "Thank you for your feedback on this review.",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to vote on review",
      })
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>

              <Skeleton className="mt-2 h-4 w-40" />
              <Skeleton className="mt-1 h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="positive">Positive (4-5 ★)</SelectItem>
              <SelectItem value="critical">Critical (1-3 ★)</SelectItem>
            </SelectContent>
          </Select>

          {!isWritingReview && (
            <Button onClick={() => setIsWritingReview(true)} disabled={!session}>
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {isWritingReview && (
        <div className="mb-8 rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-medium">Write Your Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="mt-1 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= reviewForm.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Summarize your experience"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Review Content</Label>
              <Textarea
                id="content"
                value={reviewForm.content}
                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                placeholder="Share your experience with this product"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit">Submit Review</Button>
              <Button type="button" variant="outline" onClick={() => setIsWritingReview(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          filteredReviews.map((review: any) => (
            <div key={review._id} className="border-b pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={review.user?.image || "/placeholder.svg?height=40&width=40"}
                    alt={review.user?.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{review.user?.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>

              <h4 className="mt-2 font-medium">{review.title}</h4>
              <p className="mt-1 text-sm">{review.content}</p>

              {review.images && review.images.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {review.images.map((image: string, index: number) => (
                    <Image
                      key={index}
                      src={image || "/placeholder.svg?height=100&width=100"}
                      alt={`Review image ${index + 1}`}
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center space-x-4 text-sm">
                <span>Was this review helpful?</span>
                <button
                  onClick={() => handleHelpful(review._id, true)}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{review.helpful}</span>
                </button>
                <button
                  onClick={() => handleHelpful(review._id, false)}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{review.unhelpful}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

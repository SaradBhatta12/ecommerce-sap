"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Star, Edit, Trash2, RefreshCw, Search, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Review {
  _id: string
  product: {
    _id: string
    name: string
    images: string[]
    price: number
    slug: string
  }
  rating: number
  title: string
  content: string
  images?: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  helpful?: number
  unhelpful?: number
}

interface ReviewsResponse {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Edit review state
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editRating, setEditRating] = useState(5)
  const [editImages, setEditImages] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch reviews from API
  const fetchReviews = async (page = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true)
      else if (page === 1) setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/user/reviews?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data: ReviewsResponse = await response.json()
      setReviews(data.reviews)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load reviews on component mount and when filters change
  useEffect(() => {
    if (session) {
      fetchReviews(1)
    }
  }, [session, statusFilter, searchTerm])

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/user/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      // Remove review from local state
      setReviews(reviews.filter((review) => review._id !== reviewId))
      toast.success('Review deleted successfully')
      
      // Refresh reviews to update pagination
      fetchReviews(currentPage)
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setEditTitle(review.title)
    setEditContent(review.content)
    setEditRating(review.rating)
    setEditImages(review.images || [])
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingReview) return

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/user/reviews/${editingReview._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          rating: editRating,
          images: editImages
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update review')
      }

      const { review: updatedReview } = await response.json()
      
      // Update review in local state
      setReviews(reviews.map((review) =>
        review._id === editingReview._id ? updatedReview : review
      ))
      
      setIsEditDialogOpen(false)
      setEditingReview(null)
      toast.success('Review updated successfully')
    } catch (error) {
      console.error('Error updating review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to view your reviews.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground">Manage your product reviews and ratings</p>
        </div>
        <Button
          onClick={() => fetchReviews(currentPage, true)}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reviews by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {review.product.images && review.product.images.length > 0 ? (
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                        <Star className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{review.product.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <Badge variant={getStatusBadgeVariant(review.status)}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                          {review.updatedAt !== review.createdAt && " (edited)"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                          disabled={review.status === 'approved'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(review._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">{review.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.slice(0, 3).map((image, index) => (
                            <div key={index} className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                              <img
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {review.images.length > 3 && (
                            <div className="flex items-center justify-center h-16 w-16 rounded-md bg-gray-100 text-xs text-muted-foreground">
                              +{review.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {review.helpful !== undefined && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{review.helpful} found helpful</span>
                          {review.unhelpful !== undefined && (
                            <span>{review.unhelpful} found unhelpful</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No reviews match your current filters. Try adjusting your search.'
                  : "You haven't written any reviews yet. Start shopping and share your experience!"}
              </p>
              <div className="flex gap-2">
                {(searchTerm || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} reviews
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReviews(currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReviews(currentPage + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Make changes to your review. Note: Approved reviews cannot be edited.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rating">Rating</Label>
              <Select value={editRating.toString()} onValueChange={(value) => setEditRating(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: rating }, (_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span>{rating} Star{rating !== 1 ? 's' : ''}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Review title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Review</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your review..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting || !editTitle.trim() || !editContent.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

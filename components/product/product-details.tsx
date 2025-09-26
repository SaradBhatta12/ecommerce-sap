"use client"

import { useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/store"
import { useCurrency } from "@/contexts/CurrencyContext"

interface Product {
  reviews: number
  rating: number
  discount: ReactNode
  tags: boolean
  _id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: {
    _id: string
    name: string
    slug: string
  }
  brand?: {
    _id: string
    name: string
    slug: string
  }
  stock: number
  isNew?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
}

interface WishlistItem {
  product: {
    _id: string
  }
}

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const domain = params.domain as string
  // Store functionality removed
  const { formatPrice } = useCurrency()

  const [quantity, setQuantity] = useState(1)
  // RTK Query hooks for wishlist operations
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !session?.user?.email,
    // Prevent unnecessary refetches
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  })
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation()
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation()

  // Check if product is in wishlist
  const isInWishlist = wishlistData?.wishlist?.some((item: WishlistItem) => item.product._id === product._id) || false
  const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist

  const handleAddToCart = () => {
    // Cart functionality removed
    toast.error("Cart functionality removed", {
      description: "Cart functionality has been temporarily removed.",
    })
  }

  const handleToggleWishlist = async () => {
    if (!session) {
      toast.warning("Authentication Required", {
        description: "Please sign in to add items to your wishlist",
      })
      router.push(`/s/${domain}/auth?tab=login&callbackUrl=/s/${domain}/product/detail/${product._id}`)
      return
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist({ productId: product._id }).unwrap()
        toast.success("Removed from wishlist", {
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        // Add to wishlist
        await addToWishlist({ productId: product._id }).unwrap()
        toast.success("Added to wishlist", {
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Error", {
        description: "Failed to update wishlist. Please try again.",
      })
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    } else {
      toast.warning("Maximum quantity reached", {
        description: `Only ${product.stock} items available in stock.`,
      })
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Shared successfully")
        })
        .catch((error) => {
          console.error("Error sharing:", error)
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
     toast.success("Product link has been copied to clipboard")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-2 flex items-center space-x-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating || 0) ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({product.reviews || 0} reviews)</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {product.discountPrice || (product.isOnSale && product.discount) ? (
          <>
            <span className="text-3xl font-bold">
              {formatPrice(product.discountPrice || product.price - (product.price * product.discount) / 100)}
            </span>
            <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
            <Badge variant="destructive">{product.discount}% Off</Badge>
          </>
        ) : (
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Badge variant={product.stock > 0 ? "default" : "outline"}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </Badge>
        {product.isNew && <Badge variant="secondary">New</Badge>}
        {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-medium">Description</h2>
        <p className="mt-2 text-muted-foreground">{product.description}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex h-8 w-12 items-center justify-center border-y border-input bg-background">
              {quantity}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button className="flex-1" onClick={handleAddToCart} disabled={product.stock <= 0}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className={`${isInWishlist ? "text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" : ""}`}
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
          >
            <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-red-500" : ""}`} />
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium">Category:</span>
          <p className="text-sm text-muted-foreground">{product.category?.name || "Uncategorized"}</p>
        </div>
        {product.brand && (
          <div>
            <span className="text-sm font-medium">Brand:</span>
            <p className="text-sm text-muted-foreground">{product.brand.name}</p>
          </div>
        )}
        {product.tags && product.tags?.length > 0 && (
          <div className="col-span-2">
            <span className="text-sm font-medium">Tags:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {product?.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

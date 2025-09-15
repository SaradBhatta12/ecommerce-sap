"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
// Store functionality removed

interface ProductDetailsProps {
  product: any
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const domain = params.domain as string
  // Store functionality removed
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (session) {
      checkWishlistStatus()
    }
  }, [session, product._id])

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/user/wishlist")
      if (!response.ok) return

      const items = await response.json()
      const isInList = items.some((item: any) => item.product._id === product._id)
      setIsInWishlist(isInList)
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const handleAddToCart = () => {
    // Cart functionality removed
    toast({
      title: "Cart functionality removed",
      description: "Cart functionality has been temporarily removed.",
      variant: "destructive",
    })
  }

  const handleToggleWishlist = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist",
      })
      router.push(`/s/${domain}/auth?tab=login&callbackUrl=/s/${domain}/product/detail/${product._id}`)
      return
    }

    setIsAddingToWishlist(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist?productId=${product._id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to remove from wishlist")

        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        // Add to wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product._id }),
        })

        if (!response.ok) throw new Error("Failed to add to wishlist")

        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    } else {
      toast({
        title: "Maximum quantity reached",
        description: `Only ${product.stock} items available in stock.`,
        variant: "destructive",
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
          toast({
            title: "Shared successfully",
            description: "Product has been shared",
          })
        })
        .catch((error) => {
          console.error("Error sharing:", error)
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard",
      })
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
              Rs. {(product.discountPrice || product.price - (product.price * product.discount) / 100).toLocaleString()}
            </span>
            <span className="text-xl text-muted-foreground line-through">Rs. {product.price.toLocaleString()}</span>
            <Badge variant="destructive">{product.discount}% Off</Badge>
          </>
        ) : (
          <span className="text-3xl font-bold">Rs. {product.price.toLocaleString()}</span>
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
            disabled={isAddingToWishlist}
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
        {product.tags && product.tags.length > 0 && (
          <div className="col-span-2">
            <span className="text-sm font-medium">Tags:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {product.tags.map((tag: string) => (
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

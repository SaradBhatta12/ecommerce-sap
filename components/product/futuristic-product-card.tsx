"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Eye, Check } from "lucide-react"
import { HolographicCard } from "@/components/ui/holographic-card"
import { Button } from "@/components/ui/button"
import { addToWishlist, removeFromWishlist } from "@/lib/api-endpoints"
import { useToast } from "@/hooks/use-toast"
// Store functionality removed

interface FuturisticProductCardProps {
  product: any
  inWishlist?: boolean
}

export function FuturisticProductCard({ product, inWishlist = false }: FuturisticProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(inWishlist)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const { toast } = useToast()
  // Store functionality removed

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id)
        setIsWishlisted(false)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist`,
        })
      } else {
        await addToWishlist(product._id)
        setIsWishlisted(true)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = () => {
    setIsAddingToCart(true)

    // Cart functionality removed
    setTimeout(() => {
      setIsAddingToCart(false)

      toast({
        title: "Cart functionality removed",
        description: "Cart functionality has been temporarily removed.",
        variant: "destructive",
      })
    }, 600)
  }

  return (
    <HolographicCard
      className="group h-full w-full overflow-hidden"
      glowColor="rgba(130, 100, 255, 0.6)"
      backgroundColor="rgba(15, 15, 20, 0.7)"
      holographicEffect={true}
      floatingEffect={false}
    >
      <div className="relative flex flex-col h-full">
        {/* Discount badge */}
        {product.discountPrice && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-10 bg-black/40 backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:bg-black/60"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        {/* Product image */}
        <div className="relative aspect-square overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setShowQuickView(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col flex-grow p-4 space-y-2">
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-1">({product.numReviews || 0})</span>
          </div>

          <Link href={`/product/${product.slug}`} className="hover:underline">
            <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>
          </Link>

          <div className="flex items-baseline mt-1 space-x-2">
            {product.discountPrice ? (
              <>
                <span className="text-xl font-bold text-white">${product.discountPrice.toFixed(2)}</span>
                <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="mt-auto pt-3">
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <Check className="mr-2 h-4 w-4" />
                  Added
                </motion.div>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </HolographicCard>
  )
}

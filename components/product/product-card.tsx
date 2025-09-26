"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye, 
  Zap,
  Percent,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  discount?: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
  };
  originalPrice?: number;
}

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice } = useCurrency();
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Get wishlist items from Redux store
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item: any) => 
    item.productId === product._id
  );

  const handleProductClick = useCallback(() => {
    // Navigate to product detail page
  }, []);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      
      const cartItem = {
        id: product._id, // Using 'id' to match CartItem interface
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images[0] || "/placeholder-image.jpg",
        quantity: 1,
      };

      dispatch(addToCart(cartItem));
      toast.success(`${product.name} added to cart!`, {
        description: "Item successfully added to your shopping cart",
        action: {
          label: "View Cart",
          onClick: () => window.location.href = "/cart"
        }
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, dispatch, isAddingToCart]);

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingWishlist) return;
    
    try {
      setIsTogglingWishlist(true);
      
      if (isInWishlist) {
        dispatch(removeFromWishlist(product._id));
        toast.success("Removed from wishlist", {
          description: `${product.name} has been removed from your wishlist`
        });
      } else {
        const wishlistItem = {
          id: product._id, // Using 'id' to match WishlistItem interface
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.discountPrice || product.price,
          originalPrice: product.price,
          image: product.images[0] || "/placeholder-image.jpg",
          addedAt: new Date().toISOString(),
        };
        dispatch(addToWishlist(wishlistItem));
        toast.success("Added to wishlist", {
          description: `${product.name} has been added to your wishlist`,
          action: {
            label: "View Wishlist",
            onClick: () => window.location.href = "/dashboard/wishlist"
          }
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  }, [product, dispatch, isInWishlist, isTogglingWishlist]);

  // Calculate discount percentage
  const discountPercentage = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : product.discount || 0;

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : product.originalPrice;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white",
        "transform hover:-translate-y-1 cursor-pointer"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/detail/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {/* Product Image */}
          <Image
            src={product.images[0] || "/placeholder-image.jpg"}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              imageLoading ? "blur-sm" : "blur-0"
            )}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Loading Overlay */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium px-2 py-1">
                <Zap className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium px-2 py-1">
                <Percent className="w-3 h-3 mr-1" />
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-2 py-1">
                Featured
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              "absolute top-3 right-3 h-9 w-9 p-0 rounded-full shadow-md transition-all duration-200 z-10",
              "bg-white/90 backdrop-blur-sm hover:bg-white",
              isInWishlist ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-all duration-200",
                isInWishlist ? "fill-current" : ""
              )} 
            />
          </Button>

          {/* Quick Actions Overlay */}
          <div className={cn(
            "absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-gray-100 shadow-lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Category & Brand */}
          {(product.category || product.brand) && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              {product.category && (
                <span className="uppercase tracking-wide font-medium">
                  {product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="font-medium">
                  {product.brand.name}
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(product.rating!)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.rating} {product.reviews && `(${product.reviews})`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {originalPrice && originalPrice !== displayPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            
            {/* Mobile Add to Cart */}
            <Button
              size="sm"
              className="lg:hidden"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Add to Cart Button */}
          <Button
            className={cn(
              "w-full hidden lg:flex items-center justify-center gap-2 transition-all duration-200",
              "bg-gray-900 hover:bg-gray-800 text-white"
            )}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
            <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
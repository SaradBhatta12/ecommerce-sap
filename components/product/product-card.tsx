"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/store";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  discount?: number;
  discountPrice?: number;
  slug: string;
  stock?: number;
  applicableDiscounts?: {
    _id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
  }[];
}

interface ProductCardProps {
  product: Product;
  isWishlist?: boolean;
}

export default function ProductCard({
  product,
  isWishlist = false,
}: ProductCardProps) {
  const { data: session } = useSession();

  const router = useRouter();
  
  // RTK Query hooks for wishlist operations
  const { data: wishlistData } = useGetWishlistQuery();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();

  // Check if product is in wishlist
  const isInWishlist = isWishlist || wishlistData?.wishlist?.some((item: any) => item.product._id === product._id) || false;
  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const handleAddToCart = () => {
    // Cart functionality removed
    toast.error("Cart functionality removed", {
      description: "Cart functionality has been temporarily removed.",
    });
  };

  const handleToggleWishlist = async () => {
    if (!session) {
      toast.warning("Authentication Required", {
        description: "Please sign in to add items to your wishlist",
      });
      router.push(
        `/auth?tab=login&callbackUrl=/wishlist`
      );
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist({ productId: product._id }).unwrap();
        toast.success("Removed from wishlist", {
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        // Add to wishlist
        await addToWishlist({ productId: product._id }).unwrap();
        toast.success("Added to wishlist", {
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Error", {
        description: "Failed to update wishlist. Please try again.",
      });
  };

  // Calculate discount price from applicable discounts
  const calculateDiscountedPrice = () => {
    if (product.discountPrice) return product.discountPrice;
    
    // Check for active discounts
    const activeDiscount = product.applicableDiscounts?.find(d => d.isActive);
    if (activeDiscount) {
      if (activeDiscount.type === 'percentage') {
        return product.price - (product.price * activeDiscount.value) / 100;
      } else {
        return Math.max(0, product.price - activeDiscount.value);
      }
    }
    
    // Fallback to legacy discount
    if (product.isOnSale && product.discount) {
      return product.price - (product.price * product.discount) / 100;
    }
    
    return product.price;
  };
  
  const discountedPrice = calculateDiscountedPrice();
  const hasDiscount = discountedPrice < product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.price - discountedPrice) / product.price) * 100) : 0;

  // Generate random image for better visual appeal
  const randomImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop"
  ];
  
  const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];
  const imageToUse = product.images[0] || randomImage;

  // Clean product card matching the design
  return (
    <div className="bg-white group">
      <div className="relative">
        <Link href={`/product/detail/${product._id}`}>
          <div className="aspect-square overflow-hidden bg-gray-50">
            <Image
              src={imageToUse}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      </div>
      
      {/* Product info */}
      <div className="pt-4 space-y-2">
        <div className="text-sm text-gray-500 uppercase tracking-wide">
          {product.isNew ? 'Cotton T-Shirt' : 'Oversized T-Shirt'}
        </div>
        
        <Link href={`/product/detail/${product._id}`}>
          <h3 className="font-medium text-black hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="text-right space-y-1">
          {hasDiscount ? (
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-500 line-through">
                  $ {product.price.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              </div>
              <span className="text-lg font-medium text-red-600">
                $ {discountedPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-medium text-black">
              $ {product.price.toFixed(2)}
            </span>
          )}
          {product.stock !== undefined && product.stock < 10 && (
            <div className="text-xs text-orange-600">
              Only {product.stock} left!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

}
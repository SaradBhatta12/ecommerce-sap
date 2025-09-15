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
import { useToast } from "@/components/ui/use-toast";
// Store functionality removed

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
  const [isInWishlist, setIsInWishlist] = useState(isWishlist);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  // Domain functionality removed

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (session && !isWishlist) {
      checkWishlistStatus();
    }
  }, [session, product._id, isWishlist]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/user/wishlist");
      if (!response.ok) return;

      const items = await response.json();
      const isInList = items?.some(
        (item: any) => item.product._id === product._id
      );
      setIsInWishlist(isInList);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleAddToCart = () => {
    // Cart functionality removed
    toast({
      title: "Cart functionality removed",
      description: "Cart functionality has been temporarily removed.",
      variant: "destructive",
    });
  };

  const handleToggleWishlist = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist",
      });
      router.push(
        `/auth?tab=login&callbackUrl=/wishlist`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(
          `/api/user/wishlist?productId=${product._id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to remove from wishlist");

        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        // Add to wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (!response.ok) throw new Error("Failed to add to wishlist");

        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const discountedPrice =
    product.discountPrice ||
    (product.isOnSale && product.discount
      ? product.price - (product.price * product.discount) / 100
      : product.price);

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
        
        <div className="text-right">
          <span className="text-lg font-medium text-black">
            $ {product.price}
          </span>
        </div>
      </div>
    </div>
  );
}

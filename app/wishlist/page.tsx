"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/store";
import { toast } from "sonner";
import Image from "next/image";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: wishlistItems = [], isLoading, error } = useGetWishlistQuery(undefined, {
    skip: !session?.user?.email
  });
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/wishlist");
    }
  }, [status, router]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist({ productId }).unwrap();
      toast.success("Item removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item from wishlist");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Wishlist</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            There was an error loading your wishlist. Please try again later.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="animate-bounce mb-4">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start adding items to your wishlist by clicking the heart icon on products you love.
          </p>
          <div className="flex gap-4">
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item: any) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square">
              <Image
                src={item.product.images[0] || "/placeholder.jpg"}
                alt={item.product.name}
                fill
                className="object-cover"
              />
              {item.product.salePrice && (
                <Badge className="absolute top-2 left-2 bg-red-500">
                  Sale
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{item.product.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-lg">
                  Rs. {item.product.salePrice || item.product.price}
                </span>
                {item.product.salePrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    Rs. {item.product.price}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {item.product.category.name}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  disabled={item.product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

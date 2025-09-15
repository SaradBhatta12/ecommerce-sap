"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, ShoppingCart, Heart, RefreshCw, Search, Filter, Star, Package } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/store/api/userApi";

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    inStock: boolean;
    rating?: number;
    reviewCount?: number;
    description?: string;
  };
  addedAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  
  // Using RTK Query instead of manual fetch
  const { data: wishlistItems = [], isLoading, error, refetch } = useGetWishlistQuery(undefined, {
    skip: !session?.user?.email
  });
  const [removeFromWishlistMutation, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      router.push("/auth/login?callbackUrl=/dashboard/wishlist");
      return;
    }
  }, [session, status, router]);

  // Filter and sort wishlist items
  useEffect(() => {
    let filtered = [...wishlistItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => 
        item.product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "oldest":
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case "price-low":
          return a.product.price - b.product.price;
        case "price-high":
          return b.product.price - a.product.price;
        case "name":
          return a.product.name.localeCompare(b.product.name);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [wishlistItems, searchTerm, categoryFilter, sortBy]);

  const fetchWishlist = async (showRefreshToast = false) => {
    if (!session?.user?.email) return;

    try {
      if (showRefreshToast) setRefreshing(true);
      await refetch();
      if (showRefreshToast) {
        toast.success("Wishlist refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Error loading wishlist. Please try again.");
    } finally {
      if (showRefreshToast) setRefreshing(false);
    }
  };

  const removeFromWishlist = async (productId: string, productName: string) => {
    if (!session?.user?.email) return;

    try {
      await removeFromWishlistMutation({ productId }).unwrap();
      toast.success(`"${productName}" removed from wishlist`);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Error removing item. Please try again.");
    }
  };

  const clearWishlist = async () => {
    if (!session?.user?.email || wishlistItems.length === 0) return;

    try {
      const response = await fetch("/api/user/wishlist/clear", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });

      if (response.ok) {
        await refetch();
        toast.success(`All ${wishlistItems.length} items cleared from wishlist`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to clear wishlist");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Error clearing wishlist. Please try again.");
    }
  };

  const addToCart = async (productId: string, productName: string) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast.success(`"${productName}" added to cart`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart. Please try again.");
    }
  };



  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Wishlist</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          There was an error loading your wishlist. Please try again later.
        </p>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              {searchTerm || categoryFilter !== "all" ? ` (filtered from ${wishlistItems.length})` : ''}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchWishlist(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {wishlistItems.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Wishlist</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove all {wishlistItems.length} items from your wishlist? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button variant="destructive" onClick={clearWishlist}>
                      Clear All Items
                    </Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      {wishlistItems.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search wishlist items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
      
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            {wishlistItems.length === 0 ? (
              <>
                <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-6">
                  Save items you love for later. Start browsing and add items to your wishlist.
                </p>
                <Link href="/products">
                  <Button className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Start Shopping
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2">No items match your filters</h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
              <div className="relative">
                <Image
                src={item.product.images[0] || "/placeholder.jpg"}
                alt={item.product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Badge
                  variant={item.product.inStock ? "default" : "destructive"}
                  className="text-xs"
                >
                  {item.product.inStock ? (
                    <><Package className="h-3 w-3 mr-1" />In Stock</>
                  ) : (
                    "Out of Stock"
                  )}
                </Badge>
                {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 bg-white/80 hover:bg-white"
                  onClick={() => setSelectedItem(item)}
                >
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2">
                    {item.product.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {item.product.category}
                  </Badge>
                </div>
                
                {item.product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(item.product.rating!)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({item.product.reviewCount || 0})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      Rs. {item.product.price.toFixed(2)}
                    </span>
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        Rs. {item.product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-4">
                  Added on {new Date(item.addedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!item.product.inStock}
                    onClick={() => addToCart(item.product._id, item.product.name)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.product._id, item.product.name)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Product Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedItem.product.name}</DialogTitle>
                <DialogDescription>
                  Added to wishlist on {new Date(selectedItem.addedAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Image
                    src={selectedItem.product.images[0] || "/placeholder.jpg"}
                    alt={selectedItem.product.name}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Badge
                    variant={selectedItem.product.inStock ? "default" : "destructive"}
                    className="absolute top-2 right-2"
                  >
                    {selectedItem.product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-primary">
                        Rs. {selectedItem.product.price.toFixed(2)}
                      </span>
                      {selectedItem.product.originalPrice && selectedItem.product.originalPrice > selectedItem.product.price && (
                        <span className="text-lg text-muted-foreground line-through">
                          Rs. {selectedItem.product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">{selectedItem.product.category}</Badge>
                  </div>
                  
                  {selectedItem.product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(selectedItem.product.rating!)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedItem.product.rating.toFixed(1)} ({selectedItem.product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}
                  
                  {selectedItem.product.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.product.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      disabled={!selectedItem.product.inStock}
                      onClick={() => {
                        addToCart(selectedItem.product._id, selectedItem.product.name);
                        setSelectedItem(null);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        removeFromWishlist(selectedItem.product._id, selectedItem.product.name);
                        setSelectedItem(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

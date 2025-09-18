"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  
  // Using RTK Query with optimized configuration
  const { data: wishlistItems = [], isLoading, error, refetch } = useGetWishlistQuery(undefined, {
    skip: !session?.user?.email,
    // Prevent unnecessary refetches
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });
  const [removeFromWishlistMutation, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/login?callbackUrl=/dashboard/wishlist");
      return;
    }
  }, [session, status, router]);

  // Memoized filtered and sorted items to prevent unnecessary recalculations
  const filteredItems = useMemo(() => {
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

    return filtered;
  }, [wishlistItems, searchTerm, categoryFilter, sortBy]);

  // Memoized callback functions to prevent unnecessary re-renders
  const fetchWishlist = useCallback(async (showRefreshToast = false) => {
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
  }, [session?.user?.email, refetch]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      await removeFromWishlistMutation({ productId }).unwrap();
      toast.success("Item removed from wishlist!");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Error removing item. Please try again.");
    }
  }, [removeFromWishlistMutation]);

  const clearWishlist = useCallback(async () => {
    try {
      // Remove all items one by one since we don't have a clear all endpoint
      for (const item of wishlistItems) {
        await removeFromWishlistMutation({ productId: item.product._id }).unwrap();
      }
      toast.success("Wishlist cleared successfully!");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Error clearing wishlist. Please try again.");
    }
  }, [wishlistItems, removeFromWishlistMutation]);

  const addToCart = useCallback(async (product: WishlistItem['product']) => {
    try {
      // Add to cart logic here
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart. Please try again.");
    }
  }, []);

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
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-1/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-red-500 mb-4">
              <Heart className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Error loading wishlist</h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your wishlist. Please try again.
            </p>
            <Button onClick={() => fetchWishlist(true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(wishlistItems.map(item => item.product.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            {wishlistItems.length === 0 
              ? "No items in your wishlist" 
              : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved for later`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchWishlist(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {wishlistItems.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={clearWishlist}
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

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
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
                <Link href="/shop">
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2">No items match your filters</h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setSortBy("newest");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
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
                    onClick={() => addToCart(item.product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.product._id)}
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
                        addToCart(selectedItem.product);
                        setSelectedItem(null);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        removeFromWishlist(selectedItem.product._id);
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

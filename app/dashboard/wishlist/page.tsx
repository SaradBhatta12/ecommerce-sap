"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
// Store functionality removed

interface WishlistItem {
  _id: string;
  productId: {
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
  const { data: session } = useSession();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  // Store functionality removed

  useEffect(() => {
    fetchWishlist();
  }, [session]);

  // Filter and sort wishlist items
  useEffect(() => {
    let filtered = [...wishlistItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productId.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => 
        item.productId.category.toLowerCase() === categoryFilter.toLowerCase()
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
          return a.productId.price - b.productId.price;
        case "price-high":
          return b.productId.price - a.productId.price;
        case "name":
          return a.productId.name.localeCompare(b.productId.name);
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
      const response = await fetch(`/api/user/wishlist?email=${session.user.email}`);
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist || []);
        if (showRefreshToast) {
          toast.success("Wishlist refreshed successfully!");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Error loading wishlist. Please try again.");
    } finally {
      setLoading(false);
      if (showRefreshToast) setRefreshing(false);
    }
  };

  const removeFromWishlist = async (productId: string, productName: string) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          productId,
        }),
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
        toast.success(`"${productName}" removed from wishlist`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to remove item");
      }
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
        setWishlistItems([]);
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

  const getUniqueCategories = () => {
    const categories = wishlistItems.map(item => item.productId.category);
    return [...new Set(categories)];
  };



  if (loading) {
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
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
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
                  src={item.productId.images[0] || "/placeholder.jpg"}
                  alt={item.productId.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Badge
                    variant={item.productId.inStock ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {item.productId.inStock ? (
                      <><Package className="h-3 w-3 mr-1" />In Stock</>
                    ) : (
                      "Out of Stock"
                    )}
                  </Badge>
                  {item.productId.originalPrice && item.productId.originalPrice > item.productId.price && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(((item.productId.originalPrice - item.productId.price) / item.productId.originalPrice) * 100)}% OFF
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
                    {item.productId.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {item.productId.category}
                  </Badge>
                </div>
                
                {item.productId.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(item.productId.rating!)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({item.productId.reviewCount || 0})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ${item.productId.price.toFixed(2)}
                    </span>
                    {item.productId.originalPrice && item.productId.originalPrice > item.productId.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.productId.originalPrice.toFixed(2)}
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
                    disabled={!item.productId.inStock}
                    onClick={() => addToCart(item.productId._id, item.productId.name)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.productId.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.productId._id, item.productId.name)}
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
                <DialogTitle className="text-xl">{selectedItem.productId.name}</DialogTitle>
                <DialogDescription>
                  Added to wishlist on {new Date(selectedItem.addedAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Image
                    src={selectedItem.productId.images[0] || "/placeholder.jpg"}
                    alt={selectedItem.productId.name}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Badge
                    variant={selectedItem.productId.inStock ? "default" : "destructive"}
                    className="absolute top-2 right-2"
                  >
                    {selectedItem.productId.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-primary">
                        ${selectedItem.productId.price.toFixed(2)}
                      </span>
                      {selectedItem.productId.originalPrice && selectedItem.productId.originalPrice > selectedItem.productId.price && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${selectedItem.productId.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">{selectedItem.productId.category}</Badge>
                  </div>
                  
                  {selectedItem.productId.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(selectedItem.productId.rating!)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedItem.productId.rating.toFixed(1)} ({selectedItem.productId.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}
                  
                  {selectedItem.productId.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.productId.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      disabled={!selectedItem.productId.inStock}
                      onClick={() => {
                        addToCart(selectedItem.productId._id, selectedItem.productId.name);
                        setSelectedItem(null);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        removeFromWishlist(selectedItem.productId._id, selectedItem.productId.name);
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

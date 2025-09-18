"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import ProductGrid from "@/components/product/product-grid";
import { ProductGridSkeleton } from "@/components/ui/loading-states";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Category {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "featured");
  
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/categories?limit=50');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize price range from URL params
  useEffect(() => {
    const minPrice = currentMinPrice ? parseInt(currentMinPrice) : 0;
    const maxPrice = currentMaxPrice ? parseInt(currentMaxPrice) : 10000;
    setPriceRange([minPrice, maxPrice]);
  }, [currentMinPrice, currentMaxPrice]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page
    router.push(`/shop?${params.toString()}`);
  }, [searchQuery, searchParams, router]);

  const handleCategoryFilter = useCallback((category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== currentCategory) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset to first page
    router.push(`/shop?${params.toString()}`);
  }, [currentCategory, searchParams, router]);

  const handleSortChange = useCallback((sort: string) => {
    setSelectedSort(sort);
    const params = new URLSearchParams(searchParams.toString());
    if (sort && sort !== "featured") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }, [searchParams, router]);

  const handlePriceFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }
    if (priceRange[1] < 10000) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }, [priceRange, searchParams, router]);

  const clearFilters = useCallback(() => {
    router.push('/shop');
    setSearchQuery('');
    setPriceRange([0, 10000]);
    setSelectedSort('featured');
  }, [router]);

  const activeFiltersCount = [
    currentCategory,
    searchQuery,
    currentMinPrice,
    currentMaxPrice,
    selectedSort !== 'featured' ? selectedSort : null
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4 flex items-center">
            <span className="hover:text-gray-700 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Shop</span>
            {currentCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium capitalize">
                  {categories.find(cat => cat.slug === currentCategory)?.name || currentCategory}
                </span>
              </>
            )}
          </div>
          
          {/* Page Title and Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentCategory 
                  ? categories.find(cat => cat.slug === currentCategory)?.name || 'Products'
                  : 'All Products'
                }
              </h1>
              <p className="text-gray-600">
                Discover our curated collection of premium products
              </p>
            </div>
            
            {/* Sort Dropdown */}
            <div className="mt-4 sm:mt-0">
              <Select value={selectedSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Price Range Filter */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000}
                        min={0}
                        step={100}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                      <Button 
                        onClick={handlePriceFilter} 
                        size="sm" 
                        className="w-full mt-3"
                      >
                        Apply Price Filter
                      </Button>
                    </div>
                  </div>
                  
                  {/* Categories */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Categories</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <Button
                        variant={!currentCategory ? "default" : "ghost"}
                        onClick={() => handleCategoryFilter("")}
                        className="w-full justify-start"
                        size="sm"
                      >
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category._id}
                          variant={currentCategory === category.slug ? "default" : "ghost"}
                          onClick={() => handleCategoryFilter(category.slug)}
                          className="w-full justify-between"
                          size="sm"
                        >
                          <span>{category.name}</span>
                          {category.productCount && (
                            <Badge variant="secondary" className="text-xs">
                              {category.productCount}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Category Filter Tabs */}
            <div className="hidden lg:flex flex-wrap gap-2">
              <Button
                onClick={() => handleCategoryFilter("")}
                variant={!currentCategory ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                All
              </Button>
              {!isLoadingCategories && categories.slice(0, 8).map((category) => (
                <Button
                  key={category._id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  variant={currentCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  {category.name}
                  {category.productCount && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.productCount}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Active Filter Tags */}
          {(searchQuery || currentCategory || currentMinPrice || currentMaxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {currentCategory && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {categories.find(cat => cat.slug === currentCategory)?.name || currentCategory}
                </Badge>
              )}
              {(currentMinPrice || currentMaxPrice) && (
                <Badge variant="secondary" className="px-3 py-1">
                  Price: ₹{currentMinPrice || 0} - ₹{currentMaxPrice || '10000+'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Product Grid */}
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}

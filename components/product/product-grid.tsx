"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
// Store functionality removed

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
}

export default function ProductGrid() {
  const domain = "default"; // Multi-tenant functionality removed
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(9);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Build query string from search params
        const queryParams = new URLSearchParams();

        // Add all existing search params
        for (const [key, value] of searchParams.entries()) {
          queryParams.append(key, value);
        }

        // Set default limit if not provided
        if (!queryParams.has("limit")) {
          queryParams.set("limit", "20");
        }

        // Append domain
        queryParams.set("domain", domain); // ✅ safe and correct way

        // ✅ Final fetch URL
        const response = await fetch(`/api/products?${queryParams.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        setProducts(data.products || []);
        setPagination(
          data.pagination || { total: 0, page: 1, limit: 9, pages: 1 }
        );
        setVisibleProducts(9);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, toast]);

  const loadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 6, products.length));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            No products found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, visibleProducts).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {visibleProducts < products.length && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMore} variant="outline" size="lg" className="min-w-[120px]">
            Load More ({products.length - visibleProducts} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

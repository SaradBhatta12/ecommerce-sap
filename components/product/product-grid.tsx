"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useGetProductsQuery } from "@/store";

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
  const [visibleProducts, setVisibleProducts] = useState(9);

  // Build query parameters from search params
  const queryParams = useMemo(() => {
    const params: any = {};
    
    // Add all existing search params
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    // Set default limit if not provided
    if (!params.limit) {
      params.limit = 20;
    }

    // Append domain
    params.domain = domain;

    return params;
  }, [searchParams, domain]);

  // Use RTK Query hook to fetch products
  const {
    data: productsData,
    error,
    isLoading,
    isError
  } = useGetProductsQuery(queryParams);

  // Handle error state
  if (isError) {
    console.error("Error fetching products:", error);
    toast.error("Error", {
      description: "Failed to load products. Please try again.",
    });
  }

  const products = productsData?.products || [];
  const pagination = {
    total: productsData?.totalProducts || 0,
    page: productsData?.currentPage || 1,
    limit: queryParams.limit || 20,
    pages: productsData?.totalPages || 1,
  };

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

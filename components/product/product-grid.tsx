"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ProductGridSkeleton } from "@/components/ui/loading-states";
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

const ProductGrid = React.memo(function ProductGrid() {
  const [visibleProducts, setVisibleProducts] = useState(9);
  const searchParams = useSearchParams();

  const queryParams = useMemo(() => {
    return {
      category: searchParams.get("category"),
      brand: searchParams.get("brand"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      onSale: searchParams.get("onSale"),
      search: searchParams.get("search"),
      sort: searchParams.get("sort"),
    };
  }, [searchParams]);

  const {
    data: productsData,
    error,
    isLoading,
  } = useGetProductsQuery({
    category: queryParams.category || undefined,
    brand: queryParams.brand || undefined,
    minPrice: queryParams.minPrice ? Number(queryParams.minPrice) : undefined,
    maxPrice: queryParams.maxPrice ? Number(queryParams.maxPrice) : undefined,
    onSale: queryParams.onSale === "true" ? true : undefined,
    search: queryParams.search || undefined,
    sort: queryParams.sort || undefined,
    limit: 50,
  });

  const products = productsData?.products || [];

  const loadMore = useCallback(() => {
    setVisibleProducts(prev => Math.min(prev + 9, products.length));
  }, [products.length]);

  const hasMore = useMemo(() => visibleProducts < products.length, [visibleProducts, products.length]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading products. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return <ProductGridSkeleton count={9} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.slice(0, visibleProducts).map((product) => (
          <ProductCard key={product._id as any} product={product as any} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
});

export default ProductGrid;

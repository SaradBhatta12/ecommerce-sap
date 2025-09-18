"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/loading-states";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
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
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface RelatedProductsProps {
  categoryId: string | Category;
  currentProductId: string;
}

const RelatedProducts = React.memo(function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  const fetchRelatedProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Handle both string and object categoryId
      const categoryIdValue = typeof categoryId === 'string' ? categoryId : categoryId._id;
      
      const response = await fetch(
        `/api/products?category=${categoryIdValue}&limit=6`
      );
      const data = await response.json();

      // Filter out the current product
      const filteredProducts = data?.products?.filter(
        (product: Product) => product._id !== currentProductId
      ) || [];
      
      setRelatedProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, currentProductId]);

  useEffect(() => {
    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [fetchRelatedProducts]);

  const itemsPerPage = 4;
  
  const endIndex = useMemo(() => 
    Math.min(startIndex + itemsPerPage, relatedProducts.length), 
    [startIndex, relatedProducts.length]
  );
  
  const visibleProducts = useMemo(() => 
    relatedProducts.slice(startIndex, endIndex), 
    [relatedProducts, startIndex, endIndex]
  );

  const nextProducts = useCallback(() => {
    if (endIndex < relatedProducts.length) {
      setStartIndex(prev => prev + 1);
    }
  }, [endIndex, relatedProducts.length]);

  const prevProducts = useCallback(() => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  }, [startIndex]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Related Products</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ProductGridSkeleton count={4} />
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevProducts}
            disabled={startIndex === 0}
            aria-label="Previous products"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextProducts}
            disabled={endIndex >= relatedProducts.length}
            aria-label="Next products"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
});

export default RelatedProducts;

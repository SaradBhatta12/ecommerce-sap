"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export default function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products?category=${categoryId._id}&limit=6`
        );
        const data = await response.json();

        // Filter out the current product
        const filteredProducts = data?.products?.filter(
          (product: any) => product._id !== currentProductId
        );
        setRelatedProducts(filteredProducts || []);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  const itemsPerPage = 4;
  const endIndex = Math.min(startIndex + itemsPerPage, relatedProducts.length);
  const visibleProducts = relatedProducts.slice(startIndex, endIndex);

  const nextProducts = () => {
    if (endIndex < relatedProducts.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevProducts = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
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
}

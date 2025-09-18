"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/ui/loading-states";
// Store functionality removed

function FeaturedProducts() {
  const domain = "default"; // Multi-tenant functionality removed
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "/api/products?isFeatured=true&limit=6&domain=" + domain
      );

      const data = await response.json();
      setFeaturedProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const { endIndex, visibleProducts } = useMemo(() => {
    const end = Math.min(startIndex + itemsPerPage, featuredProducts.length);
    const visible = featuredProducts.slice(startIndex, end);
    return { endIndex: end, visibleProducts: visible };
  }, [startIndex, itemsPerPage, featuredProducts]);

  const nextProducts = useCallback(() => {
    if (endIndex < featuredProducts.length) {
      setStartIndex(prev => prev + 1);
    }
  }, [endIndex, featuredProducts.length]);

  const prevProducts = useCallback(() => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  }, [startIndex]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of premium products
            </p>
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 no-shadows no-rounded relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      <div className="fullscreen-container relative">
        <div className="responsive-container">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-responsive-2xl font-bold tracking-tight font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Featured Products
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 font-light tracking-wide">Discover our handpicked favorites</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 btn-enhanced shadow-lg hover:shadow-xl"
                onClick={prevProducts}
                disabled={startIndex === 0}
                aria-label="Previous products"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 btn-enhanced shadow-lg hover:shadow-xl"
                onClick={nextProducts}
                disabled={endIndex >= featuredProducts.length}
                aria-label="Next products"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {visibleProducts.map((product, index) => (
              <div 
                key={ index}
                className="transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl rounded-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-12 py-4 text-base font-medium uppercase tracking-wider btn-enhanced shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

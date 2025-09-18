"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryGridSkeleton } from "@/components/ui/loading-states";
// Store functionality removed

const CategoryOverview = React.memo(function CategoryOverview() {
  const domain = "default"; // Multi-tenant functionality removed

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories?&domain=${domain}`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Shop by Category
            </h2>
            <p className="text-muted-foreground">
              Explore our wide range of product categories
            </p>
          </div>
          <CategoryGridSkeleton count={6} />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories?.map((category) => (
          <Link key={category._id} href={`/categories/${category.slug}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-square overflow-hidden">
                <Image
                  src={
                    category.image || "/placeholder.svg?height=200&width=200"
                  }
                  alt={category.name}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.productCount || 0} products
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
});

export default CategoryOverview;

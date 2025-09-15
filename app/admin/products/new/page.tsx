"use client";

import { EnhancedProductForm } from "@/components/admin/product-form";
import { useGetCategoriesQuery, useGetBrandsQuery } from "@/store";
import { Brand, Category } from "@/types";

export default function CreateProductPage() {
  // RTK Query hooks for fetching categories and brands
  const { data: categoriesData } = useGetCategoriesQuery({
    page: 1,
    limit: 100,
  });
  
  const { data: brandsData } = useGetBrandsQuery({
    page: 1,
    limit: 100,
  });

  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];

  return (
    <div className="min-h-screen">
      <EnhancedProductForm 
        categories={categories as unknown as Category[]} 
        brands={brands as unknown as Brand[]} 
      />
    </div>
  );
}

"use client";

import { EnhancedProductForm as ProductForm } from "@/components/admin/product-form";
import { Brand, Category } from "@/types";
import {
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} from "@/store";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const { toast } = useToast();

  // RTK Query hooks for fetching data
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useGetProductByIdQuery(params.id as string);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery({
    page: 1,
    limit: 100,
  });

  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useGetBrandsQuery({
    page: 1,
    limit: 100,
  });

  // Handle errors with toast notifications
  useEffect(() => {
    if (productError) {
      toast({
        title: "Error",
        description: "Failed to fetch product data",
        variant: "destructive",
      });
    }
    if (categoriesError) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
    if (brandsError) {
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      });
    }
  }, [productError, categoriesError, brandsError, toast]);

  const isLoading = productLoading || categoriesLoading || brandsLoading;
  const hasError = productError || categoriesError || brandsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">Update product information</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading product data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !productData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">Update product information</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">
              {productError ? "Error Loading Product" : "Product Not Found"}
            </h1>
            <p className="text-muted-foreground">
              {productError
                ? "There was an error loading the product data."
                : "The product you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => refetchProduct()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">Update product information</p>
      </div>
      <ProductForm
        initialData={productData?.product}
        categories={categories as unknown as Category[]}
        brands={brands as unknown as Brand[]}
      />
    </div>
  );
}

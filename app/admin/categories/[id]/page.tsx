"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CategoryForm from "@/components/admin/category-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function EditCategoryPage() {
  const router = useRouter();

  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch category
        const categoryResponse = await fetch(`/api/categories/${params.id}`);
        if (!categoryResponse.ok) {
          throw new Error("Category not found");
        }
        const categoryData = await categoryResponse.json();

        // Fetch all categories for parent selection
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        setCategory(categoryData.category);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        router.push("/admin/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Category</h2>
          <p className="text-muted-foreground">Update category information</p>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Category</h2>
        <p className="text-muted-foreground">Update category information</p>
      </div>
      <CategoryForm
        category={category}
        categories={categories.filter((cat: any) => cat._id !== params.id)}
      />
    </div>
  );
}

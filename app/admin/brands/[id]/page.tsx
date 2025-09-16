"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BrandForm from "@/components/admin/brand-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function EditBrandPage() {
  const router = useRouter();

  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch brand
        const brandResponse = await fetch(`/api/brands/${params.id}`);
        if (!brandResponse.ok) {
          throw new Error("Brand not found");
        }
        const brandData = await brandResponse.json();

        setBrand(brandData.brand);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        router.push("/admin/brands");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Brand</h2>
          <p className="text-muted-foreground">Update brand information</p>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Brand</h2>
        <p className="text-muted-foreground">Update brand information</p>
      </div>
      <BrandForm brand={brand} />
    </div>
  );
}

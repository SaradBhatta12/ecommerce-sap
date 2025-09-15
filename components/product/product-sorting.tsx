"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProductFilters from "./product-filters";
// Store functionality removed

export default function ProductSorting() {
  const domain = "default"; // Multi-tenant functionality removed
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center space-x-3">
        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="py-4">
              <h2 className="mb-4 text-lg font-semibold">Filters</h2>
              <ProductFilters />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {searchParams.has("category") ? "filtered" : "all"} products
        </p>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          Sort by:
        </span>
        <Select
          defaultValue={searchParams.get("sort") || "featured"}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[160px] sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

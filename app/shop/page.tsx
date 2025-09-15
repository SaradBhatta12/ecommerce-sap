import { Suspense } from "react";
import ProductGrid from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-600 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Products</span>
          </div>
          
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-black mb-6">PRODUCTS</h1>
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 bg-gray-200 border-0 rounded-none text-sm focus:outline-none focus:ring-0"
              />
            </div>
          </div>
          
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="px-4 py-2 text-sm font-medium text-black border border-gray-300 bg-white hover:bg-gray-50">
              NEW
            </button>
            <button className="px-4 py-2 text-sm font-medium text-black border border-gray-300 bg-white hover:bg-gray-50">
              SHIRTS
            </button>
            <button className="px-4 py-2 text-sm font-medium text-black border border-gray-300 bg-white hover:bg-gray-50">
              POLO SHIRTS
            </button>
            <button className="px-4 py-2 text-sm font-medium text-black border border-gray-300 bg-white hover:bg-gray-50">
              SHORTS
            </button>
            <button className="px-4 py-2 text-sm font-medium text-black border border-gray-300 bg-white hover:bg-gray-50">
              SUITS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Product Grid */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

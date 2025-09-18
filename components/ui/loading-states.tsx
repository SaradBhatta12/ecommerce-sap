"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Product Card Loading State
export const ProductCardSkeleton = React.memo(function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
});

// Product Grid Loading State
export const ProductGridSkeleton = React.memo(function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
});

// Category Card Loading State
export const CategoryCardSkeleton = React.memo(function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );
});

// Category Grid Loading State
export const CategoryGridSkeleton = React.memo(function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
});

// Table Row Loading State
export const TableRowSkeleton = React.memo(function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
});

// Table Loading State
export const TableSkeleton = React.memo(function TableSkeleton({ 
  rows = 5, 
  columns = 5 
}: { 
  rows?: number; 
  columns?: number; 
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Form Loading State
export const FormSkeleton = React.memo(function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
});

// Stats Card Loading State
export const StatsCardSkeleton = React.memo(function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
});

// Chart Loading State
export const ChartSkeleton = React.memo(function ChartSkeleton({ height = 350 }: { height?: number }) {
  return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
});

// Review Card Loading State
export const ReviewCardSkeleton = React.memo(function ReviewCardSkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
});

// Generic List Loading State
export const ListSkeleton = React.memo(function ListSkeleton({ 
  count = 5, 
  itemHeight = "h-12" 
}: { 
  count?: number; 
  itemHeight?: string; 
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${itemHeight}`} />
      ))}
    </div>
  );
});

// Page Loading State
export const PageSkeleton = React.memo(function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
});
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Sale {
  id: string;
  customer: {
    name: string;
    email: string;
    initials: string;
  };
  amount: number;
  date: string;
}

export function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const response = await fetch("/api/admin/recent-sales");
        const data = await response.json();
        setSales(data.sales);
      } catch (error) {
        console.error("Failed to fetch recent sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="ml-auto font-medium">
              <Skeleton className="h-4 w-[80px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sales?.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No recent sales found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sales?.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.customer.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.customer.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {sale.customer.email}
            </p>
          </div>
          <div className="ml-auto font-medium nepali-price">
            {sale.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

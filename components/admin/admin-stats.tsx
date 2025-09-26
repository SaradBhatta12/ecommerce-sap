"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useGetStatsQuery } from "@/store/api/adminApi";
import React from "react";
import { StatsCardSkeleton } from "@/components/ui/loading-states";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
  formatValue?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  isLoading,
  formatValue = false,
}) => {
  const { formatPrice } = useCurrency();
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const displayValue = formatValue && typeof value === 'number' 
    ? formatPrice(value) 
    : typeof value === 'number' 
      ? value.toLocaleString() 
      : value;

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          ) : (
            displayValue
          )}
        </div>
        {change !== undefined && !isLoading && (
          <div className="flex items-center space-x-1">
            {isPositive && (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{Math.abs(change)}%
                </span>
              </>
            )}
            {isNegative && (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  -{Math.abs(change)}%
                </span>
              </>
            )}
            {change === 0 && (
              <span className="text-sm font-medium text-gray-500">
                No change
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
        {change === undefined && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Current total
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const AdminStats: React.FC = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useGetStatsQuery();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton count={4} />
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Failed to fetch admin stats:", error);
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-red-500 mb-2">
              <Package className="h-8 w-8" />
            </div>
            <p className="text-red-600 font-medium mb-2">
              Failed to load statistics
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the admin statistics.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Provide default values if stats is undefined
  const statsData = stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Key metrics and performance indicators
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={statsData.totalRevenue}
          change={statsData.revenueChange}
          icon={<CreditCard className="h-5 w-5 text-blue-600" />}
          formatValue={true}
        />
        
        <StatCard
          title="Total Orders"
          value={statsData.totalOrders}
          change={statsData.ordersChange}
          icon={<ShoppingCart className="h-5 w-5 text-green-600" />}
        />
        
        <StatCard
          title="Total Products"
          value={statsData.totalProducts}
          change={statsData.productsChange}
          icon={<Package className="h-5 w-5 text-purple-600" />}
        />
        
        <StatCard
          title="Total Customers"
          value={statsData.totalCustomers}
          change={statsData.customersChange}
          icon={<Users className="h-5 w-5 text-orange-600" />}
        />
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-100 rounded">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Performance Summary
            </p>
            <p className="text-xs text-blue-700">
              Data refreshed automatically every 5 minutes. Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminStats);

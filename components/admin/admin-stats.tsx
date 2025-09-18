"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { useGetStatsQuery } from "@/store/api/adminApi";
import React from "react";
import { StatsCardSkeleton } from "@/components/ui/loading-states";

export function AdminStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useGetStatsQuery();

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

  if (isLoading) {
    return null;
  }

  if (error) {
    console.error("Failed to fetch admin stats:", error);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold nepali-price">
            {statsData?.totalRevenue?.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {statsData.revenueChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {stats.revenueChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(statsData.revenueChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {statsData.ordersChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {statsData.ordersChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(statsData.ordersChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {statsData.productsChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {statsData.productsChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(statsData.productsChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {statsData.customersChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {statsData.customersChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(statsData.customersChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const AdminStats = React.memo(function AdminStats() {
  const { data: stats, isLoading, error } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading statistics</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.revenueGrowth || 0}% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalOrders?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.ordersGrowth || 0}% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalProducts?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.productsGrowth || 0}% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString() || '0'}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.usersGrowth || 0}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

export default AdminStats;

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

export function AdminStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return null;
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
            {stats?.totalRevenue?.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.revenueChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {stats.revenueChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(stats.revenueChange)}% from last month
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
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.ordersChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {stats.ordersChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(stats.ordersChange)}% from last month
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
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.productsChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {stats.productsChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(stats.productsChange)}% from last month
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
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.customersChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4" />
                {stats.customersChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4" />
                {Math.abs(stats.customersChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

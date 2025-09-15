"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Package,
  Heart,
  Star,
  ShoppingBag,
  Loader2,
  TrendingUp,
  Clock,
  MapPin,
  User,
  CreditCard,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetUserOrdersQuery, useGetWishlistQuery, useGetUserAddressesQuery } from "@/store";

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  reviewsCount: number;
  addressesCount: number;
  recentOrders: any[];
  recentWishlist: any[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    reviewsCount: 0,
    addressesCount: 0,
    recentOrders: [],
    recentWishlist: [],
  });
  // RTK Query hooks for data fetching
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetUserOrdersQuery();

  const {
    data: wishlistData,
    isLoading: wishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useGetWishlistQuery();

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useGetUserAddressesQuery();

  const loading = ordersLoading || wishlistLoading || addressesLoading;

  // Calculate stats from RTK Query data
  useEffect(() => {
    if (ordersData || wishlistData || addressesData) {
      const orders = ordersData?.orders || [];
      const wishlist = wishlistData?.wishlist || [];
      const addresses = addressesData?.addresses || [];

      const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const recentOrders = orders.slice(0, 5);
      const recentWishlist = wishlist.slice(0, 3);
      
      setStats({
        totalOrders: orders.length,
        totalSpent,
        wishlistItems: wishlist.length,
        reviewsCount: 0, // Will be updated when reviews API is implemented
        addressesCount: addresses.length,
        recentOrders,
        recentWishlist,
      });
    }
  }, [ordersData, wishlistData, addressesData]);

  // Handle errors
  useEffect(() => {
    if (ordersError || wishlistError || addressesError) {
      toast.error("Some data could not be loaded. Please try again.");
    }
  }, [ordersError, wishlistError, addressesError]);

  const handleRefresh = () => {
    refetchOrders();
    refetchWishlist();
    refetchAddresses();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "User"}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Link href="/shop">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalOrders === 0 ? "No orders yet" : `${stats.totalOrders} order${stats.totalOrders > 1 ? 's' : ''} placed`}
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spent
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs. {stats.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSpent === 0 ? "Start shopping today" : "Lifetime spending"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wishlist Items
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.wishlistItems}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.wishlistItems === 0 ? "Save items you love" : `${stats.wishlistItems} item${stats.wishlistItems > 1 ? 's' : ''} saved`}
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Addresses</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.addressesCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.addressesCount === 0 ? "Add delivery address" : `${stats.addressesCount} address${stats.addressesCount > 1 ? 'es' : ''} saved`}
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    {stats.recentOrders.length === 0 ? "No recent orders" : `Your latest ${stats.recentOrders.length} orders`}
                  </CardDescription>
                </div>
                <Link href="/dashboard/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No orders found</p>
                    <Link href="/shop">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentOrders.map((order: any) => (
                      <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div>
                            <p className="font-medium text-sm">Order #{order._id.slice(-8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">Rs. {order.total?.toLocaleString()}</p>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Wishlist</CardTitle>
                  <CardDescription>
                    {stats.recentWishlist.length === 0 ? "No wishlist items" : `${stats.recentWishlist.length} recent items`}
                  </CardDescription>
                </div>
                <Link href="/dashboard/wishlist">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats.recentWishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No wishlist items</p>
                    <Link href="/shop">
                      <Button>Explore Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentWishlist.map((item: any) => (
                      <div key={item._id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Rs. {item.product?.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and manage all your orders</CardDescription>
              </div>
              <Link href="/dashboard/orders">
                <Button>Manage Orders</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No orders found</p>
                  <Link href="/shop">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <div>
                          <p className="font-medium">Order #{order._id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs. {order.total?.toLocaleString()}</p>
                        <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'processing' ? 'secondary' : 'outline'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/dashboard/orders">
                      <Button variant="outline">View All Orders</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>Your saved items for later</CardDescription>
              </div>
              <Link href="/dashboard/wishlist">
                <Button>Manage Wishlist</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentWishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No wishlist items found</p>
                  <Link href="/shop">
                    <Button>Explore Products</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.recentWishlist.map((item: any) => (
                    <div key={item._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        <Heart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rs. {item.product?.price?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="col-span-full text-center pt-4">
                    <Link href="/dashboard/wishlist">
                      <Button variant="outline">View All Items</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

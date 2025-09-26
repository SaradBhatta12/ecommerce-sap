"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { RecentActivity } from "@/components/admin/analytics/RecentActivity";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsData {
  dashboard: {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    totalCategories: number;
    totalBrands: number;
  };
  sales: {
    salesData: Array<{
      _id: { year: number; month: number; day: number };
      totalSales: number;
      orderCount: number;
    }>;
    categoryRevenue: Array<{
      _id: string;
      revenue: number;
      orders: number;
    }>;
  };
  products: {
    topSellingProducts: Array<{
      _id: string;
      name: string;
      image: string;
      totalSold: number;
      revenue: number;
    }>;
    lowStockProducts: Array<{
      _id: string;
      name: string;
      images: string[];
      stock: number;
    }>;
    categoryDistribution: Array<{
      _id: string;
      count: number;
    }>;
  };
  customers: {
    newCustomers: number;
    customerGrowth: Array<{
      _id: { year: number; month: number; day: number };
      count: number;
    }>;
    topCustomers: Array<{
      _id: string;
      name: string;
      email: string;
      totalSpent: number;
      orderCount: number;
    }>;
    customerOrders: Array<{
      _id: string;
      count: number;
    }>;
  };
  performance: {
    current: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
    };
    previous: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
    };
    changes: {
      revenue: number;
      orders: number;
      avgOrderValue: number;
    };
  };
  activity: {
    recentOrders: any[];
    recentUsers: any[];
    recentProducts: any[];
  };
}

export default function AnalyticsPage() {
  const { formatPrice } = useCurrency();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?type=all&period=${period}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatSalesData = (salesData: any[]) => {
    return salesData.map(item => ({
      name: `${item._id.month}/${item._id.day}`,
      sales: item.totalSales,
      orders: item.orderCount,
    }));
  };

  const formatCategoryData = (categoryData: any[]) => {
    return categoryData.map(item => ({
      name: item._id,
      value: item.revenue,
      orders: item.orders,
    }));
  };

  const formatCustomerGrowth = (growthData: any[]) => {
    return growthData.map(item => ({
      name: `${item._id.month}/${item._id.day}`,
      customers: item.count,
    }));
  };

  const generateRecentActivity = () => {
    if (!data) return [];
    
    const activities: { id: string; type: "order" | "user" | "product"; title: string; description: string; timestamp: any; status: "success" | "info"; user?: { name: any; email: any; } | { name: any; email: any; } | undefined; metadata?: { amount: any; } | { category: any; }; }[] = [];
    
    // Add recent orders
    data.activity.recentOrders.forEach((order: any) => {
      activities.push({
        id: `order-${order._id}`,
        type: "order" as const,
        title: `New Order #${order._id.slice(-6)}`,
        description: `Order placed by ${order.userId?.name || 'Customer'}`,
        timestamp: order.createdAt,
        status: order.status === 'completed' ? 'success' as const : 'info' as const,
        user: order.userId ? {
          name: order.userId.name,
          email: order.userId.email,
        } : undefined,
        metadata: {
          amount: order.totalAmount,
        },
      });
    });

    // Add recent users
    data.activity.recentUsers.forEach((user: any) => {
      activities.push({
        id: `user-${user._id}`,
        type: "user" as const,
        title: "New User Registration",
        description: `${user.name} joined the platform`,
        timestamp: user.createdAt,
        status: "success" as const,
        user: {
          name: user.name,
          email: user.email,
        },
      });
    });

    // Add recent products
    data.activity.recentProducts.forEach((product: any) => {
      activities.push({
        id: `product-${product._id}`,
        type: "product" as const,
        title: "New Product Added",
        description: `${product.name} was added to ${product.category?.name || 'catalog'}`,
        timestamp: product.createdAt,
        status: "info" as const,
        metadata: {
          category: product.category?.name,
        },
      });
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  return (
    <div className="flex-1 space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your e-commerce performance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalytics}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={data ? formatPrice(data.dashboard.totalRevenue) : formatPrice(0)}
              change={data?.performance.changes.revenue}
              changeLabel="vs last period"
              icon={<DollarSign className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Total Orders"
              value={data?.dashboard.totalOrders || 0}
              change={data?.performance.changes.orders}
              changeLabel="vs last period"
              icon={<ShoppingCart className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Total Customers"
              value={data?.dashboard.totalUsers || 0}
              description="Active customers"
              icon={<Users className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Total Products"
              value={data?.dashboard.totalProducts || 0}
              description="In catalog"
              icon={<Package className="h-4 w-4" />}
              loading={loading}
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Average Order Value"
              value={data?.performance?.current?.avgOrderValue ? formatPrice(data.performance.current.avgOrderValue) : formatPrice(0)}
              change={data?.performance.changes.avgOrderValue}
              changeLabel="vs last period"
              icon={<TrendingUp className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Pending Orders"
              value={data?.dashboard.pendingOrders || 0}
              description="Awaiting processing"
              icon={<AlertTriangle className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Completed Orders"
              value={data?.dashboard.completedOrders || 0}
              description="Successfully delivered"
              icon={<TrendingUp className="h-4 w-4" />}
              loading={loading}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsChart
              title="Sales Trend"
              description="Revenue over time"
              data={data ? formatSalesData(data.sales.salesData) : []}
              type="area"
              dataKey="sales"
              color="#8884d8"
              loading={loading}
              formatValue={(value) => formatPrice(value)}
            />
            <AnalyticsChart
              title="Revenue by Category"
              description="Top performing categories"
              data={data ? formatCategoryData(data.sales.categoryRevenue.slice(0, 6)) : []}
              type="pie"
              dataKey="value"
              loading={loading}
              formatValue={(value) => formatPrice(value)}
            />
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6">
            <AnalyticsChart
              title="Sales Performance"
              description="Daily sales and order count"
              data={data ? formatSalesData(data.sales.salesData) : []}
              type="line"
              dataKey="sales"
              color="#10b981"
              loading={loading}
              height={400}
              formatValue={(value) => formatPrice(value)}
            />
            
            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsChart
                title="Revenue by Category"
                description="Category performance breakdown"
                data={data ? formatCategoryData(data.sales.categoryRevenue) : []}
                type="bar"
                dataKey="value"
                color="#f59e0b"
                loading={loading}
                formatValue={(value) => formatPrice(value)}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>Best performing product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data?.sales.categoryRevenue.slice(0, 5).map((category, index) => (
                        <div key={category._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{category._id}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatPrice(category.revenue)}</div>
                            <div className="text-xs text-muted-foreground">{category.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.products.topSellingProducts.slice(0, 5).map((product, index) => (
                      <div key={product._id} className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <img
                          src={product.image || "/placeholder.jpg"}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.totalSold} sold • {formatPrice(product.revenue)} revenue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Low Stock Alert</span>
                </CardTitle>
                <CardDescription>Products running low on inventory</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.products.lowStockProducts.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center space-x-3">
                        <img
                          src={product.images[0] || "/placeholder.jpg"}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Only {product.stock} left in stock
                          </div>
                        </div>
                        <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <AnalyticsChart
            title="Product Distribution by Category"
            description="Number of products in each category"
            data={data ? data.products.categoryDistribution.map(cat => ({
              name: cat._id,
              value: cat.count,
            })) : []}
            type="bar"
            dataKey="value"
            color="#8b5cf6"
            loading={loading}
            height={300}
          />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="New Customers"
              value={data?.customers.newCustomers || 0}
              description={`In the last ${period}`}
              icon={<Users className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Total Customers"
              value={data?.dashboard.totalUsers || 0}
              description="All registered users"
              icon={<Users className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Customer Growth"
              value={data ? `+${data.customers.customerGrowth.reduce((sum, item) => sum + item.count, 0)}` : "+0"}
              description="New registrations"
              icon={<TrendingUp className="h-4 w-4" />}
              loading={loading}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsChart
              title="Customer Growth"
              description="New customer registrations over time"
              data={data ? formatCustomerGrowth(data.customers.customerGrowth) : []}
              type="area"
              dataKey="customers"
              color="#06b6d4"
              loading={loading}
            />

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest spending customers</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                          <div className="space-y-1">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.customers.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatPrice(customer.totalSpent)}</div>
                          <div className="text-xs text-muted-foreground">{customer.orderCount} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <RecentActivity
            activities={data ? generateRecentActivity() : []}
            loading={loading}
            maxItems={20}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
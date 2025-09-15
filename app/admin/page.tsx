"use client";

import { Suspense } from "react";
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
  ArrowUpRight,
  Brain,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetRecentSalesQuery,
} from "@/store";

export default function AdminDashboardPage() {
  // RTK Query hooks for data fetching
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetStatsQuery();

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetAnalyticsQuery({ detailed: true });

  const {
    data: recentSales,
    isLoading: recentSalesLoading,
    error: recentSalesError,
    refetch: refetchRecentSales,
  } = useGetRecentSalesQuery();
  // Handle refresh all data
  const handleRefresh = () => {
    refetchStats();
    refetchAnalytics();
    refetchRecentSales();
  };
  console.log(recentSales)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={handleRefresh}
            disabled={statsLoading || analyticsLoading || recentSalesLoading}
          >
            {(statsLoading || analyticsLoading || recentSalesLoading) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button size="sm" className="h-9">
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="py-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="py-2">
            Reports
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-2">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Error handling for stats */}
          {statsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load dashboard statistics. Please try refreshing.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      रू {stats?.totalRevenue?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.revenueChange > 0 ? '+' : ''}{stats?.revenueChange || 0}% from last month
                    </p>
                    <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${Math.min(Math.abs(stats?.revenueChange || 0), 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.totalOrders?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.ordersChange > 0 ? '+' : ''}{stats?.ordersChange || 0}% from last month
                    </p>
                    <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${Math.min(Math.abs(stats?.ordersChange || 0), 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.totalProducts?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.productsChange > 0 ? '+' : ''}{stats?.productsChange || 0}% from last month
                    </p>
                    <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${Math.min(Math.abs(stats?.productsChange || 0), 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.totalUsers?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.usersChange > 0 ? '+' : ''}{stats?.usersChange || 0}% from last month
                    </p>
                    <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${Math.min(Math.abs(stats?.usersChange || 0), 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 hover-card-effect">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Compare sales performance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {analyticsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load analytics data. Please try refreshing.
                    </AlertDescription>
                  </Alert>
                ) : analyticsLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-muted-foreground">Loading analytics...</span>
                    </div>
                  </div>
                ) : analytics?.revenue?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Revenue Trend</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {analytics.revenue.slice(-3).map((item, index) => (
                            <div key={index} className="text-center">
                              <div className="font-medium">{item.month}</div>
                              <div className="text-muted-foreground">रू {item.amount.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No analytics data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-3 hover-card-effect">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest transactions across your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentSalesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load recent sales. Please try refreshing.
                    </AlertDescription>
                  </Alert>
                ) : recentSalesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-9 h-9 bg-muted rounded-full animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                        <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : recentSales?.sales?.length > 0 ? (
                  <div className="space-y-4">
                    {recentSales.sales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="flex items-center space-x-4">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">
                            {sale.customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.customer.email}
                          </p>
                        </div>
                        <div className="font-medium">
                          रू {sale.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    No recent sales data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Smart recommendations for your business
                  </CardDescription>
                </div>
                <Brain className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Increase inventory for trending products
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Smart watches and wireless earbuds are trending.
                        Consider increasing stock by 15%.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Customer retention opportunity
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Send personalized offers to 230 customers who haven't
                        purchased in 30 days.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Cart abandonment alert
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cart abandonment rate increased by 5%. Consider
                        optimizing checkout process.
                      </p>
                    </div>
                  </li>
                </ul>
                <Button variant="link" className="mt-4 w-full">
                  View all insights
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Your scheduled activities</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-yellow-500/10 p-1">
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Inventory review</p>
                      <p className="text-xs text-muted-foreground">
                        Today at 2:00 PM
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Team meeting</p>
                      <p className="text-xs text-muted-foreground">
                        Tomorrow at 10:00 AM
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500/10 p-1">
                      <Package className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">New product launch</p>
                      <p className="text-xs text-muted-foreground">
                        May 20, 2035
                      </p>
                    </div>
                  </li>
                </ul>
                <Button variant="link" className="mt-4 w-full">
                  View calendar
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used operations</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Orders
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Create Discount
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start col-span-2"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Generate AI Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Analytics content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and view custom reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Reports content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                System alerts and important updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Notifications content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Package,
  DollarSign,
  Clock,
  Truck,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { getAllOrders } from "@/_actions/_orders";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IOrder } from "@/models/order";
import Image from "next/image";
import user from "@/models/user";
import { Avatar } from "@/components/ui/avatar";

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "shipped":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "processing":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "pending":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    default:
      return null;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  console.log(orders);
  const getAllOrdersAdmin = async () => {
    try {
      const response = await getAllOrders();
      if (response.succes) {
        const allCleanOrders = JSON.parse(response.orders as string);
        setOrders(allCleanOrders);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllOrdersAdmin();
  }, []);
  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Orders Management
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track and manage all your customer orders in one place
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">1,234</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="ml-1 hidden sm:inline">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">RS. 45,231</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500 font-medium">+8%</span>
                <span className="ml-1 hidden sm:inline">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">23</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-red-500 rotate-180" />
                <span className="text-red-500 font-medium">-4%</span>
                <span className="ml-1 hidden sm:inline">from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Delivery Rate
              </CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">98.5%</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500 font-medium">+2%</span>
                <span className="ml-1 hidden sm:inline">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Recent Orders
                </CardTitle>
                <CardDescription className="text-sm">
                  View and manage your customer orders
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10 w-full sm:w-[280px]"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="px-6 pb-4">
                <TabsList>
                  <TabsTrigger value="all" className="text-sm">
                    All Orders
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-sm">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="processing" className="text-sm">
                    Processing
                  </TabsTrigger>
                  <TabsTrigger value="shipped" className="text-sm">
                    Shipped
                  </TabsTrigger>
                  <TabsTrigger value="delivered" className="text-sm">
                    Delivered
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">
                          Order ID
                        </TableHead>
                        <TableHead className="font-semibold">
                          Customer
                        </TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold text-right">
                          Total
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                      {orders?.map((order, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 ">
                              <div className="img">
                                {(order.user as any).image ? (
                                  <Image
                                    src={
                                      (order.user as any).image &&
                                      (order.user as any).image
                                    }
                                    alt={(order.user as any).name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <Avatar className="h-8 w-8">
                                    {(order.user as any).name?.[0]}
                                  </Avatar>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {(order.user as any).name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {(order.user as any).email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-muted-foreground">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getPaymentStatusIcon(order.paymentStatus)}
                              <Badge
                                variant="outline"
                                className={getPaymentStatusColor(
                                  order.paymentStatus
                                )}
                              >
                                {order.paymentStatus.charAt(0).toUpperCase() +
                                  order.paymentStatus.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            NPR{". "}
                            {order.total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/orders/${order._id}`}
                                    className="flex items-center"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Order</DropdownMenuItem>
                                <DropdownMenuItem>
                                  Download Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="lg:hidden px-4 pb-4 space-y-4">
                  {orders?.map((order) => (
                    <Card key={order._id as unknown as string}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Customer:
                            </span>
                            <span className="text-sm font-medium">
                              {order.user.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Payment:
                            </span>
                            <div className="flex items-center gap-1">
                              {getPaymentStatusIcon(order.paymentStatus)}
                              <Badge
                                variant="outline"
                                className={`${getPaymentStatusColor(
                                  order.paymentStatus
                                )} text-xs`}
                              >
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Total:
                            </span>
                            <span className="text-sm font-semibold">
                              Rs. {order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Link href={`/orders/${order._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Other tab contents */}
              <TabsContent value="pending" className="mt-0">
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <p>Pending orders will appear here</p>
                </div>
              </TabsContent>
              <TabsContent value="processing" className="mt-0">
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Processing orders will appear here</p>
                </div>
              </TabsContent>
              <TabsContent value="shipped" className="mt-0">
                <div className="p-8 text-center text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4" />
                  <p>Shipped orders will appear here</p>
                </div>
              </TabsContent>
              <TabsContent value="delivered" className="mt-0">
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                  <p>Delivered orders will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

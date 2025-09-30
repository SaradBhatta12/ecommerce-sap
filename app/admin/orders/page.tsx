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
import { useCurrency } from "@/contexts/CurrencyContext";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Filter{
  status?: string;
  payment?: string;
  dateFrom?: string;
  dateTo?: string;
}

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
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
      const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filter>({
    status: "all",
    payment: "all",
    dateFrom: "",
    dateTo: "",
  });
  const getAllOrdersAdmin = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders(
        currentPage, 20,
        filters.status,
        filters.payment,
        filters.dateFrom,
        filters.dateTo,
        searchQuery,
      );
      if (response.succes) {
        const allCleanOrders = JSON.parse(response.orders as string);
        setTotalOrders(response.totalOrders as number);
        setTotalPages(response.totalPages as number);
        setOrders(allCleanOrders as IOrder[]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllOrdersAdmin();
  }, [currentPage, filters, searchQuery]);


  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // show all if few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // always show first

      if (currentPage > 4) {
        pages.push("ellipsis-left");
      }

      // show current page ±2
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("ellipsis-right");
      }

      pages.push(totalPages); // always show last
    }

    return pages;
  };
  return (
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Orders Management
            </h1>

          </div>
        </div>


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
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search orders..."
                      className="pl-10 w-full sm:w-[280px]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onKeyDown={(e) => e.key === "Enter" && setSearchQuery(search)} onClick={() => setSearchQuery(search)} size="sm">
                      Search
                    </Button>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment</Label>
                      <Select
                        value={filters.payment}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, payment: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All payments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <div className="flex items-center gap-2 flex-col justify-left">
                        <Input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                          }
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setFilters({ status: "", payment: "", dateFrom: "", dateTo: "" });
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">


              <div className="mt-0">
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
                    {
                      loading && orders?.length === 0 ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">
                              Loading...
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : !loading && orders?.length === 0 ? (
                        <TableBody>
                          <TableRow className="ordernot-found">
                            <TableCell colSpan={7} className="text-center">
                              <span className="text-sm text-muted-foreground">
                                No orders found
                              </span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody >

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
                                {formatPrice(order.total)}
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
                      )
                    }
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
              </div>
              <div className="pagination p-4">
                <Pagination>
                  <PaginationContent>
                    {/* Previous button */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {/* Page numbers */}
                    {getPages().map((page, idx) => (
                      <PaginationItem key={idx} >
                        {typeof page === "number" ? (
                          <PaginationLink
                            className="rounded-full shadow-none"
                            onClick={() => setCurrentPage(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        ) : (
                          <PaginationEllipsis />
                        )}
                      </PaginationItem>
                    ))}

                    {/* Next button */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages && setCurrentPage(currentPage + 1)
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { formatNPR, formatPrice } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType?: string;
  provider?: string;
  emailVerified?: Date | null;
  addresses?: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface CustomerFilters {
  search?: string;
  role?: string;
  userType?: string;
  emailVerified?: boolean;
  hasOrders?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationInfo {
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface CustomersTableProps {
  customers: Customer[];
  pagination: PaginationInfo;
  filters: CustomerFilters;
  loading: boolean;
  onFiltersChange: (filters: CustomerFilters) => void;
  onPageChange: (page: number) => void;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerUpdate: (customerId: string, updates: any) => void;
  onCustomerDelete: (customerId: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export default function CustomersTable({
  customers,
  pagination,
  filters,
  loading,
  onFiltersChange,
  onPageChange,
  onCustomerSelect,
  onCustomerUpdate,
  onCustomerDelete,
  onRefresh,
  onExport,
}: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const { formatPrice } = useCurrency();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchTerm });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "superadmin":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusBadge = (customer: Customer) => {
    if (customer.emailVerified) {
      return <Badge variant="outline" className="text-green-600">Verified</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600">Unverified</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return formatPrice(amount);
  };

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card className="mb-4 lg:hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{customer.name}</h3>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
            {customer.phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" />
                {customer.phone}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getRoleBadgeVariant(customer.role)}>
              {customer.role}
            </Badge>
            {getStatusBadge(customer)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{customer.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Joined {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCustomerSelect(customer)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCustomerSelect(customer)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onCustomerUpdate(customer._id, {
                      emailVerified: !customer.emailVerified,
                    })
                  }
                >
                  {customer.emailVerified ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Mark Unverified
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Mark Verified
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onCustomerDelete(customer._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer base and view their activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select
                    value={filters.role || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("role", value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email Status</label>
                  <Select
                    value={
                      filters.emailVerified === true
                        ? "verified"
                        : filters.emailVerified === false
                        ? "unverified"
                        : "all"
                    }
                    onValueChange={(value) =>
                      handleFilterChange(
                        "emailVerified",
                        value === "all"
                          ? undefined
                          : value === "verified"
                          ? true
                          : false
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Order Status</label>
                  <Select
                    value={
                      filters.hasOrders === true
                        ? "has-orders"
                        : filters.hasOrders === false
                        ? "no-orders"
                        : "all"
                    }
                    onValueChange={(value) =>
                      handleFilterChange(
                        "hasOrders",
                        value === "all"
                          ? undefined
                          : value === "has-orders"
                          ? true
                          : false
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="has-orders">With Orders</SelectItem>
                      <SelectItem value="no-orders">No Orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Provider</label>
                  <Select
                    value={filters.userType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("userType", value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="credentials">Email/Password</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="lg:hidden">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {customers.map((customer) => (
              <CustomerCard key={customer._id} customer={customer} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(customer.role)}>
                      {customer.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      {customer.totalOrders}
                    </div>
                  </TableCell>
                  <TableCell>{formatNPR(customer.totalSpent)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(customer.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onCustomerSelect(customer)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onCustomerUpdate(customer._id, {
                              emailVerified: !customer.emailVerified,
                            })
                          }
                        >
                          {customer.emailVerified ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Mark Unverified
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Mark Verified
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onCustomerDelete(customer._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {!loading && customers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.totalCustomers
            )}{" "}
            of {pagination.totalCustomers} customers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = Math.max(
                  1,
                  Math.min(
                    pagination.currentPage - 2 + i,
                    pagination.totalPages - 4 + i
                  )
                );
                return (
                  <Button
                    key={pageNum}
                    variant={
                      pageNum === pagination.currentPage ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
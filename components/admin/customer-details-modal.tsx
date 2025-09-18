"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
// Use the correct Customer interface from the admin page
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType: string;
  provider?: string;
  emailVerified?: Date;
  addresses: Array<{
    _id: string;
    fullName: string;
    address: string;
    district: string;
    province: string;
    phone: string;
    addressType: string;
    isDefault: boolean;
  }>;
  notificationPreferences?: {
    email: boolean;
    marketing: boolean;
    orderUpdates: boolean;
  };
  createdAt: string;
  updatedAt: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}
import { formatNPR } from "@/lib/currency";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    productId: {
      _id: string;
      name: string;
      images?: string[];
    };
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CustomerDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
}: CustomerDetailsModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    if (customer && isOpen) {
      fetchCustomerOrders(1);
    }
  }, [customer, isOpen]);

  const fetchCustomerOrders = async (page: number) => {
    if (!customer) return;

    setOrdersLoading(true);
    try {
      const response = await fetch(
        `/api/admin/customers/${customer._id}?orders=true&page=${page}&limit=10`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setOrdersPagination(data.pagination);
      } else {
        toast.error("Failed to fetch customer orders");
      }
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      toast.error("Failed to fetch customer orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      processing: { variant: "default" as const, icon: Package },
      shipped: { variant: "outline" as const, icon: Truck },
      delivered: { variant: "outline" as const, icon: CheckCircle },
      cancelled: { variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      icon: Clock,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <Badge
                      variant={
                        customer.role === "admin"
                          ? "destructive"
                          : customer.role === "superadmin"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {customer.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                    {customer.emailVerified ? (
                      <Badge variant="outline" className="text-green-600">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        Unverified
                      </Badge>
                    )}
                  </div>

                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {customer.provider && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Provider:</span>
                      <Badge variant="outline">{customer.provider}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{customer.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{formatNPR(customer?.totalSpent as any)}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>

                {customer.lastOrderDate && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Order</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(customer.lastOrderDate), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs for detailed information */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                      <p className="text-muted-foreground">
                        This customer hasn't placed any orders yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Order Cards */}
                      <div className="space-y-4 md:hidden">
                        {orders.map((order) => (
                          <Card key={order._id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold">#{order.orderNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {getStatusBadge(order.status)}
                                  <p className="font-semibold mt-1">{formatCurrency(order.total)}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium">{order.items.length}</span> item(s)
                                </p>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Desktop Order Table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order) => (
                              <TableRow key={order._id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">#{order.orderNumber}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {order._id.slice(-8)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{order.items.length} items</p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.items[0]?.productId?.name}
                                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(order.total)}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Orders Pagination */}
                      {ordersPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            Page {ordersPagination.currentPage} of {ordersPagination.totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchCustomerOrders(ordersPagination.currentPage - 1)}
                              disabled={!ordersPagination.hasPrevPage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchCustomerOrders(ordersPagination.currentPage + 1)}
                              disabled={!ordersPagination.hasNextPage}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Saved Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!customer.addresses || customer.addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No addresses found</h3>
                      <p className="text-muted-foreground">
                        This customer hasn't saved any addresses yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.addresses.map((address, index) => (
                        <Card key={address._id || index} className={`relative ${address.isDefault ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                          <CardContent className="p-4">
                            {address.isDefault && (
                              <Badge variant="default" className="absolute top-2 right-2 bg-primary text-primary-foreground">
                                Default
                              </Badge>
                            )}
                            <div className="space-y-3">
                              {/* Full Name */}
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold text-base">{address.fullName}</p>
                              </div>
                              
                              {/* Address */}
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="space-y-1">
                                  <p className="font-medium">{address.address}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.district}, {address.province}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Phone */}
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm">{address.phone}</p>
                              </div>
                              
                              {/* Address Type */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  {address.addressType === 'home' && <User className="h-4 w-4 text-muted-foreground" />}
                                  {address.addressType === 'office' && <Package className="h-4 w-4 text-muted-foreground" />}
                                  {address.addressType === 'other' && <MapPin className="h-4 w-4 text-muted-foreground" />}
                                  <Badge variant="secondary" className="text-xs">
                                    {address.addressType?.charAt(0).toUpperCase() + address.addressType?.slice(1) || 'Home'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
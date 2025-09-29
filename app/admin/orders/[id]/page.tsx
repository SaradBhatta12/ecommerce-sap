"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { ChevronLeft, Package, Truck, CheckCircle, Printer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/store/api/orderApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const printRef = useRef<HTMLDivElement>(null);
  const orderId = params.id as string;
  
  // RTK Query hook to fetch order details
  const { data, error, isLoading, refetch } = useGetOrderByIdQuery(orderId);
  console.log(data)
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${data?.orderNumber || orderId}`,
    onAfterPrint: () => toast.success("Invoice printed successfully"),
  });

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateOrderStatus({
        id: orderId,
        status: newStatus,
      }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    }
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href="/admin/orders">Return to Orders</Link>
        </Button>
      </div>
    );
  }

  const order = data?.order;

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "shipped":
        return <Badge variant="primary">Shipped</Badge>;
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "handover_to_courier":
        return <Badge variant="warning">Handover to Courier</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Order Status Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order #{order.orderNumber}</CardTitle>
            {getStatusBadge(order.status)}
          </div>
          <CardDescription>
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Status</p>
              <p className="text-sm capitalize">{order.status}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Update Status:</p>
              <Select
                defaultValue={order.status}
                onValueChange={handleStatusUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="handover_to_courier">Handover to Courier</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Payment and shipping information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Payment Method</div>
                  <div className="text-sm">{order.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Payment Status</div>
                  <div className="text-sm capitalize">
                    <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {order.trackingNumber && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">Tracking Number</div>
                    <div className="text-sm font-mono">{order.trackingNumber}</div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <div className="text-sm font-medium">Customer Information</div>
                <div className="text-sm">
                  {order.user?.name}
                  <br />
                  {order.user?.email}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">Shipping Address</div>
                <div className="text-sm">
                  {order.address?.fullName}
                  <br />
                  {order.address?.address}
                  <br />
                  {order.address?.city}, {order.address?.province}{" "}
                  {order.address?.postalCode}
                  <br />
                  {order.address?.phone}
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">Order Notes</div>
                    <div className="text-sm">{order.notes}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              {order.items?.length}{" "}
              {order.items?.length === 1 ? "item" : "items"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.quantity} x {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping || 0)}</span>
                </div>
                {order.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount.amount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
            <CardDescription>Track order status changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4 border-l pl-6 pt-2">
              {order.timeline.map((event, index) => (
                <div key={index} className="relative pb-4">
                  <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {event.status === "Order Placed" && (
                      <Package className="h-3 w-3" />
                    )}
                    {event.status === "Processing" && (
                      <Package className="h-3 w-3" />
                    )}
                    {event.status === "Shipped" && (
                      <Truck className="h-3 w-3" />
                    )}
                    {event.status === "Delivered" && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {event.status === "Cancelled" && (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{event.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-sm">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Printable Invoice */}
      <div className="hidden">
        <div ref={printRef} className="p-8 max-w-4xl mx-auto bg-white">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
              <p className="text-gray-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">Your Store Name</h2>
              <p className="text-gray-600">123 Commerce Street</p>
              <p className="text-gray-600">Business City, 12345</p>
              <p className="text-gray-600">contact@yourstore.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p>{order.user?.name}</p>
              <p>{order.user?.email}</p>
              <p>{order.address?.address}</p>
              <p>
                {order.address?.city}, {order.address?.province}{" "}
                {order.address?.postalCode}
              </p>
              <p>{order.address?.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Information:</h3>
              <p>Method: {order.paymentMethod}</p>
              <p>Status: {order.paymentStatus}</p>
              {order.paymentDetails?.transactionId && (
                <p>Transaction ID: {order.paymentDetails.transactionId}</p>
              )}
              {order.trackingNumber && (
                <p>Tracking Number: {order.trackingNumber}</p>
              )}
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.product} className="border-b">
                  <td className="py-2">{item.name}</td>
                  <td className="text-right py-2">{formatPrice(item.price)}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>{formatPrice(order.shipping || 0)}</span>
              </div>
              {order.discount && (
                <div className="flex justify-between mb-2">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount.amount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm mt-16">
            <p>Thank you for your business!</p>
            <p>For any questions regarding this invoice, please contact customer support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

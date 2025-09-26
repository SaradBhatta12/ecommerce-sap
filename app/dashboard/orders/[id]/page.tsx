"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Package, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrDerById } from "@/_actions/_orders";
import { Order, OrderItem, OrderTimeline } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function OrderDetailPage() {
  const params = useParams();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrDerById(params.id as string);
        setOrder(response?.order || null);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <Badge variant="outline">Processing</Badge>;
      case "shipped":
        return <Badge variant="secondary">Shipped</Badge>;
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div>{getStatusBadge(order.status)}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Order #{order?.id} - Placed on{" "}
              {new Date(order?.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Payment Method</div>
                  <div className="text-sm">{order?.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Order Status</div>
                  <div className="text-sm capitalize">{order?.status}</div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">Shipping Address</div>
                <div className="text-sm">
                  {order?.address?.fullName}
                  <br />
                  {order?.address?.address}
                  <br />
                  {order?.address?.city}, {order?.address?.province}{" "}
                  {order?.address?.postalCode}
                  <br />
                  {order?.address?.phone}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              {order?.items?.length}{" "}
              {order?.items?.length === 1 ? "item" : "items"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {order?.items?.map((item: OrderItem) => (
                  <div
                    key={item.product._id || item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <Image
                          src={item.image}
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
                  <span>{formatPrice(order?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(order?.shipping || 0)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order?.total || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
          <CardDescription>Track your order status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4 border-l pl-6 pt-2">
            {order?.timeline?.map((event: OrderTimeline, index: number) => (
              <div key={index} className="relative pb-4">
                <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {event?.status === "Order Placed" && (
                    <Package className="h-3 w-3" />
                  )}
                  {event?.status === "Processing" && (
                    <Package className="h-3 w-3" />
                  )}
                  {event?.status === "Shipped" && (
                    <Truck className="h-3 w-3" />
                  )}
                  {event?.status === "Delivered" && (
                    <CheckCircle className="h-3 w-3" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{event?.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event?.date).toLocaleDateString()}
                    </p>
                  </div>
                  {event?.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Download,
  Edit,
  MapPin,
  Mail,
  Phone,
  Package,
  Truck,
  CreditCard,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock order data based on the provided schema
const orderData = {
  "ORD-6429": {
    id: "ORD-6429",
    user: {
      id: "user_123",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    items: [
      {
        product: "prod_123",
        name: "Premium Wireless Headphones",
        price: 129.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        product: "prod_456",
        name: "Smart Watch Series 5",
        price: 249.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    address: {
      fullName: "Sarah Johnson",
      address: "123 Main Street",
      city: "New York",
      province: "NY",
      postalCode: "10001",
      phone: "+1 (555) 123-4567",
    },
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    paymentDetails: {
      transactionId: "txn_12345",
      provider: "Stripe",
      amount: 399.98,
      currency: "USD",
      status: "succeeded",
    },
    status: "delivered",
    subtotal: 379.98,
    shipping: 20.0,
    discount: {
      id: "disc_123",
      code: "SUMMER10",
      amount: 38.0,
    },
    total: 361.98,
    trackingNumber: "TRK123456789",
    notes: "Please leave at the front door",
    createdAt: new Date("2024-05-15T10:30:00"),
    updatedAt: new Date("2024-05-18T15:45:00"),
    timeline: [
      {
        status: "Order Placed",
        date: "2024-05-15 10:30 AM",
        completed: true,
      },
      {
        status: "Payment Confirmed",
        date: "2024-05-15 10:32 AM",
        completed: true,
      },
      {
        status: "Processing",
        date: "2024-05-15 2:15 PM",
        completed: true,
      },
      {
        status: "Shipped",
        date: "2024-05-16 9:00 AM",
        completed: true,
      },
      {
        status: "Delivered",
        date: "2024-05-18 3:45 PM",
        completed: true,
      },
    ],
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const order = orderData[orderId as keyof typeof orderData];

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-700 h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className=" p-4 sm:p-6 lg:p-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
            >
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Order {order.id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Package className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />

                  <div className="space-y-6">
                    {order.timeline.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 relative"
                      >
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 z-10 ${
                            item.completed
                              ? "bg-green-500 ring-4 ring-green-100 dark:ring-green-900"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              item.completed
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {item.status}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Tracking Number
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {order.trackingNumber}
                        </p>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-sm mt-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Track Package
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                          Product
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
                          Quantity
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow
                          key={index}
                          className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            ${item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mt-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Shipping</span>
                      <span>${order.shipping.toFixed(2)}</span>
                    </div>

                    {order.discount && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          Discount ({order.discount.code})
                        </span>
                        <span>-${order.discount.amount.toFixed(2)}</span>
                      </div>
                    )}

                    <Separator className="my-2 bg-gray-200 dark:bg-gray-600" />
                    <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-gray-100">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          Order Notes
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          {order.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {order.user.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Mail className="h-4 w-4" />
                    {order.user.email}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500 dark:text-gray-400" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {order.address.fullName}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {order.address.address}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {order.address.city}, {order.address.province}{" "}
                      {order.address.postalCode}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      {order.address.phone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <CreditCard className="h-5 w-5" />
                    Payment
                  </CardTitle>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Payment Method
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.paymentMethod}
                    </p>
                  </div>

                  {order.paymentDetails && (
                    <>
                      <Separator className="bg-gray-200 dark:bg-gray-600" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Transaction Details
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Transaction ID:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {order.paymentDetails.transactionId}
                          </span>

                          <span className="text-gray-600 dark:text-gray-400">
                            Provider:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {order.paymentDetails.provider}
                          </span>

                          <span className="text-gray-600 dark:text-gray-400">
                            Amount:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            ${order.paymentDetails.amount?.toFixed(2)}
                          </span>

                          <span className="text-gray-600 dark:text-gray-400">
                            Currency:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {order.paymentDetails.currency}
                          </span>

                          <span className="text-gray-600 dark:text-gray-400">
                            Status:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {order.paymentDetails.status}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Dates */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Calendar className="h-5 w-5" />
                  Order Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Created:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {order.createdAt.toLocaleDateString()}{" "}
                      {order.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <span className="text-gray-600 dark:text-gray-400">
                      Updated:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {order.updatedAt.toLocaleDateString()}{" "}
                      {order.updatedAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

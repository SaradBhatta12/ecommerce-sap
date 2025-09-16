"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const { domain } = useParams();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    paymentMethod: '',
    transactionId: '',
    refId: '',
    amount: '',
  });

  useEffect(() => {
    // Get order details from URL parameters
    const orderId = searchParams.get('orderId') || '';
    const paymentMethod = searchParams.get('payment_method') || '';
    const transactionId = searchParams.get('transaction_id') || '';
    const refId = searchParams.get('ref_id') || '';
    const amount = searchParams.get('amount') || '';

    setOrderDetails({
      orderId,
      paymentMethod,
      transactionId,
      refId,
      amount,
    });
  }, [searchParams]);

  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'esewa':
        return 'eSewa';
      case 'khalti':
        return 'Khalti';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center px-4 py-16 md:px-6 md:py-24">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <Check className="h-8 w-8 text-green-600" />
      </div>

      <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
      <p className="mb-8 text-center text-muted-foreground">
        Thank you for your purchase. Your order has been confirmed and will be
        shipped soon.
      </p>

      <div className="mb-8 w-full max-w-md rounded-lg border p-6">
        {orderDetails.orderId && (
          <div className="mb-4 flex justify-between">
            <span className="font-medium">Order Number:</span>
            <span>#{orderDetails.orderId}</span>
          </div>
        )}
        <div className="mb-4 flex justify-between">
          <span className="font-medium">Date:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        {orderDetails.paymentMethod && (
          <div className="mb-4 flex justify-between">
            <span className="font-medium">Payment Method:</span>
            <span>{formatPaymentMethod(orderDetails.paymentMethod)}</span>
          </div>
        )}
        {orderDetails.transactionId && (
          <div className="mb-4 flex justify-between">
            <span className="font-medium">Transaction ID:</span>
            <span className="text-sm">{orderDetails.transactionId}</span>
          </div>
        )}
        {orderDetails.refId && (
          <div className="mb-4 flex justify-between">
            <span className="font-medium">Reference ID:</span>
            <span className="text-sm">{orderDetails.refId}</span>
          </div>
        )}
        {orderDetails.amount && (
          <div className="flex justify-between">
            <span className="font-medium">Total:</span>
            <span className="nepali-price">Rs. {parseFloat(orderDetails.amount).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Button asChild>
          <Link href={`/dashboard/orders`}>View Order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/`}>Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

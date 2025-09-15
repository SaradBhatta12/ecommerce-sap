"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const { domain } = useParams();
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
        <div className="mb-4 flex justify-between">
          <span className="font-medium">Order Number:</span>
          <span>#NM12345</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-medium">Date:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-medium">Payment Method:</span>
          <span>Esewa</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Total:</span>
          <span className="nepali-price">4,850</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <Button asChild>
          <Link href={`/${domain}/dashboard/orders`}>View Order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${domain}/`}>Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

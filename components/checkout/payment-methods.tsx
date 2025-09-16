"use client";

import { useState } from "react";
import Image from "next/image";
import { CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { initiateEsewaPayment } from "@/lib/payment/esewa";
import { initiateKhaltiPayment } from "@/lib/payment/khalti";
import { toast } from "sonner";

interface PaymentMethodsProps {
  selectedMethod: string;
  amount: number;
  onPaymentMethodChange: (method: string) => void;
  onPaymentComplete: (transactionId: string) => void;
  onOrderDataReady?: () => void;
}

export default function PaymentMethods({
  selectedMethod,
  amount,
  onPaymentMethodChange,
  onPaymentComplete,
  onOrderDataReady,
}: PaymentMethodsProps) {
  const handlePaymentMethodChange = (value: string) => {
    onPaymentMethodChange(value);
  };

  const handleEsewaPayment = () => {
    const baseUrl = window.location.origin;
    const orderId = `ORDER_${Date.now()}`;

    initiateEsewaPayment({
      amount,
      productId: orderId,
      productName: `Order Payment`,
      successUrl: `${baseUrl}/api/payment/esewa/success`,
      failureUrl: `${baseUrl}/api/payment/esewa/failure`,
    });
  };

  const handleKhaltiPayment = () => {
    const baseUrl = window.location.origin;
    const orderId = `ORDER_${Date.now()}`;

    initiateKhaltiPayment({
      amount,
      productId: orderId,
      productName: `Order Payment`,
      successUrl: `${baseUrl}/api/payment/khalti/success`,
      failureUrl: `${baseUrl}/api/payment/khalti/failure`,
    });
  };

  const handlePayNow = () => {
    // First trigger the order data preparation
    if (onOrderDataReady) {
      onOrderDataReady();
    }

    // Then initiate the payment
    if (selectedMethod === "esewa") {
      handleEsewaPayment();
    } else if (selectedMethod === "khalti") {
      handleKhaltiPayment();
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedMethod}
        onValueChange={handlePaymentMethodChange}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted">
          <RadioGroupItem value="esewa" id="esewa" />
          <Label htmlFor="esewa" className="flex flex-1 items-center gap-2">
            <Image
              src="/placeholder.svg?height=30&width=50"
              alt="Esewa"
              width={50}
              height={30}
              className="h-8 w-auto"
            />
            <span>Esewa</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted">
          <RadioGroupItem value="khalti" id="khalti" />
          <Label htmlFor="khalti" className="flex flex-1 items-center gap-2">
            <Image
              src="/placeholder.svg?height=30&width=50"
              alt="Khalti"
              width={50}
              height={30}
              className="h-8 w-auto"
            />
            <span>Khalti</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted">
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod" className="flex flex-1 items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <span>Cash on Delivery</span>
          </Label>
        </div>
      </RadioGroup>

      <div className="mt-4 text-sm text-muted-foreground">
        {selectedMethod === "esewa" && (
          <p>
            Pay securely using your Esewa account. You will be redirected to
            Esewa to complete the payment.
          </p>
        )}
        {selectedMethod === "khalti" && (
          <p>
            Pay securely using your Khalti account. You will be redirected to
            Khalti to complete the payment.
          </p>
        )}
        {selectedMethod === "cod" && (
          <p>
            Pay with cash upon delivery. Please have the exact amount ready for
            our delivery person.
          </p>
        )}
      </div>

      {(selectedMethod === "esewa" || selectedMethod === "khalti") && (
        <Button 
          onClick={handlePayNow} 
          className="w-full mt-4"
          size="lg"
        >
          Pay Now - Rs. {amount.toLocaleString()}
        </Button>
      )}
    </div>
  );
}

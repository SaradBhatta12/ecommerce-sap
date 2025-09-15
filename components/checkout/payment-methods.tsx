"use client";

import { useState } from "react";
import Image from "next/image";
import { CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { initiateEsewaPayment } from "@/lib/payment/esewa";
import { initiateKhaltiPayment } from "@/lib/payment/khalti";
import { useToast } from "@/components/ui/use-toast";

interface PaymentMethodsProps {
  orderId: string;
  amount: number;
  onPaymentMethodChange: (method: string) => void;
  onPaymentComplete: (transactionId: string) => void;
}

export default function PaymentMethods({
  orderId,
  amount,
  onPaymentMethodChange,
  onPaymentComplete,
}: PaymentMethodsProps) {
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const { toast } = useToast();

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    onPaymentMethodChange(value);
  };

  const handleEsewaPayment = () => {
    const baseUrl = window.location.origin;

    initiateEsewaPayment({
      amount,
      productId: orderId,
      productName: `Order #${orderId}`,
      successUrl: `${baseUrl}/api/payment/esewa/success?order_id=${orderId}`,
      failureUrl: `${baseUrl}/api/payment/esewa/failure?order_id=${orderId}`,
    });
  };

  const handleKhaltiPayment = () => {
    const baseUrl = window.location.origin;

    initiateKhaltiPayment({
      amount,
      productId: orderId,
      productName: `Order #${orderId}`,
      successUrl: `${baseUrl}/api/payment/khalti/success?order_id=${orderId}`,
      failureUrl: `${baseUrl}/api/payment/khalti/failure?order_id=${orderId}`,
    });
  };

  const handlePayNow = () => {
    if (paymentMethod === "esewa") {
      handleEsewaPayment();
    } else if (paymentMethod === "khalti") {
      handleKhaltiPayment();
    } else {
      // For COD, just complete the order
      onPaymentComplete("cod_payment");
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={paymentMethod}
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
        {paymentMethod === "esewa" && (
          <p>
            Pay securely using your Esewa account. You will be redirected to
            Esewa to complete the payment.
          </p>
        )}
        {paymentMethod === "khalti" && (
          <p>
            Pay securely using your Khalti account. You will be redirected to
            Khalti to complete the payment.
          </p>
        )}
        {paymentMethod === "cod" && (
          <p>
            Pay with cash upon delivery. Please have the exact amount ready for
            our delivery person.
          </p>
        )}
      </div>
    </div>
  );
}

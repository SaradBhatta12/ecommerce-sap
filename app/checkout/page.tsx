"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { clearCart } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { Loader2, CheckCircle, XCircle } from "lucide-react";
import PaymentMethods from "@/components/checkout/payment-methods";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { 
  useGetUserAddressesQuery,
  useCreateOrderMutation,
  useValidateDiscountMutation,
  useApplyDiscountMutation
} from "@/store";
import type { RootState } from "@/store";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Address {
  _id: string;
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface Discount {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
}

export default function CheckoutPage() {
  const { domain } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state?.cart?.items) as CartItem[];
  
  // RTK Query hooks
  const { data: addressesData, isLoading: addressesLoading, refetch: refetchAddresses } = useGetUserAddressesQuery(undefined, {
    skip: status !== "authenticated"
  });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [validateDiscount, { isLoading: isValidatingDiscount }] = useValidateDiscountMutation();
  const [applyDiscount] = useApplyDiscountMutation();
  
  // Local state
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  
  const addresses = addressesData?.addresses as Address[] || [];
  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 100; // Fixed shipping cost
  const discountAmount = discount ? discount.discountAmount : 0;
  const total = subtotal + shipping - discountAmount;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?callbackUrl=/checkout");
    } else if (status === "authenticated" && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [status, cartItems.length, router]);

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      } else {
        setSelectedAddress(addresses[0]._id);
      }
    }
  }, [addresses, selectedAddress]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      setDiscountError("");
      
      const result = await validateDiscount({
        code: discountCode,
        cartTotal: subtotal,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
      }).unwrap();

      if (result.valid && result.discount) {
        setDiscount(result.discount as Discount);
        toast.success("Discount applied successfully!");
        setDiscountCode("");
        setDiscountError("");
      } else {
        setDiscountError(result.message || "Invalid discount code");
        setDiscount(null);
      }
    } catch (error: any) {
      console.error("Error applying discount:", error);
      setDiscountError(error?.data?.error || "Failed to apply discount. Please try again.");
      setDiscount(null);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Address Required", {
        description: "Please select a delivery address",
      });
      return;
    }

    if (!paymentMethod) {
      toast.error("Payment method Required");
      return;
    }

    try {
      // Create order
      const orderResult = await createOrder({
        addressId: selectedAddress,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        shipping,
        discount: discount
          ? {
            id: discount._id,
            code: discount.code,
            amount: discount.discountAmount,
          }
          : null,
        total,
      }).unwrap();

      // Apply discount if used
      if (discount) {
        try {
          await applyDiscount({
            discountId: discount._id,
          }).unwrap();
        } catch (discountError) {
          console.warn("Failed to apply discount usage:", discountError);
          // Don't fail the entire checkout for discount application issues
        }
      }

      // Clear cart
      dispatch(clearCart());

      // Redirect to success page
      router.push(`/${domain}/checkout/success?orderId=${orderResult.orderId}`);
      
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Error processing checkout:", error);
      toast.error(error?.data?.message || "Failed to process checkout. Please try again.");
    }
  };

  if (status === "loading" || addressesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className=" mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
              <CardDescription>
                Select where you want your order delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addresses?.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-4">You don't have any saved addresses.</p>
                  <Link
                    href={`/dashboard/addresses/new`}
                  >
                    <Button>Add New Address</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses?.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 border rounded-lg cursor-pointer ${selectedAddress === address._id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                        }`}
                      onClick={() => setSelectedAddress(address._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.province}{" "}
                            {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.phone}
                          </p>
                        </div>
                        {selectedAddress === address._id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                  <Link
                    href={`/${domain}/dashboard/addresses/new?redirect=/checkout`}
                  >
                    <Button variant="outline" className="w-full">
                      Add New Address
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethods
                selectedMethod={paymentMethod}
                onPaymentMethodChange={(method) => setPaymentMethod(method)}
                onPaymentComplete={(transactionId) => {
                  // Handle payment completion
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">
                  Items ({cartItems?.length})
                </h3>
                <div className="space-y-2">
                  {cartItems?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Label htmlFor="discount">Discount Code</Label>
                <div className="flex mt-1 space-x-2">
                  <Input
                    id="discount"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={!!discount || isValidatingDiscount}
                  />
                  {discount ? (
                    <Button variant="outline" onClick={handleRemoveDiscount}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApplyDiscount}
                      disabled={isValidatingDiscount}
                    >
                      {isValidatingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Apply
                    </Button>
                  )}
                </div>
                {discountError && (
                  <p className="text-sm text-destructive mt-1">
                    {discountError}
                  </p>
                )}
                {discount && (
                  <p className="text-sm text-green-600 mt-1">
                    {discount.code} applied:{" "}
                    {discount.type === "percentage"
                      ? `${discount.value}% off`
                      : `Rs. ${discount.value} off`}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Rs. {shipping.toLocaleString()}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>
                      - Rs. {discount?.discountAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={
                  isCreatingOrder || addresses.length === 0 || !paymentMethod
                }
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Order"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Loader2, CheckCircle, XCircle, Package, CreditCard, Calendar } from "lucide-react";
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

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
}

export default function CheckoutPage() {
  const { domain } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const addresses = (addressesData as any)?.addresses || [];
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
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      } else {
        setSelectedAddress(addresses[0]._id);
      }
    }
  }, [addresses, selectedAddress]);

  // Handle payment response from URL parameters
  useEffect(() => {
    const handlePaymentResponse = async () => {
      const paymentMethodParam = searchParams.get('payment_method');
      const transactionId = searchParams.get('transaction_id');
      const refId = searchParams.get('ref_id');
      const amount = searchParams.get('amount');
      const oid = searchParams.get('oid');
      const pidx = searchParams.get('pidx');
      const error = searchParams.get('error');

      // Handle payment errors first
      if (error) {
        let errorMessage = 'Payment failed. Please try again.';
        
        switch (error) {
          case 'payment_cancelled':
            errorMessage = 'Payment was cancelled. You can try again when ready.';
            break;
          case 'payment_failed':
            errorMessage = 'Payment failed. Please check your payment details and try again.';
            break;
          case 'verification_failed':
            errorMessage = 'Payment verification failed. Please contact support if amount was deducted.';
            break;
          case 'system_error':
            errorMessage = 'System error occurred. Please try again or contact support.';
            break;
          default:
            errorMessage = searchParams.get('message') || errorMessage;
        }
        
        setPaymentError(errorMessage);
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Check if we have payment response parameters
      const hasPaymentDetails = transactionId || oid || pidx;
      
      if (!hasPaymentDetails) {
        return;
      }

      setIsProcessingPayment(true);
      setPaymentError(null);

      try {
        // Get order data from session storage
        const orderDataStr = sessionStorage.getItem('orderData');
        if (!orderDataStr) {
          throw new Error('Order data not found in session storage');
        }

        const orderData = JSON.parse(orderDataStr);

        // Validate order data
        if (!orderData.items || orderData.items.length === 0) {
          throw new Error('Invalid order data: no items found');
        }

        if (!orderData.total || orderData.total <= 0) {
          throw new Error('Invalid order data: invalid total amount');
        }

        // Prepare payment details based on the payment method
        let paymentDetails;
        if (oid) {
          // eSewa payment
          paymentDetails = {
            transactionId: oid,
            provider: 'esewa',
            amount: searchParams.get('amt'),
            refId: searchParams.get('refId'),
          };
        } else if (pidx) {
          // Khalti payment
          paymentDetails = {
            transactionId: pidx,
            provider: 'khalti',
            amount: searchParams.get('amount'),
            refId: searchParams.get('ref_id'),
          };
        } else {
          // Fallback to existing method
          paymentDetails = {
            transactionId: transactionId || '',
            provider: paymentMethodParam || '',
            amount: parseFloat(amount || '0'),
            refId: refId || '',
          };
        }

        // Validate payment details
        if (!paymentDetails.transactionId) {
          throw new Error('Invalid payment response: missing transaction ID');
        }

        if (!paymentDetails.provider) {
          throw new Error('Invalid payment response: missing payment provider');
        }

        // Create order via API
        const response = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData,
            paymentDetails,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
          setOrderDetails(result.order);
          setShowSuccessModal(true);
          // Clear cart only after successful order creation
          dispatch(clearCart());
          // Clear session storage after successful order creation
          sessionStorage.removeItem('orderData');
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error(result.message || 'Failed to create order');
        }
      } catch (err) {
        console.error('Error creating order:', err);
        
        // Provide specific error messages
        let errorMessage = 'Failed to create order';
        
        if (err instanceof Error) {
          if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (err.message.includes('session') || err.message.includes('auth')) {
            errorMessage = 'Session expired. Please refresh the page and try again.';
          } else if (err.message.includes('Order data not found')) {
            errorMessage = 'Order data expired. Please try placing your order again.';
          } else if (err.message.includes('Server error: 5')) {
            errorMessage = 'Server error occurred. Please try again in a few minutes.';
          } else if (err.message.includes('Server error: 4')) {
            errorMessage = 'Invalid request. Please try placing your order again.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setPaymentError(errorMessage);
      } finally {
        setIsProcessingPayment(false);
      }
    };

    handlePaymentResponse();
  }, [searchParams, dispatch]);

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
        setDiscount({
          _id: result.discount.id,
          code: result.discount.code,
          type: result.discount.type,
          value: result.discount.value,
          discountAmount: result.discount.discountAmount
        });
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
      toast.error("Please select a delivery address");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate cart items have required fields
    const invalidItems = cartItems.filter(item => !item.id || !item.name || !item.price || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast.error("Some items in your cart are invalid. Please refresh and try again.");
      return;
    }

    // Validate total amount
    if (total <= 0) {
      toast.error("Invalid order total. Please refresh and try again.");
      return;
    }

    try {
      // Prepare order data for all payment methods
      const orderData = {
        addressId: selectedAddress,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        subtotal,
        shipping,
        discount: discount
          ? {
            id: discount._id,
            code: discount.code,
            amount: discount.discountAmount,
          }
          : undefined,
        total,
      };

      // For COD, create order directly since no payment verification is needed
      if (paymentMethod === "cod") {
        const orderResult = await createOrder(orderData).unwrap();

        // Apply discount if used
        if (discount) {
          try {
            await applyDiscount({
              discountId: discount._id,
            }).unwrap();
          } catch (discountError) {
            console.warn("Failed to apply discount usage:", discountError);
          }
        }

        // Show success modal
        setOrderDetails({
          id: orderResult.orderId,
          orderNumber: orderResult.orderNumber || `ORD-${orderResult.orderId}`,
          status: 'confirmed',
          paymentStatus: 'paid',
          total: total
        });
        setShowSuccessModal(true);
        
        // Clear cart only after successful order creation
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        return;
      }

      // For online payments (eSewa, Khalti), store order data and initiate payment
      // Order will be created only after successful payment verification
      sessionStorage.setItem('orderData', JSON.stringify(orderData));
      
      // Initiate payment through PaymentMethods component
      try {
        // Check if payment initiation function is available
        if (typeof (window as any).initiatePayment === 'function') {
          // Call the payment initiation function
          (window as any).initiatePayment(paymentMethod);
          toast.success("Redirecting to payment gateway...");
        } else {
          throw new Error("Payment system not ready");
        }
      } catch (error) {
        console.error("Payment initiation error:", error);
        toast.error("Payment system not ready. Please try again.");
        // Remove order data if payment initiation fails
        sessionStorage.removeItem('orderData');
      }
      
    } catch (error: any) {
      console.error("Error processing checkout:", error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Failed to process checkout. Please try again.";
      
      if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes("session") || error?.message?.includes("auth")) {
        errorMessage = "Session expired. Please refresh the page and try again.";
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Clean up session storage if there was an error
      if (paymentMethod !== "cod") {
        sessionStorage.removeItem('orderData');
      }
    }
  };

  const handlePaymentInitiation = () => {
    if (paymentMethod === "esewa" || paymentMethod === "khalti") {
      handleCheckout();
    }
  };

  if (status === "loading" || addressesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show processing modal when handling payment response
  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Order</h2>
          <p className="text-gray-600 mb-4">Please wait while we confirm your payment and create your order...</p>
          <div className="text-sm text-gray-500">
            <p>• Verifying payment details</p>
            <p>• Creating your order</p>
            <p>• Updating inventory</p>
          </div>
          <div className="mt-6 text-xs text-gray-400">
            Please do not close this window or navigate away.
          </div>
        </div>
      </div>
    );
  }

  // Show error if payment processing failed
  if (paymentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Order Creation Failed</p>
            <p className="text-sm">{paymentError}</p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => {
                setPaymentError(null);
                // Clear any stale session data
                sessionStorage.removeItem('orderData');
                window.location.reload();
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 w-full"
            >
              Try Again
            </Button>
            <Button
              onClick={() => {
                setPaymentError(null);
                // Clear any stale session data
                sessionStorage.removeItem('orderData');
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
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
                  {addresses?.map((address: Address) => (
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
                    href={`/dashboard/addresses/new`}
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
                amount={total}
                onPaymentInitiation={handlePaymentInitiation}
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
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={
                  isCreatingOrder || addresses.length === 0 || !paymentMethod
                }
              >
                {isCreatingOrder ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>
                      {paymentMethod === "cod" ? "Creating Order..." : "Preparing Payment..."}
                    </span>
                  </div>
                ) : (
                  <span>
                    {paymentMethod === "cod" ? "Place Order" : "Proceed to Payment"}
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-center">
              Thank you for your purchase. Your order has been confirmed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {orderDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-semibold">{orderDetails.orderNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold capitalize">{paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold capitalize">{orderDetails.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-semibold">Rs. {orderDetails.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {searchParams.get('ref_id') && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Reference ID</p>
                    <p className="font-mono text-sm">{searchParams.get('ref_id')}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">Order details will be available shortly.</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/orders">
              <Button className="w-full sm:w-auto">
                View Orders
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

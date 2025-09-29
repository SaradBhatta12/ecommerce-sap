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
import { useCurrency } from "@/contexts/CurrencyContext";

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
  referenceId?: string;
}

export default function CheckoutPage() {
  const { domain } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state?.cart?.items) as CartItem[];
  const { formatPrice } = useCurrency();
  
  // API hooks
  const { data: addressesData, isLoading: addressesLoading, refetch: refetchAddresses } = useGetUserAddressesQuery(undefined, {
    skip: status !== "authenticated"
  });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [validateDiscount, { isLoading: isValidatingDiscount }] = useValidateDiscountMutation();
  const [applyDiscount] = useApplyDiscountMutation();
  
  // State
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
  
  // Calculate subtotal with proper validation
  const subtotal = cartItems.reduce(
    (total, item) => {
      // Validate item properties
      const itemPrice = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
      const itemQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 0;
      return total + (itemPrice * itemQuantity);
    },
    0
  );
  
  // Fixed shipping cost with validation
  const shipping = 100;
  
  // Calculate discount amount with validation
  const discountAmount = discount && typeof discount.discountAmount === 'number' && !isNaN(discount.discountAmount) 
    ? Math.max(0, discount.discountAmount) 
    : 0;
  
  // Calculate total with proper rounding
  const total = Math.round((subtotal + shipping - discountAmount) * 100) / 100;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && cartItems.length === 0) {
      router.push("/");
    }
  }, [status, cartItems.length, router]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      // First try to restore from localStorage
      const storedAddress = localStorage.getItem('selectedAddress');
      if (storedAddress && addresses.find((addr: Address) => addr._id === storedAddress)) {
        setSelectedAddress(storedAddress);
        return;
      }
      
      // Otherwise, select default or first address
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
        localStorage.setItem('selectedAddress', defaultAddress._id);
      } else {
        setSelectedAddress(addresses[0]._id);
        localStorage.setItem('selectedAddress', addresses[0]._id);
      }
    }
  }, [addresses, selectedAddress]);

  // Handle payment response from URL parameters
  useEffect(() => {
    const handlePaymentResponse = async () => {
      // Check for eSewa data parameter (base64 encoded)
      const esewaData = searchParams.get('data');
      const transactionUuid = searchParams.get('transaction_uuid');
      const oid = searchParams.get('oid');
      const pidx = searchParams.get('pidx');
      const refId = searchParams.get('refId');
      const amt = searchParams.get('amt');
      const error = searchParams.get('error');
      
     
      
      // Check if there are payment-related parameters
      const hasPaymentDetails = esewaData || transactionUuid || oid || pidx || refId || amt || error;
      
      if (error) {
        let errorMessage = "Payment was canceled or failed. Please try again.";
        switch (error) {
          case 'user_canceled':
            errorMessage = "Payment was canceled by user. Please try again.";
            break;
          case 'timeout':
            errorMessage = "Payment timed out. Please try again.";
            break;
          case 'invalid_amount':
            errorMessage = "Invalid payment amount. Please refresh and try again.";
            break;
          case 'payment_failed':
            errorMessage = "Payment processing failed. Please try again.";
            break;
          default:
            errorMessage = `Payment failed: ${error}`;
        }
        
        setPaymentError(errorMessage);
        // Clear URL parameters without redirecting
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // If no payment details, don't process
      if (!hasPaymentDetails) {
        console.log('No payment details found, skipping processing');
        return;
      }
      
      
      // Set processing state
      setIsProcessingPayment(true);
      
      try {
        // Get order data from session storage
        const orderDataStr = sessionStorage.getItem('orderData');
        console.log('Order data from session storage:', orderDataStr);
        
        let orderData;
        
        if (!orderDataStr) {
          // Try to reconstruct order data from cart if available
          const cartDataStr = localStorage.getItem('cart');
          if (cartDataStr) {
            try {
              const cartItems = JSON.parse(cartDataStr);
              if (cartItems && cartItems.length > 0) {
                // Calculate total from cart items
                const cartTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                
                // Create minimal order data from cart
                orderData = {
                  items: cartItems.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || ''
                  })),
                  total: cartTotal,
                  subtotal: cartTotal,
                  shipping: 0,
                  tax: 0,
                  discount: 0,
                  paymentMethod: 'esewa', // Default to esewa since we're processing payment
                  addressId: localStorage.getItem('selectedAddress') || '', // Retrieve stored address
                  timestamp: new Date().toISOString()
                };
                
                // Store the reconstructed data for future use
                sessionStorage.setItem('orderData', JSON.stringify(orderData));
              } else {
                throw new Error('Order data not found. Please try placing the order again.');
              }
            } catch (cartError) {
              console.error('Failed to reconstruct order from cart:', cartError);
              throw new Error('Order data not found. Please try placing the order again.');
            }
          } else {
            throw new Error('Order data not found. Please try placing the order again.');
          }
        } else {
          orderData = JSON.parse(orderDataStr);
        }
        console.log('Parsed order data:', orderData.items);
        
        // Validate order data
        if (!orderData.items || orderData.items.length === 0) {
          throw new Error('Invalid order data. Please try again.');
        }
        
        if (!orderData.total || orderData.total <= 0) {
          throw new Error('Invalid order total. Please try again.');
        }
        
        // Prepare payment details based on payment method
        let paymentDetails;
        
        if (esewaData) {
          // eSewa payment with base64 encoded data
          try {
            const decodedData = JSON.parse(atob(esewaData));
            paymentDetails = {
              transactionId: decodedData.transaction_uuid || transactionUuid,
              provider: 'esewa',
              amount: parseFloat(decodedData.total_amount || amt || '0'),
              refId: decodedData.transaction_code || decodedData.transaction_uuid,
              status: 'completed'
            };
          } catch (decodeError) {
            console.error('Failed to decode eSewa data:', decodeError);
            throw new Error('Invalid eSewa payment data');
          }
        } else if (oid) {
          // eSewa payment (legacy format)
          paymentDetails = {
            transactionId: oid,
            provider: 'esewa',
            amount: parseFloat(amt || '0'),
            refId: refId,
            status: 'completed'
          };
        } else if (pidx) {
          // Khalti payment
          paymentDetails = {
            transactionId: pidx,
            provider: 'khalti',
            amount: parseFloat(amt || '0'),
            refId: refId,
            status: 'completed'
          };
        } else {
          // Fallback
          paymentDetails = {
            transactionId: transactionUuid || refId || 'unknown',
            provider: 'unknown',
            amount: parseFloat(amt || '0'),
            refId: refId || transactionUuid,
            status: 'completed'
          };
        }
        
        
        // Validate payment details
        if (!paymentDetails.transactionId) {
          throw new Error('Missing transaction ID. Payment verification failed.');
        }
        
        if (!paymentDetails.provider || paymentDetails.provider === 'unknown') {
          throw new Error('Unknown payment provider. Payment verification failed.');
        }
        
        
        // Complete the order
        const response = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData,
            paymentDetails
          }),
        });

       

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Server error' }));
          console.error('API error response:', errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // Set order details for success modal - don't redirect, show modal
          setOrderDetails({
            id: result.orderId || result.order?.id,
            orderNumber: result.orderNumber || result.order?.orderNumber,
            status: result.status || result.order?.status || 'confirmed',
            paymentStatus: result.paymentStatus || result.order?.paymentStatus || 'completed',
            total: result.total || result.order?.total,
            referenceId: paymentDetails.refId
          });
          setShowSuccessModal(true);
          dispatch(clearCart());
          sessionStorage.removeItem('orderData');
          // Clear URL parameters without redirecting
          window.history.replaceState({}, document.title, window.location.pathname);
          toast.success("Order created successfully!");
         
        } else {
          throw new Error(result.message || 'Order creation failed');
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        
        // Set appropriate error message
        let errorMessage = "Failed to process payment. Please contact support.";
        
        if (err instanceof Error) {
          if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else if (err.message.includes('session') || err.message.includes('auth')) {
            errorMessage = "Session expired. Please refresh the page and try again.";
          } else if (err.message.includes('Order data not found')) {
            errorMessage = "Order session expired. Please try placing the order again.";
          } else if (err.message.includes('Server error: 5')) {
            errorMessage = "Server error. Please try again or contact support.";
          } else if (err.message.includes('Server error: 4')) {
            errorMessage = "Invalid request. Please refresh the page and try again.";
          } else {
            errorMessage = err.message;
          }
        }
        
        setPaymentError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsProcessingPayment(false);
      }
    };

    handlePaymentResponse();
  }, [searchParams, dispatch]);

  const handleApplyDiscount = async () => {
    setDiscountError("");
    
    try {
      // Validate discount code
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
        
        toast.success(`Discount applied: ${result.discount.code}`);
        setDiscountCode("");
      } else {
        setDiscountError("Invalid or expired discount code");
        toast.error("Invalid or expired discount code");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to apply discount";
      setDiscountError(errorMessage);
      toast.error(errorMessage);
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

    // Validate cart items
    const invalidItems = cartItems.filter(item => !item.id || !item.name || item.price <= 0 || item.quantity <= 0);
    if (invalidItems.length > 0) {
      toast.error("Some items in your cart are invalid. Please refresh and try again.");
      return;
    }

    // Validate total
    if (total <= 0) {
      toast.error("Invalid order total. Please refresh and try again.");
      return;
    }

    try {
      // Prepare order data with better validation
      const orderData = {
        addressId: selectedAddress,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || ''
        })),
        subtotal,
        shipping,
        total,
        discount: discount
          ? {
              id: discount._id,
              code: discount.code,
              amount: discount.discountAmount
            }
          : undefined
      };

      // Validate order data before proceeding
      if (!orderData.addressId || !orderData.paymentMethod || !orderData.items || orderData.items.length === 0) {
        throw new Error("Invalid order data. Please refresh and try again.");
      }

      // For COD orders, create order immediately without redirecting
      if (paymentMethod === "cod") {
        // Get the selected address details
        const selectedAddressDetails = addresses.find((addr: Address) => addr._id === selectedAddress);
        if (!selectedAddressDetails) {
          toast.error("Selected address not found. Please select a valid address.");
          return;
        }
        
        // Ensure address has city field (required by the order model)
        const enhancedOrderData = {
          ...orderData,
          // Include the full address details to ensure city is present
          addressDetails: {
            fullName: selectedAddressDetails.fullName,
            address: selectedAddressDetails.address,
            city: selectedAddressDetails.city || selectedAddressDetails.district || "Unknown", // Fallback to district or default value
            province: selectedAddressDetails.province,
            postalCode: selectedAddressDetails.postalCode,
            phone: selectedAddressDetails.phone
          }
        };
        
        const orderResult = await createOrder(enhancedOrderData).unwrap();
        
        // Apply discount if present
        if (discount) {
          try {
            await applyDiscount({
              discountId: discount._id
            }).unwrap();
          } catch (discountError) {
            console.warn("Failed to apply discount:", discountError);
          }
        }
        
        // Show success modal instead of redirecting
        setOrderDetails({
          id: orderResult.orderId,
          orderNumber: orderResult.orderNumber || `ORD-${orderResult.orderId}`,
          status: 'confirmed',
          paymentStatus: 'pending',
          total: total
        });
        setShowSuccessModal(true);
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        return;
      }

      // For online payments, store order data and initiate payment
      sessionStorage.setItem('orderData', JSON.stringify(orderData));
      
      // Initiate payment with better error handling
      try {
        toast.success("Redirecting to payment gateway...");
        
        // Check if payment functions are available
        if (typeof (window as any).initiatePayment === 'function') {
          (window as any).initiatePayment(paymentMethod, total, orderData);
        } else {
          // Fallback to direct payment initiation
          if (paymentMethod === "esewa") {
            const { initiateEsewaPayment } = await import('@/lib/payment/esewa');
            initiateEsewaPayment({
              amount: total,
              orderData
            });
          } else if (paymentMethod === "khalti") {
            const { initiateKhaltiPayment } = await import('@/lib/payment/khalti');
            const orderId = `ORDER_${Date.now()}`;
            
            initiateKhaltiPayment({
              amount: total,
              productId: orderId,
              productName: `Order Payment`,
              successUrl: `${window.location.origin}/checkout?payment_success=true`,
              failureUrl: `${window.location.origin}/checkout?payment_failed=true`,
            });
          } else {
            throw new Error("Unsupported payment method");
          }
        }
      } catch (paymentError) {
        console.error("Payment initiation error:", paymentError);
        toast.error("Payment system not ready. Please try again.");
        // Remove order data if payment initiation fails
        sessionStorage.removeItem('orderData');
        throw paymentError;
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
    if (paymentMethod === "esewa") {
      // Import and call eSewa payment function directly
      import('@/lib/payment/esewa').then(({ initiateEsewaPayment }) => {
        const orderData = JSON.parse(sessionStorage.getItem('orderData') || '{}');
        initiateEsewaPayment({
          amount: total,
          orderData
        });
      });
    } else if (paymentMethod === "khalti") {
      // Import and call Khalti payment function directly
      import('@/lib/payment/khalti').then(({ initiateKhaltiPayment }) => {
        const orderData = JSON.parse(sessionStorage.getItem('orderData') || '{}');
        const orderId = `ORDER_${Date.now()}`;
        
        initiateKhaltiPayment({
          amount: total,
          productId: orderId,
          productName: `Order Payment`,
          successUrl: `${window.location.origin}/api/payment/khalti/success`,
          failureUrl: `${window.location.origin}/api/payment/khalti/failure`,
        });
      });
    } else {
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
    <div className="container mx-auto py-8">
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
                      onClick={() => {
                        setSelectedAddress(address._id);
                        // Store selected address in localStorage for payment redirect recovery
                        localStorage.setItem('selectedAddress', address._id);
                      }}
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
           
                }}
                amount={total}
                onPaymentInitiation={handlePaymentInitiation}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
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
                        {formatPrice(item.price * item.quantity)}
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
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>
                      - {formatPrice(discount?.discountAmount || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full"
                onClick={paymentMethod === "cod" ? handleCheckout : handlePaymentInitiation}
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
                      <p className="font-semibold">{formatPrice(orderDetails.total)}</p>
                    </div>
                  </div>

                  {orderDetails?.referenceId && (
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-500">Reference ID</p>
                        <p className="font-mono text-sm">{orderDetails.referenceId}</p>
                      </div>
                    </div>
                  )}
                </div>
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

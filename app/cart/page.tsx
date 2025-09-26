"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Clock,
  Truck,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSelector, useDispatch } from "react-redux";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice } from "@/lib/utils";

import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  addToWishlistAction
} from "@/store";
import { addToWishlist } from "@/lib/api-endpoints"; 
import {toast} from "sonner";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
export default function CartPage() {
  const { domain } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const { formatPrice } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Load recently viewed products from localStorage
    const loadRecentlyViewed = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("recentlyViewed");
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse recently viewed products:", e);
          }
        }
      }
      return [];
    };

    setRecentlyViewed(loadRecentlyViewed().slice(0, 4));
  }, []);

  const handleRemoveItem = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    toast.success(`${name} has been removed from your cart.`);
  };  

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleSaveForLater = (item: any) => {
    dispatch(
      addToWishlistAction({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        productId: "",
        slug: "",
        addedAt: ""
      })
    );

    dispatch(removeFromCart(item.id));

    toast.success(`${item.name} has been moved to your wishlist.`);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("All items have been removed from your cart.");       
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => {
        // Validate item properties
        const itemPrice = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
        const itemQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 0;
        return total + (itemPrice * itemQuantity);
      },
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const validDiscount = typeof discount === 'number' && !isNaN(discount) ? Math.max(0, discount) : 0;
    const result = subtotal - validDiscount;
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: calculateSubtotal(),
          cartItems: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const subtotal = calculateSubtotal();
        let discountAmount = 0;

        if (data.discount.type === 'percentage') {
          discountAmount = (subtotal * data.discount.value) / 100;
          if (data.discount.maxDiscount) {
            discountAmount = Math.min(discountAmount, data.discount.maxDiscount);
          }
        } else {
          discountAmount = data.discount.value;
        }

        // Check minimum purchase requirement
        if (data.discount.minPurchase && subtotal < data.discount.minPurchase) {
          toast.error(`This coupon requires a minimum purchase of ${formatPrice(data.discount.minPurchase)}`);
          setIsApplyingCoupon(false);
          return;
        }

        setDiscount(discountAmount);
        setAppliedDiscount(data.discount);
        toast.success(`You saved ${formatPrice(discountAmount)}!`);
      } else {
        toast.error(data.message || "The coupon code you entered is invalid or expired.")
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error("Failed to apply coupon. Please try again.")
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedDiscount(null);
    setCouponCode("");
    toast.success("The discount has been removed from your order.")
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3);

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleCheckout = () => {
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push(`/checkout`);
    }, 1000);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="animate-pulse">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mt-4">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="animate-bounce mb-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>

          {isMounted && recentlyViewed.length > 0 && (
            <div className="mt-16 w-full">
              <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyViewed.map((product) => (
                  <Link
                    href={`/${domain}/product/${product.slug}`}
                    key={product.id}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <div className="relative h-40 w-full">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center mb-6">
        <Link
          href="/shop"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Continue Shopping</span>
        </Link>
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="px-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                  <CardDescription>
                    <div className="flex items-center mt-1 text-sm">
                      <Truck className="h-4 w-4 mr-1" />
                      <span>Estimated delivery: {getEstimatedDelivery()}</span>
                    </div>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-6">
                {cartItems.map((item, index: number) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors rounded-md p-2"
                  >
                    <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={
                          item.image || "/placeholder.svg?height=96&width=96"
                        }
                        alt={item.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-grow sm:ml-6 mt-4 sm:mt-0">
                      <h3 className="text-base font-medium">{item.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="flex h-8 w-12 items-center justify-center border-y border-input bg-background">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => handleSaveForLater(item)}
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                <span className="text-xs">Save for later</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Move to wishlist</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {recentlyViewed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentlyViewed.map((product) => (
                    <Link
                      href={`/${domain}/product/${product.slug}`}
                      key={product.id}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow border-0 shadow-sm">
                        <div className="relative h-32 w-full">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm font-bold mt-1">
                          {formatPrice(product.price)}
                        </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    size="sm"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>

                {discount > 0 && appliedDiscount && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-green-600">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Discount ({appliedDiscount.code})
                      </span>
                      <div className="flex items-center gap-2">
                        <span>- {formatPrice(discount)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {appliedDiscount.type === 'percentage'
                        ? `${appliedDiscount.value}% off`
                        : `Rs. ${appliedDiscount.value} off`}
                      {appliedDiscount.usageLimit && (
                        <span className="ml-2">
                          ({appliedDiscount.usageCount}/{appliedDiscount.usageLimit} used)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Estimated delivery: {getEstimatedDelivery()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <Link href={`/${domain}/shop`} className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

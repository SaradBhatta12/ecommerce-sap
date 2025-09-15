"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Heart,
  Share2,
  Check,
  X,
  Package,
  Truck,
  Shield,
  Star,
  Minus,
  Plus,
  CheckCircle,
} from "lucide-react";
import ProductReviews from "@/components/product/product-reviews";
import RelatedProducts from "@/components/product/related-products";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartItemById, openCart, addToWishlistAction, removeFromWishlistAction, selectIsInWishlist, setWishlistLoading } from "@/store";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Variant {
  sku_from_system: string;
  price: number;
  sales_price: number;
  is_available: boolean;
  inventory: number;
  image: { caption: string; document: string }[];
  variant_type: { inventory_type: string; value: string }[];
}

interface CustomizationOption {
  name: string;
  options: string[];
  priceModifiers: Record<string, number>;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
}

interface Product {
  id: string;
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  discountPrice?: number;
  arModel?: string;
  threeDModel?: string;
  vrExperience?: string;
  variant: Variant[];
  customizationOptions?: CustomizationOption[];
  digitalAssets?: { type: string; url: string; accessType: string }[];
  subscriptionOptions?: {
    interval: string;
    price: number;
    discountPercentage?: number;
  }[];
  brand?: {
    _id: string;
    name: string;
    slug: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  relatedProducts: RelatedProduct[];
}

export default function ProductPage() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Get cart item for this product/variant combination
  const cartItem = useSelector((state: any) =>
    selectCartItemById(state, product?._id || '')
  );

  // Get wishlist status for this product
  const isInWishlist = useSelector((state: any) =>
    selectIsInWishlist(state, product?._id || '')
  );

  const getProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      return data?.product;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    getProduct().then((data) => {
      if (data) {
        setProduct(data);

        // Combine product images with variant images
        const productImages = data?.images || [];
        const variantImages =
          data?.variant?.flatMap(
            (v: Variant) => v.image?.map((img) => img.document) || []
          ) || [];

        const combinedImages = [...productImages, ...variantImages].filter(
          Boolean
        );
        setAllImages(combinedImages);
        setSelectedImage(combinedImages[0] || null);

        // Set first available variant as default
        if (data?.variant?.length > 0) {
          const availableVariant =
            data.variant.find(
              (v: Variant) => v.is_available && v.inventory > 0
            ) || data.variant[0];
          setSelectedVariant(availableVariant);
        }
      }
    });
  }, [getProduct, id]);

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    if (variant.image && variant.image.length > 0) {
      setSelectedImage(variant.image[0].document);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.sales_price || selectedVariant.price;
    }
    return product?.discountPrice || product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (
      selectedVariant &&
      selectedVariant.sales_price &&
      selectedVariant.sales_price < selectedVariant.price
    ) {
      return selectedVariant.price;
    }
    if (product?.discountPrice && product?.discountPrice < product?.price) {
      return product.price;
    }
    return null;
  };

  const getDiscountPercentage = () => {
    const original = getOriginalPrice();
    const current = getCurrentPrice();
    if (original && current && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      toast.error('Please select a variant')
      return
    }

    if (selectedVariant.inventory < quantity) {
      toast.error('Not enough stock available')
      return
    }

    setIsAddingToCart(true)

    try {
      const cartItemData = {
        id: product._id || product.id,
        name: product.name,
        price: selectedVariant.sales_price || selectedVariant.price,
        image: product.images?.[0] || '/placeholder.jpg',
        quantity: quantity,
      }

      dispatch(addToCart(cartItemData))
      toast.success(`Added ${quantity} item(s) to cart`)
      setQuantity(1) // Reset quantity after adding
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!session) {
      toast.error("Please sign in to add items to your wishlist");
      router.push(`/auth?tab=login&callbackUrl=/product/detail/${id}`);
      return;
    }

    if (!product) return;

    setIsAddingToWishlist(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist?productId=${product._id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to remove from wishlist");

        dispatch(removeFromWishlistAction(product._id));
        toast.success(`${product.name} removed from wishlist`);
      } else {
        // Add to wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (!response.ok) throw new Error("Failed to add to wishlist");

        const wishlistItem = {
          id: product._id,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: getCurrentPrice(),
          originalPrice: getOriginalPrice() || undefined,
          image: selectedImage || product.images[0] || '/placeholder.svg',
          addedAt: new Date().toISOString(),
        };

        dispatch(addToWishlistAction(wishlistItem));
        toast.success(`${product.name} added to wishlist`);
      }
    } catch (error) {
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className=" mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg border bg-muted/30">
              {selectedImage ? (
                <div className="relative group">
                  <Image
                    src={selectedImage || "/placeholder.svg"}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                  />

                  {/* Discount Badge */}
                  {getDiscountPercentage() > 0 && (
                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                      {getDiscountPercentage()}% OFF
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="aspect-square w-full bg-muted flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-2">
              {allImages.slice(0, 8).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`relative overflow-hidden rounded-md border-2 transition-all hover:scale-105 ${selectedImage === image
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                    }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={100}
                    height={100}
                    className="aspect-square object-cover"
                  />
                </button>
              ))}
            </div>

            {/* 3D Model */}
            {product.arModel && (
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 bg-primary text-primary-foreground">
                    <h3 className="font-semibold">3D Model Experience</h3>
                  </div>
                  <iframe
                    title="3D Model Viewer"
                    src={`${product.arModel}/embed`}
                    className="w-full h-[400px]"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              {product.brand && (
                <Badge variant="secondary" className="w-fit">
                  {product.brand.name}
                </Badge>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (4.0) • 128 reviews
                </span>
                <Badge variant="outline" className="text-xs">
                  Bestseller
                </Badge>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-primary">
                  ₹{getCurrentPrice().toLocaleString()}
                </span>
                {getOriginalPrice() && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{getOriginalPrice()?.toLocaleString()}
                  </span>
                )}
                {getDiscountPercentage() > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    SAVE {getDiscountPercentage()}%
                  </Badge>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2">
                {selectedVariant ? (
                  selectedVariant.is_available &&
                    selectedVariant.inventory > 0 ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">
                        In Stock ({selectedVariant.inventory} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">Available</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Variants */}
            {product.variant && product.variant.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Variant</h3>
                <div className="grid gap-3">
                  {product.variant.map((variant, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedVariant?.sku_from_system ===
                          variant.sku_from_system
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                        }`}
                      onClick={() => handleVariantSelect(variant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Variant Images */}
                            {variant.image && variant.image.length > 0 && (
                              <div className="flex -space-x-2">
                                {variant.image
                                  .slice(0, 3)
                                  .map((img, imgIndex) => (
                                    <Image
                                      key={imgIndex}
                                      src={img.document || "/placeholder.svg"}
                                      alt={
                                        img.caption || `Variant ${index + 1}`
                                      }
                                      width={40}
                                      height={40}
                                      className="rounded-full border-2 border-background object-cover"
                                    />
                                  ))}
                                {variant.image.length > 3 && (
                                  <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                                    +{variant.image.length - 3}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                {variant.variant_type.map((type, typeIndex) => (
                                  <Badge
                                    key={typeIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {type.inventory_type}: {type.value}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                SKU: {variant.sku_from_system}
                              </p>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <div className="font-semibold">
                              ₹
                              {(
                                variant.sales_price || variant.price
                              ).toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-1">
                              {variant.is_available && variant.inventory > 0 ? (
                                <>
                                  <Check className="h-3 w-3 text-green-600" />
                                  <span className="text-xs text-green-600">
                                    {variant.inventory} left
                                  </span>
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 text-red-600" />
                                  <span className="text-xs text-red-600">
                                    Out of stock
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={
                    selectedVariant
                      ? quantity >= selectedVariant.inventory
                      : false
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1"
                  disabled={
                    isAddingToCart ||
                    (selectedVariant &&
                      (!selectedVariant.is_available ||
                        selectedVariant.inventory === 0)) 
                  }
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAddingToCart ? "Adding..." : cartItem ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleToggleWishlist}
                  disabled={isAddingToWishlist}
                  className={isInWishlist ? "text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? "fill-red-500" : ""}`} />
                  {isAddingToWishlist ? "Updating..." : isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Truck className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over ₹999
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">Warranty</p>
                  <p className="text-xs text-muted-foreground">1 Year</p>
                </div>
                <div className="text-center">
                  <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30 Days</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="customization">Options</TabsTrigger>
                <TabsTrigger value="digital">Digital</TabsTrigger>
                <TabsTrigger value="subscription">Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customization" className="space-y-4 mt-4">
                {product.customizationOptions &&
                  product.customizationOptions.length > 0 ? (
                  <div className="space-y-4">
                    {product.customizationOptions.map((option, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{option.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {option.options.map((opt, optIndex) => (
                              <Badge key={optIndex} variant="outline">
                                {opt}
                                {option.priceModifiers[opt] && (
                                  <span className="ml-1 text-xs text-green-600">
                                    (+₹{option.priceModifiers[opt]})
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground">
                        No customization options available.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="digital" className="space-y-4 mt-4">
                {product.digitalAssets && product.digitalAssets.length > 0 ? (
                  <div className="space-y-3">
                    {product.digitalAssets.map((asset, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{asset.type}</h4>
                              <p className="text-sm text-muted-foreground">
                                Access: {asset.accessType}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground">
                        No digital assets available.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="subscription" className="space-y-4 mt-4">
                {product.subscriptionOptions &&
                  product.subscriptionOptions.length > 0 ? (
                  <div className="space-y-3">
                    {product.subscriptionOptions.map((sub, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold capitalize">
                                {sub.interval} Plan
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                ₹{sub.price.toLocaleString()} per {sub.interval}
                              </p>
                            </div>
                            {sub.discountPercentage && (
                              <Badge variant="secondary">
                                {sub.discountPercentage}% OFF
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground">
                        No subscription plans available.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ProductReviews productId={product._id} />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts
            categoryId={product.category._id}
            currentProductId={product._id}
          />
        </div>
      </div>
    </div>
  );
}

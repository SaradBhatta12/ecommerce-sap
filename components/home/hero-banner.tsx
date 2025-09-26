"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice } from "@/lib/utils";

interface HeroBannerProps {
  product?: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    category: {
      name: string;
      slug: string;
    };
    brand?: {
      name: string;
      slug: string;
    };
    rating?: number;
    isNew?: boolean;
    isFeatured?: boolean;
  };
  stats?: {
    totalProducts: number;
    totalCategories: number;
    totalBrands: number;
  };
}

export default function HeroBanner({ product, stats }: HeroBannerProps) {
  const { formatPrice } = useCurrency();
  
  return (
    <section className="bg-gray-50 min-h-screen flex items-center">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center py-12 lg:py-20">
            {/* Left Content */}
            <div className="space-y-8 lg:space-y-12 order-2 lg:order-1">
              <div className="space-y-6">
                {product ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      {product.isNew && (
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          New Arrival
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-black leading-[0.9] tracking-tight">
                      {product.name.split(' ').slice(0, 2).join(' ')}
                      <br />
                      <span className="text-gray-600">{product.name.split(' ').slice(2).join(' ') || 'COLLECTION'}</span>
                    </h1>
                    <div className="space-y-2">
                      <p className="text-xl lg:text-2xl xl:text-3xl font-light text-gray-700 tracking-wide">
                        {product.category.name}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl lg:text-3xl font-bold text-black">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-lg lg:text-xl text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating!)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-black leading-[0.9] tracking-tight">
                      NEW
                      <br />
                      <span className="text-gray-600">COLLECTION</span>
                    </h1>
                    <div className="space-y-1">
                      <p className="text-xl lg:text-2xl xl:text-3xl font-light text-gray-700 tracking-wide">Summer</p>
                      <p className="text-xl lg:text-2xl xl:text-3xl font-light text-gray-700 tracking-wide">2024</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Stats Section */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-black">{stats.totalProducts}</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-black">{stats.totalCategories}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-black">{stats.totalBrands}</div>
                    <div className="text-sm text-gray-600">Brands</div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="group border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 px-8 py-4 text-base font-medium uppercase tracking-wider"
                >
                  <Link href="/shop" className="flex items-center gap-3">
                    Explore Shop
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
                {product && (
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-8 py-4 text-base font-medium uppercase tracking-wider"
                  >
                    <Link href={`/product/detail/${product.slug}`} className="flex items-center gap-3">
                      View Product
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Content - Product Images */}
            <div className="relative order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Main Product Image */}
                <div className="col-span-1 row-span-2">
                  <div className="relative aspect-[3/4] bg-white overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={product?.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop&crop=center"}
                      alt={product?.name || "Featured product"}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    {product?.discountPrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Secondary Product Image */}
                <div className="col-span-1">
                  <div className="relative aspect-square bg-white overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={product?.images?.[1] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center"}
                      alt={product?.name || "Product image"}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                {/* Accent Image */}
                <div className="col-span-1">
                  <div className="relative aspect-square bg-white overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={product?.images?.[2] || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop&crop=center"}
                      alt={product?.name || "Product detail"}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Geometric elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 lg:w-12 lg:h-12 bg-black rounded-full"></div>
              <div className="absolute top-1/2 -left-4 lg:-left-6 w-4 h-4 lg:w-6 lg:h-6 bg-gray-400 rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-full"></div>
              
              {/* Brand Badge */}
              {product?.brand && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-800">{product.brand.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

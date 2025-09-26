"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  brand?: {
    name: string;
  };
  rating?: number;
  reviewCount?: number;
  slug: string;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
}

interface NewThisWeekProps {
  products: Product[];
  totalCount?: number;
}

export default function NewThisWeek({ products = [], totalCount = 0 }: NewThisWeekProps) {
  const { formatPrice } = useCurrency();
  
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden fullscreen-container no-shadows no-rounded">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-black/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-tl from-gray-200/30 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="responsive-container relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 lg:mb-20">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-black mb-4 leading-[0.85] tracking-tight">
              NEW THIS WEEK
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-lg lg:text-xl text-gray-500 uppercase tracking-[0.2em] font-light">({totalCount})</p>
              <div className="h-px w-16 bg-gradient-to-r from-black to-transparent"></div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg"
            className="group border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 px-8 py-4 text-base font-medium uppercase tracking-wider backdrop-blur-sm"
            asChild
          >
            <Link href="/shop?filter=new" className="flex items-center gap-3">
              See All New
              <div className="w-6 h-px bg-current group-hover:w-8 transition-all duration-300"></div>
            </Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {products.slice(0, 8).map((product, index) => (
            <Card key={product._id} className="border-0 shadow-none group cursor-pointer bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-500 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Link href={`/product/detail/${product._id}`}>
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <Image
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <Badge className="bg-black text-white text-xs px-2 py-1 rounded-full">
                          NEW
                        </Badge>
                      )}
                      {product.onSale && product.salePrice && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          SALE
                        </Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                          OUT OF STOCK
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{product.category.name}</span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      {product.brand && (
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{product.brand.name}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-black text-base lg:text-lg leading-tight group-hover:text-gray-700 transition-colors duration-300">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    {product.rating && product.reviewCount && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating!)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      {product.onSale && product.salePrice ? (
                        <>
                          <p className="text-black font-bold text-lg">{formatPrice(product.salePrice)}</p>
                          <p className="text-gray-500 line-through text-sm">{formatPrice(product.price)}</p>
                        </>
                      ) : (
                        <p className="text-black font-bold text-lg">{formatPrice(product.price)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Pagination */}
        {products.length > 8 && (
          <div className="flex justify-center items-center space-x-4">
            <div className="flex space-x-3">
              <div className="w-3 h-3 bg-black rounded-full shadow-lg"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors duration-200 cursor-pointer"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors duration-200 cursor-pointer"></div>
            </div>
            <div className="ml-6 text-sm text-gray-500 font-medium">1 of {Math.ceil(products.length / 8)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
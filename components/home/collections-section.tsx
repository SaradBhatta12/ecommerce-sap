"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

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
  slug: string;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
}

interface CollectionsSectionProps {
  categories: Category[];
  featuredProducts: Product[];
}

export default function CollectionsSection({ categories = [], featuredProducts = [] }: CollectionsSectionProps) {
  return (
    <section className="relative py-20 lg:py-32 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
        {/* Main Content */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black leading-tight mb-8">
            FEATURED COLLECTIONS
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover our curated collections featuring the latest trends and timeless classics. 
            Each piece is carefully selected to bring you the best in contemporary fashion.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.slice(0, 6).map((category, index) => {
            const categoryProducts = featuredProducts.filter(p => p.category.slug === category.slug);
            const displayImage = categoryProducts[0]?.images[0] || category.image || '/placeholder-category.jpg';
            
            return (
              <Link key={category._id} href={`/shop?category=${category.slug}`}>
                <div className="relative group cursor-pointer">
                  <div className={`relative overflow-hidden rounded-2xl ${
                    index === 0 || index === 3 ? 'aspect-[3/4]' : 'aspect-square'
                  } bg-gradient-to-br from-gray-100 to-gray-200`}>
                    <Image
                      src={displayImage}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl lg:text-2xl font-bold mb-2 uppercase tracking-wide">
                        {category.name}
                      </h3>
                      <p className="text-sm opacity-90 mb-3">
                        {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {category.productCount} items
                        </Badge>
                        <div className="w-8 h-px bg-white group-hover:w-12 transition-all duration-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <>
            <div className="text-center mb-12">
              <h3 className="text-2xl lg:text-3xl font-bold text-black mb-4">
                FEATURED PRODUCTS
              </h3>
              <p className="text-gray-600">
                Handpicked favorites from our latest collections
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <Link key={product._id} href={`/product/${product.slug}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-2xl mb-4">
                      <Image
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Product Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isFeatured && (
                          <Badge className="bg-black text-white text-xs px-2 py-1 rounded-full">
                            FEATURED
                          </Badge>
                        )}
                        {product.onSale && product.salePrice && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            SALE
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.category.name}
                        </span>
                        {product.brand && (
                          <>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                              {product.brand.name}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-black group-hover:text-gray-700 transition-colors duration-300">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        {product.onSale && product.salePrice ? (
                          <>
                            <span className="font-bold text-black">${product.salePrice}</span>
                            <span className="text-gray-500 line-through text-sm">${product.price}</span>
                          </>
                        ) : (
                          <span className="font-bold text-black">${product.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
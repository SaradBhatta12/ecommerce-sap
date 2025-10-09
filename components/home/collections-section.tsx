"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  const { formatPrice } = useCurrency();
  
  // Remove duplicates and get unique categories based on slug, limit to 6
  const uniqueCategories = categories
    .filter((category, index, self) => 
      index === self.findIndex(c => c.slug === category.slug)
    )
    .slice(0, 6);
  
  return (
    <section className="relative py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-black dark:text-white leading-tight mb-6 lg:mb-8">
            FEATURED COLLECTIONS
          </h2>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Discover our curated collections featuring the latest trends and timeless classics. 
            Each piece is carefully selected to bring you the best in contemporary fashion.
          </p>
        </div>

        {/* Categories Grid - Improved Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
          {uniqueCategories.map((category, index) => {
            const categoryProducts = featuredProducts.filter(p => p.category.slug === category.slug);
            const displayImage = categoryProducts[0]?.images[0] || category.image || '/placeholder-category.jpg';
            
            return (
              <Link key={category._id} href={`/shop?category=${category.slug}`}>
                <div className="relative group cursor-pointer">
                  <div className={`relative overflow-hidden rounded-xl lg:rounded-2xl ${
                    // Create a more dynamic layout pattern
                    index === 0 ? 'aspect-[4/5] sm:aspect-[3/4]' : 
                    index === 1 ? 'aspect-square' :
                    index === 2 ? 'aspect-[4/5] sm:aspect-[3/4]' :
                    index === 3 ? 'aspect-square' :
                    index === 4 ? 'aspect-[4/5] sm:aspect-[3/4]' :
                    'aspect-square'
                  } bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <Image
                      src={displayImage}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                    
                    {/* Category Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 uppercase tracking-wide">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm opacity-90 mb-3 line-clamp-2">
                        {category.description || `Explore our ${category.name.toLowerCase()} collection`}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                          {category.productCount} items
                        </Badge>
                        <div className="w-6 sm:w-8 h-px bg-white group-hover:w-8 sm:group-hover:w-12 transition-all duration-300"></div>
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
            <div className="text-center mb-8 lg:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 lg:mb-4">
                FEATURED PRODUCTS
              </h3>
              <p className="text-sm lg:text-base text-gray-600 px-4">
                Handpicked favorites from our latest collections
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <Link key={product._id} href={`/product/${product.slug}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-lg lg:rounded-xl mb-3 lg:mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <Image
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Product Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
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
                    
                    <div className="space-y-1 lg:space-y-2">
                      <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.category.name}
                        </span>
                        {product.brand && (
                          <>
                            <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">
                              {product.brand.name}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-sm lg:text-base text-black group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                        {product.onSale && product.salePrice ? (
                          <>
                            <span className="font-bold text-sm lg:text-base text-black">{formatPrice(product.salePrice)}</span>
                            <span className="text-gray-500 line-through text-xs lg:text-sm">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="font-bold text-sm lg:text-base text-black">{formatPrice(product.price)}</span>
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
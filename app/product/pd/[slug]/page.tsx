import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ProductDetails from "@/components/product/product-details";
import ProductReviews from "@/components/product/product-reviews";
import RelatedProducts from "@/components/product/related-products";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";

// Add imports for our new components
import ARVRViewer from "@/components/product/ar-vr-viewer";
import AIRecommendations from "@/components/product/ai-recommendations";

async function getProduct(slug: string) {
  await dbConnect();

  const product = await Product.findOne({
    $or: [{ _id: slug }, { slug: slug }],
  })
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .lean();

  if (!product) {
    return null;
  }

  return product;
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className=" px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg">
            <Suspense fallback={<Skeleton className="aspect-square" />}>
              <Image
                src={
                  product.images[0] || "/placeholder.svg?height=600&width=600"
                }
                alt={product.name}
                width={600}
                height={600}
                className="h-auto w-full object-cover"
                priority
              />
            </Suspense>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.slice(1).map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg">
                <Image
                  src={image || "/placeholder.svg?height=200&width=200"}
                  alt={`${product.name} - View ${index + 2}`}
                  width={200}
                  height={200}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <ProductDetails product={product} />
      </div>

      {/* Add these components to the page layout
      After the product details section */}
      <div className="mt-8">
        <ARVRViewer productId={product._id} productName={product.name} />
      </div>

      <div className="mt-12">
        <AIRecommendations
          productId={product._id}
          category={product.category?._id}
        />
      </div>

      <div className="mt-16">
        <ProductReviews productId={product._id} />
      </div>

      <div className="mt-16">
        <RelatedProducts
          categoryId={product.category._id}
          currentProductId={product._id}
        />
      </div>
    </div>
  );
}

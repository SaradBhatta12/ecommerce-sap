import { EnhancedProductForm } from "@/components/admin/product-form";

// Fetch categories from API
async function getCategories() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/categories`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fetch brands from API
async function getBrands() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/brands`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch brands");
    const data = await response.json();
    return data.brands || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

// Fetch product data
async function getProduct(id: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/products/${id}`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch product");
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const [categories, brands, product] = await Promise.all([
    getCategories(),
    getBrands(),
    getProduct(params.id),
  ]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <EnhancedProductForm
        initialData={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}

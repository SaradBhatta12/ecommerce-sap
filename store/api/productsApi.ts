import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Key } from 'readline'

// Define types for products requests and responses
interface ProductsQuery {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  sort?: string
  page?: number
  limit?: number
  search?: string
  status?: string
  isNew?: boolean
  isFeatured?: boolean
}

interface Product {
  isOnSale: any
  discountPrice: any
  _id: Key | null | undefined
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  sku: string
  slug: string
  images: string[]
  category: {
    id: string
    name: string
  }
  brand: {
    id: string
    name: string
  }
  stock: number
  status: 'published' | 'draft'
  isNew: boolean
  isFeatured: boolean
  createdAt: string
}

interface ProductsResponse {
  products: Product[]
  totalPages: number
  currentPage: number
  totalProducts: number
}

interface CreateProductRequest {
  name: string
  description: string
  price: number
  salePrice?: number
  sku: string
  images: string[]
  categoryId: string
  brandId: string
  stock: number
  status?: 'published' | 'draft'
  isNew?: boolean
  isFeatured?: boolean
}

interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  salePrice?: number
  sku?: string
  images?: string[]
  categoryId?: string
  brandId?: string
  stock?: number
  status?: 'published' | 'draft'
  isNew?: boolean
  isFeatured?: boolean
}

interface Review {
  id: string
  rating: number
  comment: string
  user: {
    id: string
    name: string
  }
  createdAt: string
}

interface CreateReviewRequest {
  rating: number
  comment: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: string
  productCount: number
  createdAt: string
}

interface CategoriesQuery {
  page?: number
  limit?: number
  search?: string
  parent?: string
  domain?: string
}

interface CreateCategoryRequest {
  name: string
  description?: string
  image?: string
  parent?: string
}

interface UpdateCategoryRequest {
  name?: string
  description?: string
  image?: string
  parent?: string
}

interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  productCount: number
  createdAt: string
}

interface BrandsQuery {
  page?: number
  limit?: number
  search?: string
}

interface CreateBrandRequest {
  name: string
  description?: string
  logo?: string
}

interface UpdateBrandRequest {
  name?: string
  description?: string
  logo?: string
}

const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Product', 'Category', 'Brand', 'Review'],
  endpoints: (builder) => ({
    // Products endpoints
    getProducts: builder.query<ProductsResponse, ProductsQuery | void>({
      query: (params: ProductsQuery = {}) => ({
        url: 'products',
        params,
      }),
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation<{ productId: string; message: string }, CreateProductRequest>({
      query: (productData) => ({
        url: 'products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    getProductById: builder.query<Product & { relatedProducts: Product[] }, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    updateProduct: builder.mutation<{ message: string }, { id: string; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Product reviews endpoints
    getProductReviews: builder.query<Review[], string>({
      query: (productId) => `products/${productId}/reviews`,
      providesTags: (result, error, productId) => [{ type: 'Review', id: productId }],
    }),

    createProductReview: builder.mutation<{ reviewId: string; message: string }, { productId: string; data: CreateReviewRequest }>({
      query: ({ productId, data }) => ({
        url: `products/${productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }],
    }),

    // Categories endpoints
    getCategories: builder.query<{ categories: Category[]; totalPages: number; currentPage: number }, CategoriesQuery | void>({
      query: (params: CategoriesQuery = {}) => ({
        url: 'categories',
        params,
      }),
      providesTags: ['Category'],
    }),

    createCategory: builder.mutation<{ categoryId: string; message: string }, CreateCategoryRequest>({
      query: (categoryData) => ({
        url: 'categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    getCategoryById: builder.query<Category, string>({
      query: (id) => `categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    updateCategory: builder.mutation<{ message: string }, { id: string; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),

    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Brands endpoints
    getBrands: builder.query<{ brands: Brand[]; totalPages: number; currentPage: number }, BrandsQuery | void>({
      query: (params: BrandsQuery = {}) => ({
        url: 'brands',
        params,
      }),
      providesTags: ['Brand'],
    }),

    createBrand: builder.mutation<{ brandId: string; message: string }, CreateBrandRequest>({
      query: (brandData) => ({
        url: 'brands',
        method: 'POST',
        body: brandData,
      }),
      invalidatesTags: ['Brand'],
    }),

    getBrandById: builder.query<Brand, string>({
      query: (id) => `brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),

    updateBrand: builder.mutation<{ message: string }, { id: string; data: UpdateBrandRequest }>({
      query: ({ id, data }) => ({
        url: `brands/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }, 'Brand'],
    }),

    deleteBrand: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brand'],
    }),
  }),
})

// Export the API slice
export { productsApi }

// Export hooks for usage in functional components
export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = productsApi
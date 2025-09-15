import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for new API requests and responses
interface AdminStore {
  id: string
  name: string
  email: string
  phone?: string
  addresses: Array<{
    type: 'billing' | 'shipping'
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }>
  vendorProfile: {
    businessType: string
    businessLicense?: string
    taxId?: string
  }
  settings: {
    currency: string
    timezone: string
    language: string
  }
}

interface UpdateAdminStoreRequest {
  name?: string
  businessType?: string
}

interface AdminStoreInfo {
  logo?: string
  banner?: string
  description?: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
}

interface UpdateAdminStoreInfoRequest {
  logo?: string
  banner?: string
  description?: string
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  businessHours?: Partial<AdminStoreInfo['businessHours']>
}

interface NewCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: {
    id: string
    name: string
  }
  productCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface NewCategoriesResponse {
  categories: NewCategory[]
  totalPages: number
  currentPage: number
  totalCategories: number
}

interface CreateNewCategoryRequest {
  name: string
  description?: string
  image?: string
  parentId?: string
  isActive?: boolean
}

interface UpdateNewCategoryRequest {
  name?: string
  description?: string
  image?: string
  parentId?: string
  isActive?: boolean
}

interface NewOrder {
  id: string
  orderNumber: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentMethod: string
  total: number
  subtotal: number
  shipping: number
  discount?: {
    code: string
    amount: number
  }
  items: Array<{
    product: {
      id: string
      name: string
      image: string
      price: number
    }
    quantity: number
    price: number
  }>
  shippingAddress: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  timeline: Array<{
    status: string
    date: string
    note?: string
  }>
  createdAt: string
  updatedAt: string
}

interface PaymentDetails {
  esewa: {
    merchantId: string
    secretKey: string
    successUrl: string
    failureUrl: string
    isActive: boolean
  }
  khalti: {
    publicKey: string
    secretKey: string
    successUrl: string
    failureUrl: string
    isActive: boolean
  }
}

interface UpdatePaymentDetailsRequest {
  esewa?: {
    merchantId?: string
    secretKey?: string
    successUrl?: string
    failureUrl?: string
    isActive?: boolean
  }
  khalti?: {
    publicKey?: string
    secretKey?: string
    successUrl?: string
    failureUrl?: string
    isActive?: boolean
  }
}

interface NewProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number
  sku: string
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
  variants?: Array<{
    id: string
    name: string
    value: string
    price?: number
    stock?: number
  }>
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: string
  updatedAt: string
}

interface NewProductsResponse {
  products: NewProduct[]
  totalPages: number
  currentPage: number
  totalProducts: number
}

interface CreateNewProductRequest {
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
  variants?: Array<{
    name: string
    value: string
    price?: number
    stock?: number
  }>
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

interface UpdateNewProductRequest {
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
  variants?: Array<{
    id?: string
    name: string
    value: string
    price?: number
    stock?: number
  }>
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

const newApi = createApi({
  reducerPath: 'newApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/new/',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['AdminStore', 'NewCategory', 'NewOrder', 'NewPayment', 'NewProduct'],
  endpoints: (builder) => ({
    // Admin store endpoints
    getNewAdminStore: builder.query<AdminStore, void>({
      query: () => 'admin/store',
      providesTags: ['AdminStore'],
    }),

    updateNewAdminStore: builder.mutation<{ message: string }, UpdateAdminStoreRequest>({
      query: (storeData) => ({
        url: 'admin/store',
        method: 'PUT',
        body: storeData,
      }),
      invalidatesTags: ['AdminStore'],
    }),

    getNewAdminStoreInfo: builder.query<AdminStoreInfo, void>({
      query: () => 'admin/store-info',
      providesTags: ['AdminStore'],
    }),

    updateNewAdminStoreInfo: builder.mutation<{ message: string }, UpdateAdminStoreInfoRequest>({
      query: (storeInfoData) => ({
        url: 'admin/store-info',
        method: 'PUT',
        body: storeInfoData,
      }),
      invalidatesTags: ['AdminStore'],
    }),

    updateNewAdminProfile: builder.mutation<{ message: string }, UpdateAdminStoreRequest>({
      query: (profileData) => ({
        url: 'admin/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['AdminStore'],
    }),

    // New categories endpoints
    getNewCategories: builder.query<NewCategoriesResponse, { page?: number; limit?: number; search?: string; parent?: string }>({
      query: (params = {}) => ({
        url: 'categories',
        params,
      }),
      providesTags: ['NewCategory'],
    }),

    createNewCategory: builder.mutation<{ categoryId: string; message: string }, CreateNewCategoryRequest>({
      query: (categoryData) => ({
        url: 'categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['NewCategory'],
    }),

    updateNewCategory: builder.mutation<{ message: string }, { id: string; data: UpdateNewCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'NewCategory', id }, 'NewCategory'],
    }),

    deleteNewCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NewCategory'],
    }),

    // New orders endpoints
    getNewOrders: builder.query<NewOrder[], void>({
      query: () => 'orders',
      providesTags: ['NewOrder'],
    }),

    getNewOrderById: builder.query<NewOrder, string>({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'NewOrder', id }],
    }),

    // New payment endpoints
    getNewPayment: builder.query<PaymentDetails, void>({
      query: () => 'payment',
      providesTags: ['NewPayment'],
    }),

    updateNewPayment: builder.mutation<{ message: string }, UpdatePaymentDetailsRequest>({
      query: (paymentData) => ({
        url: 'payment',
        method: 'PUT',
        body: paymentData,
      }),
      invalidatesTags: ['NewPayment'],
    }),

    // New products endpoints
    getNewProducts: builder.query<NewProductsResponse, { page?: number; limit?: number; search?: string; category?: string; status?: string }>({
      query: (params = {}) => ({
        url: 'products',
        params,
      }),
      providesTags: ['NewProduct'],
    }),

    createNewProduct: builder.mutation<{ productId: string; message: string }, CreateNewProductRequest>({
      query: (productData) => ({
        url: 'products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['NewProduct'],
    }),

    getNewProductById: builder.query<NewProduct, string>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'NewProduct', id }],
    }),

    updateNewProduct: builder.mutation<{ message: string }, { id: string; data: UpdateNewProductRequest }>({
      query: ({ id, data }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'NewProduct', id }, 'NewProduct'],
    }),

    deleteNewProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NewProduct'],
    }),
  }),
})

// Export the API slice
export { newApi }

// Export hooks for usage in functional components
export const {
  useGetNewAdminStoreQuery,
  useUpdateNewAdminStoreMutation,
  useGetNewAdminStoreInfoQuery,
  useUpdateNewAdminStoreInfoMutation,
  useUpdateNewAdminProfileMutation,
  useGetNewCategoriesQuery,
  useCreateNewCategoryMutation,
  useUpdateNewCategoryMutation,
  useDeleteNewCategoryMutation,
  useGetNewOrdersQuery,
  useGetNewOrderByIdQuery,
  useGetNewPaymentQuery,
  useUpdateNewPaymentMutation,
  useGetNewProductsQuery,
  useCreateNewProductMutation,
  useGetNewProductByIdQuery,
  useUpdateNewProductMutation,
  useDeleteNewProductMutation,
} = newApi
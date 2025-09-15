import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for utility requests and responses
interface UploadFileResponse {
  url: string
  filename: string
  size: number
  type: string
}

interface SeedDatabaseResponse {
  message: string
  created: {
    categories: number
    brands: number
    products: number
  }
}

interface ValidateDiscountRequest {
  code: string
  cartTotal: number
  items?: Array<{
    productId: string
    quantity: number
    price: number
  }>
}

interface ValidateDiscountResponse {
  valid: boolean
  discount?: {
    id: string
    code: string
    type: 'percentage' | 'fixed'
    value: number
    discountAmount: number
    minPurchase?: number
    maxDiscount?: number
  }
  message: string
}

interface ApplyDiscountRequest {
  discountId: string
}

interface ApplyDiscountResponse {
  success: boolean
  message: string
  usageCount: number
}

interface CreateOrderRequest {
  addressId: string
  paymentMethod: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  discount?: {
    id: string
    code: string
    amount: number
  }
  total: number
}

interface CreateOrderResponse {
  orderId: string
  orderNumber: string
  message: string
  paymentUrl?: string // For payment gateway integration
}

const utilityApi = createApi({
  reducerPath: 'utilityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { endpoint }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      
      // Don't set content-type for file uploads, let the browser set it
      if (endpoint !== 'uploadFile') {
        headers.set('content-type', 'application/json')
      }
      
      return headers
    },
  }),
  tagTypes: ['Upload', 'Seed', 'Discount', 'Order'],
  endpoints: (builder) => ({
    // File upload endpoint
    uploadFile: builder.mutation<UploadFileResponse, FormData>({
      query: (formData) => ({
        url: 'upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: () => [{ type: 'Upload' as const }],
    }),

    // Database seeding endpoint
    seedDatabase: builder.mutation<SeedDatabaseResponse, void>({
      query: () => ({
        url: 'seed',
        method: 'POST',
      }),
      invalidatesTags: ['Seed'],
    }),

    // Discount validation endpoint
    validateDiscount: builder.mutation<ValidateDiscountResponse, ValidateDiscountRequest>({
      query: (discountData) => ({
        url: 'discounts/validate',
        method: 'POST',
        body: discountData,
      }),
    }),

    // Discount application endpoint
    applyDiscount: builder.mutation<ApplyDiscountResponse, ApplyDiscountRequest>({
      query: (data) => ({
        url: 'discounts/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Discount'],
    }),

    // Order creation endpoint
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (orderData) => ({
        url: 'orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Product'], // Invalidate products to refresh stock
    }),
  }),
})

// Export the API slice
export { utilityApi }

// Export hooks for usage in functional components
export const {
  useUploadFileMutation,
  useSeedDatabaseMutation,
  useValidateDiscountMutation,
  useApplyDiscountMutation,
  useCreateOrderMutation,
} = utilityApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: [
    'User',
    'Product',
    'Category',
    'Brand',
    'Order',
    'Discount',
    'Address',
    'Wishlist',
    'Review',
    'Analytics',
    'Payment',
  ],
  endpoints: () => ({}),
})

// Export types for use in other slices
export type BaseQueryFn = ReturnType<typeof fetchBaseQuery>

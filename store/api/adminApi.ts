import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for admin requests and responses
interface AnalyticsQuery {
  detailed?: boolean
}

interface AnalyticsResponse {
  revenue: Array<{ month: string; amount: number }>
  orders?: Array<{ month: string; count: number }>
  customers?: Array<{ month: string; count: number }>
}

interface StatsResponse {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  usersChange: number
}

interface RecentSalesResponse {
  id: string
  total: number
  customer: {
    name: string
    email: string
  }
  createdAt: string
}[]

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: string
}

interface UpdateUserRequest {
  name?: string
  email?: string
  role?: string
}

interface Discount {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  createdBy: string
}

interface CreateDiscountRequest {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  startDate: string
  endDate: string
}

interface UpdateDiscountRequest {
  code?: string
  type?: 'percentage' | 'fixed'
  value?: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin/',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Analytics', 'Stats', 'RecentSales', 'User', 'Discount'],
  endpoints: (builder) => ({
    // Analytics endpoint
    getAnalytics: builder.query<AnalyticsResponse, AnalyticsQuery | void>({
      query: (params: AnalyticsQuery = {}) => ({
        url: 'analytics',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Statistics endpoint
    getStats: builder.query<StatsResponse, void>({
      query: () => 'stats',
      providesTags: ['Stats'],
    }),

    // Recent sales endpoint
    getRecentSales: builder.query<RecentSalesResponse, void>({
      query: () => 'recent-sales',
      providesTags: ['RecentSales'],
    }),

    // Users management endpoints
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['User'],
    }),

    createUser: builder.mutation<{ userId: string; message: string }, CreateUserRequest>({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUser: builder.mutation<{ message: string }, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Discounts management endpoints
    getDiscounts: builder.query<Discount[], void>({
      query: () => 'discounts',
      providesTags: ['Discount'],
    }),

    createDiscount: builder.mutation<{ discountId: string; message: string }, CreateDiscountRequest>({
      query: (discountData) => ({
        url: 'discounts',
        method: 'POST',
        body: discountData,
      }),
      invalidatesTags: ['Discount'],
    }),

    getDiscountById: builder.query<Discount, string>({
      query: (id) => `discounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Discount', id }],
    }),

    updateDiscount: builder.mutation<{ message: string }, { id: string; data: UpdateDiscountRequest }>({
      query: ({ id, data }) => ({
        url: `discounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Discount', id }, 'Discount'],
    }),

    deleteDiscount: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `discounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discount'],
    }),
  }),
})

// Export the API slice
export { adminApi }

// Export hooks for usage in functional components
export const {
  useGetAnalyticsQuery,
  useGetStatsQuery,
  useGetRecentSalesQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useGetDiscountByIdQuery,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = adminApi
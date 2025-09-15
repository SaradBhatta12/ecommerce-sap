import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for auth requests and responses
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface RegisterRequest {
  name: string
  email: string
  password: string
  domain: string
}

interface RegisterResponse {
  userId: string
  message: string
}

interface LogoutRequest {
  domain?: string
}

interface LogoutResponse {
  message: string
}

const authApi = createApi({
  reducerPath: 'authApi',
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
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Logout endpoint
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (data) => ({
        url: 'logout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register endpoint
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // NextAuth endpoints (for reference, these are handled by NextAuth.js)
    // GET/POST /api/auth/[...nextauth] - handled by NextAuth
    
    // Forgot password endpoint (currently disabled)
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password endpoint (currently disabled)
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (data) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Get forgot password page (currently disabled)
    getForgotPasswordPage: builder.query<any, void>({
      query: () => 'auth/forgot-password',
    }),

    // Get reset password page (currently disabled)
    getResetPasswordPage: builder.query<any, void>({
      query: () => 'auth/reset-password',
    }),
  }),
})

// Export the API slice
export { authApi }

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetForgotPasswordPageQuery,
  useGetResetPasswordPageQuery,
} = authApi
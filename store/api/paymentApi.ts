import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for payment requests and responses
interface EsewaVerificationRequest {
  orderId: string
  transactionId: string
  amount: number
}

interface KhaltiVerificationRequest {
  orderId: string
  transactionId: string
  amount: number
}

interface PaymentVerificationResponse {
  success: boolean
  message: string
  order: {
    id: string
    orderNumber: string
    paymentStatus: 'pending' | 'paid' | 'failed'
    status: string
    total: number
    timeline: Array<{
      status: string
      date: string
      note?: string
    }>
  }
  paymentDetails?: {
    transactionId: string
    gateway: 'esewa' | 'khalti'
    amount: number
    verifiedAt: string
  }
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/payment/',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Payment', 'Order'],
  endpoints: (builder) => ({
    // eSewa payment verification
    verifyEsewaPayment: builder.mutation<PaymentVerificationResponse, EsewaVerificationRequest>({
      query: (verificationData) => ({
        url: 'esewa/verify',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),

    // Khalti payment verification
    verifyKhaltiPayment: builder.mutation<PaymentVerificationResponse, KhaltiVerificationRequest>({
      query: (verificationData) => ({
        url: 'khalti/verify',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),
  }),
})

// Export the API slice
// paymentApi is already exported above, no need to re-export

// Export hooks for usage in functional components
export const {
  useVerifyEsewaPaymentMutation,
  useVerifyKhaltiPaymentMutation,
} = paymentApi
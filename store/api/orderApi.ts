import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for order requests and responses
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderAddress {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone: string;
}

export interface OrderDiscount {
  id: string;
  code: string;
  amount: number;
}

export interface PaymentDetails {
  transactionId?: string;
  provider?: string;
  amount?: number;
  currency?: string;
  status?: string;
  referenceId?: string;
  metadata?: any;
}

export interface TimelineItem {
  status: string;
  date: string;
  description?: string;
  completed?: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  address: OrderAddress;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentDetails?: PaymentDetails;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "handover_to_courier";
  subtotal: number;
  shipping: number;
  discount?: OrderDiscount;
  total: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: TimelineItem[];
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
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
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // Get all orders
    getOrders: builder.query<Order[], void>({
      query: () => 'orders',
      providesTags: ['Order'],
    }),

    // Get order by ID
    getOrderById: builder.query<Order, string>({
      query: (id) =>{
        console.log(id)
        return `/new/orders/${id}`
      },
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Update order status (admin only)
    updateOrderStatus: builder.mutation<{ message: string }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/new/orders/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = orderApi
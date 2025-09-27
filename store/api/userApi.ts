import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for user requests and responses
interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  avatar?: string
  createdAt: string
}

interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  currentPassword?: string
  newPassword?: string
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
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
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  timeline: Array<{
    status: string
    date: string
    note?: string
  }>
  createdAt: string
}

interface Address {
  id: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  type: 'home' | 'office' | 'other'
  createdAt: string
}

interface CreateAddressRequest {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
  type?: 'home' | 'office' | 'other'
}

interface UpdateAddressRequest {
  fullName?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  isDefault?: boolean
  type?: 'home' | 'office' | 'other'
}

interface WishlistItem {
  _id: string
  product: {
    _id: string
    name: string
    slug: string
    price: number
    originalPrice?: number
    discountPrice?: number
    images: string[]
    category: string
    brand: string
    inStock: boolean
    stock: number
    rating: number
    reviewCount: number
    description: string
    tags: string[]
    isOnSale: boolean
    discount: number
  }
  addedAt: string
}

interface AddToWishlistRequest {
  productId: string
}

interface RemoveFromWishlistRequest {
  productId: string
}

interface NotificationPreferences {
  email: boolean
  marketing: boolean
  orderUpdates: boolean
  newProducts: boolean
  wishlistReminders: boolean
  priceDropAlerts: boolean
  stockAlerts: boolean
  reviewReminders: boolean
}

interface UpdateNotificationPreferencesRequest {
  preferences: NotificationPreferences
}

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/user/',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User', 'Order', 'Address', 'Wishlist', 'Notifications'],
  endpoints: (builder) => ({
    // User profile endpoints
    getUserMe: builder.query<User, void>({
      query: () => 'me',
      providesTags: ['User'],
    }),

    getUserProfile: builder.query<User, void>({
      query: () => 'profile',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<{ message: string }, UpdateProfileRequest>({
      query: (profileData) => ({
        url: 'profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // User orders endpoints
    getUserOrders: builder.query<Order[], void>({
      query: () => 'orders',
      providesTags: ['Order'],
    }),

    // User addresses endpoints
    getUserAddresses: builder.query<Address[], void>({
      query: () => 'addresses',
      providesTags: ['Address'],
    }),

    createUserAddress: builder.mutation<{ addressId: string; message: string }, CreateAddressRequest>({
      query: (addressData) => ({
        url: 'addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['Address'],
    }),

    getUserAddressById: builder.query<Address, string>({
      query: (id) => `addresses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Address', id }],
    }),

    updateUserAddress: builder.mutation<{ message: string }, { id: string; data: UpdateAddressRequest }>({
      query: ({ id, data }) => ({
        url: `addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Address', id }, 'Address'],
    }),

    deleteUserAddress: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

    // Wishlist endpoints
    getWishlist: builder.query<WishlistItem[], void>({
      query: () => 'wishlist',
      providesTags: ['Wishlist'],
    }),

    checkWishlistItem: builder.query<{ isInWishlist: boolean; wishlistItemId?: string }, string>({
      query: (productId) => `wishlist/check?productId=${productId}`,
      providesTags: (result, error, productId) => [{ type: 'Wishlist', id: productId }],
    }),

    addToWishlist: builder.mutation<{ message: string; item?: any }, AddToWishlistRequest>({
      query: (data) => ({
        url: 'wishlist',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wishlist'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // Optionally show success toast here
        } catch (error) {
          // Handle error
        }
      },
    }),

    removeFromWishlist: builder.mutation<{ message: string; removedItem?: any }, RemoveFromWishlistRequest>({
      query: (data) => ({
        url: 'wishlist',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Wishlist'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // Optionally show success toast here
        } catch (error) {
          // Handle error
        }
      },
    }),

    clearWishlist: builder.mutation<{ message: string; deletedCount?: number }, void>({
      query: () => ({
        url: 'wishlist/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // Optionally show success toast here
        } catch (error) {
          // Handle error
        }
      },
    }),

    // Notification preferences endpoints
    getNotificationPreferences: builder.query<{ preferences: NotificationPreferences }, void>({
      query: () => 'notifications',
      providesTags: ['Notifications'],
    }),

    updateNotificationPreferences: builder.mutation<{ message: string; preferences: NotificationPreferences }, UpdateNotificationPreferencesRequest>({
      query: (data) => ({
        url: 'notifications',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
})

// Export the API slice
export { userApi }

// Export hooks for usage in functional components
export const {
  useGetUserMeQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserOrdersQuery,
  useGetUserAddressesQuery,
  useCreateUserAddressMutation,
  useGetUserAddressByIdQuery,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
  useGetWishlistQuery,
  useCheckWishlistItemQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = userApi
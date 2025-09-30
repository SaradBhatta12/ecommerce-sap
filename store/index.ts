import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from './api/baseApi'
import { productsApi } from './api/productsApi'
import { userApi } from './api/userApi'
import { paymentApi } from './api/paymentApi'
import { utilityApi } from './api/utilityApi'
import { adminApi } from './api/adminApi'
import { locationApi } from './api/locationApi'
import { orderApi } from './api/orderApi'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [baseApi.reducerPath]: baseApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [utilityApi.reducerPath]: utilityApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(productsApi.middleware)
      .concat(userApi.middleware)
      .concat(paymentApi.middleware)
      .concat(utilityApi.middleware)
      .concat(adminApi.middleware)
      .concat(locationApi.middleware)
      .concat(orderApi.middleware)
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export hooks for usage in functional components




export {
  // Order API hooks
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from './api/orderApi'

export {
  // Products API hooks
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
} from './api/productsApi'

export {
  // User API hooks
  useGetUserProfileQuery,
  useGetUserMeQuery,
  useUpdateUserProfileMutation,
  useGetUserOrdersQuery,
  useGetUserAddressesQuery,
  useCreateUserAddressMutation,
  useGetUserAddressByIdQuery,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from './api/userApi'

export {
  // Payment API hooks
  useVerifyEsewaPaymentMutation,
  useVerifyKhaltiPaymentMutation,
} from './api/paymentApi'

export {
  // Utility API hooks
  useUploadFileMutation,
  useSeedDatabaseMutation,
  useValidateDiscountMutation,
  useApplyDiscountMutation,
  useCreateOrderMutation,
} from './api/utilityApi'

export {
  // Admin API hooks
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
} from './api/adminApi'

export {
  // Location API hooks
  useGetLocationTreeQuery,
  useGetLocationsByParentQuery,
  useGetLocationsByTypeQuery,
  useGetCountriesQuery,
  useGetProvincesByCountryQuery,
  useGetCitiesByProvinceQuery,
  useGetLandmarksByCityQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useExportLocationsMutation,
  useImportLocationsMutation,
} from './api/locationApi'

// Export cart actions and selectors
export {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartIsOpen,
  selectCartItemById,
} from './slices/cartSlice'

// Export wishlist actions and selectors
export {
  setWishlistItems,
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  clearWishlist,
  setLoading as setWishlistLoading,
  selectWishlistItems,
  selectWishlistTotalItems,
  selectWishlistLoading,
  selectIsInWishlist,
} from './slices/wishlistSlice'


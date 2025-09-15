'use client'

import { Provider } from 'react-redux'
import { store } from './index'

interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>
}

// Export store for use in other parts of the application
export { store }
export type { RootState, AppDispatch } from './index'

// Re-export all hooks for easy importing
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
  
  // Payment API hooks
  useVerifyEsewaPaymentMutation,
  useVerifyKhaltiPaymentMutation,
  
  // Utility API hooks
  useUploadFileMutation,
  useSeedDatabaseMutation,
  useValidateDiscountMutation,
  useApplyDiscountMutation,
  useCreateOrderMutation,
  


} from './index'
import { configureStore, UnknownAction } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import { baseApi } from './api/baseApi'

export const store = configureStore({
     reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
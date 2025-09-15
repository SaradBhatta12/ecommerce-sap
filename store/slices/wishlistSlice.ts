import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  addedAt: string
}

export interface WishlistState {
  items: WishlistItem[]
  totalItems: number
  isLoading: boolean
}

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  isLoading: false,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload
      state.totalItems = action.payload.length
    },

    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      )

      if (!existingItem) {
        state.items.push(action.payload)
        state.totalItems = state.items.length
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      )
      state.totalItems = state.items.length
    },

    clearWishlist: (state) => {
      state.items = []
      state.totalItems = 0
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setWishlistItems,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setLoading,
} = wishlistSlice.actions

export default wishlistSlice.reducer

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items
export const selectWishlistTotalItems = (state: { wishlist: WishlistState }) => state.wishlist.totalItems
export const selectWishlistLoading = (state: { wishlist: WishlistState }) => state.wishlist.isLoading
export const selectIsInWishlist = (state: { wishlist: WishlistState }, productId: string) => 
  state.wishlist.items.some(item => item.productId === productId)
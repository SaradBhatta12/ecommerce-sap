import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isOpen: boolean
}

// Load cart from localStorage if available
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        return JSON.parse(savedCart)
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e)
      }
    }
  }
  return []
}

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items))
  }
}

const initialState: CartState = {
  items: loadCartFromStorage(),
  totalItems: 0,
  totalAmount: 0,
  isOpen: false,
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, quantity } = action.payload
      const existingItem = state.items.find((item) => item.id === id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push(action.payload)
      }

      cartSlice.caseReducers.calculateTotals(state)
      saveCartToStorage(state.items)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      cartSlice.caseReducers.calculateTotals(state)
      saveCartToStorage(state.items)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)

      if (item) {
        item.quantity = quantity
      }

      cartSlice.caseReducers.calculateTotals(state)
      saveCartToStorage(state.items)
    },
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalAmount = 0
      saveCartToStorage(state.items)
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    },
    calculateTotals: (state) => {
      // Calculate total items with validation
      state.totalItems = state.items.reduce((total, item) => {
        const itemQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 0;
        return total + itemQuantity;
      }, 0);
      
      // Calculate total amount with validation and proper rounding
      state.totalAmount = Math.round(
        state.items.reduce((total, item) => {
          const itemPrice = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
          const itemQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 0;
          return total + (itemPrice * itemQuantity);
        }, 0) * 100
      ) / 100;
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart, calculateTotals } = cartSlice.actions

export default cartSlice.reducer

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartTotalItems = (state: { cart: CartState }) => state.cart.totalItems
export const selectCartTotalAmount = (state: { cart: CartState }) => state.cart.totalAmount
export const selectCartIsOpen = (state: { cart: CartState }) => state.cart.isOpen
export const selectCartItemById = (state: { cart: CartState }, id: string) =>
  state.cart.items.find((item) => item.id === id)
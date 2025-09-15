// User types
export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface UserAddress {
  _id?: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

// Product types
export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: Category | string
  brand: Brand | string
  inventory: number
  isFeatured: boolean
  isOnSale: boolean
  rating: number
  numReviews: number
  specifications: Record<string, string>
  variants?: ProductVariant[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  // 2035 features
  arModel?: string
  vrExperience?: string
  holographicPreview?: boolean
  sustainabilityScore?: number
  digitalTwin?: boolean
  customizationOptions?: CustomizationOption[]
}

export interface ProductVariant {
  _id?: string
  name: string
  options: string[]
}

export interface CustomizationOption {
  _id?: string
  name: string
  options: {
    name: string
    price: number
  }[]
}

// Category types
export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Category | string | null
  order?: number
  productCount?: number
  createdAt: Date
  updatedAt: Date
}

// Brand types
export interface Brand {
  _id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  productCount?: number
  createdAt: Date
  updatedAt: Date
}

// Order types
export interface Order {
  _id: string
  orderNumber: string
  user: User | string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount?: {
    id: string
    code: string
    type: "percentage" | "fixed"
    value: number
    discountAmount: number
  }
  shippingAddress: UserAddress
  billingAddress?: UserAddress
  paymentMethod: "cod" | "esewa" | "khalti" | "card"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentDetails?: {
    transactionId: string
    provider: string
    amount: number
    date: Date
  }
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  timeline: OrderTimeline[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  product: Product | string
  name: string
  price: number
  quantity: number
  image: string
  variant?: {
    name: string
    value: string
  }
  customizations?: {
    name: string
    value: string
    price: number
  }[]
}

export interface OrderTimeline {
  status: string
  date: Date
  description: string
}

// Discount types
export interface Discount {
  _id: string
  code: string
  description?: string
  type: "percentage" | "fixed"
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  isActive: boolean
  usageLimit?: number
  usageCount: number
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Wishlist types
export interface WishlistItem {
  _id: string
  user: User | string
  product: Product | string
  createdAt: Date
}

// Review types
export interface Review {
  _id: string
  user: User | string
  product: Product | string
  rating: number
  title: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpfulVotes: number
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message?: string
  data?: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Stats and Analytics types
export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
}

export interface AnalyticsData {
  name: string
  total?: number
  revenue?: number
  orders?: number
  customers?: number
}

export interface RecentSale {
  id: string
  customer: {
    name: string
    email: string
    initials: string
  }
  amount: number
  date: Date
}

// Theme type
export type Theme = "light" | "dark" | "system"

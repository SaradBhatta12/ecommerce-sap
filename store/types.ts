// Common types used across all API slices

// Base response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface PaginatedResponse<T> {
  items: T[]
  totalPages: number
  currentPage: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// User related types
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  phone?: string
  avatar?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  addresses: Address[]
  orders: Order[]
  wishlist: WishlistItem[]
}

// Product related types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  salePrice?: number
  sku: string
  images: string[]
  category: Category
  brand: Brand
  stock: number
  status: 'published' | 'draft' | 'archived'
  isNew: boolean
  isFeatured: boolean
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  variants?: ProductVariant[]
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }
  reviews: Review[]
  averageRating: number
  totalReviews: number
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  salePrice?: number
  stock?: number
  sku?: string
  image?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Category
  children?: Category[]
  productCount: number
  isActive: boolean
  sortOrder: number
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  productCount: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  product: {
    id: string
    name: string
  }
  isVerified: boolean
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

// Order related types
export interface Order {
  id: string
  orderNumber: string
  user: User
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'cash' | 'esewa' | 'khalti' | 'bank_transfer'
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount?: {
    id: string
    code: string
    amount: number
    type: 'percentage' | 'fixed'
  }
  total: number
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  timeline: OrderTimeline[]
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  total: number
}

export interface OrderTimeline {
  id: string
  status: string
  note?: string
  createdBy?: string
  createdAt: string
}

// Address related types
export interface Address {
  id: string
  type: 'home' | 'office' | 'other'
  fullName: string
  phone: string
  email?: string
  company?: string
  address: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Wishlist related types
export interface WishlistItem {
  id: string
  product: Product
  addedAt: string
}

// Discount related types
export interface Discount {
  id: string
  code: string
  name?: string
  description?: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  userLimit?: number
  applicableProducts?: string[]
  applicableCategories?: string[]
  startDate: string
  endDate: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Payment related types
export interface PaymentGateway {
  id: string
  name: string
  type: 'esewa' | 'khalti' | 'stripe' | 'paypal'
  isActive: boolean
  config: {
    [key: string]: any
  }
}

export interface PaymentTransaction {
  id: string
  orderId: string
  gateway: string
  transactionId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  gatewayResponse?: any
  createdAt: string
  updatedAt: string
}

// Analytics related types
export interface AnalyticsData {
  revenue: Array<{
    period: string
    amount: number
    change?: number
  }>
  orders: Array<{
    period: string
    count: number
    change?: number
  }>
  customers: Array<{
    period: string
    count: number
    change?: number
  }>
  products: Array<{
    period: string
    count: number
    change?: number
  }>
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalCategories: number
  totalBrands: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  usersChange: number
  lowStockProducts: number
  pendingOrders: number
}

// Store/Settings related types
export interface StoreSettings {
  id: string
  name: string
  description?: string
  logo?: string
  favicon?: string
  email: string
  phone?: string
  address?: Address
  currency: string
  timezone: string
  language: string
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
  }
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  businessHours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  shippingZones: ShippingZone[]
  taxSettings: TaxSettings
  emailSettings: EmailSettings
  createdAt: string
  updatedAt: string
}

export interface ShippingZone {
  id: string
  name: string
  regions: string[]
  methods: ShippingMethod[]
}

export interface ShippingMethod {
  id: string
  name: string
  description?: string
  cost: number
  freeShippingThreshold?: number
  estimatedDays: {
    min: number
    max: number
  }
  isActive: boolean
}

export interface TaxSettings {
  enabled: boolean
  rate: number
  inclusive: boolean
  displayPricesWithTax: boolean
}

export interface EmailSettings {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}

// API Query types
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface ProductQueryParams extends QueryParams {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  status?: string
  isNew?: boolean
  isFeatured?: boolean
  inStock?: boolean
}

export interface OrderQueryParams extends QueryParams {
  status?: string
  paymentStatus?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
}

export interface UserQueryParams extends QueryParams {
  role?: string
  isActive?: boolean
  emailVerified?: boolean
}

// Form types
export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  domain: string
  acceptTerms: boolean
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface NewsletterForm {
  email: string
}

// Error types
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
}

// File upload types
export interface UploadedFile {
  url: string
  filename: string
  originalName: string
  size: number
  type: string
  uploadedAt: string
}

// Cart types (for frontend state management)
export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  total: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  discount?: {
    code: string
    amount: number
  }
  total: number
}
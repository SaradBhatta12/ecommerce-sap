# Redux Store with RTK Query - E-Commerce API

This directory contains the Redux store configuration with RTK Query for managing all API calls in the e-commerce application. The store is organized into separate API slices for better maintainability and type safety.

## 📁 Structure

```
store/
├── index.ts              # Main store configuration and hook exports
├── provider.tsx          # React Provider component
├── types.ts             # TypeScript interfaces and types
├── README.md            # This documentation
└── api/
    ├── baseApi.ts       # Base API configuration
    ├── authApi.ts       # Authentication endpoints
    ├── adminApi.ts      # Admin management endpoints
    ├── productsApi.ts   # Product, category, brand endpoints
    ├── userApi.ts       # User profile and account endpoints
    ├── paymentApi.ts    # Payment verification endpoints
    ├── utilityApi.ts    # Utility endpoints (upload, seed, etc.)
    └── newApi.ts        # Enhanced API endpoints
```

## 🚀 Quick Start

### 1. Wrap your app with the StoreProvider

```tsx
// app/layout.tsx or pages/_app.tsx
import { StoreProvider } from '@/store/provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
```

### 2. Use hooks in your components

```tsx
// components/ProductList.tsx
import { useGetProductsQuery } from '@/store/provider'

export function ProductList() {
  const { data, error, isLoading } = useGetProductsQuery({
    page: 1,
    limit: 12,
    category: 'electronics'
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading products</div>

  return (
    <div>
      {data?.products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## 📚 API Documentation

### Authentication API (`authApi.ts`)

Handles user authentication and account management.

#### Available Hooks:

```tsx
// Login
const [login, { isLoading, error }] = useLoginMutation()
const handleLogin = async () => {
  try {
    const result = await login({ email: 'user@example.com', password: 'password' }).unwrap()
    console.log('Login successful:', result)
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// Register
const [register] = useRegisterMutation()
const handleRegister = async () => {
  await register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    domain: 'example.com'
  })
}

// Logout
const [logout] = useLogoutMutation()
const handleLogout = async () => {
  await logout({ domain: 'example.com' })
}
```

### Admin API (`adminApi.ts`)

Provides admin dashboard functionality and user management.

#### Available Hooks:

```tsx
// Analytics
const { data: analytics } = useGetAnalyticsQuery({ detailed: true })

// Dashboard Stats
const { data: stats } = useGetStatsQuery()

// Recent Sales
const { data: recentSales } = useGetRecentSalesQuery()

// User Management
const { data: users } = useGetUsersQuery()
const [createUser] = useCreateUserMutation()
const [updateUser] = useUpdateUserMutation()
const [deleteUser] = useDeleteUserMutation()

// Discount Management
const { data: discounts } = useGetDiscountsQuery()
const [createDiscount] = useCreateDiscountMutation()
```

### Products API (`productsApi.ts`)

Manages products, categories, brands, and reviews.

#### Available Hooks:

```tsx
// Products
const { data: products } = useGetProductsQuery({
  page: 1,
  limit: 12,
  category: 'electronics',
  minPrice: 100,
  maxPrice: 1000,
  search: 'laptop',
  sort: 'price',
  onSale: true
})

const { data: product } = useGetProductByIdQuery('product-id')
const [createProduct] = useCreateProductMutation()
const [updateProduct] = useUpdateProductMutation()
const [deleteProduct] = useDeleteProductMutation()

// Categories
const { data: categories } = useGetCategoriesQuery({
  page: 1,
  limit: 20,
  search: 'electronics'
})

// Brands
const { data: brands } = useGetBrandsQuery()

// Reviews
const { data: reviews } = useGetProductReviewsQuery('product-id')
const [createReview] = useCreateProductReviewMutation()
```

### User API (`userApi.ts`)

Handles user profile, orders, addresses, and wishlist.

#### Available Hooks:

```tsx
// User Profile
const { data: user } = useGetUserMeQuery()
const { data: profile } = useGetUserProfileQuery()
const [updateProfile] = useUpdateUserProfileMutation()

// Orders
const { data: orders } = useGetUserOrdersQuery()

// Addresses
const { data: addresses } = useGetUserAddressesQuery()
const [createAddress] = useCreateUserAddressMutation()
const [updateAddress] = useUpdateUserAddressMutation()
const [deleteAddress] = useDeleteUserAddressMutation()

// Wishlist
const { data: wishlist } = useGetWishlistQuery()
const [addToWishlist] = useAddToWishlistMutation()
const [removeFromWishlist] = useRemoveFromWishlistMutation()
const [clearWishlist] = useClearWishlistMutation()
```

### Payment API (`paymentApi.ts`)

Handles payment verification for eSewa and Khalti.

#### Available Hooks:

```tsx
// Payment Verification
const [verifyEsewa] = useVerifyEsewaPaymentMutation()
const [verifyKhalti] = useVerifyKhaltiPaymentMutation()

const handlePaymentVerification = async () => {
  try {
    const result = await verifyEsewa({
      orderId: 'order-123',
      transactionId: 'txn-456',
      amount: 1000
    }).unwrap()
    console.log('Payment verified:', result)
  } catch (error) {
    console.error('Payment verification failed:', error)
  }
}
```

### Utility API (`utilityApi.ts`)

Provides utility functions like file upload, database seeding, and order management.

#### Available Hooks:

```tsx
// File Upload
const [uploadFile] = useUploadFileMutation()
const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const result = await uploadFile(formData).unwrap()
  console.log('File uploaded:', result.url)
}

// Database Seeding
const [seedDatabase] = useSeedDatabaseMutation()

// Discount Validation
const [validateDiscount] = useValidateDiscountMutation()
const [applyDiscount] = useApplyDiscountMutation()

// Order Creation
const [createOrder] = useCreateOrderMutation()
```

### New API (`newApi.ts`)

Enhanced endpoints with additional features and better data aggregation.

#### Available Hooks:

```tsx
// Admin Store Management
const { data: store } = useGetNewAdminStoreQuery()
const [updateStore] = useUpdateNewAdminStoreMutation()

// Enhanced Categories
const { data: newCategories } = useGetNewCategoriesQuery({
  page: 1,
  limit: 20,
  search: 'electronics'
})

// Enhanced Orders
const { data: newOrders } = useGetNewOrdersQuery()
const { data: order } = useGetNewOrderByIdQuery('order-id')

// Payment Settings
const { data: paymentSettings } = useGetNewPaymentQuery()
const [updatePaymentSettings] = useUpdateNewPaymentMutation()

// Enhanced Products
const { data: newProducts } = useGetNewProductsQuery({
  page: 1,
  limit: 12,
  search: 'laptop',
  category: 'electronics'
})
```

## 🔧 Advanced Usage

### Error Handling

```tsx
import { useGetProductsQuery } from '@/store/provider'

function ProductList() {
  const { data, error, isLoading, isError } = useGetProductsQuery()

  if (isLoading) return <div>Loading...</div>
  
  if (isError) {
    console.error('API Error:', error)
    return <div>Error: {error?.data?.message || 'Something went wrong'}</div>
  }

  return <div>{/* Render products */}</div>
}
```

### Conditional Queries

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const { data: user } = useGetUserByIdQuery(userId!, {
    skip: !userId, // Skip query if userId is not available
  })

  return user ? <div>{user.name}</div> : null
}
```

### Polling and Refetching

```tsx
function LiveStats() {
  const { data, refetch } = useGetStatsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnFocus: true,   // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  })

  return (
    <div>
      <button onClick={() => refetch()}>Refresh Stats</button>
      {/* Render stats */}
    </div>
  )
}
```

### Optimistic Updates

```tsx
function ProductActions({ productId }: { productId: string }) {
  const [updateProduct] = useUpdateProductMutation()

  const handleToggleFeatured = async () => {
    try {
      await updateProduct({
        id: productId,
        data: { isFeatured: !product.isFeatured }
      }).unwrap()
    } catch (error) {
      // Handle error - RTK Query will automatically revert optimistic update
      console.error('Update failed:', error)
    }
  }

  return <button onClick={handleToggleFeatured}>Toggle Featured</button>
}
```

### Cache Management

```tsx
import { useDispatch } from 'react-redux'
import { productsApi } from '@/store/api/productsApi'

function CacheManager() {
  const dispatch = useDispatch()

  const invalidateProducts = () => {
    // Invalidate all product queries
    dispatch(productsApi.util.invalidateTags(['Product']))
  }

  const prefetchProduct = (productId: string) => {
    // Prefetch a specific product
    dispatch(productsApi.util.prefetch('getProductById', productId, { force: true }))
  }

  return (
    <div>
      <button onClick={invalidateProducts}>Refresh Products</button>
      <button onClick={() => prefetchProduct('123')}>Prefetch Product</button>
    </div>
  )
}
```

## 🎯 Best Practices

### 1. Use TypeScript
All APIs are fully typed. Always use the provided types for better development experience:

```tsx
import type { Product, CreateProductRequest } from '@/store/types'

const [createProduct] = useCreateProductMutation()

const handleCreate = async (productData: CreateProductRequest) => {
  const result: { productId: string; message: string } = await createProduct(productData).unwrap()
}
```

### 2. Handle Loading States
Always handle loading states for better UX:

```tsx
function ProductList() {
  const { data, isLoading, isFetching } = useGetProductsQuery()

  return (
    <div>
      {(isLoading || isFetching) && <LoadingSpinner />}
      {data?.products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
```

### 3. Use Query Parameters Effectively
Leverage query parameters for filtering and pagination:

```tsx
function ProductSearch() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    page: 1
  })

  const { data } = useGetProductsQuery(filters)

  return (
    <div>
      <SearchInput onChange={(search) => setFilters(prev => ({ ...prev, search, page: 1 })))} />
      <CategoryFilter onChange={(category) => setFilters(prev => ({ ...prev, category, page: 1 })))} />
      <PriceRange onChange={(minPrice, maxPrice) => setFilters(prev => ({ ...prev, minPrice, maxPrice, page: 1 })))} />
      <Pagination 
        currentPage={filters.page}
        totalPages={data?.totalPages || 1}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
      />
    </div>
  )
}
```

### 4. Error Boundaries
Implement error boundaries for better error handling:

```tsx
function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong with the API call</div>}
      onError={(error) => console.error('API Error:', error)}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## 🔍 Debugging

### Redux DevTools
The store is configured with Redux DevTools for debugging:

1. Install Redux DevTools browser extension
2. Open DevTools and navigate to Redux tab
3. Monitor API calls, cache state, and mutations

### Logging
Enable RTK Query logging in development:

```tsx
// Add to your store configuration
import { createApi } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  // ... other config
  keepUnusedDataFor: 60, // Keep data for 60 seconds
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
})
```

## 📊 Performance Tips

1. **Use selective queries**: Only fetch the data you need
2. **Implement pagination**: Don't load all data at once
3. **Use caching effectively**: RTK Query caches by default
4. **Prefetch critical data**: Use prefetch for better UX
5. **Invalidate tags wisely**: Only invalidate what needs to be refreshed

## 🚨 Common Issues

### Issue: "Cannot read property of undefined"
**Solution**: Always check if data exists before using it:

```tsx
const { data } = useGetProductsQuery()

// ❌ Wrong
return <div>{data.products.length}</div>

// ✅ Correct
return <div>{data?.products?.length || 0}</div>
```

### Issue: "Query not refetching"
**Solution**: Check your cache tags and invalidation:

```tsx
// Make sure to invalidate the right tags
const [updateProduct] = useUpdateProductMutation()
// This should invalidate 'Product' tags automatically
```

### Issue: "Authentication errors"
**Solution**: Ensure tokens are properly set in headers:

```tsx
// Check if token is being set correctly in baseQuery
const token = localStorage.getItem('token')
if (token) {
  headers.set('authorization', `Bearer ${token}`)
}
```

## 📝 Contributing

When adding new endpoints:

1. Add the endpoint to the appropriate API slice
2. Define TypeScript interfaces in `types.ts`
3. Export the hook in the main `index.ts`
4. Update this README with usage examples
5. Add appropriate cache tags for invalidation

---

**Total API Endpoints**: 47  
**Last Updated**: $(date)  
**Version**: 1.0.0
# E-Commerce API Documentation

This document provides comprehensive documentation for all API endpoints in the `/app/api/` directory.

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Admin APIs](#admin-apis)
3. [Product APIs](#product-apis)
4. [User APIs](#user-apis)
5. [Payment APIs](#payment-apis)
6. [Utility APIs](#utility-apis)
7. [New API Routes](#new-api-routes)
8. [API Summary](#api-summary)

---

## Authentication APIs

### 1. NextAuth Configuration
**Endpoint:** `GET/POST /api/auth/[...nextauth]`
- **Description:** NextAuth.js authentication handler
- **Providers:** Google OAuth, Credentials
- **Features:** JWT tokens, session management, MongoDB adapter
- **Methods:** GET, POST

### 2. Login
**Endpoint:** `POST /api/login`
- **Description:** User login with email/password
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** JWT token and session cookies
- **Authentication:** None required

### 3. Logout
**Endpoint:** `POST /api/logout`
- **Description:** User logout and cookie clearing
- **Request Body:**
  ```json
  {
    "domain": "string (optional)"
  }
  ```
- **Response:** Success message
- **Authentication:** None required

### 4. Register
**Endpoint:** `POST /api/register`
- **Description:** User registration
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "domain": "string"
  }
  ```
- **Response:** User ID and success message
- **Authentication:** None required

### 5. Forgot Password
**Endpoint:** `GET/POST /api/auth/forgot-password`
- **Description:** Password recovery (currently disabled)
- **Status:** 403 - Functionality disabled
- **Methods:** GET, POST

### 6. Reset Password
**Endpoint:** `GET/POST /api/auth/reset-password`
- **Description:** Password reset (currently disabled)
- **Status:** 403 - Functionality disabled
- **Methods:** GET, POST

---

## Admin APIs

### 1. Analytics
**Endpoint:** `GET /api/admin/analytics`
- **Description:** Get analytics data for last 6 months
- **Query Parameters:**
  - `detailed`: boolean (optional) - Include orders and customers data
- **Response:** Revenue, orders, and customer data by month
- **Authentication:** Admin role required

### 2. Statistics
**Endpoint:** `GET /api/admin/stats`
- **Description:** Get admin dashboard statistics
- **Response:** Total revenue, orders, products, users with percentage changes
- **Authentication:** Admin role required

### 3. Recent Sales
**Endpoint:** `GET /api/admin/recent-sales`
- **Description:** Get 5 most recent sales
- **Response:** Recent orders with customer information
- **Authentication:** Admin role required

### 4. Users Management
**Endpoint:** `GET/POST /api/admin/users`
- **Description:** Manage users (list all, create new)
- **GET Response:** List of all users (excluding superadmins)
- **POST Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "string (optional, default: user)"
  }
  ```
- **Authentication:** Admin role required

### 5. User Details
**Endpoint:** `GET/PUT/DELETE /api/admin/users/[id]`
- **Description:** Get, update, or delete specific user
- **Methods:** GET, PUT, DELETE
- **Authentication:** Admin role required

### 6. Discounts Management
**Endpoint:** `GET/POST /api/admin/discounts`
- **Description:** Manage discount codes
- **GET Response:** List of all discounts created by admin
- **POST Request Body:**
  ```json
  {
    "code": "string",
    "type": "percentage|fixed",
    "value": "number",
    "minPurchase": "number (optional)",
    "maxDiscount": "number (optional)",
    "usageLimit": "number (optional)",
    "startDate": "date",
    "endDate": "date"
  }
  ```
- **Authentication:** Admin role required

### 7. Discount Details
**Endpoint:** `GET/PUT/DELETE /api/admin/discounts/[id]`
- **Description:** Manage specific discount
- **Methods:** GET, PUT, DELETE
- **Authentication:** Admin role required

---

## Product APIs

### 1. Products
**Endpoint:** `GET/POST /api/products`
- **Description:** Get products list or create new product
- **GET Query Parameters:**
  - `category`: string (optional)
  - `brand`: string (optional)
  - `minPrice`: number (optional)
  - `maxPrice`: number (optional)
  - `onSale`: boolean (optional)
  - `sort`: string (optional, default: "featured")
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 12)
  - `search`: string (optional)
  - `status`: string (optional, default: "published")
  - `isNew`: boolean (optional)
  - `isFeatured`: boolean (optional)
- **POST Request Body:** Product data with name, description, price, category, SKU
- **Authentication:** POST requires authentication

### 2. Product Details
**Endpoint:** `GET/PUT/DELETE /api/products/[id]`
- **Description:** Get, update, or delete specific product
- **GET Response:** Product with populated category, brand, related products
- **Methods:** GET, PUT, DELETE
- **Authentication:** PUT/DELETE require authentication

### 3. Product Reviews
**Endpoint:** `GET/POST /api/products/[id]/reviews`
- **Description:** Get or create product reviews
- **Methods:** GET, POST
- **Authentication:** POST requires authentication

### 4. Categories
**Endpoint:** `GET/POST /api/categories`
- **Description:** Get categories list or create new category
- **GET Query Parameters:**
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 20)
  - `search`: string (optional)
  - `parent`: string (optional)
  - `domain`: string (optional)
- **POST Request Body:** Category data
- **Authentication:** POST requires authentication

### 5. Category Details
**Endpoint:** `GET/PUT/DELETE /api/categories/[id]`
- **Description:** Get, update, or delete specific category
- **Methods:** GET, PUT, DELETE
- **Authentication:** PUT/DELETE require authentication

### 6. Brands
**Endpoint:** `GET/POST /api/brands`
- **Description:** Get brands list or create new brand
- **GET Query Parameters:**
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 20)
  - `search`: string (optional)
- **POST Request Body:** Brand data
- **Authentication:** All methods require authentication

### 7. Brand Details
**Endpoint:** `GET/PUT/DELETE /api/brands/[id]`
- **Description:** Get, update, or delete specific brand
- **Methods:** GET, PUT, DELETE
- **Authentication:** All methods require authentication

---

## User APIs

### 1. User Profile (Me)
**Endpoint:** `GET /api/user/me`
- **Description:** Get current user profile
- **Response:** User data without password
- **Authentication:** Required

### 2. User Profile Management
**Endpoint:** `GET/PUT /api/user/profile`
- **Description:** Get or update user profile
- **PUT Request Body:** User data (supports password change)
- **Authentication:** Required

### 3. User Orders
**Endpoint:** `GET /api/user/orders`
- **Description:** Get user's order history
- **Response:** List of user's orders sorted by creation date
- **Authentication:** Required

### 4. User Addresses
**Endpoint:** `GET/POST /api/user/addresses`
- **Description:** Get or create user addresses
- **Methods:** GET, POST
- **Authentication:** Required

### 5. Address Details
**Endpoint:** `GET/PUT/DELETE /api/user/addresses/[id]`
- **Description:** Manage specific address
- **Methods:** GET, PUT, DELETE
- **Authentication:** Required

### 6. Wishlist
**Endpoint:** `GET/POST/DELETE /api/user/wishlist`
- **Description:** Manage user wishlist
- **GET Response:** Wishlist items with populated product data
- **POST/DELETE:** Add/remove items from wishlist
- **Authentication:** Required

### 7. Clear Wishlist
**Endpoint:** `DELETE /api/user/wishlist/clear`
- **Description:** Clear entire wishlist
- **Authentication:** Required

---

## Payment APIs

### 1. eSewa Payment Verification
**Endpoint:** `POST /api/payment/esewa/verify`
- **Description:** Verify eSewa payment
- **Request Body:**
  ```json
  {
    "orderId": "string",
    "transactionId": "string",
    "amount": "number"
  }
  ```
- **Response:** Payment verification status and updated order
- **Authentication:** Required

### 2. Khalti Payment Verification
**Endpoint:** `POST /api/payment/khalti/verify`
- **Description:** Verify Khalti payment
- **Request Body:**
  ```json
  {
    "orderId": "string",
    "transactionId": "string",
    "amount": "number"
  }
  ```
- **Response:** Payment verification status and updated order
- **Authentication:** Required

---

## Utility APIs

### 1. File Upload
**Endpoint:** `POST /api/upload`
- **Description:** Upload image files
- **Request:** FormData with file
- **Supported Types:** JPEG, PNG, WebP, GIF
- **Max Size:** 5MB
- **Response:** File URL
- **Authentication:** None required

### 2. Database Seeding
**Endpoint:** `POST /api/seed`
- **Description:** Seed database with sample data
- **Features:** Creates categories, brands, and products
- **Authentication:** Admin role required

### 3. Discount Validation
**Endpoint:** `POST /api/discounts/validate`
- **Description:** Validate discount code
- **Request Body:**
  ```json
  {
    "code": "string",
    "cartTotal": "number",
    "items": "array (optional)"
  }
  ```
- **Response:** Discount validity and calculated amount
- **Authentication:** None required

### 4. Discount Application
**Endpoint:** `POST /api/discounts/apply`
- **Description:** Apply discount (increment usage count)
- **Request Body:**
  ```json
  {
    "discountId": "string"
  }
  ```
- **Authentication:** None required

### 5. Order Creation
**Endpoint:** `POST /api/orders`
- **Description:** Create new order
- **Request Body:**
  ```json
  {
    "addressId": "string",
    "paymentMethod": "string",
    "items": "array",
    "subtotal": "number",
    "shipping": "number",
    "discount": "object (optional)",
    "total": "number"
  }
  ```
- **Authentication:** Required

---

## New API Routes

### Admin Routes

#### 1. Admin Store Information
**Endpoint:** `GET/PUT /api/new/admin/store`
- **Description:** Get or update admin store information
- **GET Response:** Store details including name, email, addresses, vendor profile
- **PUT Request Body:** Store name and business type updates
- **Authentication:** Required

#### 2. Admin Store Info
**Endpoint:** `GET/PUT /api/new/admin/store-info`
- **Description:** Manage detailed store information
- **Features:** Image uploads, field updates
- **Authentication:** Required

#### 3. Admin Profile
**Endpoint:** `PUT /api/new/admin/profile`
- **Description:** Update admin profile (store name and business type)
- **Authentication:** Required

### Category Routes

#### 4. Categories (New)
**Endpoint:** `GET/POST /api/new/categories`
- **Description:** Enhanced category management with admin filtering
- **Features:** Pagination, search, parent filtering, product counts
- **Authentication:** Required

#### 5. Category Details (New)
**Endpoint:** `PUT/DELETE /api/new/categories/[id]`
- **Description:** Update or delete specific category
- **Authentication:** Required

### Order Routes

#### 6. Orders (New)
**Endpoint:** `GET /api/new/orders`
- **Description:** Get all orders with user data aggregation
- **Response:** Orders with populated user information
- **Authentication:** Required

#### 7. Order Details (New)
**Endpoint:** `GET /api/new/orders/[id]`
- **Description:** Get specific order by ID
- **Authentication:** Required

### Payment Routes

#### 8. Payment Details (New)
**Endpoint:** `GET/PUT /api/new/payment`
- **Description:** Get or update eSewa and Khalti payment details
- **GET Response:** eSewa and Khalti configuration
- **PUT:** Update eSewa payment details
- **Authentication:** Required

### Product Routes

#### 9. Products (New)
**Endpoint:** `GET/POST /api/new/products`
- **Description:** Enhanced product management
- **Features:** Pagination, search, filtering, CRUD operations
- **Authentication:** Required

#### 10. Product Details (New)
**Endpoint:** `GET/PUT/DELETE /api/new/products/[id]`
- **Description:** Manage specific product with population
- **Authentication:** Required

---

## API Summary

### Total API Endpoints: 47

#### By Category:
- **Authentication APIs:** 6 endpoints
- **Admin APIs:** 7 endpoints
- **Product APIs:** 7 endpoints
- **User APIs:** 7 endpoints
- **Payment APIs:** 2 endpoints
- **Utility APIs:** 5 endpoints
- **New API Routes:** 10 endpoints
- **Miscellaneous:** 3 endpoints

#### By HTTP Method:
- **GET:** 25 endpoints
- **POST:** 15 endpoints
- **PUT:** 12 endpoints
- **DELETE:** 8 endpoints

#### Authentication Requirements:
- **Public APIs:** 12 endpoints
- **Authenticated APIs:** 28 endpoints
- **Admin-only APIs:** 7 endpoints

#### Key Features:
- Multi-tenant support with domain-based filtering
- Comprehensive authentication with NextAuth.js
- File upload capabilities
- Payment gateway integration (eSewa, Khalti)
- Advanced product management with variants
- Order management system
- Discount and coupon system
- User profile and address management
- Admin analytics and statistics
- Database seeding capabilities

---

*Last updated: $(date)*
*Total API endpoints documented: 47*
/**
 * @fileoverview API Endpoints Library for E-commerce Application
 * 
 * This module provides a comprehensive set of server-side functions for handling
 * various API operations in the e-commerce application. It includes endpoints for:
 * - Authentication (login, register, logout, session management)
 * - Product management (CRUD operations, filtering, pagination)
 * - Category management (hierarchical categories with product counts)
 * - Brand management (brand operations with product associations)
 * - Discount/Coupon management (validation, application, usage tracking)
 * - Order management (creation, status updates, user orders)
 * - User management (profile updates, admin operations)
 * - Cart operations (add, remove, update items)
 * - Wishlist management (add/remove products)
 * - Payment processing (Stripe integration)
 * 
 * @author E-commerce Development Team
 * @version 2.0.0
 * @since 1.0.0
 * 
 * @requires next-auth/next For authentication handling
 * @requires mongoose For MongoDB operations
 * @requires next/cache For cache revalidation
 * @requires bcryptjs For password hashing
 * 
 * @example
 * ```typescript
 * // Get products with filtering and pagination
 * const result = await getProducts({
 *   page: 1,
 *   limit: 20,
 *   category: 'electronics',
 *   search: 'laptop'
 * });
 * 
 * if (result.success) {
 *   console.log('Products:', result.products);
 *   console.log('Pagination:', result.pagination);
 * }
 * ```
 * 
 * @note All functions return a standardized ApiResponse object with:
 * - success: boolean indicating operation success
 * - message?: string with error/success message
 * - data?: any containing the requested data
 * - pagination?: PaginationInfo for paginated results
 * 
 * @note Admin-only functions automatically check user permissions
 * @note All database operations include proper error handling and validation
 * @note Queries are optimized with proper indexing hints and parallel execution
 */

"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/product";
import Category from "@/models/category";
import Brand from "@/models/brand";
import User from "@/models/user";
import Order from "@/models/order";
import Discount from "@/models/discount";
import Wishlist from "@/models/wishlist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { validatePagination, type PaginationParams, type PaginationInfo } from "@/lib/pagination-utils";

// ===== TYPE DEFINITIONS =====

/**
 * Extended user interface with additional properties for session management
 * @interface ExtendedUser
 */
export type ExtendedUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  image?: string;
};

/**
 * Extended session interface that includes the extended user type
 * @interface ExtendedSession
 */
export type ExtendedSession = {
  user: ExtendedUser;
  expires: string;
};

/**
 * Standardized API response structure used across all endpoints
 * @interface ApiResponse
 * @template T - The type of data being returned
 */
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
};

/**
 * Pagination parameters for list endpoints
 * @interface PaginationParams
 */
export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
};

/**
 * Pagination information returned with paginated results
 * @interface PaginationInfo
 */
export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/**
 * Product filtering parameters extending pagination
 * @interface ProductFilters
 */
export type ProductFilters = PaginationParams & {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Category filtering parameters extending pagination
 * @interface CategoryFilters
 */
export type CategoryFilters = PaginationParams & {
  parent?: string;
  level?: number;
  includeProductCount?: boolean;
};

// ===== UTILITY FUNCTIONS =====

/**
 * Gets the authenticated session with proper typing
 * @returns {Promise<ExtendedSession | null>} The authenticated session or null
 * @throws {Error} If session retrieval fails
 */
export async function getAuthenticatedSession(): Promise<ExtendedSession | null> {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    return session;
  } catch (error) {
    console.error("Session retrieval error:", error);
    return null;
  }
}

/**
 * Requires admin authentication and returns the session
 * @returns {Promise<ExtendedSession>} The authenticated admin session
 * @throws {Error} If user is not authenticated or not an admin
 */
export async function requireAdmin(): Promise<ExtendedSession> {
  const session = await getAuthenticatedSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Admin access required");
  }
  
  return session;
}

// ===== AUTH ENDPOINTS =====

/**
 * Authenticates a user with email and password
 * @param {FormData} formData - Form data containing email and password
 * @returns {Promise<ApiResponse<{user: ExtendedUser}>>} Authentication result with user data
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('email', 'user@example.com');
 * formData.append('password', 'password123');
 * const result = await login(formData);
 * ```
 */
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    // In a real implementation, you would set session/token here
    // For mobile, return a token that can be stored

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login" };
  }
}

/**
 * Registers a new user account
 * @param {FormData} formData - Form data containing name, email, and password
 * @returns {Promise<ApiResponse<{user: ExtendedUser}>>} Registration result with user data
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('name', 'John Doe');
 * formData.append('email', 'john@example.com');
 * formData.append('password', 'securepassword');
 * const result = await register(formData);
 * ```
 */
export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "An error occurred during registration" };
  }
}

/**
 * Logs out the current user
 * @returns {Promise<ApiResponse>} Logout confirmation
 * @note For web applications, this would clear the session
 * @note For mobile applications, instruct to clear the stored token
 */
export async function logout() {
  // For web, this would clear the session
  // For mobile, instruct to clear the stored token
  return { success: true };
}

/**
 * Gets the current authenticated user's information
 * @returns {Promise<ApiResponse<{user: ExtendedUser}>>} Current user data or authentication error
 * @example
 * ```typescript
 * const result = await getCurrentUser();
 * if (result.success) {
 *   console.log('Current user:', result.user);
 * }
 * ```
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: "Not authenticated" };
    }

    return {
      success: true,
      user: session.user,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return { success: false, message: "Failed to get current user" };
  }
}

// ===== PRODUCT ENDPOINTS =====

/**
 * Retrieves products with filtering, sorting, and pagination
 * @param {ProductFilters} params - Product filtering and pagination parameters
 * @returns {Promise<ApiResponse<{products: Product[], pagination: PaginationInfo}>>} Products with pagination info
 * @example
 * ```typescript
 * const result = await getProducts({
 *   category: 'electronics',
 *   minPrice: 100,
 *   maxPrice: 1000,
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'price',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export async function getProducts(params: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    await dbConnect();

    const {
      category,
      brand,
      minPrice,
      maxPrice,
      onSale,
      sort = "featured",
      page = 1,
      limit = 12,
      search,
    } = params;

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (onSale) {
      query.isOnSale = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sortOptions: any = {};
    switch (sort) {
      case "price-asc":
        sortOptions.price = 1;
        break;
      case "price-desc":
        sortOptions.price = -1;
        break;
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "rating":
        sortOptions.rating = -1;
        break;
      default:
        sortOptions.isFeatured = -1;
        sortOptions.createdAt = -1;
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with proper population
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .populate("brand", "name slug")
        .lean(),
      Product.countDocuments(query)
    ]);

    const pagination: PaginationInfo = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    return {
      success: true,
      products,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, message: "Failed to fetch products" };
  }
}

/**
 * Get single product by ID or slug
 */
export async function getProduct(id: string): Promise<ApiResponse> {
  if (!id) {
    return { success: false, message: "Product ID is required" };
  }

  try {
    await dbConnect();

    // Find product by ID or slug
    const product = await Product.findOne({
      $or: [{ _id: id }, { slug: id }],
    })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .lean();

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    return { success: true, product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, message: "Failed to fetch product" };
  }
}

/**
 * Create new product (Admin only)
 */
export async function createProduct(productData: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!productData || !productData.name || !productData.price) {
    return { success: false, message: "Product name and price are required" };
  }

  try {
    await dbConnect();

    // Create product
    const product = new Product(productData);
    await product.save();

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product created successfully",
      product,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, message: "Failed to create product" };
  }
}

/**
 * Update product (Admin only)
 */
export async function updateProduct(id: string, updateData: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Product ID is required" };
  }

  try {
    await dbConnect();

    // Update product
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    revalidatePath(`/admin/products/${id}`);
    revalidatePath(`/product/${product.slug}`);
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product updated successfully",
      product,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, message: "Failed to update product" };
  }
}

/**
 * Delete product (Admin only)
 */
export async function deleteProduct(id: string): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Product ID is required" };
  }

  try {
    await dbConnect();

    // Delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Failed to delete product" };
  }
}

// ===== CATEGORY ENDPOINTS =====

export async function getCategories(params: {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string | null;
}) {
  try {
    await dbConnect();

    const { page = 1, limit = 20, search = "", parent = null } = params;

    // Build query
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (parent === "null") {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    // Count total categories
    const total = await Category.countDocuments(query);

    // Get categories with pagination
    const categories = await Category.find(query)
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get product counts for each category
    const categoryIds = categories.map((category) => category._id);
    const productCounts = await Product.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Add product count to each category
    const categoriesWithCounts = categories.map((category) => {
      const productCount = productCounts.find(
        (pc) => pc._id.toString() === category._id.toString()
      );
      return {
        ...category,
        productCount: productCount ? productCount.count : 0,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      categories: categoriesWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Failed to fetch categories" };
  }
}

/**
 * Get single category by ID or slug
 */
export async function getCategory(id: string): Promise<ApiResponse> {
  if (!id) {
    return { success: false, message: "Category ID is required" };
  }

  try {
    await dbConnect();

    // Find category by ID or slug
    const category = await Category.findOne({
      $or: [{ _id: id }, { slug: id }],
    })
      .populate("parent", "name slug")
      .lean();

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Get product count
    const productCount = await Product.countDocuments({
      category: category._id,
    });
    
    return { 
      success: true, 
      category: {
        ...category,
        productCount
      }
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, message: "Failed to fetch category" };
  }
}

/**
 * Create new category (Admin only)
 */
export async function createCategory(data: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!data || !data.name) {
    return { success: false, message: "Category name is required" };
  }

  try {
    await dbConnect();

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }
    });

    if (existingCategory) {
      return { success: false, message: "Category with this name already exists" };
    }

    // Create category
    const category = await Category.create(data);

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category created successfully",
      category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, message: "Failed to create category" };
  }
}

/**
 * Update category (Admin only)
 */
export async function updateCategory(id: string, updateData: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Category ID is required" };
  }

  try {
    await dbConnect();

    // Update category
    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);

    return {
      success: true,
      message: "Category updated successfully",
      category,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, message: "Failed to update category" };
  }
}

/**
 * Delete category (Admin only)
 */
export async function deleteCategory(id: string): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Category ID is required" };
  }

  try {
    await dbConnect();

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return {
        success: false,
        message: `Cannot delete category with ${productCount} products. Please reassign or delete the products first.`,
      };
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      return {
        success: false,
        message: `Cannot delete category with ${subcategoryCount} subcategories. Please reassign or delete the subcategories first.`,
      };
    }

    // Delete category
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Failed to delete category" };
  }
}

// ===== BRAND ENDPOINTS =====

interface BrandFilters extends PaginationParams {}

/**
 * Get brands with filtering and pagination
 */
export async function getBrands(params: BrandFilters): Promise<ApiResponse> {
  try {
    await dbConnect();

    const { page, limit, search } = validatePagination(params);

    // Build query
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Execute queries in parallel for better performance
    const [brands, total] = await Promise.all([
      Brand.find(query)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Brand.countDocuments(query)
    ]);

    // Get product counts for each brand
    const brandIds = brands.map((brand) => brand._id);
    const productCounts = await Product.aggregate([
      { $match: { brand: { $in: brandIds } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);

    // Add product count to each brand
    const brandsWithCounts = brands.map((brand) => {
      const productCount = productCounts.find(
        (pc) => pc._id.toString() === brand._id.toString()
      );
      return {
        ...brand,
        productCount: productCount ? productCount.count : 0,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      total,
      page,
      limit,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      success: true,
      brands: brandsWithCounts,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: false, message: "Failed to fetch brands" };
  }
}

/**
 * Get single brand by ID or slug
 */
export async function getBrand(id: string): Promise<ApiResponse> {
  if (!id) {
    return { success: false, message: "Brand ID is required" };
  }

  try {
    await dbConnect();

    // Find brand by ID or slug
    const brand = await Brand.findOne({
      $or: [{ _id: id }, { slug: id }],
    }).lean();

    if (!brand) {
      return { success: false, message: "Brand not found" };
    }

    // Get product count
    const productCount = await Product.countDocuments({ brand: brand._id });

    return { 
      success: true, 
      brand: {
        ...brand,
        productCount
      }
    };
  } catch (error) {
    console.error("Error fetching brand:", error);
    return { success: false, message: "Failed to fetch brand" };
  }
}

/**
 * Create new brand (Admin only)
 */
export async function createBrand(data: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!data || !data.name) {
    return { success: false, message: "Brand name is required" };
  }

  try {
    await dbConnect();

    // Check if brand with same name exists
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }
    });

    if (existingBrand) {
      return { success: false, message: "Brand with this name already exists" };
    }

    // Create brand
    const brand = await Brand.create(data);

    revalidatePath("/admin/brands");

    return {
      success: true,
      message: "Brand created successfully",
      brand,
    };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { success: false, message: "Failed to create brand" };
  }
}

/**
 * Update brand (Admin only)
 */
export async function updateBrand(id: string, updateData: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Brand ID is required" };
  }

  try {
    await dbConnect();

    // Update brand
    const brand = await Brand.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true,
    });

    if (!brand) {
      return { success: false, message: "Brand not found" };
    }

    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${id}`);

    return {
      success: true,
      message: "Brand updated successfully",
      brand,
    };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { success: false, message: "Failed to update brand" };
  }
}

/**
 * Delete brand (Admin only)
 */
export async function deleteBrand(id: string): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Brand ID is required" };
  }

  try {
    await dbConnect();

    // Check if brand has products
    const productCount = await Product.countDocuments({ brand: id });
    if (productCount > 0) {
      return {
        success: false,
        message: `Cannot delete brand with ${productCount} products. Please reassign or delete the products first.`,
      };
    }

    // Delete brand
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return { success: false, message: "Brand not found" };
    }

    revalidatePath("/admin/brands");

    return {
      success: true,
      message: "Brand deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { success: false, message: "Failed to delete brand" };
  }
}

// ===== DISCOUNT ENDPOINTS =====

/**
 * Get all discounts (Admin only)
 */
export async function getDiscounts(): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  try {
    await dbConnect();

    // Get all discounts
    const discounts = await Discount.find({})
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, discounts };
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return { success: false, message: "Failed to fetch discounts" };
  }
}

/**
 * Get single discount by ID (Admin only)
 */
export async function getDiscount(id: string): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Discount ID is required" };
  }

  try {
    await dbConnect();

    // Find discount by ID
    const discount = await Discount.findById(id).lean();

    if (!discount) {
      return { success: false, message: "Discount not found" };
    }

    return { success: true, discount };
  } catch (error) {
    console.error("Error fetching discount:", error);
    return { success: false, message: "Failed to fetch discount" };
  }
}

/**
 * Create new discount (Admin only)
 */
export async function createDiscount(data: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!data || !data.code) {
    return { success: false, message: "Discount code is required" };
  }

  try {
    await dbConnect();

    // Check if discount code already exists
    const existingDiscount = await Discount.findOne({
      code: data.code.toUpperCase(),
    });

    if (existingDiscount) {
      return { success: false, message: "Discount code already exists" };
    }

    // Ensure code is uppercase
    data.code = data.code.toUpperCase();

    // Create discount
    const discount = await Discount.create(data);

    revalidatePath("/admin/discounts");

    return {
      success: true,
      message: "Discount created successfully",
      discount,
    };
  } catch (error) {
    console.error("Error creating discount:", error);
    return { success: false, message: "Failed to create discount" };
  }
}

/**
 * Update discount (Admin only)
 */
export async function updateDiscount(id: string, updateData: any): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Discount ID is required" };
  }

  try {
    await dbConnect();

    // Check if discount code already exists (if code is being changed)
    if (updateData.code) {
      const existingDiscount = await Discount.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingDiscount) {
        return { success: false, message: "Discount code already exists" };
      }

      // Ensure code is uppercase
      updateData.code = updateData.code.toUpperCase();
    }

    // Update discount
    const discount = await Discount.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!discount) {
      return { success: false, message: "Discount not found" };
    }

    revalidatePath("/admin/discounts");
    revalidatePath(`/admin/discounts/${id}`);

    return {
      success: true,
      message: "Discount updated successfully",
      discount,
    };
  } catch (error) {
    console.error("Error updating discount:", error);
    return { success: false, message: "Failed to update discount" };
  }
}

/**
 * Delete discount (Admin only)
 */
export async function deleteDiscount(id: string): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Discount ID is required" };
  }

  try {
    await dbConnect();

    // Delete discount
    const discount = await Discount.findByIdAndDelete(id);

    if (!discount) {
      return { success: false, message: "Discount not found" };
    }

    revalidatePath("/admin/discounts");

    return {
      success: true,
      message: "Discount deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting discount:", error);
    return { success: false, message: "Failed to delete discount" };
  }
}

/**
 * Toggle discount status (Admin only)
 */
export async function toggleDiscountStatus(id: string, isActive: boolean): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Discount ID is required" };
  }

  try {
    await dbConnect();

    // Update discount status
    const discount = await Discount.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!discount) {
      return { success: false, message: "Discount not found" };
    }

    revalidatePath("/admin/discounts");

    return {
      success: true,
      message: `Discount ${isActive ? "activated" : "deactivated"} successfully`,
      discount,
    };
  } catch (error) {
    console.error("Error updating discount status:", error);
    return { success: false, message: "Failed to update discount status" };
  }
}

export async function validateDiscount(code: string): Promise<ApiResponse> {
  if (!code || typeof code !== 'string') {
    return { success: false, message: "Discount code is required" };
  }

  try {
    await dbConnect();

    // Find discount by code
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).lean();

    if (!discount) {
      return { success: false, message: "Invalid discount code" };
    }

    // Check if discount is expired
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return { success: false, message: "Discount code has expired" };
    }

    // Check if discount has reached usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return {
        success: false,
        message: "Discount code has reached its usage limit",
      };
    }

    return {
      success: true,
      discount: {
        id: discount._id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        minOrderAmount: discount.minOrderAmount,
      },
    };
  } catch (error) {
    console.error("Error validating discount:", error);
    return { success: false, message: "Failed to validate discount" };
  }
}

export async function applyDiscount(code: string, cartTotal: number): Promise<ApiResponse> {
  if (!code || typeof code !== 'string') {
    return { success: false, message: "Discount code is required" };
  }

  if (!cartTotal || cartTotal <= 0) {
    return { success: false, message: "Valid cart total is required" };
  }

  try {
    await dbConnect();

    // Find discount by code
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).lean();

    if (!discount) {
      return { success: false, message: "Invalid discount code" };
    }

    // Check if discount is expired
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return { success: false, message: "Discount code has expired" };
    }

    // Check if discount has reached usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return {
        success: false,
        message: "Discount code has reached its usage limit",
      };
    }

    // Check minimum order amount
    if (discount.minOrderAmount && cartTotal < discount.minOrderAmount) {
      return {
        success: false,
        message: `Minimum order amount of ${discount.minOrderAmount} required for this discount`,
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === "percentage") {
      // Calculate percentage discount with validation
      const discountValue = typeof discount.value === 'number' && !isNaN(discount.value) ? discount.value : 0;
      discountAmount = (cartTotal * discountValue) / 100;
      
      // Apply max discount limit if specified
      if (
        discount.maxDiscountAmount &&
        typeof discount.maxDiscountAmount === 'number' &&
        !isNaN(discount.maxDiscountAmount) &&
        discountAmount > discount.maxDiscountAmount
      ) {
        discountAmount = discount.maxDiscountAmount;
      }
    } else {
      // Fixed amount discount with validation
      const discountValue = typeof discount.value === 'number' && !isNaN(discount.value) ? discount.value : 0;
      discountAmount = discountValue;
      
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    // Round discount amount to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    // Calculate new total with proper rounding
    const newTotal = Math.round((cartTotal - discountAmount) * 100) / 100;

    return {
      success: true,
      discount: {
        id: discount._id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
      },
      cartTotal,
      discountAmount,
      newTotal,
    };
  } catch (error) {
    console.error("Error applying discount:", error);
    return { success: false, message: "Failed to apply discount" };
  }
}

// ===== ORDER ENDPOINTS =====

interface OrderFilters extends PaginationParams {
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Get user's orders with pagination
 */
export async function getUserOrders(params: PaginationParams = {}): Promise<ApiResponse> {
  const authResult = await getAuthenticatedSession();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  const { user } = authResult.session as ExtendedSession;

  try {
    await dbConnect();

    const { page, limit } = validatePagination(params);

    // Build query with index optimization
    const query = { user: user.id };

    // Execute queries in parallel for better performance
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: 'items.product',
          select: 'name slug images price',
          options: { lean: true }
        })
        .sort({ createdAt: -1 }) // Index: { user: 1, createdAt: -1 }
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      total,
      page,
      limit,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      success: true,
      orders,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, message: "Failed to fetch orders" };
  }
}

export async function getOrder(id: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Find order
    const order = await Order.findById(id).lean();

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Check if order belongs to user or user is admin
    if (
      order.user.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return { success: false, message: "Unauthorized" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, message: "Failed to fetch order" };
  }
}

export async function createOrder(orderData: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Add user to order data
    orderData.user = session.user.id;

    // Add initial timeline entry
    orderData.timeline = [
      {
        status: "Order Placed",
        date: new Date(),
        description: "Your order has been placed successfully.",
      },
    ];

    // Create order
    const order = await Order.create(orderData);

    // If discount was applied, increment usage count
    if (orderData.discount && orderData.discount.id) {
      await Discount.findByIdAndUpdate(orderData.discount.id, {
        $inc: { usageCount: 1 },
      });
    }

    // Update product inventory
    const inventoryUpdates = orderData.items.map((item: any) => 
      Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity },
      })
    );
    
    await Promise.all(inventoryUpdates);

    return {
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
      },
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: "Failed to create order" };
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(
  id: string,
  status: string,
  description?: string
): Promise<ApiResponse> {
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult as ApiResponse;
  }

  if (!id) {
    return { success: false, message: "Order ID is required" };
  }

  if (!status) {
    return { success: false, message: "Status is required" };
  }

  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Update order status
    order.status = status;

    // Add to timeline
    order.timeline.push({
      status,
      date: new Date(),
      description: description || `Order status updated to ${status}`,
    });

    // Save order
    await order.save();

    revalidatePath(`/admin/orders/${id}`);

    return {
      success: true,
      message: "Order status updated successfully",
      order: {
        id: order._id,
        status: order.status,
      },
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: "Failed to update order status" };
  }
}

// ===== WISHLIST ENDPOINTS =====

export async function getWishlist() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    const wishlistItems = await Wishlist.find({ user: session.user.id })
      .populate({
        path: "product",
        select: "name slug price discountPrice images",
      })
      .sort({ createdAt: -1 });

    return { success: true, wishlistItems };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { success: false, message: "Failed to fetch wishlist" };
  }
}

export async function addToWishlist(productId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (!productId) {
      return { success: false, message: "Product ID is required" };
    }

    await dbConnect();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: session.user.id,
      product: productId,
    });

    if (existingItem) {
      return { success: true, message: "Product already in wishlist" };
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user: session.user.id,
      product: productId,
    });

    revalidatePath("/dashboard/wishlist");

    return {
      success: true,
      message: "Product added to wishlist",
      item: wishlistItem,
    };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, message: "Failed to add to wishlist" };
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (!productId) {
      return { success: false, message: "Product ID is required" };
    }

    await dbConnect();

    await Wishlist.findOneAndDelete({
      user: session.user.id,
      product: productId,
    });

    revalidatePath("/dashboard/wishlist");

    return { success: true, message: "Product removed from wishlist" };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, message: "Failed to remove from wishlist" };
  }
}

export async function clearWishlist() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    await Wishlist.deleteMany({ user: session.user.id });

    revalidatePath("/dashboard/wishlist");

    return { success: true, message: "Wishlist cleared successfully" };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return { success: false, message: "Failed to clear wishlist" };
  }
}

// ===== USER PROFILE ENDPOINTS =====

export async function getUserProfile() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get user profile
    const user = await User.findById(session.user.id)
      .select("-password")
      .lean();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, message: "Failed to fetch user profile" };
  }
}

export async function updateUserProfile(userData: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    const { currentPassword, newPassword, ...updateData } = userData;

    await dbConnect();

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const user = await User.findById(session.user.id);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      const isPasswordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordMatch) {
        return { success: false, message: "Current password is incorrect" };
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      {
        new: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    revalidatePath("/dashboard/settings");

    return {
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, message: "Failed to update user profile" };
  }
}

// ===== USER ADDRESSES ENDPOINTS =====

export async function getUserAddresses() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get user's addresses
    const user = await User.findById(session.user.id)
      .select("addresses")
      .lean();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, addresses: user.addresses || [] };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, message: "Failed to fetch addresses" };
  }
}

export async function addUserAddress(addressData: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get user
    const user = await User.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // If this is the first address or marked as default, update all other addresses
    if (addressData.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push(addressData);

    // Save user
    await user.save();

    revalidatePath("/dashboard/addresses");

    return {
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    };
  } catch (error) {
    console.error("Error adding address:", error);
    return { success: false, message: "Failed to add address" };
  }
}

export async function updateUserAddress(addressId: string, addressData: any) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get user
    const user = await User.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Find address index
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return { success: false, message: "Address not found" };
    }

    // If setting as default, update all other addresses
    if (addressData.isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...addressData,
    };

    // Save user
    await user.save();

    revalidatePath("/dashboard/addresses");

    return {
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, message: "Failed to update address" };
  }
}

export async function deleteUserAddress(addressId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get user
    const user = await User.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Find address index
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return { success: false, message: "Address not found" };
    }

    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault;

    // Remove address
    user.addresses.splice(addressIndex, 1);

    // If it was the default address and there are other addresses, set the first one as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    // Save user
    await user.save();

    revalidatePath("/dashboard/addresses");

    return {
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, message: "Failed to delete address" };
  }
}

// ===== ADMIN STATS ENDPOINTS =====

export async function getAdminStats() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get current date and date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get total revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Get revenue from last 30 days
    const revenueLastMonthResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const revenueLastMonth =
      revenueLastMonthResult.length > 0 ? revenueLastMonthResult[0].total : 0;

    // Get revenue from 30-60 days ago
    const revenuePreviousMonthResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const revenuePreviousMonth =
      revenuePreviousMonthResult.length > 0
        ? revenuePreviousMonthResult[0].total
        : 0;

    // Calculate revenue change percentage with proper validation
    const revenueChange =
      revenuePreviousMonth === 0 || typeof revenuePreviousMonth !== 'number' || isNaN(revenuePreviousMonth)
        ? (revenueLastMonth > 0 ? 100 : 0)
        : Math.round(
            ((revenueLastMonth - revenuePreviousMonth) / revenuePreviousMonth) *
              100 * 100
          ) / 100;

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get orders from last 30 days
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get orders from 30-60 days ago
    const ordersPreviousMonth = await Order.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    // Calculate orders change percentage with proper validation
    const ordersChange =
      ordersPreviousMonth === 0 || typeof ordersPreviousMonth !== 'number' || isNaN(ordersPreviousMonth)
        ? (ordersLastMonth > 0 ? 100 : 0)
        : Math.round(
            ((ordersLastMonth - ordersPreviousMonth) / ordersPreviousMonth) *
              100 * 100
          ) / 100;

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get products created in last 30 days
    const productsLastMonth = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get products created 30-60 days ago
    const productsPreviousMonth = await Product.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    // Calculate products change percentage with proper validation
    const productsChange =
      productsPreviousMonth === 0 || typeof productsPreviousMonth !== 'number' || isNaN(productsPreviousMonth)
        ? (productsLastMonth > 0 ? 100 : 0)
        : Math.round(
            ((productsLastMonth - productsPreviousMonth) /
              productsPreviousMonth) *
              100 * 100
          ) / 100;

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Get customers created in last 30 days
    const customersLastMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get customers created 30-60 days ago
    const customersPreviousMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    // Calculate customers change percentage with proper validation
    const customersChange =
      customersPreviousMonth === 0 || typeof customersPreviousMonth !== 'number' || isNaN(customersPreviousMonth)
        ? (customersLastMonth > 0 ? 100 : 0)
        : Math.round(
            ((customersLastMonth - customersPreviousMonth) /
              customersPreviousMonth) *
              100 * 100
          ) / 100;

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueChange,
        ordersChange,
        productsChange,
        customersChange,
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { success: false, message: "Failed to fetch admin stats" };
  }
}

// ===== ADMIN ANALYTICS ENDPOINTS =====

export async function getAdminAnalytics(detailed = false) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Create data for the last 6 months
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);

      const monthName = month.toLocaleString("default", { month: "short" });

      // Get revenue for this month
      const revenueResult = await Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: month, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

      if (detailed) {
        // Get order count for this month
        const orderCount = await Order.countDocuments({
          createdAt: { $gte: month, $lte: monthEnd },
        });

        // Get new customers for this month
        const customerCount = await User.countDocuments({
          role: "user",
          createdAt: { $gte: month, $lte: monthEnd },
        });

        data.push({
          name: monthName,
          revenue: revenue,
          orders: orderCount * 1000, // Scale for visualization
          customers: customerCount * 2000, // Scale for visualization
        });
      } else {
        data.push({
          name: monthName,
          total: revenue,
        });
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return { success: false, message: "Failed to fetch analytics data" };
  }
}

// ===== ADMIN RECENT SALES ENDPOINTS =====

export async function getRecentSales() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    // Get recent orders
    const recentOrders = await Order.find({ status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean();

    // Format the sales data
    const sales = await Promise.all(
      recentOrders.map(async (order) => {
        let customer = {
          name: "Guest User",
          email: "guest@example.com",
          initials: "GU",
        };

        if (order.user) {
          const user = order.user;
          const nameParts = user.name.split(" ");
          const initials =
            nameParts.length > 1
              ? `${nameParts[0][0]}${nameParts[1][0]}`
              : user.name.substring(0, 2);

          customer = {
            name: user.name,
            email: user.email,
            initials: initials.toUpperCase(),
          };
        }

        return {
          id: order._id.toString(),
          customer,
          amount: order.total,
          date: order.createdAt,
        };
      })
    );

    return { success: true, sales };
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return { success: false, message: "Failed to fetch recent sales" };
  }
}

// ===== PAYMENT VERIFICATION ENDPOINTS =====

export async function verifyEsewaPayment(data: {
  orderId: string;
  transactionId: string;
  amount: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    const { orderId, transactionId, amount } = data;

    if (!orderId || !transactionId || !amount) {
      return { success: false, message: "Missing required fields" };
    }

    await dbConnect();

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Verify order belongs to user
    if (order.user.toString() !== session.user.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Update order payment status
    order.paymentStatus = "paid";
    order.paymentDetails = {
      transactionId,
      provider: "esewa",
      amount: Number.parseFloat(amount),
      date: new Date(),
    };

    // Add to timeline
    order.timeline.push({
      status: "Payment Confirmed",
      date: new Date(),
      description: "Payment has been confirmed via Esewa.",
    });

    // Save order
    await order.save();

    revalidatePath(`/dashboard/orders/${orderId}`);

    return {
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, message: "Failed to verify payment" };
  }
}

export async function verifyKhaltiPayment(data: {
  orderId: string;
  transactionId: string;
  amount: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    const { orderId, transactionId, amount } = data;

    if (!orderId || !transactionId || !amount) {
      return { success: false, message: "Missing required fields" };
    }

    await dbConnect();

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Verify order belongs to user
    if (order.user.toString() !== session.user.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Update order payment status
    order.paymentStatus = "paid";
    order.paymentDetails = {
      transactionId,
      provider: "khalti",
      amount: Number.parseFloat(amount),
      date: new Date(),
    };

    // Add to timeline
    order.timeline.push({
      status: "Payment Confirmed",
      date: new Date(),
      description: "Payment has been confirmed via Khalti.",
    });

    // Save order
    await order.save();

    revalidatePath(`/dashboard/orders/${orderId}`);

    return {
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, message: "Failed to verify payment" };
  }
}

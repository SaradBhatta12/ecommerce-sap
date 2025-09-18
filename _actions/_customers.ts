"use server";

import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import Order from "@/models/order";
import mongoose from "mongoose";

// =============================================================================
// CUSTOMER MANAGEMENT ACTIONS
// =============================================================================

export interface CustomerFilters {
  search?: string;
  role?: string;
  userType?: string;
  emailVerified?: boolean;
  hasOrders?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export const getCustomers = async (
  filters: CustomerFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 10 }
) => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    // Build the match query
    const matchQuery: any = {};

    // Search filter
    if (filters.search) {
      matchQuery.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { phone: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Role filter
    if (filters.role && filters.role !== "all") {
      matchQuery.role = filters.role;
    }

    // User type filter
    if (filters.userType && filters.userType !== "all") {
      matchQuery.userType = filters.userType;
    }

    // Email verified filter
    if (filters.emailVerified !== undefined) {
      if (filters.emailVerified) {
        matchQuery.emailVerified = { $exists: true, $ne: null };
      } else {
        matchQuery.$or = [
          { emailVerified: { $exists: false } },
          { emailVerified: null },
        ];
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      matchQuery.createdAt = {};
      if (filters.dateFrom) {
        matchQuery.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchQuery.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Aggregate pipeline to get customers with order statistics
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orders" },
          totalSpent: {
            $sum: {
              $map: {
                input: "$orders",
                as: "order",
                in: "$$order.total",
              },
            },
          },
          lastOrderDate: {
            $max: {
              $map: {
                input: "$orders",
                as: "order",
                in: "$$order.createdAt",
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          userType: 1,
          provider: 1,
          emailVerified: 1,
          addresses: 1,
          notificationPreferences: 1,
          createdAt: 1,
          updatedAt: 1,
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    // Apply has orders filter after aggregation
    if (filters.hasOrders !== undefined) {
      if (filters.hasOrders) {
        pipeline.push({ $match: { totalOrders: { $gt: 0 } } });
      } else {
        pipeline.push({ $match: { totalOrders: 0 } });
      }
    }

    // Get total count
    const totalCountPipeline = [...pipeline, { $count: "total" }];
    const totalCountResult = await User.aggregate(totalCountPipeline);
    const totalCustomers = totalCountResult[0]?.total || 0;

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: pagination.limit });

    // Execute the query
    const customers = await User.aggregate(pipeline);

    const totalPages = Math.ceil(totalCustomers / pagination.limit);

    return {
      success: true,
      customers,
      totalCustomers,
      totalPages,
      currentPage: pagination.page,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      success: false,
      message: "Failed to fetch customers",
      status: 500,
    };
  }
};

export const getCustomerById = async (customerId: string) => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return {
        success: false,
        message: "Invalid customer ID",
        status: 400,
      };
    }

    const customer = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(customerId) } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orders" },
          totalSpent: {
            $sum: {
              $map: {
                input: "$orders",
                as: "order",
                in: "$$order.total",
              },
            },
          },
          lastOrderDate: {
            $max: {
              $map: {
                input: "$orders",
                as: "order",
                in: "$$order.createdAt",
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          orders: 0,
        },
      },
    ]);

    if (!customer || customer.length === 0) {
      return {
        success: false,
        message: "Customer not found",
        status: 404,
      };
    }

    return {
      success: true,
      customer: customer[0],
    };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return {
      success: false,
      message: "Failed to fetch customer",
      status: 500,
    };
  }
};

export const getCustomerOrders = async (
  customerId: string,
  pagination: PaginationOptions = { page: 1, limit: 10 }
) => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return {
        success: false,
        message: "Invalid customer ID",
        status: 400,
      };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    // Get total count
    const totalOrders = await Order.countDocuments({
      userId: new mongoose.Types.ObjectId(customerId),
    });

    // Get orders with pagination
    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(customerId),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .populate("items.productId", "name images")
      .lean();

    const totalPages = Math.ceil(totalOrders / pagination.limit);

    return {
      success: true,
      orders,
      totalOrders,
      totalPages,
      currentPage: pagination.page,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    };
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return {
      success: false,
      message: "Failed to fetch customer orders",
      status: 500,
    };
  }
};

export const updateCustomerStatus = async (
  customerId: string,
  updates: {
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }
) => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return {
        success: false,
        message: "Invalid customer ID",
        status: 400,
      };
    }

    const updateData: any = {};

    if (updates.role) {
      if (!["user", "admin", "superadmin"].includes(updates.role)) {
        return {
          success: false,
          message: "Invalid role",
          status: 400,
        };
      }
      updateData.role = updates.role;
    }

    if (updates.emailVerified !== undefined) {
      updateData.emailVerified = updates.emailVerified ? new Date() : null;
    }

    const customer = await User.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, select: "-password" }
    );

    if (!customer) {
      return {
        success: false,
        message: "Customer not found",
        status: 404,
      };
    }

    return {
      success: true,
      customer,
      message: "Customer updated successfully",
    };
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      success: false,
      message: "Failed to update customer",
      status: 500,
    };
  }
};

export const deleteCustomer = async (customerId: string) => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return {
        success: false,
        message: "Invalid customer ID",
        status: 400,
      };
    }

    // Check if customer has orders
    const orderCount = await Order.countDocuments({
      userId: new mongoose.Types.ObjectId(customerId),
    });

    if (orderCount > 0) {
      return {
        success: false,
        message: "Cannot delete customer with existing orders",
        status: 400,
      };
    }

    const customer = await User.findByIdAndDelete(customerId);

    if (!customer) {
      return {
        success: false,
        message: "Customer not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Customer deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return {
      success: false,
      message: "Failed to delete customer",
      status: 500,
    };
  }
};

export const getCustomerStats = async () => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    const stats = await User.aggregate([
      {
        $facet: {
          totalCustomers: [{ $count: "count" }],
          newThisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            },
            { $count: "count" },
          ],
          verifiedEmails: [
            {
              $match: {
                emailVerified: { $exists: true, $ne: null },
              },
            },
            { $count: "count" },
          ],
          byRole: [
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ],
          byProvider: [
            {
              $group: {
                _id: "$provider",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];

    return {
      success: true,
      stats: {
        totalCustomers: result.totalCustomers[0]?.count || 0,
        newThisMonth: result.newThisMonth[0]?.count || 0,
        verifiedEmails: result.verifiedEmails[0]?.count || 0,
        byRole: result.byRole,
        byProvider: result.byProvider,
      },
    };
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return {
      success: false,
      message: "Failed to fetch customer statistics",
      status: 500,
    };
  }
};

export const exportCustomers = async (filters: CustomerFilters = {}) => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    // Build the match query (same as getCustomers)
    const matchQuery: any = {};

    if (filters.search) {
      matchQuery.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { phone: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.role && filters.role !== "all") {
      matchQuery.role = filters.role;
    }

    if (filters.userType && filters.userType !== "all") {
      matchQuery.userType = filters.userType;
    }

    if (filters.emailVerified !== undefined) {
      if (filters.emailVerified) {
        matchQuery.emailVerified = { $exists: true, $ne: null };
      } else {
        matchQuery.$or = [
          { emailVerified: { $exists: false } },
          { emailVerified: null },
        ];
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      matchQuery.createdAt = {};
      if (filters.dateFrom) {
        matchQuery.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchQuery.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    const customers = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orders" },
          totalSpent: {
            $sum: {
              $map: {
                input: "$orders",
                as: "order",
                in: "$$order.total",
              },
            },
          },
          lastOrderDate: {
            $max: {
              $map: {
                input: "$orders",
                as: "order",
                in: "$$order.createdAt",
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          userType: 1,
          provider: 1,
          emailVerified: 1,
          createdAt: 1,
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return {
      success: true,
      customers,
      count: customers.length,
    };
  } catch (error) {
    console.error("Error exporting customers:", error);
    return {
      success: false,
      message: "Failed to export customers",
      status: 500,
    };
  }
};
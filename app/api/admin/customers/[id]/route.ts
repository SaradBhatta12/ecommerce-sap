import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCurrentSession } from "@/lib/auth-utils";
import { updateCustomerStatus, deleteCustomer } from "@/_actions/_customers";

// GET /api/admin/customers/[id] - Get customer details or orders
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const orders = searchParams.get("orders");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Await params before using
    const { id } = await params;

    // Get customer with enhanced data
    const customer = await User.findById(id).select("-password");
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Calculate customer statistics
    const orderStats = await Order.aggregate([
      { $match: { user: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

    // Enhanced customer object with statistics
    const enhancedCustomer = {
      ...customer.toObject(),
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      lastOrderDate: stats.lastOrderDate
    };

    if (orders === "true") {
      const skip = (page - 1) * limit;
      
      // Fetch orders with proper population and generate order numbers
      const customerOrders = await Order.find({ user: id })
        .populate({
          path: "items.product",
          select: "name images price"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Add order numbers and format data
      const formattedOrders = customerOrders.map((order, index) => ({
        ...order,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        shippingAddress: {
          street: order.address?.address || "",
          city: order.address?.city || "",
          state: order.address?.province || "",
          zipCode: order.address?.postalCode || "",
          country: "Nepal"
        }
      }));

      const totalOrders = await Order.countDocuments({ user: id });
      const totalPages = Math.ceil(totalOrders / limit);

      return NextResponse.json({
        success: true,
        customer: enhancedCustomer,
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      customer: enhancedCustomer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update customer status/role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using
    const { id } = await params;
    const customerId = id;
    const updates = await request.json();

    // Validate updates
    const allowedUpdates = ["role", "isActive", "emailVerified"];
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return NextResponse.json(
        { error: "Invalid update fields" },
        { status: 400 }
      );
    }

    const result = await updateCustomerStatus(customerId, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: result.customer,
      message: result.message,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using
    const { id } = await params;
    const customerId = id;
    const result = await deleteCustomer(customerId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
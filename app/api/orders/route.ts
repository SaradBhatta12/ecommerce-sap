import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db-connect";
import Order from "@/models/order";
import User from "@/models/user";
import Product from "@/models/product";
import Discount from "@/models/discount";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      addressId,
      paymentMethod,
      items,
      subtotal,
      shipping,
      discount,
      total,
    } = await request.json();

    if (!addressId || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user address
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Validate stock availability before creating order
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // Create order
    const order = await Order.create({
      user: session.user.id,
      items: items?.map((item: any) => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      address: {
        fullName: address.fullName,
        address: address.address,
        city: address.district, // Map district to city
        province: address.province,
        postalCode: address.postalCode,
        phone: address.phone,
      },
      paymentMethod,
      subtotal,
      shipping,
      discount: discount
        ? {
            id: discount.id,
            code: discount.code,
            amount: discount.amount,
          }
        : undefined,
      total,
    });

    // Update product stock and discount usage
    for (const item of items) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.quantity },
      });
    }

    // If discount was applied, increment usage count
    if (discount && discount.id) {
      await Discount.findByIdAndUpdate(discount.id, {
        $inc: { usageCount: 1 },
      });
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    await dbConnect();

    // Build query
    const query: any = { user: session.user.id };
    if (status) {
      query.status = status;
    }

    // Get orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

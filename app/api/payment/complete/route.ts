import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db-connect';
import Order from '@/models/order';
import User from '@/models/user';
import Product from '@/models/product';
import Discount from '@/models/discount';

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderData, paymentDetails } = body;

    console.log('Payment completion request:', { items: orderData.items, paymentDetails });

    // Validate required data
    if (!orderData || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: "Missing order data or payment details" },
        { status: 400 }
      );
    }

    // Validate order data structure
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order items" },
        { status: 400 }
      );
    }

    if (!orderData.addressId || !orderData.paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing address or payment method" },
        { status: 400 }
      );
    }

    // Validate payment details
    if (!paymentDetails.provider || !paymentDetails.transactionId) {
      return NextResponse.json(
        { success: false, message: "Invalid payment details" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify user exists and get user with addresses
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the selected address from user's addresses array
    const selectedAddress = user.addresses?.find((addr: any) =>
      addr._id?.toString() === orderData.addressId
    );

    if (!selectedAddress) {
      return NextResponse.json(
        { success: false, message: "Selected address not found" },
        { status: 400 }
      );
    }

    // Validate products and check stock
    const productIds = orderData.items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    console.log(products.length, productIds.length)

    if (!(products.length === productIds.length)) {
      return NextResponse.json(
        { success: false, message: "Some products not found" },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const item of orderData.items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.name || item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: session.user.id,
      items: orderData.items.map((item: any) => ({
        product: item.productId,
        name: item.name || products.find(p => p._id.toString() === item.productId)?.name || 'Unknown Product',
        price: item.price,
        quantity: item.quantity,
        image: item.image || products.find(p => p._id.toString() === item.productId)?.images?.[0] || ''
      })),
      address: {
        fullName: selectedAddress.fullName,
        address: selectedAddress.address || '',
        city: selectedAddress.district || selectedAddress.city || '',
        province: selectedAddress.province || '',
        postalCode: selectedAddress.postalCode || '',
        phone: selectedAddress.phone
      },
      paymentMethod: orderData.paymentMethod,
      paymentDetails: {
        provider: paymentDetails.provider,
        transactionId: paymentDetails.transactionId,
        status: paymentDetails.status || 'completed',
        verifiedAt: new Date(),
        ...(paymentDetails.data && { data: paymentDetails.data }),
        ...(paymentDetails.pidx && { pidx: paymentDetails.pidx }),
        ...(paymentDetails.oid && { oid: paymentDetails.oid }),
        ...(paymentDetails.transaction_uuid && { transaction_uuid: paymentDetails.transaction_uuid })
      },
      subtotal: orderData.subtotal || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total || 0,
      status: 'processing',
      paymentStatus: 'paid'
    });

    // Add discount if present
    if (orderData.discount) {
      order.discount = {
        id: orderData.discount.id,
        code: orderData.discount.code,
        amount: orderData.discount.amount
      };
    }

    // Save order
    const savedOrder = await order.save();

    // Update product stock
    for (const item of orderData.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update discount usage if applicable
    if (orderData.discount?.id) {
      try {
        await Discount.findByIdAndUpdate(
          orderData.discount.id,
          { $inc: { usageCount: 1 } }
        );
        console.log('Discount usage updated');
      } catch (discountError) {
        console.warn('Failed to update discount usage:', discountError);
        // Don't fail the order creation for discount update errors
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: savedOrder._id.toString(),
      orderNumber: orderNumber,
      status: 'confirmed',
      paymentStatus: 'completed',
      total: orderData.total,
      order: {
        id: savedOrder._id.toString(),
        orderNumber: orderNumber,
        status: 'confirmed',
        paymentStatus: 'completed',
        total: orderData.total,
        items: savedOrder.items,
        address: savedOrder.address,
        createdAt: savedOrder.createdAt
      }
    });

  } catch (error: any) {
    console.error("Payment completion error:", error);

    // Handle specific error types
    let errorMessage = "Failed to complete payment and create order";
    let statusCode = 500;

    if (error.name === 'ValidationError') {
      errorMessage = "Invalid order data";
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid ID format";
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = "Duplicate order detected";
      statusCode = 409;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db-connect';
import Order from '@/models/order';
import User from '@/models/user';
import Discount from '@/models/discount';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      orderData,
      paymentDetails
    } = body;

    if (!orderData || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: "Missing order data or payment details" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify user exists
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get address details
    const selectedAddress = user.addresses?.find(
      (addr: any) => addr._id.toString() === orderData.addressId
    );

    if (!selectedAddress) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: session.user.id,
      items: orderData.items.map((item: any) => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
      })),
      address: {
        fullName: selectedAddress.fullName,
        address: selectedAddress.address,
        city: selectedAddress.city,
        province: selectedAddress.province,
        postalCode: selectedAddress.postalCode,
        phone: selectedAddress.phone,
      },
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      discount: orderData.discount ? {
        id: orderData.discount.id,
        code: orderData.discount.code,
        amount: orderData.discount.amount,
      } : undefined,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'paid',
      paymentDetails: {
        transactionId: paymentDetails.transactionId,
        provider: paymentDetails.provider,
        amount: paymentDetails.amount,
        currency: 'NPR',
        status: 'completed',
        metadata: {
          refId: paymentDetails.refId,
        },
      },
      status: 'processing',
    });

    await order.save();

    // Apply discount usage if discount was used
    if (orderData.discount && orderData.discount.id) {
      try {
        await Discount.findByIdAndUpdate(
          orderData.discount.id,
          { $inc: { usageCount: 1 } }
        );
      } catch (discountError) {
        console.warn("Failed to update discount usage:", discountError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
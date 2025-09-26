import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db-connect';
import Order from '@/models/order';
import User from '@/models/user';
import Discount from '@/models/discount';
import { verifyEsewaPayment, isEsewaPaymentSuccessful } from '@/lib/payment/esewa';
import { verifyKhaltiPayment, isKhaltiPaymentSuccessful } from '@/lib/payment/khalti';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);
    const { orderData, paymentDetails } = body;

    // Validate required fields
    if (!orderData || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: 'Missing order data or payment details' },
        { status: 400 }
      );
    }

    // Validate payment details structure
    if (!paymentDetails.provider || !paymentDetails.transactionId) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment details: missing provider or transaction ID' },
        { status: 400 }
      );
    }

    // Validate payment provider
    const validProviders = ['esewa', 'khalti'];
    if (!validProviders.includes(paymentDetails.provider.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: `Unsupported payment provider: ${paymentDetails.provider}` },
        { status: 400 }
      );
    }

    let isPaymentValid = false;
    let verificationError = null;

    try {
      // Verify payment based on provider
      if (paymentDetails.provider.toLowerCase() === 'esewa') {
        console.log('eSewa payment details received:', paymentDetails);
        
        // Map payment details to eSewa verification format
        const esewaVerificationParams = {
          productCode: paymentDetails.productCode || process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || 'EPAYTEST',
          transactionUuid: paymentDetails.transactionId,
          totalAmount: paymentDetails.amount || orderData.total
        };
        
        console.log('eSewa verification params:', esewaVerificationParams);
        
        const esewaResult = await verifyEsewaPayment(esewaVerificationParams);
        console.log('eSewa verification result:', esewaResult);
        
        isPaymentValid = isEsewaPaymentSuccessful(esewaResult);
        if (!isPaymentValid) {
          verificationError = `eSewa payment verification failed. Status: ${esewaResult.status}`;
        }
      } else if (paymentDetails.provider.toLowerCase() === 'khalti') {
        const khaltiResult = await verifyKhaltiPayment(paymentDetails);
        isPaymentValid = isKhaltiPaymentSuccessful(khaltiResult);
        if (!isPaymentValid) {
          verificationError = 'Khalti payment verification failed';
        }
      }
    } catch (verifyError) {
      console.error('Payment verification error:', verifyError);
      verificationError = verifyError instanceof Error ? verifyError.message : 'Payment verification failed';
      isPaymentValid = false;
    }

    if (!isPaymentValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: verificationError || 'Payment verification failed',
          error: 'PAYMENT_VERIFICATION_FAILED'
        },
        { status: 400 }
      );
    }

    // Validate order data structure
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data: no items found' },
        { status: 400 }
      );
    }

    // Validate address ID
    if (!orderData.addressId) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data: missing address ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify user exists and get user with addresses
    const user = await User.findById(session.user.id).populate('addresses');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find the selected address
    const selectedAddress = user.addresses?.find((addr: any) => addr._id.toString() === orderData.addressId);
    if (!selectedAddress) {
      return NextResponse.json(
        { success: false, message: 'Selected address not found' },
        { status: 400 }
      );
    }

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create order in database
      const order = new Order({
        user: session.user.id,
        items: orderData.items.map((item: any) => ({
          product: item.productId,
          name: item.name || 'Product',
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
          phone: selectedAddress.phone
        },
        subtotal: orderData.subtotal,
        shipping: orderData.shipping || 0,
        discount: orderData.discount ? {
          id: orderData.discount.id,
          code: orderData.discount.code,
          amount: orderData.discount.amount,
        } : undefined,
        total: orderData.total,
        paymentMethod: paymentDetails.provider,
        paymentStatus: 'paid',
        paymentDetails: {
          transactionId: paymentDetails.transactionId,
          provider: paymentDetails.provider,
          amount: paymentDetails.amount || orderData.total,
          currency: 'NPR',
          status: 'completed',
          referenceId: paymentDetails.refId || paymentDetails.transactionId,
          metadata: {
            refId: paymentDetails.refId,
          },
        },
        status: 'pending'
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

      // Return success response with both flat properties and nested order object
      return NextResponse.json({
        success: true,
        message: 'Order created successfully',
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        order: order
      });

    } catch (dbError) {
      console.error('Database error creating order:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create order in database',
          error: 'DATABASE_ERROR'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment completion error:', error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during payment processing',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
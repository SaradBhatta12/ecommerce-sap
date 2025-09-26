import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyEsewaPayment, isEsewaPaymentSuccessful } from '@/lib/payment/esewa';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Log all parameters for debugging
    console.log('eSewa success endpoint called with params:', Object.fromEntries(searchParams.entries()));
    
    // Check for base64 encoded data parameter (eSewa v2 format)
    const esewaData = searchParams.get('data');
    
    let productCode, transactionUuid, totalAmount;
    
    if (esewaData) {
      // Decode base64 data
      try {
        const decodedData = JSON.parse(atob(esewaData));
        console.log('Decoded eSewa data:', decodedData);
        
        productCode = decodedData.product_code;
        transactionUuid = decodedData.transaction_uuid;
        totalAmount = decodedData.total_amount;
      } catch (decodeError) {
        console.error('Failed to decode eSewa data:', decodeError);
        return NextResponse.redirect(
          new URL('/checkout?error=invalid_data', request.url)
        );
      }
    } else {
      // Fallback to individual parameters
      productCode = searchParams.get('product_code');
      transactionUuid = searchParams.get('transaction_uuid');
      totalAmount = searchParams.get('total_amount');
    }

    if (!productCode || !transactionUuid || !totalAmount) {
      console.log('Missing required parameters:', { productCode, transactionUuid, totalAmount });
      return NextResponse.redirect(
        new URL('/checkout?error=missing_parameters', request.url)
      );
    }

    // Get session to verify user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.redirect(
        new URL('/auth/login?callbackUrl=/checkout', request.url)
      );
    }

    // Verify payment with eSewa
    const verificationResponse = await verifyEsewaPayment({
      productCode,
      transactionUuid,
      totalAmount: parseFloat(totalAmount)
    });

    if (isEsewaPaymentSuccessful(verificationResponse)) {
      // Payment successful - redirect back to checkout with payment details
      const successUrl = new URL('/checkout', request.url);
      successUrl.searchParams.set('payment_method', 'esewa');
      successUrl.searchParams.set('oid', transactionUuid);
      successUrl.searchParams.set('refId', verificationResponse.ref_id || '');
      successUrl.searchParams.set('amt', totalAmount);
      
      // Add the base64 encoded data to preserve payment information
      if (esewaData) {
        successUrl.searchParams.set('data', esewaData);
      }
      
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed or pending
      const failureUrl = new URL('/checkout?error=payment_failed', request.url);
      failureUrl.searchParams.set('status', verificationResponse.status);
      
      return NextResponse.redirect(failureUrl);
    }
  } catch (error) {
    console.error('eSewa payment verification error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=verification_failed', request.url)
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyEsewaPayment, isEsewaPaymentSuccessful } from '@/lib/payment/esewa';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productCode = searchParams.get('product_code');
    const transactionUuid = searchParams.get('transaction_uuid');
    const totalAmount = searchParams.get('total_amount');

    if (!productCode || !transactionUuid || !totalAmount) {
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
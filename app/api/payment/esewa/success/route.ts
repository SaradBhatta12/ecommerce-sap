import { NextRequest, NextResponse } from 'next/server';
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

    // Verify payment with eSewa
    const verificationResponse = await verifyEsewaPayment({
      productCode,
      transactionUuid,
      totalAmount: parseFloat(totalAmount)
    });

    if (isEsewaPaymentSuccessful(verificationResponse)) {
      // Payment successful - redirect to success page with transaction details
      const successUrl = new URL('/checkout/success', request.url);
      successUrl.searchParams.set('payment_method', 'esewa');
      successUrl.searchParams.set('transaction_id', transactionUuid);
      successUrl.searchParams.set('ref_id', verificationResponse.ref_id || '');
      successUrl.searchParams.set('amount', totalAmount);
      
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
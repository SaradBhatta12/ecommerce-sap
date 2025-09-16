import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productCode = searchParams.get('product_code');
    const transactionUuid = searchParams.get('transaction_uuid');
    const totalAmount = searchParams.get('total_amount');

    // Log the failure for debugging
    console.log('eSewa payment failed:', {
      productCode,
      transactionUuid,
      totalAmount,
      timestamp: new Date().toISOString()
    });

    // Redirect to checkout with error message
    const failureUrl = new URL('/checkout', request.url);
    failureUrl.searchParams.set('error', 'payment_cancelled');
    failureUrl.searchParams.set('message', 'Payment was cancelled or failed. Please try again.');
    
    if (transactionUuid) {
      failureUrl.searchParams.set('transaction_id', transactionUuid);
    }

    return NextResponse.redirect(failureUrl);
  } catch (error) {
    console.error('eSewa payment failure handler error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=system_error', request.url)
    );
  }
}
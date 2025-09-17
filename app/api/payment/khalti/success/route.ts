import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pidx = searchParams.get('pidx');
    const transactionId = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');

    if (!pidx || !transactionId || !amount) {
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

    if (status === 'Completed') {
      // Payment successful - create order and redirect to success page
      const successUrl = new URL('/checkout/success', request.url);
      successUrl.searchParams.set('payment_method', 'khalti');
      successUrl.searchParams.set('transaction_id', transactionId);
      successUrl.searchParams.set('ref_id', pidx);
      successUrl.searchParams.set('amount', amount);
      successUrl.searchParams.set('create_order', 'true');
      
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed or pending
      const failureUrl = new URL('/checkout?error=payment_failed', request.url);
      failureUrl.searchParams.set('status', status || 'unknown');
      
      return NextResponse.redirect(failureUrl);
    }
  } catch (error) {
    console.error('Khalti payment verification error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=verification_failed', request.url)
    );
  }
}
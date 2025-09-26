'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, CreditCard, Calendar } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  const paymentMethod = searchParams.get('payment_method')?.split('?')[0]; // Remove query parameters from payment method
  const transactionId = searchParams.get('transaction_id');
  const refId = searchParams.get('ref_id');
  const amount = searchParams.get('amount');
  const shouldCreateOrder = searchParams.get('create_order') === 'true';

  useEffect(() => {
    const createOrder = async () => {
      try {
        // Check for eSewa data parameter (base64 encoded)
        const esewaData = searchParams.get('data');
        const transactionUuid = searchParams.get('transaction_uuid');
        const hasPaymentDetails = transactionId || searchParams.get('oid') || searchParams.get('pidx') || esewaData || transactionUuid;
        
        if (!hasPaymentDetails) {
          setLoading(false);
          return;
        }

        // Get order data from session storage
        const orderDataStr = sessionStorage.getItem('orderData');
        if (!orderDataStr) {
          throw new Error('Order data not found in session storage');
        }

        const orderData = JSON.parse(orderDataStr);

        // Prepare payment details based on the payment method
        let paymentDetails;
        
        if (esewaData && paymentMethod === 'esewa') {
          // eSewa payment with base64 encoded data
          try {
            const decodedData = JSON.parse(atob(esewaData));
            paymentDetails = {
              transactionId: decodedData.transaction_uuid || transactionUuid,
              provider: 'esewa',
              amount: parseFloat(decodedData.total_amount || '0'),
              refId: decodedData.transaction_code || decodedData.transaction_uuid,
            };
          } catch (decodeError) {
            console.error('Failed to decode eSewa data:', decodeError);
            throw new Error('Invalid eSewa payment data');
          }
        } else if (searchParams.get('oid')) {
          // eSewa payment (legacy format)
          paymentDetails = {
            transactionId: searchParams.get('oid'),
            provider: 'esewa',
            amount: searchParams.get('amt'),
            refId: searchParams.get('refId'),
          };
        } else if (searchParams.get('pidx')) {
          // Khalti payment
          paymentDetails = {
            transactionId: searchParams.get('pidx'),
            provider: 'khalti',
            amount: searchParams.get('amount'),
            refId: searchParams.get('ref_id'),
          };
        } else {
          // Fallback to existing method
          paymentDetails = {
            transactionId: transactionId || transactionUuid || '',
            provider: paymentMethod || 'esewa', // Default to esewa if no payment method
            amount: parseFloat(amount || '0'),
            refId: refId || '',
          };
        }

        // Debug: Log payment details being sent
        console.log('Payment details being sent:', paymentDetails);
        console.log('Order data being sent:', orderData);

        // Create order via API
        const response = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData,
            paymentDetails,
          }),
        });
console.log(response)
        const result = await response.json();

        if (result.success) {
          // Handle the new response structure with flat properties
          const orderData = {
            id: result.orderId || result.order?.id || '',
            orderNumber: result.orderNumber || result.order?.orderNumber || '',
            status: result.status || result.order?.status || 'pending',
            paymentStatus: result.paymentStatus || result.order?.paymentStatus || 'pending',
            total: result.total || result.order?.total || 0,
          };
          setOrderDetails(orderData);
          // Clear session storage after successful order creation
          sessionStorage.removeItem('orderData');
        } else {
          throw new Error(result.message || 'Failed to create order');
        }
      } catch (err) {
        console.error('Error creating order:', err);
        let errorMessage = 'Failed to create order';
        
        // Handle different types of errors
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        
        // Handle network errors
        if (errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Only create order if we have payment details or if explicitly requested
    if (shouldCreateOrder || transactionId || searchParams.get('oid') || searchParams.get('pidx') || searchParams.get('data') || searchParams.get('transaction_uuid')) {
      createOrder();
    } else {
      setLoading(false);
    }
  }, [transactionId, paymentMethod, refId, amount, searchParams, shouldCreateOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Order Creation Failed</p>
            <p className="text-sm">{error}</p>
          </div>
          <Link
            href="/checkout"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {/* Order Details */}
          <div className="px-6 py-8">
            {orderDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-semibold">{orderDetails.orderNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold capitalize">{paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-semibold">{transactionId || searchParams.get('oid') || searchParams.get('pidx') || searchParams.get('transaction_uuid') || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-semibold">{formatPrice(orderDetails.total)}</p>
                    </div>
                  </div>
                </div>

                {(refId || searchParams.get('ref_id')) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Reference ID</p>
                    <p className="font-mono text-sm">{refId || searchParams.get('ref_id')}</p>
                  </div>
                )}

                {/* Payment Status Indicator */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Payment Status</p>
                      <p className="text-sm text-green-600 capitalize">{orderDetails.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold capitalize">{paymentMethod || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-semibold">{transactionId || searchParams.get('oid') || searchParams.get('pidx') || searchParams.get('transaction_uuid') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold">{formatPrice(parseFloat(amount || '0'))}</p>
                  </div>
                  {(refId || searchParams.get('ref_id')) && (
                    <div>
                      <p className="text-sm text-gray-500">Reference ID</p>
                      <p className="font-semibold">{refId || searchParams.get('ref_id')}</p>
                    </div>
                  )}
                </div>

                {/* Warning for incomplete order */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-yellow-500 rounded-full mr-2"></div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Received</p>
                      <p className="text-sm text-yellow-600">Your payment was successful, but order details are being processed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              View Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

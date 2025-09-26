import CryptoJS from 'crypto-js';

export interface EsewaPaymentParams {
  amount: number
  orderData?: any // Optional order data for context
}

export interface EsewaVerificationParams {
  productCode: string
  transactionUuid: string
  totalAmount: number
}

export interface EsewaVerificationResponse {
  product_code: string
  transaction_uuid: string
  total_amount: number
  status: 'COMPLETE' | 'PENDING' | 'FAILED'
  ref_id?: string
}

/**
 * Generate HMAC-SHA256 signature for eSewa payment
 * Based on eSewa ePay v2 documentation
 */
function generateEsewaSignature(secretKey: string, message: string): string {
  const hash = CryptoJS.HmacSHA256(message, secretKey);
  return CryptoJS.enc.Base64.stringify(hash);
}

/**
 * Initiate eSewa payment using ePay v2 API
 * Implements proper HMAC-SHA256 signature generation as per eSewa documentation
 */
export function initiateEsewaPayment({
  amount,
  orderData,
}: EsewaPaymentParams): void {
  // Get environment variables
  const merchantCode = process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || 'EPAYTEST';
  const secretKey = process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY;
  const paymentUrl = process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

  // Validate required environment variables
  if (!secretKey) {
    throw new Error('eSewa secret key is not configured. Please set NEXT_PUBLIC_ESEWA_SECRET_KEY environment variable.');
  }

  // Generate unique transaction UUID
  const transactionUuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create proper success and failure URLs with http/https protocol as required by eSewa
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const successUrl = `${baseUrl}/api/payment/esewa/success`;
  const failureUrl = `${baseUrl}/api/payment/esewa/failure`;

  // Prepare payment data according to eSewa documentation
  const paymentData = {
    amount: amount.toString(),
    tax_amount: "0",
    total_amount: amount.toString(),
    transaction_uuid: transactionUuid,
    product_code: merchantCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code"
  };

  // Create signature string as per eSewa documentation
  // Format: total_amount=100,transaction_uuid=11-201-13,product_code=EPAYTEST
  const signatureString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
  
  // Generate signature using HMAC-SHA256
  const signature = generateEsewaSignature(secretKey, signatureString);

  // Create form element
  const form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action", paymentUrl);
  form.setAttribute("style", "display: none");

  // Add all form fields including signature
  const formData = {
    ...paymentData,
    signature
  };

  // Create input fields and append to form
  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", key);
    input.setAttribute("value", value);
    form.appendChild(input);
  });

  // Append form to body and submit
  document.body.appendChild(form);
  form.submit();
}

/**
 * Verify eSewa payment status
 * Used to check transaction status after payment
 */
export async function verifyEsewaPayment({
  productCode,
  transactionUuid,
  totalAmount
}: EsewaVerificationParams): Promise<EsewaVerificationResponse> {
  const verificationUrl = process.env.NEXT_PUBLIC_ESEWA_VERIFICATION_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';
  
  const params = new URLSearchParams({
    product_code: productCode,
    transaction_uuid: transactionUuid,
    total_amount: totalAmount.toString()
  });

  try {
    const response = await fetch(`${verificationUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EsewaVerificationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('eSewa verification error:', error);
    throw new Error('Failed to verify eSewa payment');
  }
}

/**
 * Check if eSewa payment was successful
 */
export function isEsewaPaymentSuccessful(verificationResponse: EsewaVerificationResponse): boolean {
  return verificationResponse.status === 'COMPLETE';
}

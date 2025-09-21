export interface KhaltiPaymentParams {
  amount: number
  productId: string
  productName: string
  successUrl: string
  failureUrl: string
}

export interface KhaltiVerificationParams {
  token: string
  amount: number
}

export interface KhaltiVerificationResponse {
  idx: string
  token: string
  amount: number
  mobile: string
  product_identity: string
  product_name: string
  state: {
    idx: string
    name: string
  }
}

export function initiateKhaltiPayment({
  amount,
  productId,
  productName,
  successUrl,
  failureUrl,
}: KhaltiPaymentParams): void {
  // Load Khalti script if not already loaded
  if (!window.KhaltiCheckout) {
    const script = document.createElement("script")
    script.src = "https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.22.0.0.0/khalti-checkout.iffe.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      initializeKhaltiWidget()
    }
  } else {
    initializeKhaltiWidget()
  }

  function initializeKhaltiWidget() {
    // Khalti configuration
    const config = {
      // replace this key with yours
      publicKey: "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
      productIdentity: productId,
      productName: productName,
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload: any) {
          // Handle success
          window.location.href = `${successUrl}?transaction_id=${payload.token}&amount=${payload.amount}`
        },
        onError(error: any) {
          // Handle error
          window.location.href = `${failureUrl}?error=${error.message}`
        },
        onClose() {
          console.log("Khalti widget closed")
        },
      },
      paymentPreference: ["KHALTI"],
    }

    // Initialize Khalti checkout
    const checkout = new window.KhaltiCheckout(config)
    checkout.show({ amount: amount * 100 }) // Amount in paisa
  }
}

/**
 * Verify Khalti payment status
 * Used to check transaction status after payment
 */
export async function verifyKhaltiPayment({
  token,
  amount
}: KhaltiVerificationParams): Promise<KhaltiVerificationResponse> {
  const verificationUrl = 'https://khalti.com/api/v2/payment/verify/';
  const secretKey = process.env.KHALTI_SECRET_KEY || 'test_secret_key_f59e8b7d18b4499ca40f68195a846e9b';
  
  try {
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        amount: amount * 100 // Amount in paisa
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: KhaltiVerificationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Khalti verification error:', error);
    throw new Error('Failed to verify Khalti payment');
  }
}

/**
 * Check if Khalti payment was successful
 */
export function isKhaltiPaymentSuccessful(verificationResponse: KhaltiVerificationResponse): boolean {
  return verificationResponse.state.name === 'Completed';
}

// Add Khalti type definition
declare global {
  interface Window {
    KhaltiCheckout: any
  }
}

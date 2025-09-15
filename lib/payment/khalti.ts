export interface KhaltiPaymentParams {
  amount: number
  productId: string
  productName: string
  successUrl: string
  failureUrl: string
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

// Add Khalti type definition
declare global {
  interface Window {
    KhaltiCheckout: any
  }
}

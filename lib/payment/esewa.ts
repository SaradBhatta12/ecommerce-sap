export interface EsewaPaymentParams {
  amount: number
  productId: string
  productName: string
  successUrl: string
  failureUrl: string
}

export function initiateEsewaPayment({
  amount,
  productId,
  productName,
  successUrl,
  failureUrl,
}: EsewaPaymentParams): void {
  // Create a form element
  const form = document.createElement("form")
  form.setAttribute("method", "POST")
  form.setAttribute("action", "https://uat.esewa.com.np/epay/main") // Use production URL in production
  form.setAttribute("style", "display: none")

  // Add form fields
  const params = {
    amt: amount.toString(),
    psc: "0", // Service charge
    pdc: "0", // Delivery charge
    txAmt: "0", // Tax amount
    tAmt: amount.toString(), // Total amount
    pid: productId,
    scd: "EPAYTEST", // Merchant code (use your actual merchant code in production)
    su: successUrl,
    fu: failureUrl,
  }

  // Create input fields and append to form
  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement("input")
    input.setAttribute("type", "hidden")
    input.setAttribute("name", key)
    input.setAttribute("value", value)
    form.appendChild(input)
  })

  // Append form to body and submit
  document.body.appendChild(form)
  form.submit()
}

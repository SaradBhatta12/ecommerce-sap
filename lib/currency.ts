/**
 * Format currency in Nepali Rupees (NPR)
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export function formatNPR(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? "रू 0" : "0";
  }

  // Format number with commas for thousands separator
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `रू ${formatted}` : formatted;
}

/**
 * Format currency in Nepali Rupees with full text
 * @param amount - The amount to format
 * @returns Formatted currency string with "Rupees" text
 */
export function formatNPRWithText(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "रू 0 Rupees";
  }

  const formatted = formatNPR(amount, false);
  return `रू ${formatted} Rupees`;
}

/**
 * Parse NPR string back to number
 * @param nprString - The NPR formatted string
 * @returns Parsed number
 */
export function parseNPR(nprString: string): number {
  if (!nprString) return 0;
  
  // Remove currency symbols and text
  const cleanString = nprString
    .replace(/रू/g, '')
    .replace(/Rupees/gi, '')
    .replace(/,/g, '')
    .trim();
  
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert USD to NPR (approximate rate)
 * @param usdAmount - Amount in USD
 * @param exchangeRate - Current exchange rate (default: 132)
 * @returns Amount in NPR
 */
export function convertUSDToNPR(usdAmount: number, exchangeRate: number = 132): number {
  return usdAmount * exchangeRate;
}
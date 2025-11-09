/**
 * Format utilities for phone numbers, ID numbers, dates, etc.
 */

/**
 * Format Israeli phone number
 * Input: "0501234567" -> Output: "050-123-4567"
 */
export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";

  if (cleaned.length <= 3) {
    return cleaned;
  }

  if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

/**
 * Format Israeli ID number
 * Input: "123456789" -> Output: "12-3456789" (with validation)
 */
export function formatIdNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return "";

  if (cleaned.length <= 2) {
    return cleaned;
  }

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`;
}

/**
 * Format currency (Israeli Shekel)
 * Input: 3900 -> Output: "3,900 ₪"
 */
export function formatCurrency(amount: number): string {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  return `${amount.toLocaleString("he-IL")} ₪`;
}

/**
 * Format date for Hebrew locale
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate price based on selected claims
 */
export function calculateTotalPrice(claimCount: number, pricePerClaim: number = 3900): number {
  return claimCount * pricePerClaim;
}

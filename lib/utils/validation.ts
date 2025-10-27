/**
 * Custom validation utilities for Israeli-specific data
 */

/**
 * Validate Israeli ID number using checksum algorithm
 * https://en.wikipedia.org/wiki/Israeli_identity_card#Validation
 */
export function validateIsraeliId(id: string): boolean {
  const cleaned = id.replace(/\D/g, "");

  // Must be exactly 9 digits
  if (cleaned.length !== 9) return false;

  // Pad with leading zeros if needed
  const paddedId = cleaned.padStart(9, "0");

  // Luhn algorithm for Israeli ID
  const sum = paddedId
    .split("")
    .reduce((acc, digit, index) => {
      let num = parseInt(digit) * (((index % 2) + 1));
      if (num > 9) num -= 9;
      return acc + num;
    }, 0);

  return sum % 10 === 0;
}

/**
 * Validate Israeli phone number
 * Supports: 05X-XXX-XXXX, 0X-XXX-XXXX (landline)
 */
export function validateIsraeliPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");

  // Mobile: 10 digits starting with 05
  const mobilePattern = /^05\d{8}$/;

  // Landline: 9-10 digits starting with 0
  const landlinePattern = /^0[2-4,8-9]\d{7,8}$/;

  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
}

/**
 * Validate email address (basic)
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if date is in the future
 */
export function isDateInFuture(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if person is over 18 (legal adult in Israel)
 */
export function isLegalAdult(birthDate: string | Date): boolean {
  return calculateAge(birthDate) >= 18;
}

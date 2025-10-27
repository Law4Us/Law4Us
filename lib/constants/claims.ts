import type { Claim, ClaimType } from "../types";

/**
 * Available claim types with labels and pricing
 * Price is per claim in Israeli Shekels (₪)
 */
export const CLAIMS: Claim[] = [
  {
    key: "divorceAgreement",
    label: "הסכם גירושין",
    price: 3900,
  },
  {
    key: "divorce",
    label: "תביעת גירושין/כתב הגנה גירושין",
    price: 3900,
  },
  {
    key: "property",
    label: "תביעת/כתב הגנה רכושית",
    price: 3900,
  },
  {
    key: "custody",
    label: "תביעת/כתב הגנה משמורת",
    price: 3900,
  },
  {
    key: "alimony",
    label: "תביעת/כתב הגנה מזונות",
    price: 3900,
  },
] as const;

/**
 * Get claim by key
 */
export function getClaimByKey(key: ClaimType): Claim | undefined {
  return CLAIMS.find((claim) => claim.key === key);
}

/**
 * Get claim label by key
 */
export function getClaimLabel(key: ClaimType): string {
  return getClaimByKey(key)?.label || key;
}

/**
 * Calculate total price for selected claims
 */
export function calculateTotal(selectedClaims: ClaimType[]): number {
  return selectedClaims.reduce((total, key) => {
    const claim = getClaimByKey(key);
    return total + (claim?.price || 0);
  }, 0);
}

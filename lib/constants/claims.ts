import type { Claim, ClaimType } from "../types";

/**
 * Available claim types with labels, descriptions, and pricing
 * Price is per claim in Israeli Shekels (₪)
 */
export const CLAIMS: Claim[] = [
  {
    key: "divorceAgreement",
    label: "הסכם גירושין",
    description: "הסכם מפורט המסדיר את תנאי הגירושין, כולל חלוקת רכוש, משמורת, מזונות וכל הסדר נוסף בין הצדדים",
    price: 3900,
  },
  {
    key: "divorce",
    label: "תביעת גירושין/כתב הגנה גירושין",
    description: "הגשת תביעה לגירושין או כתב הגנה נגד תביעת גירושין בבית המשפט לענייני משפחה",
    price: 3900,
  },
  {
    key: "property",
    label: "תביעת/כתב הגנה רכושית",
    description: "תביעה או הגנה בעניין חלוקת הרכוש המשותף, נכסים, חובות וזכויות כלכליות",
    price: 3900,
  },
  {
    key: "custody",
    label: "תביעת/כתב הגנה משמורת",
    description: "הסדרת משמורת הילדים, הסדרי שהייה, סמכות הורית וכל עניין הנוגע לרווחת הילדים",
    price: 3900,
  },
  {
    key: "alimony",
    label: "תביעת/כתב הגנה מזונות",
    description: "תביעה או הגנה בעניין מזונות לילדים, מזונות לבן/בת זוג או הפחתת מזונות קיימים",
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

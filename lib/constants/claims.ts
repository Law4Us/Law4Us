import type { Claim, ClaimType } from "../types";

/**
 * Available claim types with labels, descriptions, and pricing
 * Price is per claim in Israeli Shekels (₪)
 *
 * Pricing model:
 * - Family court claims: ₪3,900 per claim
 * - Rabbinical bundled divorce: ₪3,900 TOTAL (includes divorce + custody + alimony + property)
 */
export const CLAIMS: Claim[] = [
  {
    key: "divorceAgreement",
    label: "הסכם גירושין",
    description: "הסכם מפורט המסדיר את תנאי הגירושין, כולל חלוקת רכוש, משמורת, מזונות וכל הסדר נוסף בין הצדדים",
    price: 3900,
  },
  {
    key: "shalomBayit",
    label: "שלום בית",
    description: "תביעה לשלום בית בבית הדין הרבני, לניסיון פיוס והצלת הנישואין",
    price: 3900,
  },
  {
    key: "divorceRabbinical",
    label: "חבילת גירושין רבני",
    description: "תביעת גירושין בבית הדין הרבני כולל כריכת כל התביעות הנלוות (משמורת, מזונות, רכוש)",
    price: 3900,
    isBundle: true,
    bundledClaims: ["custody", "alimony", "property"],
  },
  {
    key: "divorce",
    label: "תביעת גירושין משפחתי",
    description: "הגשת תביעה לגירושין בבית המשפט לענייני משפחה",
    price: 3900,
  },
  {
    key: "property",
    label: "תביעת רכושית",
    description: "תביעה בעניין חלוקת הרכוש המשותף, נכסים, חובות וזכויות כלכליות",
    price: 3900,
  },
  {
    key: "custody",
    label: "תביעת משמורת",
    description: "הסדרת משמורת הילדים, הסדרי שהייה, סמכות הורית וכל עניין הנוגע לרווחת הילדים",
    price: 3900,
  },
  {
    key: "alimony",
    label: "תביעת מזונות",
    description: "תביעה בעניין מזונות לילדים, מזונות לבן/בת זוג או הפחתת מזונות קיימים",
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
 * Note: Bundled claims (like divorceRabbinical) include multiple claims in one price
 */
export function calculateTotal(selectedClaims: ClaimType[]): number {
  // Check if any bundled claim is selected
  const bundledClaim = selectedClaims.find((key) => {
    const claim = getClaimByKey(key);
    return claim?.isBundle;
  });

  if (bundledClaim) {
    const bundle = getClaimByKey(bundledClaim);
    if (bundle) {
      // For bundled claims, only charge the bundle price
      // Any additional non-bundled claims are added separately
      const bundledClaimKeys = bundle.bundledClaims || [];
      const additionalClaims = selectedClaims.filter(
        (key) => key !== bundledClaim && !bundledClaimKeys.includes(key)
      );
      const additionalPrice = additionalClaims.reduce((total, key) => {
        const claim = getClaimByKey(key);
        return total + (claim?.price || 0);
      }, 0);
      return bundle.price + additionalPrice;
    }
  }

  // No bundle - calculate normally
  return selectedClaims.reduce((total, key) => {
    const claim = getClaimByKey(key);
    return total + (claim?.price || 0);
  }, 0);
}

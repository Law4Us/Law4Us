import type { Claim, ClaimType } from "../types";

export const SERVICE_FEE = 3900;
export const VAT_RATE = 0.18;

/**
 * Court/government fees are configured in one place because they change
 * independently of the legal service fee and must never receive VAT.
 *
 * The `בקשה` fee supplied for this update is used for agreement approval and
 * shalom-bayit requests until a procedure-specific fee is supplied.
 */
export const COURT_FEES_BY_PROCEDURE: Record<ClaimType, number> = {
  disputeResolution: 119,
  divorceAgreement: 280,
  shalomBayit: 280,
  divorceRabbinical: 899,
  property: 596,
  custody: 417,
  alimony: 280,
};

export interface PricingBreakdown {
  serviceFeePerProcedure: number;
  billableProcedureCount: number;
  serviceSubtotal: number;
  vatRate: number;
  vatAmount: number;
  courtFeeTotal: number;
  total: number;
}

export const CLAIMS: Claim[] = [
  {
    key: "disputeResolution",
    label: "בקשה ליישוב סכסוך",
    description: "פתיחת הליך מקדים להפניה ליחידת הסיוע לפני הגשת תביעה",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.disputeResolution,
  },
  {
    key: "divorceAgreement",
    label: "הסכם גירושין",
    description: "הסכם מפורט המסדיר את תנאי הגירושין, כולל חלוקת רכוש, משמורת, מזונות וכל הסדר נוסף בין הצדדים",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.divorceAgreement,
  },
  {
    key: "shalomBayit",
    label: "שלום בית",
    description: "תביעה לשלום בית בבית הדין הרבני, לניסיון פיוס והצלת הנישואין",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.shalomBayit,
  },
  {
    key: "divorceRabbinical",
    label: "חבילת גירושין רבני",
    description: "תביעת גירושין בבית הדין הרבני כולל כריכת כל התביעות הנלוות (משמורת, מזונות, רכוש)",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.divorceRabbinical,
    isBundle: true,
    bundledClaims: ["custody", "alimony", "property"],
  },
  {
    key: "property",
    label: "תביעת רכושית",
    description: "תביעה בעניין חלוקת הרכוש המשותף, נכסים, חובות וזכויות כלכליות",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.property,
  },
  {
    key: "custody",
    label: "תביעת משמורת",
    description: "הסדרת משמורת הילדים, הסדרי שהייה, סמכות הורית וכל עניין הנוגע לרווחת הילדים",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.custody,
  },
  {
    key: "alimony",
    label: "תביעת מזונות",
    description: "תביעה בעניין מזונות לילדים, מזונות לבן/בת זוג או הפחתת מזונות קיימים",
    price: SERVICE_FEE,
    courtFee: COURT_FEES_BY_PROCEDURE.alimony,
  },
];

export function getClaimByKey(key: ClaimType): Claim | undefined {
  return CLAIMS.find((claim) => claim.key === key);
}

export function getClaimLabel(key: ClaimType): string {
  return getClaimByKey(key)?.label || key;
}

export function getBillableClaims(selectedClaims: ClaimType[]): Claim[] {
  const selected = selectedClaims
    .map(getClaimByKey)
    .filter((claim): claim is Claim => Boolean(claim));
  const bundle = selected.find((claim) => claim.isBundle);

  if (!bundle) {
    return selected;
  }

  const includedInBundle = new Set(bundle.bundledClaims || []);
  return selected.filter(
    (claim) => claim.key === bundle.key || !includedInBundle.has(claim.key)
  );
}

/**
 * Calculate the payable amount for both UI display and payment creation.
 * VAT is applied to the lawyer/service subtotal only; filing fees are added
 * afterwards and intentionally do not participate in the VAT calculation.
 */
export function calculatePricing(selectedClaims: ClaimType[]): PricingBreakdown {
  const billableClaims = getBillableClaims(selectedClaims);
  const serviceSubtotal = billableClaims.length * SERVICE_FEE;
  const vatAmount = Math.round(serviceSubtotal * VAT_RATE);
  const courtFeeTotal = billableClaims.reduce((sum, claim) => sum + claim.courtFee, 0);

  return {
    serviceFeePerProcedure: SERVICE_FEE,
    billableProcedureCount: billableClaims.length,
    serviceSubtotal,
    vatRate: VAT_RATE,
    vatAmount,
    courtFeeTotal,
    total: serviceSubtotal + vatAmount + courtFeeTotal,
  };
}

export function calculateTotal(selectedClaims: ClaimType[]): number {
  return calculatePricing(selectedClaims).total;
}

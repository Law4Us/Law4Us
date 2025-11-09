import { z } from "zod";

/**
 * Schemas for claim-specific questions (Step 2)
 * Each claim type has its own set of questions
 */

// Shared schema for children (simple version)
export const childSimpleSchema = z.object({
  __id: z.string(),
  firstName: z.string().min(1, "יש למלא שם פרטי"),
  lastName: z.string().min(1, "יש למלא שם משפחה"),
  birthDate: z.string().min(1, "יש למלא תאריך לידה"),
});

// Shared schema for children (full version with details)
export const childFullSchema = z.object({
  __id: z.string(),
  firstName: z.string().min(1, "יש למלא שם פרטי"),
  lastName: z.string().min(1, "יש למלא שם משפחה"),
  birthDate: z.string().min(1, "יש למלא תאריך לידה"),
  idNumber: z.string().min(1, "יש למלא תעודת זהות"),
  details: z.string().optional(),
});

// Divorce Agreement schema
export const divorceAgreementSchema = z.object({
  children: z.array(childSimpleSchema).optional(),
  // Property division
  propertyAgreement: z.string().min(1, "יש לבחור אופציה"),
  propertyCustom: z.string().optional(),
  // Custody
  custodyAgreement: z.string().min(1, "יש לבחור אופציה"),
  custodyCustom: z.string().optional(),
  // Visitation
  visitationAgreement: z.string().optional(),
  visitationCustom: z.string().optional(),
  // Alimony
  alimonyAgreement: z.string().min(1, "יש לבחור אופציה"),
  alimonyAmount: z.coerce.number().optional(),
  alimonyCustom: z.string().optional(),
  // Additional terms
  additionalTerms: z.string().optional(),
  uploadedAgreement: z.any().optional(), // File upload
});

// Divorce Claim schema
export const divorceClaimSchema = z.object({
  children: z.array(childFullSchema).optional(),
  separationDate: z.string().optional(),
  divorceReason: z.string().optional(),
  additionalInfo: z.string().optional(),
  weddingCity: z.string().optional(),
  religiousMarriage: z.enum(["כן", "לא"]).optional(),
  religiousCouncil: z.string().optional(),
  policeComplaints: z.enum(["כן", "לא"]).optional(),
  policeComplaintsWho: z.string().optional(),
  policeComplaintsWhere: z.string().optional(),
  policeComplaintsDate: z.string().optional(),
  policeComplaintsOutcome: z.string().optional(),
  divorceReasons: z.string().optional(),
});

// Property Claim schema
export const propertyClaimSchema = z.object({
  children: z.array(childFullSchema).optional(),
  hasAssets: z.enum(["yes", "no"], {
    required_error: "יש לציין האם קיימים נכסים או חובות",
  }),
  // Properties, debts, accounts will be added as repeaters in Prompt 4
  hasSharedProperty: z.enum(["כן", "לא"]).optional(),
  hasSharedDebts: z.enum(["כן", "לא"]).optional(),
  hasSharedAccounts: z.enum(["כן", "לא"]).optional(),
});

// Custody Claim schema
export const custodyClaimSchema = z.object({
  children: z.array(childFullSchema).min(1, "יש להוסיף לפחות ילד אחד"),
  custodyType: z
    .enum(["exclusive", "shared", "equal"], {
      required_error: "יש לבחור סוג משמורת",
    })
    .optional(),
  custodyReason: z.string().optional(),
});

// Alimony Claim schema
export const alimonyClaimSchema = z.object({
  children: z.array(childFullSchema).min(1, "יש להוסיף לפחות ילד אחד"),
  hasChildrenNeeds: z.enum(["yes", "no"], {
    required_error: "יש לציין האם קיימות הוצאות לקטינים",
  }),
  hasHouseholdNeeds: z.enum(["yes", "no"], {
    required_error: "יש לציין האם קיימות הוצאות מדור",
  }),
  // Needs table will be added in Prompt 4
  hasChildSupport: z.enum(["כן", "לא"]).optional(),
  hasSpousalSupport: z.enum(["כן", "לא"]).optional(),
  monthlyIncome: z.string().optional(),
  monthlyExpenses: z.string().optional(),
});

// Combined claim schemas type
export type DivorceAgreement = z.infer<typeof divorceAgreementSchema>;
export type DivorceClaim = z.infer<typeof divorceClaimSchema>;
export type PropertyClaim = z.infer<typeof propertyClaimSchema>;
export type CustodyClaim = z.infer<typeof custodyClaimSchema>;
export type AlimonyClaim = z.infer<typeof alimonyClaimSchema>;

// Union type for all claim data
export type ClaimData = {
  divorceAgreement?: DivorceAgreement;
  divorce?: DivorceClaim;
  property?: PropertyClaim;
  custody?: CustodyClaim;
  alimony?: AlimonyClaim;
};

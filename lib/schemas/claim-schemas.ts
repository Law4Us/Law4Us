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
  relationshipAgreement: z
    .string()
    .min(10, "אנא פרט על מה הסכמתם (לפחות 10 תווים)")
    .max(500, "הטקסט ארוך מדי"),
});

// Divorce Claim schema
export const divorceClaimSchema = z.object({
  children: z.array(childFullSchema).optional(),
  separationDate: z.string().optional(),
  divorceReason: z.string().optional(),
  additionalInfo: z.string().optional(),
});

// Property Claim schema
export const propertyClaimSchema = z.object({
  children: z.array(childFullSchema).optional(),
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

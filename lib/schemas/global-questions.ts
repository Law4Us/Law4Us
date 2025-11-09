import { z } from "zod";

/**
 * Schema for global questions (Step 2)
 * These questions are shown for all claim types
 */

// Previous marriages section
export const previousMarriagesSchema = z.object({
  marriedBefore: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  hadChildrenFromPrevious: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  marriedBefore2: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  hadChildrenFromPrevious2: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
});

// Housing section
export const housingSchema = z.object({
  applicantHomeType: z.enum(
    ["jointOwnership", "applicantOwnership", "respondentOwnership", "rental", "other"],
    {
      required_error: "יש לבחור סוג דיור",
    }
  ),
  partnerHomeType: z.enum(
    ["jointOwnership", "applicantOwnership", "respondentOwnership", "rental", "other"],
    {
      required_error: "יש לבחור סוג דיור",
    }
  ),
});

// Family violence section
export const familyViolenceSchema = z.object({
  protectionOrderRequested: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  protectionOrderDate: z.string().optional(),
  protectionOrderAgainst: z.string().optional(),
  protectionOrderCaseNumber: z.string().optional(),
  protectionOrderJudge: z.string().optional(),
  protectionOrderGiven: z.enum(["כן", "לא"]).optional(),
  protectionOrderGivenDate: z.string().optional(),
  protectionOrderContent: z.string().optional(),

  pastViolenceReported: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  pastViolenceReportedDetails: z.string().optional(),
});

// Other family cases (repeater)
export const otherFamilyCaseSchema = z.object({
  __id: z.string(),
  caseNumber: z.string().min(1, "יש למלא מספר תיק"),
  judge: z.string().min(1, "יש למלא בפני מי נדון"),
  caseNature: z.string().min(1, "יש למלא מהות התיק"),
  caseEndDate: z.string().optional(),
});

export const otherFamilyCasesSchema = z.object({
  otherFamilyCases: z.array(otherFamilyCaseSchema).optional(),
});

// Welfare and counseling section
export const welfareSchema = z.object({
  contactedWelfare: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  contactedMarriageCounseling: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  willingToJoinFamilyCounseling: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
  willingToJoinMediation: z.enum(["כן", "לא"], {
    required_error: "יש לענות על השאלה",
  }),
});

// Children overview
export const childrenOverviewSchema = z.object({
  hasSharedChildren: z.enum(["yes", "no"], {
    required_error: "יש לציין האם יש ילדים משותפים",
  }),
});

// Combined global questions schema
export const globalQuestionsSchema = z.object({
  ...previousMarriagesSchema.shape,
  ...housingSchema.shape,
  ...familyViolenceSchema.shape,
  ...welfareSchema.shape,
  ...childrenOverviewSchema.shape,
});

export type GlobalQuestions = z.infer<typeof globalQuestionsSchema>;

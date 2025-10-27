import { z } from "zod";
import { validateIsraeliId, validateIsraeliPhone } from "../utils/validation";

/**
 * Schema for basic info (Step 1 - Claim Picker)
 * Validates both plaintiff and defendant information
 */
export const basicInfoSchema = z
  .object({
    // Plaintiff (תובע/בעל/אישה)
    fullName: z
      .string()
      .min(2, "שם חייב להכיל לפחות 2 תווים")
      .max(100, "שם ארוך מדי"),
    idNumber: z
      .string()
      .min(9, "מספר זהות חייב להכיל 9 ספרות")
      .refine(validateIsraeliId, "מספר זהות לא תקין"),
    address: z
      .string()
      .min(5, "כתובת חייבת להכיל לפחות 5 תווים")
      .max(200, "כתובת ארוכה מדי"),
    phone: z
      .string()
      .refine(validateIsraeliPhone, "מספר טלפון לא תקין"),
    email: z
      .string()
      .email("כתובת מייל לא תקינה"),
    birthDate: z
      .string()
      .min(1, "יש למלא תאריך לידה")
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 18 && age <= 120;
        },
        "יש להיות מעל גיל 18"
      ),

    // Defendant (נתבע/בעל/אישה)
    fullName2: z
      .string()
      .min(2, "שם חייב להכיל לפחות 2 תווים")
      .max(100, "שם ארוך מדי"),
    idNumber2: z
      .string()
      .min(9, "מספר זהות חייב להכיל 9 ספרות")
      .refine(validateIsraeliId, "מספר זהות לא תקין"),
    address2: z
      .string()
      .min(5, "כתובת חייבת להכיל לפחות 5 תווים")
      .max(200, "כתובת ארוכה מדי"),
    phone2: z
      .string()
      .refine(validateIsraeliPhone, "מספר טלפון לא תקין"),
    email2: z
      .string()
      .email("כתובת מייל לא תקינה"),
    birthDate2: z
      .string()
      .min(1, "יש למלא תאריך לידה")
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 18 && age <= 120;
        },
        "יש להיות מעל גיל 18"
      ),

    // Relationship info
    relationshipType: z.enum(["married", "commonLaw", "separated", "notMarried"], {
      required_error: "יש לבחור סטטוס זוגי",
    }),
    weddingDay: z.string().optional(),
  })
  .refine(
    (data) => {
      // If not married, wedding day not required
      if (data.relationshipType === "notMarried") {
        return true;
      }
      // Otherwise, wedding day is required
      return data.weddingDay && data.weddingDay.length > 0;
    },
    {
      message: "תאריך נישואין נדרש",
      path: ["weddingDay"],
    }
  );

export type BasicInfo = z.infer<typeof basicInfoSchema>;

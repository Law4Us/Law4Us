/**
 * Question definitions for the wizard
 * Organized by sections: global questions and claim-specific questions
 */

import {
  OTHER_FAMILY_CASES_FIELDS,
  CHILDREN_FIELDS,
  APARTMENT_FIELDS,
  VEHICLE_FIELDS,
  SAVINGS_FIELDS,
  BENEFITS_FIELDS,
 PROPERTY_FIELDS,
 DEBT_FIELDS,
} from "./property-repeaters";
import type { RepeaterField } from "@/components/wizard/repeater";

export type QuestionType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "radio"
  | "file"
  | "fileList"
  | "heading"
  | "repeater";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: QuestionOption[];
  conditional?: {
    dependsOn: string;
    showWhen: string | string[];
  };
  maxLength?: number;
  accept?: string; // for file inputs
  repeaterConfig?: {
    fields: RepeaterField[];
    addButtonLabel?: string;
    minRows?: number;
    maxRows?: number;
  };
}

// ============================================================================
// GLOBAL QUESTIONS (shown for all claim types)
// ============================================================================

export const GLOBAL_QUESTIONS: Question[] = [
  // Section 1: Previous Marriages
  {
    id: "heading-previous-marriages",
    type: "heading",
    label: "נישואים קודמים",
  },
  {
    id: "marriedBefore",
    type: "radio",
    label: "האם [APPLICANT_NAME] היה/ה נשוי/אה בעבר?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "hadChildrenFromPrevious",
    type: "radio",
    label: "האם ל[APPLICANT_NAME] יש ילדים מנישואים קודמים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "marriedBefore2",
    type: "radio",
    label: "האם [RESPONDENT_NAME] היה/ה נשוי/אה בעבר?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "hadChildrenFromPrevious2",
    type: "radio",
    label: "האם ל[RESPONDENT_NAME] יש ילדים מנישואים קודמים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },

  // Section 2: Housing
  {
    id: "heading-housing",
    type: "heading",
    label: "דיור",
  },
  {
    id: "applicantHomeType",
    type: "radio",
    label: "סוג הדיור של [APPLICANT_NAME]:",
    required: true,
    options: [
      { value: "jointOwnership", label: "בעלות משותפת" },
      { value: "applicantOwnership", label: "בבעלות [APPLICANT_NAME]" },
      { value: "respondentOwnership", label: "בבעלות [RESPONDENT_NAME]" },
      { value: "rental", label: "שכירות" },
      { value: "other", label: "אחר" },
    ],
  },
  {
    id: "partnerHomeType",
    type: "radio",
    label: "סוג הדיור של [RESPONDENT_NAME]:",
    required: true,
    options: [
      { value: "jointOwnership", label: "בעלות משותפת" },
      { value: "applicantOwnership", label: "בבעלות [APPLICANT_NAME]" },
      { value: "respondentOwnership", label: "בבעלות [RESPONDENT_NAME]" },
      { value: "rental", label: "שכירות" },
      { value: "other", label: "אחר" },
    ],
  },

  // Section 3: Family Violence
  {
    id: "heading-family-violence",
    type: "heading",
    label: "אלימות במשפחה",
  },
  {
    id: "protectionOrderRequested",
    type: "radio",
    label: "האם הוגשה בקשה לצו הגנה?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "protectionOrderDate",
    type: "date",
    label: "תאריך הגשת הבקשה לצו הגנה:",
    conditional: {
      dependsOn: "protectionOrderRequested",
      showWhen: "כן",
    },
  },
  {
    id: "protectionOrderAgainst",
    type: "text",
    label: "נגד מי הוגשה הבקשה?",
    placeholder: "שם מלא",
    conditional: {
      dependsOn: "protectionOrderRequested",
      showWhen: "כן",
    },
  },
  {
    id: "protectionOrderCaseNumber",
    type: "text",
    label: "מספר תיק:",
    placeholder: "מספר תיק בבית המשפט",
    conditional: {
      dependsOn: "protectionOrderRequested",
      showWhen: "כן",
    },
  },
  {
    id: "protectionOrderJudge",
    type: "text",
    label: "בפני מי נדון?",
    placeholder: "שם השופט/ת",
    conditional: {
      dependsOn: "protectionOrderRequested",
      showWhen: "כן",
    },
  },
  {
    id: "protectionOrderGiven",
    type: "radio",
    label: "האם ניתן צו הגנה?",
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "protectionOrderRequested",
      showWhen: "כן",
    },
  },
  {
    id: "protectionOrderGivenDate",
    type: "date",
    label: "תאריך מתן צו ההגנה:",
    conditional: {
      dependsOn: "protectionOrderGiven",
      showWhen: "כן",
    },
  },
  {
    id: "protectionOrderContent",
    type: "textarea",
    label: "תוכן צו ההגנה:",
    placeholder: "פרטו את תנאי צו ההגנה...",
    maxLength: 500,
    conditional: {
      dependsOn: "protectionOrderGiven",
      showWhen: "כן",
    },
  },
  {
    id: "pastViolenceReported",
    type: "radio",
    label: "האם דווח על אלימות בעבר (למשטרה/רווחה)?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "pastViolenceReportedDetails",
    type: "textarea",
    label: "פרטו:",
    placeholder: "פרטו מתי, לאן ומה דווח...",
    maxLength: 500,
    conditional: {
      dependsOn: "pastViolenceReported",
      showWhen: "כן",
    },
  },

  // Section 3.5: Other Family Cases
  {
    id: "otherFamilyCases",
    type: "repeater",
    label: "נתונים על תיקים אחרים בענייני המשפחה בין בני הזוג",
    helper: "פרטו לגבי כל תיק בנפרד",
    repeaterConfig: {
      fields: OTHER_FAMILY_CASES_FIELDS,
      addButtonLabel: "הוסף תיק",
      minRows: 0,
      maxRows: 10,
    },
  },

  // Section 4: Welfare and Counseling
  {
    id: "heading-welfare",
    type: "heading",
    label: "רווחה וייעוץ",
  },
  {
    id: "contactedWelfare",
    type: "radio",
    label: "האם פניתם לשירותי הרווחה?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "contactedMarriageCounseling",
    type: "radio",
    label: "האם פניתם לייעוץ נישואין?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "willingToJoinFamilyCounseling",
    type: "radio",
    label: "האם אתם מוכנים להשתתף בייעוץ משפחתי?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "willingToJoinMediation",
    type: "radio",
    label: "האם אתם מוכנים להשתתף בגישור?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },

  // Section 4.5: Living Situation (Separation)
  {
    id: "heading-living-situation",
    type: "heading",
    label: "מצב מגורים",
  },
  {
    id: "livingSeparately",
    type: "radio",
    label: "האם הצדדים גרים בנפרד?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "separationDate",
    type: "date",
    label: "ממתי גרים בנפרד?",
    conditional: {
      dependsOn: "livingSeparately",
      showWhen: "כן",
    },
  },

  // Section 4.7: Relationship Description
  {
    id: "heading-relationship",
    type: "heading",
    label: "מערכת היחסים",
  },
  {
    id: "relationshipDescription",
    type: "textarea",
    label: "תארו בקצרה את מערכת היחסים בינכם:",
    placeholder: "תארו את מערכת היחסים שלכם...",
    maxLength: 500,
    required: true,
    helper: "כתבו בחופשיות במילים שלכם - אין צורך בשפה משפטית",
  },

  // Section 5: Children
  {
    id: "heading-children",
    type: "heading",
    label: "ילדים",
  },
  {
    id: "hasSharedChildren",
    type: "radio",
    label: "האם יש לכם ילדים משותפים?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "children",
    type: "repeater",
    label: "פרטי ילדים",
    helper: "הוסיפו את פרטי כל הילדים מהנישואין. עבור כל ילד/ה, תארו את מערכת היחסים שלכם איתם",
    repeaterConfig: {
      fields: CHILDREN_FIELDS,
      addButtonLabel: "הוסף ילד/ה",
      minRows: 0,
      maxRows: 10,
    },
    conditional: {
      dependsOn: "hasSharedChildren",
      showWhen: "yes",
    },
  },
];

// ============================================================================
// CLAIM-SPECIFIC QUESTIONS
// ============================================================================

// Request for dispute resolution (בקשה ליישוב סכסוך - טופס 1)
export const DISPUTE_RESOLUTION_QUESTIONS: Question[] = [
  {
    id: "heading-dispute-resolution",
    type: "heading",
    label: "בקשה ליישוב סכסוך",
    helper: "פרטים אלה ימולאו בטופס 1 הרשמי שיוגש ליחידת הסיוע.",
  },
  {
    id: "disputeResolution.courtType",
    type: "radio",
    label: "לאיזו ערכאה תרצו להגיש את הבקשה?",
    required: true,
    options: [
      { value: "familyCourt", label: "בית המשפט לענייני משפחה" },
      { value: "rabbinicalCourt", label: "בית הדין הרבני האזורי" },
    ],
  },
  {
    id: "disputeResolution.courtCity",
    type: "text",
    label: "באיזו עיר נמצאת הערכאה?",
    placeholder: "לדוגמה: תל אביב",
    required: true,
  },
  {
    id: "disputeResolution.relationshipToRespondent",
    type: "radio",
    label: "מה הקשר בינך לבין המשיב/ה?",
    required: true,
    options: [
      { value: "spouse", label: "בן/בת זוג" },
      { value: "parentOfChild", label: "הורה של ילדי" },
      { value: "child", label: "ילד/ה שלי" },
      { value: "father", label: "אבי" },
      { value: "mother", label: "אמי" },
    ],
  },
  {
    id: "disputeResolution.noPendingApplication",
    type: "radio",
    label: "האם למיטב ידיעתך אין בקשה אחרת ליישוב סכסוך בינך לבין המשיב/ה שתלויה ועומדת?",
    helper: "ניתן להפיק את טופס 1 רק אם אין בקשה מקבילה תלויה ועומדת בערכאה כלשהי.",
    required: true,
    options: [
      { value: "yes", label: "כן, אין בקשה תלויה ועומדת" },
      { value: "no", label: "לא / אינני בטוח/ה" },
    ],
  },
];

// Divorce Agreement (הסכם גירושין)
export const DIVORCE_AGREEMENT_QUESTIONS: Question[] = [
  {
    id: "heading-divorce-agreement",
    type: "heading",
    label: "הסכם גירושין",
  },

  // Property division
  {
    id: "divorceAgreement.propertyAgreement",
    type: "radio",
    label: "חלוקת רכוש:",
    required: true,
    options: [
      { value: "referenceClaim", label: "כמפורט בתביעה הרכושית הנפרדת" },
      { value: "eachKeepsOwn", label: "כל צד שומר על הרכוש שברשותו" },
      { value: "equalSplit", label: "חלוקה שווה של כל הרכוש" },
      { value: "custom", label: "הסדר מותאם אישית" },
    ],
  },
  {
    id: "divorceAgreement.propertyCustom",
    type: "textarea",
    label: "פרטי חלוקת הרכוש:",
    placeholder: "תארו בקצרה כיצד יחולק הרכוש...",
    maxLength: 300,
    helper: "כתבו בשפה פשוטה, נעביר לניסוח משפטי",
    conditional: {
      dependsOn: "divorceAgreement.propertyAgreement",
      showWhen: "custom",
    },
  },

  // Custody
  {
    id: "divorceAgreement.custodyAgreement",
    type: "radio",
    label: "משמורת:",
    required: true,
    options: [
      { value: "referenceClaim", label: "כמפורט בתביעת המשמורת הנפרדת" },
      { value: "jointCustody", label: "משמורת משותפת" },
      { value: "applicantCustody", label: "משמורת מלאה למבקש/ת" },
      { value: "respondentCustody", label: "משמורת מלאה למשיב/ה" },
      { value: "custom", label: "הסדר מותאם אישית" },
      { value: "noChildren", label: "אין ילדים" },
    ],
  },
  {
    id: "divorceAgreement.custodyCustom",
    type: "textarea",
    label: "פרטי הסדר המשמורת:",
    placeholder: "תארו בקצרה את הסדר המשמורת...",
    maxLength: 300,
    helper: "כתבו בשפה פשוטה, נעביר לניסוח משפטי",
    conditional: {
      dependsOn: "divorceAgreement.custodyAgreement",
      showWhen: "custom",
    },
  },

  // Visitation
  {
    id: "divorceAgreement.visitationAgreement",
    type: "radio",
    label: "הסדרי ראייה:",
    required: false,
    options: [
      { value: "referenceClaim", label: "כמפורט בתביעת המשמורת הנפרדת" },
      { value: "flexible", label: "הסדר גמיש בהסכמה" },
      { value: "fixed", label: "הסדר קבוע" },
      { value: "custom", label: "הסדר מותאם אישית" },
    ],
    conditional: {
      dependsOn: "divorceAgreement.custodyAgreement",
      showWhen: ["jointCustody", "applicantCustody", "respondentCustody", "custom"],
    },
  },
  {
    id: "divorceAgreement.visitationCustom",
    type: "textarea",
    label: "פרטי הסדרי הראייה:",
    placeholder: "תארו את הסדרי הראייה המוסכמים...",
    maxLength: 300,
    helper: "למשל: סופי שבוע מתחלפים, ימים באמצע השבוע, חלוקת חגים",
    conditional: {
      dependsOn: "divorceAgreement.visitationAgreement",
      showWhen: "custom",
    },
  },

  // Alimony
  {
    id: "divorceAgreement.alimonyAgreement",
    type: "radio",
    label: "מזונות:",
    required: true,
    options: [
      { value: "referenceClaim", label: "כמפורט בתביעת המזונות הנפרדת" },
      { value: "specificAmount", label: "סכום מוסכם" },
      { value: "none", label: "אין חיוב במזונות" },
      { value: "custom", label: "הסדר מותאם אישית" },
    ],
  },
  {
    id: "divorceAgreement.alimonyAmount",
    type: "number",
    label: "סכום מזונות חודשי (₪):",
    placeholder: "0",
    conditional: {
      dependsOn: "divorceAgreement.alimonyAgreement",
      showWhen: "specificAmount",
    },
  },
  {
    id: "divorceAgreement.alimonyCustom",
    type: "textarea",
    label: "פרטי הסדר המזונות:",
    placeholder: "תארו את ההסדר המוסכם...",
    maxLength: 300,
    helper: "כתבו בשפה פשוטה, נעביר לניסוח משפטי",
    conditional: {
      dependsOn: "divorceAgreement.alimonyAgreement",
      showWhen: "custom",
    },
  },

  // Additional terms
  {
    id: "divorceAgreement.additionalTerms",
    type: "textarea",
    label: "תנאים נוספים (אופציונלי):",
    placeholder: "תארו כל הסכמה נוספת שחשוב לכלול...",
    maxLength: 300,
    helper: "למשל: ביטוחים, הוצאות נוספות, ירושה, שם משפחה",
  },

  // Upload existing agreement
  {
    id: "divorceAgreement.uploadedAgreement",
    type: "file",
    label: "העלאת הסכם קיים (אופציונלי):",
    accept: ".pdf,.doc,.docx",
    helper: "אם יש לכם הסכם בכתב, תוכלו להעלות אותו כאן",
  },
];

// Divorce (גירושין)
export const DIVORCE_QUESTIONS: Question[] = [
  {
    id: "heading-divorce",
    type: "heading",
    label: "גירושין",
  },
  // ========== STEP 1: Empathetic Situation Assessment ==========
  {
    id: "divorce.currentSituation",
    type: "radio",
    label: "מה המצב הנוכחי?",
    helper: "התשובה שלך תעזור לנו להתאים את ההליך המשפטי המתאים ביותר עבורך",
    required: true,
    options: [
      { value: "wantDivorce", label: "אני רוצה להתגרש" },
      { value: "wantReconciliation", label: "אני רוצה לנסות לשמור על הנישואין (שלום בית)" },
      { value: "partnerWantsDivorce", label: "בן/בת הזוג רוצה להתגרש ואני לא" },
    ],
  },

  // ========== STEP 2: Court Routing Questions (only for divorce path) ==========
  {
    id: "heading-divorce-routing",
    type: "heading",
    label: "שאלות להתאמת הערכאה המשפטית",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.infidelity",
    type: "radio",
    label: "האם יש טענות לבגידה של אחד הצדדים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
      { value: "preferNotToSay", label: "מעדיף/ה לא לענות" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.youngestChildAge",
    type: "radio",
    label: "מה גיל הילד/ה הקטן/ה ביותר?",
    required: true,
    options: [
      { value: "noChildren", label: "אין ילדים" },
      { value: "under6", label: "מתחת לגיל 6" },
      { value: "6andAbove", label: "גיל 6 ומעלה" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.careerDisparity",
    type: "radio",
    label: "האם יש פער משמעותי בהכנסות בין בני הזוג?",
    helper: "למשל: אחד עובד והשני עקרת בית, או פער של יותר מפי 2 בהכנסות",
    required: true,
    options: [
      { value: "iEarnMore", label: "כן, אני מרוויח/ה יותר משמעותית" },
      { value: "partnerEarnsMore", label: "כן, בן/בת הזוג מרוויח/ה יותר משמעותית" },
      { value: "similar", label: "לא, ההכנסות דומות" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.significantProperty",
    type: "radio",
    label: "האם יש רכוש משמעותי לחלוקה?",
    helper: "נדל\"ן, עסק, חסכונות משמעותיים, פנסיה",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.halachicGrounds",
    type: "radio",
    label: "האם קיימות עילות לגירושין מהסיבות הבאות?",
    helper: "עילות אלה משמעותיות בהליך בבית הדין הרבני",
    required: true,
    options: [
      { value: "refusalRelations", label: "סירוב ליחסי אישות" },
      { value: "neglect", label: "אי טיפול בבית/במשפחה" },
      { value: "humiliation", label: "השפלת בן/בת הזוג" },
      { value: "fertility", label: "בעיות פוריות" },
      { value: "other", label: "אחר" },
      { value: "none", label: "אף אחת מהנ\"ל" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },

  // ========== STEP 3: Core Divorce Questions ==========
  {
    id: "heading-divorce-core",
    type: "heading",
    label: "פרטי הגירושין",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.childrenDispute",
    type: "radio",
    label: "האם יש ויכוח על הילדים – איפה גרים, כמה זמן עם כל אחד, חינוך או בריאות?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.needSupport",
    type: "radio",
    label: "האם את/ה צריך/ה שנבקש כסף חודשי לילדים או לך (מזונות)?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.propertyDispute",
    type: "radio",
    label: "האם יש ויכוח על דירה/כספים/חסכונות/הלוואות או צורך להקפיא נכסים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.urgentRelief",
    type: "radio",
    label: "האם יש משהו דחוף לעצור או להסדיר זמנית (כסף זמני, סידור זמני לילדים, צו מניעה/עיקול)?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.urgentReliefDetails",
    type: "textarea",
    label: "מה דחוף? (פירוט קצר)",
    placeholder: "תארו בקצרה את הסעד הדחוף שאתם צריכים",
    maxLength: 300,
    conditional: {
      dependsOn: "divorce.urgentRelief",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.parallelCases",
    type: "radio",
    label: "האם יש הליכים פתוחים בבית משפט/בית דין אחר?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.parallelCasesDetails",
    type: "textarea",
    label: "פרטי הליכים פתוחים (אם יש):",
    placeholder: "היכן נפתח ההליך, מספר תיק, מה נדרש שם",
    maxLength: 400,
    conditional: {
      dependsOn: "divorce.parallelCases",
      showWhen: "כן",
    },
  },
  {
    id: "heading-divorce-story",
    type: "heading",
    label: "רקע וסיפור הקרע",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.whoWantsDivorceAndWhy",
    type: "textarea",
    label: "מה קרה בזוגיות? תארו את הקרע, ניסיונות תיקון ואירועים חריגים (אלימות/בגידה/נטישה):",
    placeholder: "כתבו במילים פשוטות מה הוביל למשבר, מתי, ומה נעשה כדי לתקן...",
    maxLength: 1000,
    required: true,
    helper: "ננסח את הסיפור בשפה משפטית עבורכם",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "heading-divorce-reasons",
    type: "heading",
    label: "עילות וסיבות משפטיות",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.divorceReasons",
    type: "textarea",
    label: "עילות/סיבות משפטיות לתביעת הגירושין:",
    placeholder: "תארו עד 5 סעיפים או פסקאות, כל סעיף בשורה נפרדת",
    helper: "לדוגמה: נטישה, אלימות, בגידה, סרבנות, אי קיום חיי אישות. ננסח משפטית עבורך",
    maxLength: 1500,
    required: true,
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },

  {
    id: "heading-divorce-marriage-details",
    type: "heading",
    label: "פרטי הנישואין",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.weddingCity",
    type: "text",
    label: "עיר/מקום הנישואין:",
    placeholder: "לדוגמה: תל אביב",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.religiousMarriage",
    type: "radio",
    label: "האם הנישואין נערכו בטקס דתי?",
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.religiousCouncil",
    type: "text",
    label: "המועצה הדתית בה נרשמתם:",
    placeholder: "לדוגמה: מועצה דתית תל אביב",
    helper: "יש למלא רק אם הנישואין דתיים",
    conditional: {
      dependsOn: "divorce.religiousMarriage",
      showWhen: "כן",
    },
  },
  {
    id: "heading-divorce-police",
    type: "heading",
    label: "דיווחים ותלונות",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.policeComplaints",
    type: "radio",
    label: "האם הוגשו בעבר תלונות במשטרה?",
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.policeComplaintsWho",
    type: "text",
    label: "מי הגיש את התלונות?",
    placeholder: "שם המתלונן/ת",
    conditional: {
      dependsOn: "divorce.policeComplaints",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.policeComplaintsWhere",
    type: "text",
    label: "היכן הוגשו התלונות?",
    placeholder: "לדוגמה: תחנת משטרת תל אביב",
    conditional: {
      dependsOn: "divorce.policeComplaints",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.policeComplaintsDate",
    type: "text",
    label: "מתי הוגשו התלונות?",
    placeholder: "לדוגמה: 05/2024",
    conditional: {
      dependsOn: "divorce.policeComplaints",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.policeComplaintsOutcome",
    type: "textarea",
    label: "מה עלה בגורל התלונות / האם הוגש כתב אישום?",
    placeholder: "ציינו בקצרה את תוצאות ההליך הפלילי, אם יש",
    maxLength: 400,
    conditional: {
      dependsOn: "divorce.policeComplaints",
      showWhen: "כן",
    },
  },

  // Mediation and Therapy History
  {
    id: "heading-divorce-mediation-history",
    type: "heading",
    label: "גישור וטיפול משפחתי - היסטוריה",
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.hadPreviousMediation",
    type: "radio",
    label: "האם נערכו בעבר נסיונות גישור בין הצדדים?",
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
    conditional: {
      dependsOn: "divorce.currentSituation",
      showWhen: "wantDivorce",
    },
  },
  {
    id: "divorce.previousMediationDetails",
    type: "textarea",
    label: "נא לתת פרטים (מתי, מי היה המגשר, באיזה נושאים)",
    placeholder: "פרטו מתי התקיים הגישור, מי ניהל אותו, ובאילו נושאים",
    maxLength: 500,
    conditional: {
      dependsOn: "divorce.hadPreviousMediation",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.marriageCounselingDetails",
    type: "textarea",
    label: "פרטי הייעוץ הזוגי/טיפול משפחתי (אם פניתם)",
    placeholder: "מתי, אצל מי, למשך כמה זמן, באילו נושאים",
    helper: "אם ענית \"כן\" בשאלה הכללית על ייעוץ נישואין, נא לפרט כאן",
    maxLength: 500,
    conditional: {
      dependsOn: "contactedMarriageCounseling",
      showWhen: "כן",
    },
  },

  // Ketubah (for religious marriages) - Note: This section's parent conditional is religiousMarriage,
  // which itself is conditional on wantDivorce, so this is properly nested
  {
    id: "heading-divorce-ketubah",
    type: "heading",
    label: "כתובה",
    helper: "כתובה היא מסמך הנישואין היהודי, הכולל התחייבות כספית של הבעל כלפי האישה במקרה של גירושין או פטירה. יש למלא רק אם נישאתם בנישואין דתיים.",
    conditional: {
      dependsOn: "divorce.religiousMarriage",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.ketubahAmount",
    type: "text",
    label: "מהו הסכום שנכתב בכתובה?",
    placeholder: "לדוגמה: 200 זוז כסף",
    helper: "רק למי שנישא בנישואין דתיים",
    conditional: {
      dependsOn: "divorce.religiousMarriage",
      showWhen: "כן",
    },
  },
  {
    id: "divorce.ketubahRequest",
    type: "textarea",
    label: "מה אתם מבקשים בעניין הכתובה?",
    placeholder: "לדוגמה: תשלום מלוא סכום הכתובה, ויתור על הכתובה, וכו'",
    maxLength: 300,
    helper: "כתבו בשפה פשוטה, נעביר לניסוח משפטי",
    conditional: {
      dependsOn: "divorce.religiousMarriage",
      showWhen: "כן",
    },
  },
];

// Property Division (חלוקת רכוש)
// NOTE: Living situation questions moved to GLOBAL_QUESTIONS
export const PROPERTY_QUESTIONS: Question[] = [
  // Property listing
  {
    id: "heading-property-details",
    type: "heading",
    label: "פירוט נכסים וחובות",
  },
  {
    id: "property.hasAssets",
    type: "radio",
    label: "האם קיימים נכסים או חובות לחלוקה?",
    helper: "אם אין מה לפרט, בחרו \"לא\" ותוכלו להמשיך לשלב הבא",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "property.apartments",
    type: "repeater",
    label: "דירות ונדל\"ן",
    helper: "פרטו את כל הנכסים המקרקעין (דירות, קרקעות, משרדים, וכו')",
    repeaterConfig: {
      fields: APARTMENT_FIELDS,
      addButtonLabel: "הוסף דירה/נדל\"ן",
      minRows: 0,
      maxRows: 20,
    },
    conditional: {
      dependsOn: "property.hasAssets",
      showWhen: "yes",
    },
  },
  {
    id: "property.vehicles",
    type: "repeater",
    label: "כלי רכב",
    helper: "פרטו את כל כלי הרכב (רכבים, אופנועים, וכו')",
    repeaterConfig: {
      fields: VEHICLE_FIELDS,
      addButtonLabel: "הוסף רכב",
      minRows: 0,
      maxRows: 10,
    },
    conditional: {
      dependsOn: "property.hasAssets",
      showWhen: "yes",
    },
  },
  {
    id: "property.savings",
    type: "repeater",
    label: "חסכונות ותיקי השקעות",
    helper: "פרטו חשבונות בנק, חסכונות, תיקי השקעות, מניות, וכו'",
    repeaterConfig: {
      fields: SAVINGS_FIELDS,
      addButtonLabel: "הוסף חיסכון/השקעה",
      minRows: 0,
      maxRows: 20,
    },
    conditional: {
      dependsOn: "property.hasAssets",
      showWhen: "yes",
    },
  },
  {
    id: "property.benefits",
    type: "repeater",
    label: "זכויות סוציאליות",
    helper: "פרטו קרנות פנסיה, קופות גמל, ביטוח מנהלים, תגמולים, וכו'",
    repeaterConfig: {
      fields: BENEFITS_FIELDS,
      addButtonLabel: "הוסף זכות סוציאלית",
      minRows: 0,
      maxRows: 20,
    },
    conditional: {
      dependsOn: "property.hasAssets",
      showWhen: "yes",
    },
  },
  {
    id: "property.properties",
    type: "repeater",
    label: "רכוש כללי",
    helper: "פרטו ריהוט, תכשיטים, אומנות, וכל רכוש נוסף בעל ערך",
    repeaterConfig: {
      fields: PROPERTY_FIELDS,
      addButtonLabel: "הוסף פריט רכוש",
      minRows: 0,
      maxRows: 50,
    },
    conditional: {
      dependsOn: "property.hasAssets",
      showWhen: "yes",
    },
  },
  {
    id: "property.debts",
    type: "repeater",
    label: "חובות",
    helper: "פרטו משכנתאות, הלוואות, חובות כרטיסי אשראי, וכל חוב אחר",
    repeaterConfig: {
      fields: DEBT_FIELDS,
      addButtonLabel: "הוסף חוב",
      minRows: 0,
      maxRows: 20,
    },
    conditional: {
      dependsOn: "property.hasAssets",
      showWhen: "yes",
    },
  },

  // Employment section
  {
    id: "heading-employment",
    type: "heading",
    label: "תעסוקה והכנסות",
  },
  {
    id: "property.applicantEmploymentStatus",
    type: "radio",
    label: "סטטוס תעסוקתי של [APPLICANT_NAME]:",
    required: true,
    options: [
      { value: "employee", label: "שכיר/ה" },
      { value: "selfEmployed", label: "עצמאי/ת" },
      { value: "unemployed", label: "מובטל/ת" },
    ],
  },
  {
    id: "property.applicantEmployer",
    type: "text",
    label: "שם המעסיק של [APPLICANT_NAME]:",
    placeholder: "שם החברה/ארגון",
    required: true,
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "employee",
    },
  },
  {
    id: "property.applicantGrossSalary",
    type: "number",
    label: "כמה [APPLICANT_NAME] מרוויח/ה ברוטו:",
    placeholder: "0",
    required: true,
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "employee",
    },
  },
  {
    id: "property.applicantPaySlips",
    type: "fileList",
    label: "תלושים אחרונים:",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו את 3 התלושים האחרונים",
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "employee",
    },
  },
  {
    id: "property.applicantOccupation",
    type: "text",
    label: "מהות העיסוק:",
    placeholder: "תיאור העיסוק",
    required: true,
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.applicantEstablishedDate",
    type: "date",
    label: "מתי הוקם העסק:",
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.applicantRegisteredOwner",
    type: "text",
    label: "על שם מי רשום:",
    placeholder: "שם בעל העסק",
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.applicantGrossIncome",
    type: "number",
    label: "כמה [APPLICANT_NAME] מרוויח/ה ברוטו:",
    placeholder: "0",
    required: true,
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.applicantIncomeProof",
    type: "file",
    label: 'אישור רו"ח על השתכרות חודשית:',
    accept: ".pdf,.jpg,.jpeg,.png",
    conditional: {
      dependsOn: "property.applicantEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.respondentEmploymentStatus",
    type: "radio",
    label: "סטטוס תעסוקתי של [RESPONDENT_NAME]:",
    required: true,
    options: [
      { value: "employee", label: "שכיר/ה" },
      { value: "selfEmployed", label: "עצמאי/ת" },
      { value: "unemployed", label: "מובטל/ת" },
    ],
  },
  {
    id: "property.respondentEmployer",
    type: "text",
    label: "שם המעסיק של [RESPONDENT_NAME] (אם ידוע):",
    placeholder: "שם המעסיק",
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "employee",
    },
  },
  {
    id: "property.respondentGrossSalary",
    type: "number",
    label: "כמה [RESPONDENT_NAME] מרוויח/ה ברוטו (במידה ולא ידוע - אומדן):",
    placeholder: "הקלד סכום או אומדן",
    required: true,
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "employee",
    },
  },
  {
    id: "property.respondentPaySlips",
    type: "fileList",
    label: "תלושים אחרונים (אם יש):",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו תלושים אם יש ברשותכם",
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "employee",
    },
  },
  {
    id: "property.respondentOccupation",
    type: "text",
    label: "מהות העיסוק (אם ידוע):",
    placeholder: "תיאור העיסוק",
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.respondentEstablishedDate",
    type: "date",
    label: "מתי הוקם העסק (אם ידוע):",
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.respondentRegisteredOwner",
    type: "text",
    label: "על שם מי רשום (אם ידוע):",
    placeholder: "שם בעל העסק",
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.respondentGrossIncome",
    type: "number",
    label: "כמה [RESPONDENT_NAME] מרוויח/ה ברוטו (במידה ולא ידוע - אומדן):",
    placeholder: "הקלד סכום או אומדן",
    required: true,
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },
  {
    id: "property.respondentIncomeProof",
    type: "file",
    label: 'אישור רו"ח על השתכרות חודשית (אם יש):',
    accept: ".pdf,.jpg,.jpeg,.png",
    conditional: {
      dependsOn: "property.respondentEmploymentStatus",
      showWhen: "selfEmployed",
    },
  },

  // Legal status
  {
    id: "heading-legal-status",
    type: "heading",
    label: "הליכים משפטיים",
  },
  {
    id: "property.courtProceedings",
    type: "radio",
    label: "האם נפתחו הליכים בבית משפט?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "property.courtCaseNumber",
    type: "text",
    label: "מספר תיק:",
    placeholder: "מספר תיק בבית המשפט",
    conditional: {
      dependsOn: "property.courtProceedings",
      showWhen: "yes",
    },
  },
  {
    id: "property.courtName",
    type: "text",
    label: "שם בית המשפט:",
    placeholder: "לדוגמה: בית משפט לענייני משפחה תל אביב",
    conditional: {
      dependsOn: "property.courtProceedings",
      showWhen: "yes",
    },
  },
  {
    id: "property.courtJudge",
    type: "text",
    label: "בפני מי נדון:",
    placeholder: "שם השופט/ת",
    conditional: {
      dependsOn: "property.courtProceedings",
      showWhen: "yes",
    },
  },
  {
    id: "property.courtStatus",
    type: "textarea",
    label: "מצב ההליכים:",
    placeholder: "תארו בקצרה את מצב ההליכים...",
    maxLength: 500,
    conditional: {
      dependsOn: "property.courtProceedings",
      showWhen: "yes",
    },
  },
  {
    id: "property.courtDocument",
    type: "file",
    label: "נא לצרף מסמך מבית המשפט:",
    accept: ".pdf,.doc,.docx",
    helper: "כתב תביעה, כתב הגנה, או כל מסמך אחר מהתיק",
    conditional: {
      dependsOn: "property.courtProceedings",
      showWhen: "yes",
    },
  },
];

// Custody (משמורת)
// NOTE: Children repeater is now in GLOBAL_QUESTIONS (shared across all claims)
export const CUSTODY_QUESTIONS: Question[] = [
  // Custody details
  {
    id: "heading-custody-details",
    type: "heading",
    label: "פרטי המשמורת",
  },
  {
    id: "custody.whoShouldHaveCustody",
    type: "textarea",
    label: "סיכום מצב המשמורת - למה המשמורת צריכה להיות אצלך?",
    placeholder: "הסבירו למה אתם מבקשים משמורת ומה לטובת הילדים. תארו את היכולת שלכם לדאוג לילדים, הסביבה הביתית, הזמינות שלכם, וכל גורם רלוונטי נוסף...",
    maxLength: 2000,
    required: true,
    helper: "זהו הסיכום המרכזי של בקשת המשמורת שלכם"
  },
  {
    id: "custody.currentLivingArrangement",
    type: "radio",
    label: "היכן הקטינים מתגוררים כרגע?",
    required: true,
    options: [
      { value: "together", label: "תחת קורת גג אחת עם שני ההורים" },
      { value: "with_applicant", label: "אצל [APPLICANT_NAME]" },
      { value: "with_respondent", label: "אצל [RESPONDENT_NAME]" },
      { value: "split", label: "חלוקה - חלק מהזמן אצל כל אחד" },
      { value: "split_children", label: "חלק מהילדים אצל [APPLICANT_NAME], חלק אצל [RESPONDENT_NAME]" },
    ],
  },
  {
    id: "custody.sinceWhen",
    type: "date",
    label: "מתי התחיל מצב זה?",
    helper: "מתי הילדים התחילו לגור במצב הנוכחי",
    conditional: {
      dependsOn: "custody.currentLivingArrangement",
      showWhen: ["with_applicant", "with_respondent", "split", "split_children"],
    },
  },
  {
    id: "custody.currentVisitationArrangement",
    type: "textarea",
    label: "כיצד הסדרי הראיה עם ההורה השני?",
    placeholder: "פרטו את הסדרי הראיה הנוכחיים - ימים, שעות, תדירות...\nלדוגמה: 'ההורה השני רואה את הילדים פעם בשבוע ביום חמישי אחר הצהריים, וסוף שבוע אחד בחודש'",
    maxLength: 500,
    required: true,
    conditional: {
      dependsOn: "custody.currentLivingArrangement",
      showWhen: ["with_applicant", "with_respondent"],
    },
  },
  {
    id: "custody.splitArrangementDetails",
    type: "textarea",
    label: "פרטו את חלוקת הזמנים בפועל:",
    placeholder: "תארו כיצד הזמן מתחלק בין שני ההורים...\nלדוגמה: 'שבוע אצל כל הורה לסירוגין' או 'ימים א׳-ד׳ אצל אמא, ה׳-ש׳ אצל אבא'",
    maxLength: 500,
    required: true,
    conditional: {
      dependsOn: "custody.currentLivingArrangement",
      showWhen: "split",
    },
  },
  {
    id: "custody.splitChildrenDetails",
    type: "textarea",
    label: "איזה ילד מתגורר אצל מי?",
    placeholder: "לדוגמה: 'נועה וליאם מתגוררים אצל האם, איתי מתגורר אצל האב'. ציינו אם יש ביקורים קבועים.",
    maxLength: 500,
    helper: "ציינו בשמות הילדים כדי שנוכל לנסח זאת במסמכים המשפטיים",
    required: true,
    conditional: {
      dependsOn: "custody.currentLivingArrangement",
      showWhen: "split_children",
    },
  },
  {
    id: "custody.requestedArrangement",
    type: "radio",
    label: "איזה הסדר משמורת אתם מבקשים?",
    required: true,
    options: [
      { value: "full_custody", label: "משמורת מלאה למבקש/ת" },
      { value: "joint_custody", label: "משמורת משותפת" },
      { value: "primary_with_visits", label: "משמורת ראשית עם הסדרי ראיה" },
    ],
  },
  {
    id: "custody.whyNotOtherParent",
    type: "textarea",
    label: "למה המשמורת לא צריכה להיות אצל ההורה השני?",
    placeholder: "הסבירו מדוע לדעתכם המשמורת לא צריכה להיות אצל ההורה השני, מבחינת טובת הילדים...",
    maxLength: 1000,
  },
];

// Alimony (מזונות)
// NOTE: Alimony claims reuse:
//   - children repeater from GLOBAL_QUESTIONS
//   - property.separationDate from property questions
//   - property employment questions
// This section only contains UNIQUE alimony questions
export const ALIMONY_QUESTIONS: Question[] = [
  {
    id: "heading-alimony",
    type: "heading",
    label: "מזונות - פרטים ספציפיים",
  },

  // Previous alimony payments
  {
    id: "heading-previous-alimony",
    type: "heading",
    label: "מזונות קודמים (אם רלוונטי)",
  },
  {
    id: "alimony.wasPreviousAlimony",
    type: "radio",
    label: "האם שולמו מזונות בעבר?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "alimony.lastAlimonyAmount",
    type: "number",
    label: "סכום מזונות אחרון ששולם (חודשי):",
    placeholder: "0",
    conditional: {
      dependsOn: "alimony.wasPreviousAlimony",
      showWhen: "yes",
    },
  },
  {
    id: "alimony.lastAlimonyDate",
    type: "date",
    label: "מתי שולם סכום זה לאחרונה?",
    conditional: {
      dependsOn: "alimony.wasPreviousAlimony",
      showWhen: "yes",
    },
  },
  {
    id: "alimony.previousAlimonyDetails",
    type: "textarea",
    label: "פרטים נוספים על מזונות שהיו בעבר:",
    placeholder: "פרטו על הסכמים קודמים, פסקי דין, או כל מידע רלוונטי אחר...",
    maxLength: 500,
    conditional: {
      dependsOn: "alimony.wasPreviousAlimony",
      showWhen: "yes",
    },
  },

  // Children's needs (expense table)
  {
    id: "heading-children-needs",
    type: "heading",
    label: "צרכי הקטינים - הוצאות חודשיות",
  },
  {
    id: "alimony.hasChildrenNeeds",
    type: "radio",
    label: "האם קיימות הוצאות חודשיות עבור הקטינים?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "alimony.childrenNeeds",
    type: "repeater",
    label: "פירוט הוצאות חודשיות לילדים:",
    helper: "הוסיפו את כל ההוצאות החודשיות הקשורות לילדים",
    repeaterConfig: {
      addButtonLabel: "+ הוסף הוצאה",
      minRows: 0,
      fields: [
        {
          id: "category",
          name: "category",
          type: "select",
          label: "קטגוריה:",
          required: true,
          options: [
            { value: "food", label: "מזון" },
            { value: "clothing", label: "לבוש והנעלה" },
            { value: "education", label: "חינוך (שכר לימוד, ספרים)" },
            { value: "medical", label: "רפואה (ביטוח, תרופות)" },
            { value: "activities", label: "פעילויות חוץ (חוגים)" },
            { value: "transportation", label: "הסעות ותחבורה" },
            { value: "other", label: "אחר" },
          ],
        },
        {
          id: "description",
          name: "description",
          type: "text",
          label: "פירוט:",
          placeholder: "תיאור קצר של ההוצאה",
          maxLength: 100,
          required: true,
        },
        {
          id: "monthlyAmount",
          name: "monthlyAmount",
          type: "number",
          label: "סכום חודשי (₪):",
          placeholder: "0",
          required: true,
        },
      ],
    },
    conditional: {
      dependsOn: "alimony.hasChildrenNeeds",
      showWhen: "yes",
    },
  },

  // Household needs (expense table)
  {
    id: "heading-household-needs",
    type: "heading",
    label: "צורכי המדור - הוצאות חודשיות",
  },
  {
    id: "alimony.hasHouseholdNeeds",
    type: "radio",
    label: "האם יש הוצאות חודשיות למדור (דיור ומשק בית)?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "alimony.householdNeeds",
    type: "repeater",
    label: "פירוט הוצאות חודשיות למדור:",
    helper: "הוסיפו את כל ההוצאות החודשיות של משק הבית",
    repeaterConfig: {
      addButtonLabel: "+ הוסף הוצאה",
      minRows: 0,
      fields: [
        {
          id: "category",
          name: "category",
          type: "select",
          label: "קטגוריה:",
          required: true,
          options: [
            { value: "rent", label: "שכר דירה / משכנתא" },
            { value: "tax", label: "ארנונה" },
            { value: "electricity", label: "חשמל" },
            { value: "water", label: "מים" },
            { value: "gas", label: "גז" },
            { value: "building", label: "ועד בית" },
            { value: "maintenance", label: "תיקונים ותחזוקה" },
            { value: "internet", label: "אינטרנט וטלפון" },
            { value: "insurance", label: "ביטוחים (דירה, תכולה)" },
            { value: "other", label: "אחר" },
          ],
        },
        {
          id: "description",
          name: "description",
          type: "text",
          label: "פירוט:",
          placeholder: "תיאור קצר של ההוצאה",
          maxLength: 100,
          required: true,
        },
        {
          id: "monthlyAmount",
          name: "monthlyAmount",
          type: "number",
          label: "סכום חודשי (₪):",
          placeholder: "0",
          required: true,
        },
      ],
    },
    conditional: {
      dependsOn: "alimony.hasHouseholdNeeds",
      showWhen: "yes",
    },
  },

  // Bank accounts
  {
    id: "heading-bank-accounts",
    type: "heading",
    label: "חשבונות בנק",
  },
  {
    id: "alimony.hasBankAccounts",
    type: "radio",
    label: "האם יש לך חשבונות בנק?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "alimony.bankAccounts",
    type: "repeater",
    label: "פרטי חשבונות הבנק:",
    helper: "הוסיפו את כל חשבונות הבנק שלכם",
    conditional: {
      dependsOn: "alimony.hasBankAccounts",
      showWhen: "yes",
    },
    repeaterConfig: {
      addButtonLabel: "+ הוסף חשבון בנק",
      minRows: 1,
      fields: [
        {
          id: "bankName",
          name: "bankName",
          type: "text",
          label: "שם הבנק:",
          placeholder: "לאומי, הפועלים, וכו'",
          required: true,
        },
        {
          id: "accountNumber",
          name: "accountNumber",
          type: "text",
          label: "מספר חשבון:",
          placeholder: "מספר החשבון",
          required: true,
        },
        {
          id: "balance",
          name: "balance",
          type: "number",
          label: "יתרה משוערת (אם ידוע):",
          placeholder: "0",
        },
      ],
    },
  },

];

// ============================================================================
// SHALOM BAYIT QUESTIONS (reconciliation claim)
// ============================================================================

export const SHALOMBAYIT_QUESTIONS: Question[] = [
  {
    id: "heading-shalombayit",
    type: "heading",
    label: "תביעה לשלום בית",
  },
  {
    id: "shalomBayit.marriageQuality",
    type: "radio",
    label: "איך הייתה מערכת היחסים בתחילת הנישואין?",
    required: true,
    options: [
      { value: "excellent", label: "מצוינת - אהבה והרמוניה" },
      { value: "good", label: "טובה - עם עליות וירידות רגילות" },
      { value: "difficult", label: "קשה מההתחלה" },
    ],
  },
  {
    id: "shalomBayit.crisisDuration",
    type: "radio",
    label: "מתי החלה המשבר הנוכחי?",
    required: true,
    options: [
      { value: "recent", label: "לאחרונה (פחות מחודש)" },
      { value: "months", label: "לפני מספר חודשים" },
      { value: "year", label: "לפני כשנה" },
      { value: "years", label: "כבר שנים" },
    ],
  },
  {
    id: "shalomBayit.crisisReasons",
    type: "textarea",
    label: "מה לדעתך הסיבות העיקריות למשבר?",
    placeholder: "תארו את הגורמים שהובילו למצב הנוכחי...",
    required: true,
    maxLength: 2000,
  },
  {
    id: "shalomBayit.previousAttempts",
    type: "radio",
    label: "האם ניסיתם בעבר לפתור את הבעיות?",
    required: true,
    options: [
      { value: "none", label: "לא ניסינו" },
      { value: "ourselves", label: "ניסינו בעצמנו" },
      { value: "family", label: "בעזרת משפחה/חברים" },
      { value: "professional", label: "בעזרת איש מקצוע (יועץ/מטפל)" },
    ],
  },
  {
    id: "shalomBayit.counselingDetails",
    type: "textarea",
    label: "פרטו על הטיפול/ייעוץ שקיבלתם",
    placeholder: "סוג הטיפול, משך הזמן, תוצאות...",
    conditional: {
      dependsOn: "shalomBayit.previousAttempts",
      showWhen: "professional",
    },
    maxLength: 1000,
  },
  {
    id: "shalomBayit.partnerWillingness",
    type: "radio",
    label: "האם בן/בת הזוג מוכן/ה לנסות שלום בית?",
    required: true,
    options: [
      { value: "yes", label: "כן, מוכן/ה" },
      { value: "maybe", label: "לא בטוח/ה" },
      { value: "no", label: "לא, רוצה להתגרש" },
      { value: "unknown", label: "לא יודע/ת" },
    ],
  },
  {
    id: "shalomBayit.whatWouldHelp",
    type: "textarea",
    label: "מה לדעתך יכול לעזור להציל את הנישואין?",
    placeholder: "תארו מה לדעתך נדרש כדי לשקם את מערכת היחסים...",
    required: true,
    maxLength: 2000,
  },
  {
    id: "shalomBayit.commitment",
    type: "radio",
    label: "מה מידת המחויבות שלך להצלת הנישואין?",
    required: true,
    options: [
      { value: "full", label: "מחויבות מלאה - אעשה הכל" },
      { value: "willing", label: "מוכן/ה לנסות ברצינות" },
      { value: "conditional", label: "בתנאים מסוימים" },
      { value: "lastResort", label: "זו הזדמנות אחרונה" },
    ],
  },
  {
    id: "shalomBayit.livingArrangement",
    type: "radio",
    label: "מה מצב המגורים הנוכחי?",
    required: true,
    options: [
      { value: "together", label: "גרים יחד" },
      { value: "separated", label: "גרים בנפרד" },
      { value: "sameHouseSeparate", label: "גרים באותו בית אך בנפרד" },
    ],
  },
  {
    id: "shalomBayit.additionalInfo",
    type: "textarea",
    label: "מידע נוסף שחשוב לדעת",
    placeholder: "כל מידע נוסף שיכול לעזור בהכנת התביעה...",
    maxLength: 2000,
  },
];

// Map claim keys to their questions
export const CLAIM_QUESTIONS_MAP: Record<string, Question[]> = {
  disputeResolution: DISPUTE_RESOLUTION_QUESTIONS,
  divorceAgreement: DIVORCE_AGREEMENT_QUESTIONS,
  divorce: DIVORCE_QUESTIONS,
  divorceRabbinical: DIVORCE_QUESTIONS,  // Uses same questions as divorce
  shalomBayit: SHALOMBAYIT_QUESTIONS,
  property: PROPERTY_QUESTIONS,
  custody: CUSTODY_QUESTIONS,
  alimony: ALIMONY_QUESTIONS,
};

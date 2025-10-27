/**
 * Question definitions for the wizard
 * Organized by sections: global questions and claim-specific questions
 */

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
  | "heading";

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
    label: "האם המבקש/ת היה/ה נשוי/אה בעבר?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "hadChildrenFromPrevious",
    type: "radio",
    label: "האם למבקש/ת יש ילדים מנישואים קודמים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "marriedBefore2",
    type: "radio",
    label: "האם הנתבע/ת היה/ה נשוי/אה בעבר?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "hadChildrenFromPrevious2",
    type: "radio",
    label: "האם לנתבע/ת יש ילדים מנישואים קודמים?",
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
    label: "סוג הדיור של המבקש/ת:",
    required: true,
    options: [
      { value: "jointOwnership", label: "בעלות משותפת" },
      { value: "applicantOwnership", label: "בבעלות המבקש/ת" },
      { value: "respondentOwnership", label: "בבעלות הנתבע/ת" },
      { value: "rental", label: "שכירות" },
      { value: "other", label: "אחר" },
    ],
  },
  {
    id: "partnerHomeType",
    type: "radio",
    label: "סוג הדיור של הנתבע/ת:",
    required: true,
    options: [
      { value: "jointOwnership", label: "בעלות משותפת" },
      { value: "applicantOwnership", label: "בבעלות המבקש/ת" },
      { value: "respondentOwnership", label: "בבעלות הנתבע/ת" },
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
];

// ============================================================================
// CLAIM-SPECIFIC QUESTIONS
// ============================================================================

// Divorce Agreement (הסכם גירושין)
export const DIVORCE_AGREEMENT_QUESTIONS: Question[] = [
  {
    id: "heading-divorce-agreement",
    type: "heading",
    label: "הסכם גירושין",
  },
  {
    id: "divorceAgreement.agreedOnDivorce",
    type: "radio",
    label: "האם הגעתם להסכמה על הגירושין?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "divorceAgreement.agreedOnTerms",
    type: "radio",
    label: "האם הגעתם להסכמה על כל התנאים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
      { value: "חלקית", label: "חלקית" },
    ],
  },
  {
    id: "divorceAgreement.agreementDetails",
    type: "textarea",
    label: "פרטו את עיקרי ההסכם:",
    placeholder: "תארו בקצרה את עיקרי ההסכמות בינכם...",
    maxLength: 1000,
    helper: "כתבו על חלוקת רכוש, משמורת, מזונות וכל נושא נוסף שהוסכם",
  },
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
  {
    id: "divorce.separationDate",
    type: "date",
    label: "תאריך הפרידה בפועל:",
    required: true,
    helper: "מתי נפרדתם בפועל?",
  },
  {
    id: "divorce.separationReason",
    type: "textarea",
    label: "סיבת הפרידה:",
    placeholder: "תארו בקצרה את הסיבות לפרידה...",
    required: true,
    maxLength: 1000,
  },
  {
    id: "divorce.whoInitiated",
    type: "radio",
    label: "מי יזם את הפרידה?",
    required: true,
    options: [
      { value: "applicant", label: "המבקש/ת" },
      { value: "respondent", label: "הנתבע/ת" },
      { value: "mutual", label: "הדדי" },
    ],
  },
  {
    id: "divorce.attemptedReconciliation",
    type: "radio",
    label: "האם נעשו ניסיונות לפייס?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "divorce.reconciliationDetails",
    type: "textarea",
    label: "פרטו את ניסיונות הפיוס:",
    placeholder: "תארו אילו ניסיונות נעשו...",
    maxLength: 500,
    conditional: {
      dependsOn: "divorce.attemptedReconciliation",
      showWhen: "כן",
    },
  },
];

// Property Division (חלוקת רכוש)
export const PROPERTY_QUESTIONS: Question[] = [
  {
    id: "heading-property",
    type: "heading",
    label: "חלוקת רכוש",
  },
  {
    id: "property.hasSharedProperty",
    type: "radio",
    label: "האם יש רכוש משותף?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "property.propertyRegime",
    type: "radio",
    label: "איזה משטר רכוש חל עליכם?",
    required: true,
    options: [
      { value: "community", label: "שיתוף" },
      { value: "separation", label: "הפרדה" },
      { value: "unknown", label: "לא יודע/ת" },
    ],
    helper: "משטר שיתוף הוא ברירת המחדל בישראל",
    conditional: {
      dependsOn: "property.hasSharedProperty",
      showWhen: "כן",
    },
  },
  {
    id: "property.hasApartment",
    type: "radio",
    label: "האם יש דירה משותפת?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "property.apartmentValue",
    type: "number",
    label: "שווי הדירה המשוער (בש\"ח):",
    placeholder: "0",
    conditional: {
      dependsOn: "property.hasApartment",
      showWhen: "כן",
    },
  },
  {
    id: "property.apartmentMortgage",
    type: "number",
    label: "יתרת משכנתא (בש\"ח):",
    placeholder: "0",
    conditional: {
      dependsOn: "property.hasApartment",
      showWhen: "כן",
    },
  },
  {
    id: "property.whoWantsApartment",
    type: "radio",
    label: "מי מעוניין לשמור על הדירה?",
    options: [
      { value: "applicant", label: "המבקש/ת" },
      { value: "respondent", label: "הנתבע/ת" },
      { value: "sell", label: "למכור" },
      { value: "undecided", label: "לא הוחלט" },
    ],
    conditional: {
      dependsOn: "property.hasApartment",
      showWhen: "כן",
    },
  },
  {
    id: "property.hasCars",
    type: "radio",
    label: "האם יש כלי רכב?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "property.hasPensions",
    type: "radio",
    label: "האם יש קרנות פנסיה/השתלמות/קופות גמל?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "property.hasDebts",
    type: "radio",
    label: "האם יש חובות משותפים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "property.additionalAssets",
    type: "textarea",
    label: "נכסים נוספים:",
    placeholder: "פרטו נכסים נוספים (תכשיטים, עסקים, מניות, וכו')...",
    maxLength: 1000,
  },
];

// Custody (משמורת)
export const CUSTODY_QUESTIONS: Question[] = [
  {
    id: "heading-custody",
    type: "heading",
    label: "משמורת ילדים",
  },
  {
    id: "custody.hasChildren",
    type: "radio",
    label: "האם יש ילדים משותפים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "custody.custodyArrangement",
    type: "radio",
    label: "סידור משמורת מבוקש:",
    required: true,
    options: [
      { value: "sole-applicant", label: "משמורת יחידה למבקש/ת" },
      { value: "sole-respondent", label: "משמורת יחידה לנתבע/ת" },
      { value: "joint", label: "משמורת משותפת" },
      { value: "shared", label: "משמורת משותפת שוויונית" },
    ],
    conditional: {
      dependsOn: "custody.hasChildren",
      showWhen: "כן",
    },
  },
  {
    id: "custody.currentArrangement",
    type: "textarea",
    label: "סידור משמורת נוכחי:",
    placeholder: "תארו איפה הילדים גרים כרגע ומה סידורי השהייה...",
    maxLength: 500,
    conditional: {
      dependsOn: "custody.hasChildren",
      showWhen: "כן",
    },
  },
  {
    id: "custody.proposedSchedule",
    type: "textarea",
    label: "הצעה לסידור שהייה:",
    placeholder: "תארו את ההצעה שלכם לחלוקת זמן עם הילדים...",
    maxLength: 500,
    helper: "לדוגמה: שבוע-שבוע, חילופי ימים, סופי שבוע, וכו'",
    conditional: {
      dependsOn: "custody.hasChildren",
      showWhen: "כן",
    },
  },
  {
    id: "custody.specialNeeds",
    type: "textarea",
    label: "צרכים מיוחדים של הילדים:",
    placeholder: "האם יש לילדים צרכים מיוחדים, טיפולים, או דרישות מיוחדות?",
    maxLength: 500,
    conditional: {
      dependsOn: "custody.hasChildren",
      showWhen: "כן",
    },
  },
];

// Alimony (מזונות)
export const ALIMONY_QUESTIONS: Question[] = [
  {
    id: "heading-alimony",
    type: "heading",
    label: "מזונות",
  },
  {
    id: "alimony.childSupportRequested",
    type: "radio",
    label: "האם מבוקשים מזונות ילדים?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "alimony.spousalSupportRequested",
    type: "radio",
    label: "האם מבוקשים מזונות אישה/בעל?",
    required: true,
    options: [
      { value: "כן", label: "כן" },
      { value: "לא", label: "לא" },
    ],
  },
  {
    id: "alimony.applicantIncome",
    type: "number",
    label: "הכנסה חודשית של המבקש/ת (בש\"ח):",
    placeholder: "0",
    required: true,
  },
  {
    id: "alimony.respondentIncome",
    type: "number",
    label: "הכנסה חודשית של הנתבע/ת (בש\"ח):",
    placeholder: "0",
    required: true,
  },
  {
    id: "alimony.applicantEmploymentStatus",
    type: "radio",
    label: "סטטוס תעסוקתי של המבקש/ת:",
    required: true,
    options: [
      { value: "employed", label: "שכיר/ה" },
      { value: "selfEmployed", label: "עצמאי/ת" },
      { value: "unemployed", label: "מובטל/ת" },
      { value: "student", label: "סטודנט/ית" },
      { value: "disabled", label: "נכה" },
    ],
  },
  {
    id: "alimony.respondentEmploymentStatus",
    type: "radio",
    label: "סטטוס תעסוקתי של הנתבע/ת:",
    required: true,
    options: [
      { value: "employed", label: "שכיר/ה" },
      { value: "selfEmployed", label: "עצמאי/ת" },
      { value: "unemployed", label: "מובטל/ת" },
      { value: "student", label: "סטודנט/ית" },
      { value: "disabled", label: "נכה" },
    ],
  },
  {
    id: "alimony.requestedChildSupport",
    type: "number",
    label: "סכום מזונות ילדים מבוקש (לילד, בש\"ח):",
    placeholder: "0",
    helper: "הסכום הממוצע בישראל הוא כ-1,500-2,500 ₪ לילד",
    conditional: {
      dependsOn: "alimony.childSupportRequested",
      showWhen: "כן",
    },
  },
  {
    id: "alimony.requestedSpousalSupport",
    type: "number",
    label: "סכום מזונות אישה/בעל מבוקש (בש\"ח):",
    placeholder: "0",
    conditional: {
      dependsOn: "alimony.spousalSupportRequested",
      showWhen: "כן",
    },
  },
  {
    id: "alimony.spousalSupportDuration",
    type: "select",
    label: "תקופת מזונות אישה/בעל:",
    options: [
      { value: "", label: "בחר..." },
      { value: "temporary", label: "זמני (עד לפסיקה סופית)" },
      { value: "1year", label: "שנה" },
      { value: "2years", label: "שנתיים" },
      { value: "3years", label: "3 שנים" },
      { value: "ongoing", label: "קבוע" },
      { value: "other", label: "אחר" },
    ],
    conditional: {
      dependsOn: "alimony.spousalSupportRequested",
      showWhen: "כן",
    },
  },
  {
    id: "alimony.additionalExpenses",
    type: "textarea",
    label: "הוצאות מיוחדות:",
    placeholder: "פרטו הוצאות מיוחדות (חינוך, בריאות, חוגים, וכו')...",
    maxLength: 500,
  },
];

// Map claim keys to their questions
export const CLAIM_QUESTIONS_MAP: Record<string, Question[]> = {
  divorceAgreement: DIVORCE_AGREEMENT_QUESTIONS,
  divorce: DIVORCE_QUESTIONS,
  property: PROPERTY_QUESTIONS,
  custody: CUSTODY_QUESTIONS,
  alimony: ALIMONY_QUESTIONS,
};

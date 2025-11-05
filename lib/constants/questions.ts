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

  // Section 5: Children
  {
    id: "heading-children",
    type: "heading",
    label: "ילדים",
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
  {
    id: "divorce.relationshipDescription",
    type: "textarea",
    label: "אנא רשום עד 5 שורות על מערכת היחסים שלכם",
    placeholder: "תארו את מערכת היחסים בינכם...",
    maxLength: 500,
    required: true,
  },
  {
    id: "divorce.whoWantsDivorceAndWhy",
    type: "textarea",
    label: "מי רוצה להתגרש ולמה?",
    placeholder: "תארו מי יזם את הגירושין ומה הסיבות...",
    maxLength: 1000,
    required: true,
  },
];

// Property Division (חלוקת רכוש)
export const PROPERTY_QUESTIONS: Question[] = [
  // Living situation (moved earlier)
  {
    id: "heading-living-situation",
    type: "heading",
    label: "מצב מגורים",
  },
  {
    id: "property.livingTogether",
    type: "radio",
    label: "האם אתם מתגוררים יחד?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "property.separationDate",
    type: "date",
    label: "ממתי לא מתגוררים יחד:",
    conditional: {
      dependsOn: "property.livingTogether",
      showWhen: "no",
    },
  },

  // Property listing
  {
    id: "heading-property-details",
    type: "heading",
    label: "פירוט נכסים וחובות",
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
    ],
  },
  {
    id: "custody.sinceWhen",
    type: "date",
    label: "מתי התחיל מצב זה?",
    helper: "מתי הילדים התחילו לגור במצב הנוכחי",
    conditional: {
      dependsOn: "custody.currentLivingArrangement",
      showWhen: ["with_applicant", "with_respondent", "split"],
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

  // Relationship description
  {
    id: "alimony.relationshipDescription",
    type: "textarea",
    label: "תארו בקצרה את מערכת היחסים:",
    placeholder: "תארו את מערכת היחסים בינכם...",
    maxLength: 500,
    helper: "תיאור זה יעובד באמצעות AI לשפה משפטית מקצועית",
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
    id: "alimony.childrenNeeds",
    type: "repeater",
    label: "פירוט הוצאות חודשיות לילדים:",
    helper: "הוסיפו את כל ההוצאות החודשיות הקשורות לילדים",
    repeaterConfig: {
      addButtonLabel: "+ הוסף הוצאה",
      minRows: 1,
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
  },

  // Household needs (expense table)
  {
    id: "heading-household-needs",
    type: "heading",
    label: "צורכי המדור - הוצאות חודשיות",
  },
  {
    id: "alimony.householdNeeds",
    type: "repeater",
    label: "פירוט הוצאות חודשיות למדור:",
    helper: "הוסיפו את כל ההוצאות החודשיות של משק הבית",
    repeaterConfig: {
      addButtonLabel: "+ הוסף הוצאה",
      minRows: 1,
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

  // Vehicle details
  {
    id: "heading-vehicle",
    type: "heading",
    label: "רכב",
  },
  {
    id: "alimony.hasVehicle",
    type: "radio",
    label: "האם יש לך רכב?",
    required: true,
    options: [
      { value: "yes", label: "כן" },
      { value: "no", label: "לא" },
    ],
  },
  {
    id: "alimony.vehicleDetails",
    type: "textarea",
    label: "פרטי הרכב:",
    placeholder: "יצרן, דגם, שנה, מספר רישוי",
    maxLength: 200,
    conditional: {
      dependsOn: "alimony.hasVehicle",
      showWhen: "yes",
    },
  },

  // Requested alimony amount
  {
    id: "heading-requested-amount",
    type: "heading",
    label: "סכום המזונות המבוקש",
  },
  {
    id: "alimony.requestedAmount",
    type: "number",
    label: "סכום המזונות החודשיים המבוקש (₪):",
    placeholder: "0",
    required: true,
    helper: "הסכום שאתם מבקשים מבית המשפט לפסוק כמזונות חודשיים",
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

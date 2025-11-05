/**
 * Configuration for property repeater components
 * Each property type has its own set of fields
 */

import { RepeaterField } from "@/components/wizard/repeater";

// Other Family Cases (תיקי משפחה אחרים)
export const OTHER_FAMILY_CASES_FIELDS: RepeaterField[] = [
  {
    id: "caseNumber",
    name: "caseNumber",
    label: "מספר התיק",
    type: "text",
    placeholder: "מספר תיק בבית המשפט",
    required: true,
  },
  {
    id: "caseType",
    name: "caseType",
    label: "סוג התיק",
    type: "text",
    placeholder: "לדוגמה: תביעת רכושית, תביעת מזונות",
    required: true,
  },
  {
    id: "court",
    name: "court",
    label: "בית המשפט",
    type: "text",
    placeholder: "שם בית המשפט",
    required: true,
  },
  {
    id: "judge",
    name: "judge",
    label: "בפני מי נדון התיק",
    type: "text",
    placeholder: "שם השופט/ת",
  },
  {
    id: "status",
    name: "status",
    label: "סטטוס התיק",
    type: "text",
    placeholder: "בתהליך / הסתיים / פסק דין",
    required: true,
  },
  {
    id: "caseEndDate",
    name: "caseEndDate",
    label: "מתי הסתיים הדיון בתיק",
    type: "date",
  },
];

// Children (ילדים) - With relationship description for each child
export const CHILDREN_FIELDS: RepeaterField[] = [
  {
    id: "childRelationship",
    name: "childRelationship",
    label: "אנא רשום עד חמש שורות על מערכת היחסים עם הילד/ה",
    type: "textarea",
    placeholder: "תארו את הקשר שלכם עם הילד/ה הזה/ה...",
    rows: 3,
  },
  {
    id: "firstName",
    name: "firstName",
    label: "שם פרטי",
    type: "text",
    placeholder: "שם פרטי של הילד/ה",
    required: true,
  },
  {
    id: "lastName",
    name: "lastName",
    label: "שם משפחה",
    type: "text",
    placeholder: "שם משפחה",
    required: true,
  },
  {
    id: "idNumber",
    name: "idNumber",
    label: "תעודת זהות",
    type: "text",
    placeholder: "מספר תעודת זהות",
  },
  {
    id: "birthDate",
    name: "birthDate",
    label: "תאריך לידה",
    type: "date",
    required: true,
  },
  {
    id: "address",
    name: "address",
    label: "כתובת",
    type: "text",
    placeholder: "כתובת מגורים",
  },
  {
    id: "nameOfParent",
    name: "nameOfParent",
    label: "שם ההורה שאינו המבקש",
    type: "text",
    placeholder: "שם ההורה השני",
  },
];

// Apartments (דירות)
export const APARTMENT_FIELDS: RepeaterField[] = [
  {
    id: "description",
    name: "description",
    label: "תיאור הדירה",
    type: "text",
    placeholder: "לדוגמה: דירת 4 חדרים ברח' הרצל 10, תל אביב",
    required: true,
  },
  {
    id: "value",
    name: "value",
    label: "שווי משוער (ש\"ח)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    id: "owner",
    name: "owner",
    label: "בעלות",
    type: "select",
    required: true,
    options: [
      { value: "שניהם", label: "שניהם" },
      { value: "המבקש/ת", label: "המבקש/ת" },
      { value: "הנתבע/ת", label: "הנתבע/ת" },
    ],
  },
  {
    id: "purchaseDate",
    name: "purchaseDate",
    label: "תאריך רכישה",
    type: "date",
  },
  {
    id: "proof",
    name: "proof",
    label: "אישור בעלות (אופציונלי)",
    type: "file",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו אישור בעלות מרשם המקרקעין",
  },
];

// Vehicles (רכבים)
export const VEHICLE_FIELDS: RepeaterField[] = [
  {
    id: "description",
    name: "description",
    label: "תיאור הרכב",
    type: "text",
    placeholder: "לדוגמה: מזדה 3 לבן (2019)",
    required: true,
  },
  {
    id: "value",
    name: "value",
    label: "שווי משוער (ש\"ח)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    id: "owner",
    name: "owner",
    label: "בעלות",
    type: "select",
    required: true,
    options: [
      { value: "שניהם", label: "שניהם" },
      { value: "המבקש/ת", label: "המבקש/ת" },
      { value: "הנתבע/ת", label: "הנתבע/ת" },
    ],
  },
  {
    id: "purchaseDate",
    name: "purchaseDate",
    label: "תאריך רכישה",
    type: "date",
  },
  {
    id: "proof",
    name: "proof",
    label: "רישיון רכב (אופציונלי)",
    type: "file",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו צילום רישיון הרכב",
  },
];

// Savings accounts (חסכונות)
export const SAVINGS_FIELDS: RepeaterField[] = [
  {
    id: "description",
    name: "description",
    label: "תיאור החשבון",
    type: "text",
    placeholder: "לדוגמה: חשבון חיסכון - בנק הפועלים",
    required: true,
  },
  {
    id: "value",
    name: "value",
    label: "יתרה (ש\"ח)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    id: "owner",
    name: "owner",
    label: "בעלות",
    type: "select",
    required: true,
    options: [
      { value: "שניהם", label: "שניהם" },
      { value: "המבקש/ת", label: "המבקש/ת" },
      { value: "הנתבע/ת", label: "הנתבע/ת" },
    ],
  },
  {
    id: "proof",
    name: "proof",
    label: "אישור מהבנק (אופציונלי)",
    type: "file",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו אישור יתרה מהבנק",
  },
];

// Social benefits (תנאים סוציאליים)
export const BENEFITS_FIELDS: RepeaterField[] = [
  {
    id: "description",
    name: "description",
    label: "תיאור התנאי הסוציאלי",
    type: "text",
    placeholder: "לדוגמה: קרן פנסיה - מבטחים",
    required: true,
  },
  {
    id: "value",
    name: "value",
    label: "שווי משוער (ש\"ח)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    id: "owner",
    name: "owner",
    label: "בעלות",
    type: "select",
    required: true,
    options: [
      { value: "שניהם", label: "שניהם" },
      { value: "המבקש/ת", label: "המבקש/ת" },
      { value: "הנתבע/ת", label: "הנתבע/ת" },
    ],
  },
  {
    id: "proof",
    name: "proof",
    label: "אישור מהגוף המנהל (אופציונלי)",
    type: "file",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו אישור צבירה",
  },
];

// General property (רכוש כללי)
export const PROPERTY_FIELDS: RepeaterField[] = [
  {
    id: "description",
    name: "description",
    label: "תיאור הרכוש",
    type: "text",
    placeholder: "לדוגמה: ריהוט, תכשיטים, ציוד אלקטרוני",
    required: true,
  },
  {
    id: "value",
    name: "value",
    label: "שווי משוער (ש\"ח)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    id: "owner",
    name: "owner",
    label: "בעלות",
    type: "select",
    required: true,
    options: [
      { value: "שניהם", label: "שניהם" },
      { value: "המבקש/ת", label: "המבקש/ת" },
      { value: "הנתבע/ת", label: "הנתבע/ת" },
    ],
  },
  {
    id: "proof",
    name: "proof",
    label: "אישור / תמונה (אופציונלי)",
    type: "file",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו אישור או תמונה של הרכוש",
  },
];

// Debts (חובות)
export const DEBT_FIELDS: RepeaterField[] = [
  {
    id: "description",
    name: "description",
    label: "תיאור החוב",
    type: "text",
    placeholder: "לדוגמה: משכנתא, הלוואה בנקית",
    required: true,
  },
  {
    id: "amount",
    name: "amount",
    label: "סכום החוב (ש\"ח)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    id: "creditor",
    name: "creditor",
    label: "נושה",
    type: "text",
    placeholder: "שם הבנק / החברה",
  },
  {
    id: "debtor",
    name: "debtor",
    label: "חייב",
    type: "select",
    required: true,
    options: [
      { value: "שניהם", label: "שניהם" },
      { value: "המבקש/ת", label: "המבקש/ת" },
      { value: "הנתבע/ת", label: "הנתבע/ת" },
    ],
  },
  {
    id: "proof",
    name: "proof",
    label: "אישור חוב (אופציונלי)",
    type: "file",
    accept: ".pdf,.jpg,.jpeg,.png",
    helper: "העלו אישור יתרת חוב",
  },
];

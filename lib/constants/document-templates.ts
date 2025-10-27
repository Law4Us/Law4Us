/**
 * Legal document templates
 * Placeholders: {{fieldName}} - replaced with actual data
 */

export const POWER_OF_ATTORNEY_TEMPLATE = `
ייפוי כוח לייצוג משפטי

אני הח"מ, {{fullName}}, ת.ז. {{idNumber}}, כתובת: {{address}},
טלפון: {{phone}}, דוא"ל: {{email}}

מיפה בזאת את כוחו של עו"ד {{lawyerName}} ו/או מי מטעמו לייצג אותי בתביעה בבית המשפט לענייני משפחה בעניין:

{{claimTypes}}

ייפוי כוח זה כולל את הסמכויות הבאות:
• להגיש בשמי כל תביעה, בקשה, או מסמך הנדרש
• להופיע בשמי בכל הליך שיפוטי
• לקבל החלטות משפטיות בשמי בהתייעצות עימי
• לחתום על כל מסמך הנדרש לצורך ייצוגי
• להגיע להסכמות ופשרות בכפוף לאישורי

ייפוי כוח זה תקף עד לסיום ההליכים המשפטיים הנוגעים לנושאים המפורטים לעיל או עד לביטולו בכתב על ידי.

תאריך: {{date}}

חתימה: {{signature}}

_______________________
{{fullName}}
`;

export const FORM_3_TEMPLATE = `
בית המשפט לענייני משפחה
טופס 3 - הרצאת פרטים

פרטי המבקש/ת:
שם מלא: {{fullName}}
מספר זהות: {{idNumber}}
כתובת: {{address}}
טלפון: {{phone}}
דוא"ל: {{email}}
תאריך לידה: {{birthDate}}

פרטי הנתבע/ת:
שם מלא: {{fullName2}}
מספר זהות: {{idNumber2}}
כתובת: {{address2}}
טלפון: {{phone2}}
דוא"ל: {{email2}}

פרטי הנישואין:
סטטוס: {{relationshipType}}
תאריך נישואין: {{weddingDay}}

{{childrenBlock}}

סוגי התביעות:
{{claimTypes}}

הנני מצהיר/ה בזאת כי הפרטים לעיל נכונים ומלאים למיטב ידיעתי.

תאריך: {{date}}

חתימה: {{signature}}

_______________________
{{fullName}}
`;

export interface DocumentData {
  fullName: string;
  idNumber: string;
  address: string;
  phone: string;
  email: string;
  birthDate?: string;
  fullName2?: string;
  idNumber2?: string;
  address2?: string;
  phone2?: string;
  email2?: string;
  relationshipType?: string;
  weddingDay?: string;
  claimTypes: string;
  childrenBlock?: string;
  lawyerName?: string;
  signature: string;
  date: string;
}

/**
 * Fill document template with actual data
 */
export function fillDocumentTemplate(
  template: string,
  data: DocumentData
): string {
  let filled = template;

  // Replace all placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    filled = filled.replace(placeholder, value || "");
  });

  // Remove any remaining unfilled placeholders
  filled = filled.replace(/\{\{[^}]+\}\}/g, "");

  return filled;
}

/**
 * Generate children block for Form 3
 */
export function generateChildrenBlock(
  children: Array<{
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    idNumber?: string;
  }>
): string {
  if (!children || children.length === 0) {
    return "ילדים: אין ילדים משותפים";
  }

  let block = "ילדים משותפים:\n";
  children.forEach((child, index) => {
    block += `${index + 1}. ${child.firstName || ""} ${child.lastName || ""}, `;
    block += `ת.ז. ${child.idNumber || "___________"}, `;
    block += `נולד/ה ביום ${child.birthDate || "___________"}\n`;
  });

  return block;
}

/**
 * Format claim types list for documents
 */
export function formatClaimTypesList(
  claimKeys: string[],
  claimLabels: { [key: string]: string }
): string {
  if (!claimKeys || claimKeys.length === 0) {
    return "";
  }

  return claimKeys
    .map((key, index) => `${index + 1}. ${claimLabels[key] || key}`)
    .join("\n");
}

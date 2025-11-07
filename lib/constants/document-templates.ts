/**
 * Legal document templates
 * Placeholders: {{fieldName}} - replaced with actual data
 */

export const POWER_OF_ATTORNEY_TEMPLATE = `ייפוי כוח לייצוג משפטי

בית המשפט לענייני משפחה

ייפוי כוח כללי

אני הח"מ, {{fullName}}, ת.ז. {{idNumber}}, מרחוב {{address}}, טלפון: {{phone}}

מיפה בזאת את כוחו של עו"ד {{lawyerName}}, מרחוב ז'בוטינסקי 7, רמת גן, טלפון: 03-6389500,
לייצג אותי בתביעה/בקשה בבית המשפט לענייני משפחה בעניין:

{{claimTypes}}

והנני מרשה ומסמיך את באי כוחי הנ"ל או מי מעובדיו או מי מטעמו, לבצע בשמי את הפעולות הבאות:

1. לחתום ולהגיש בשמי תביעה/בקשה/הודעה לבית המשפט לענייני משפחה.
2. לשלוח בשמי הודעות מטעמי.
3. לקבל לידיו חוות דעת רפואיות ואישורים רפואיים הנוגעים לעניין.
4. לייצג אותי בבית המשפט ובבית הדין הדתי ובכל הרשויות ובכל הערכאות.
5. לנהל בשמי את כל ההליכים המשפטיים הנוגעים לעניין, לרבות הגשת תצהירים, ערעורים ובקשות רשות ערעור, בקשות לעיון בתיק, בקשות למיצוי כל הליך דיוני וכו'.
6. למסור עניין זה לבוררות אם יראה לנכון, ולבחור בורר מטעמי.
7. לפשר ולסיים בדרך של פשרה או בכל דרך אחרת את כל העניינים הנ"ל, בהתאם לשיקול דעתו ובתנאים שיראו לו.
8. לבצע את תוכן הפסק דין או ההחלטה שתינתן בתיק, ולפעול לביצועם של פסקי דין בכל הדרכים המותרות בחוק.
9. לבצע כל פעולה אחרת הנדרשת לשם מילוי תפקידו כעורך דיני ולשם מילוי זכויותי על פי כל דין.
10. לגבות בשמי סכומי תביעה.
11. לבקש מכל רשות מידע הנדרש לצורך התביעה, לרבות רשות המסים, המוסד לביטוח לאומי, משרדי ממשלה וכל גוף או אדם אחר.
12. להתייצב בפניי משרד רישום המקרקעין וכל המשרדים והרשויות הנוגעים לנכסי מקרקעין, לרבות מינהל מקרקעי ישראל ורשויות מקומיות.
13. להתייצב בפניי רשם החברות ולבצע כל פעולה בקשר לניירות ערך.
14. להתייצב בפני רשם הפטנטים והמותגים.
15. להעביר ייפוי כוח זה או כל חלק ממנו לעורך דין אחר שיפעל במקומו.

ייפוי כוח זה יעמוד בתוקפו עד לסיום ההליך המשפטי.

ולראיה באתי על החתום, היום {{date}}

{{signature}}

{{fullName}}
`;

export const FORM_3_TEMPLATE = `טופס 3
(תקנה 258ד (ה))

הרצאת פרטים בתיק עיקרי
טופס 3 (תקנה 258ד (ה))

מהות התובענה: {{claimTypes}}
מעמדו של ממלא הטופס: {{applicantTitle}}

1. פרטים אישיים:

{{applicantTitle}}:
שם משפחה: {{lastName}}
שם פרטי: {{firstName}}
מס' זהות: {{idNumber}}
תאריך לידה: {{birthDate}}
כתובת מגורים: {{address}}
טל' בבית: {{phone}}
טל' נייד: {{phone}}
מקום עבודה: לא צוין
טל' עבודה: לא צוין
כתובת עבודה: לא צוין
שם עורך הדין: עו"ד אריאל דרור
טל' עורך דין: 03-6389500
מען עורך הדין: רחוב ז'בוטינסקי 7, רמת גן

בן/בת הזוג:
שם משפחה: {{lastName2}}
שם פרטי: {{firstName2}}
מס' זהות: {{idNumber2}}
תאריך לידה: {{birthDate2}}
כתובת מגורים: {{address2}}
טל' בבית: {{phone2}}
טל' נייד: {{phone2}}
מקום עבודה: לא צוין
טל' עבודה: לא צוין
כתובת עבודה: לא צוין
שם עורך הדין: לא צוין
טל' עורך דין: לא צוין
מען עורך הדין: לא צוין

2. פרטים לגבי מצב אישי:

תאריך נישואין נוכחיים: {{weddingDay}}
נישואין קודמים: {{previousMarriages}}
ילדים מנישואין קודמים: {{childrenFromPrevious}}

3. ילדים:

{{childrenBlock}}

4. פרטים לגבי דירת המגורים:

הדירה בה גר/ה {{applicantTitle}} היא: {{applicantHomeType}}
הדירה בה גר/ה בן/בת הזוג היא: {{partnerHomeType}}

5. נתונים על אלימות במשפחה:

האם הוגשה בעבר בקשה לבית המשפט או לבית דין דתי למתן צו הגנה, על פי החוק למניעת אלימות משפחה, התשנ"א-1991? {{protectionOrder}}

האם היו בעבר אירועי אלימות שהוגשה בגינם תלונה למשטרה ולא הוגשה בקשה לצו הגנה? {{pastViolence}}

6. נתונים על תיקים אחרים בענייני המשפחה בין בני הזוג שנידונו או נידונים בבית משפט:

{{otherCases}}

7. קשר עם גורמים טיפוליים:

האם היית/ם בקשר עם:
מחלקת הרווחה: {{contactedWelfare}}
ייעוץ נישואין: {{contactedMarriageCounseling}}
ייעוץ משפחתי: {{contactedFamilyCounseling}}
גישור: {{contactedMediation}}

האם את/ה מוכנ/ה לקחת חלק ב:
ייעוץ משפחתי: {{willingFamilyCounseling}}
גישור: {{willingMediation}}

8. הצהרה:

אני {{fullName}} מצהיר/ה כי לפי מיטב ידיעתי הפרטים שמילאתי בטופס נכונים.

{{signature}}

חתימת {{applicantTitle}}
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

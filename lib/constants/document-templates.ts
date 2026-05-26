/**
 * Legal document templates
 * Placeholders: {{fieldName}} - replaced with actual data
 */

export const POWER_OF_ATTORNEY_TEMPLATE = `ייפוי כוח לייצוג משפטי

אני החתום מטה {{fullName}}, ת"ז {{idNumber}}, ממנה בזה את עוה"ד אריאל דרור להיות בא כוחי בעניין {{powerOfAttorneyMatter}}.

מבלי לפגוע בכלליות המינוי הנ"ל יהיו באי כוחי רשאים לעשות ולפעול בשמי ובמקומי בכל הפעולות הבאות, כולן או מקצתן, הכל בקשר לעניין הנ"ל ולכל הנובע ממנו כדלקמן:

1. לחתום על ולהגיש בשמי כל תביעה או תביעה שכנגד, ו/או כל בקשה, הגנה, התנגדות, בקשה למתן רשות לערער, ערעור, דיון נוסף, הודעה, טענה, השגה, ערר, תובענה או כל הליך אחר הנוגע או הנובע מההליך הנ"ל ללא יוצא מן הכלל.
2. לחתום על ו/או לשלוח התראות נוטריוניות או אחרות ולעשות את כל הפעולות הקשורות והנובעות מהעניין הנ"ל.
3. לבקש ולקבל כל חוות דעת רפואית ו/או כל מסמך רפואי אחר וכל חוות דעת אחרת הנוגעת לעניין הנ"ל.
4. לייצגני ולהופיע בשמי ובמקומי בפני כל בתי המשפט, בתי הדין, רשויות ממשלתיות וכל רשות אחרת, ככל שהדברים נוגעים או קשורים לעניין הנ"ל.
5. לנקוט בכל הפעולות הכרוכות בייצוג האמור והמותרות על פי דין, ובכללן הזמנת עדים ומינוי מומחים.
6. למסור כל עניין הנובע מהעניין האמור לעיל לבוררות ולחתום על שטר בוררות.
7. להתפשר בכל עניין הנוגע או הנובע מהעניינים האמורים לעיל ולחתום על פשרה בבית המשפט או מחוצה לו.
8. להוציא לפועל כל פסק דין, החלטה או צו ולנקוט בכל הפעולות המותרות על פי חוק.
9. לנקוט בכל הפעולות ולחתום על כל מסמך או כתב אשר בא כוחי ימצא לנכון בעניין הנ"ל.
10. לגבות את סכום התביעה או כל סכום אחר, לרבות הוצאות בית המשפט ושכר טרחת עו"ד, ולקבל בשמי מסמכים וחפצים.
11. לבקש ולקבל מידע שהנני זכאי לקבלו על פי כל דין מכל מאגר מידע של רשות הנוגע לעניין הנ"ל.
12. להופיע בשמי ולייצגני בפני רשם המקרקעין ולחתום בשמי על מסמכים הנדרשים לעניין הנ"ל.
13. לייצגני ולהופיע בשמי בפני רשם החברות, רשם השותפויות ורשם האגודות השיתופיות בכל הקשור לעניין הנ"ל.
14. לטפל בשמי בכל הקשור לרישום פטנטים, סימני מסחר וכל זכות אחרת המוכרת בדין.
15. להעביר ייפוי כוח זה, על כל הסמכויות שבו או חלק מהן, לעורך דין אחר עם זכות העברה לאחרים.

הכתוב דלעיל ביחיד יכלול את הרבים ולהפך.

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
טל' עורך דין: 03-6951408
מען עורך הדין: ברקוביץ 4, מגדל המוזיאון, תל אביב

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
  powerOfAttorneyMatter?: string;
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

/**
 * Fee Agreement Template (הסכם שכר טרחה)
 * Signable document with client details and pricing
 */
export const FEE_AGREEMENT_TEMPLATE = `הסכם שכ"ט

שנערך ברמת גן ביום {{date}}

בין: עוה"ד אריאל דרור, ברקוביץ 4, מגדל המוזיאון, תל אביב (להלן: "עוה"ד") מצד אחד
ובין: {{fullName}} – ת"ז {{idNumber}}, {{address}} (להלן: "הלקוח") מצד שני

הואיל: והלקוח מעוניין במתן שירותים משפטיים כמפורט בהסכם זה;
והואיל: ועוה"ד מעוניינים ליתן ללקוח שירותים משפטיים כמפורט בהסכם זה, הכול בכפוף לתנאי הסכם זה.

לפיכך הוסכם כדלקמן:

1. המבוא להסכם זה מהווה חלק בלתי נפרד הימנו.

2. הוסכם בין הצדדים כי הלקוח שכר בזאת את שירותיהם המשפטיים של עוה"ד, לביצוע פעולות משפטיות אלה:
{{claimServicesList}}

3. א. התשלום עבור השירותים המשפטיים:
מחיר שירות: {{serviceSubtotal}} ש"ח
מע"מ על השירות בלבד ({{vatRate}}%): {{vatAmount}} ש"ח
אגרת בית משפט / אגרה ממשלתית (ללא מע"מ): {{courtFeeTotal}} ש"ח
סה"כ לתשלום: {{totalPrice}} ש"ח
התשלום יבוצע באמצעות מערכת התשלום המאובטחת באתר. (להלן: "שכ"ט").

4. התנאי לטיפול המשפטי, הינו תשלום סך התשלום.

5. התשלום יינתן בכל מצב לרבות במצב של הפסקת ייצוג מטעמי הלקוח ו/או הגעה להסכם.

6. פעולות מעבר לאמור בהסכם זה, כרוכות בעלויות נוספות.

7. הסכום לעיל כולל רק את האגרה המוצגת; שליחויות והוצאות נלוות אחרות, ככל שיהיו, אינן כלולות.

על החתום:

{{signature}}

הלקוח
`;

/**
 * Map claim keys to service descriptions for fee agreement
 */
export const CLAIM_SERVICES_MAP: Record<string, string> = {
  disputeResolution: 'הכנת בקשה ליישוב סכסוך',
  property: 'הכנת כתב תביעה רכושית',
  custody: 'הכנת כתב תביעה משמורת',
  alimony: 'הכנת כתב תביעה מזונות',
  divorceRabbinical: 'הכנת כתב תביעה גירושין (כולל משמורת, מזונות, רכוש)',
  divorceAgreement: 'הכנת הסכם גירושין',
  shalomBayit: 'הכנת כתב תביעה שלום בית',
};

/**
 * Format claim services list for fee agreement
 */
export function formatClaimServicesForFee(claimKeys: string[]): string {
  if (!claimKeys || claimKeys.length === 0) return '';

  return claimKeys
    .map((key) => CLAIM_SERVICES_MAP[key] || key)
    .join(' / ');
}

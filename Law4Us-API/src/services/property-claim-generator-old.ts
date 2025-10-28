/**
 * Property Claim Document Generator (תביעת רכושית)
 * Generates structured property claim documents without LLM
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  HeadingLevel,
  TabStopType,
  TabStopPosition,
  convertInchesToTwip,
  LevelFormat,
  BorderStyle,
} from 'docx';
import { BasicInfo, FormData } from '../types';

// Font sizes (in half-points)
const FONT_SIZES = {
  TITLE: 32, // 16pt
  HEADING_1: 28, // 14pt
  HEADING_2: 26, // 13pt
  BODY: 24, // 12pt
  SMALL: 22, // 11pt
};

// Spacing (in twips: 1/20 of a point)
const SPACING = {
  SECTION: 600, // Large gap between sections
  SUBSECTION: 400, // Medium gap between subsections
  PARAGRAPH: 240, // Standard paragraph spacing
  LINE: 120, // Small gap between lines
  MINIMAL: 60, // Minimal spacing
};

interface PropertyClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
}

/**
 * Get gendered term for plaintiff (person 1)
 */
function getPlaintiffTerm(gender?: 'male' | 'female'): {
  title: string; // התובע/התובעת
  pronoun: string; // הוא/היא
  possessive: string; // שלו/שלה
} {
  if (gender === 'male') {
    return { title: 'התובע', pronoun: 'הוא', possessive: 'שלו' };
  }
  return { title: 'התובעת', pronoun: 'היא', possessive: 'שלה' };
}

/**
 * Get gendered term for defendant (person 2)
 */
function getDefendantTerm(gender?: 'male' | 'female'): {
  title: string; // הנתבע/הנתבעת
  pronoun: string; // הוא/היא
  possessive: string; // שלו/שלה
} {
  if (gender === 'male') {
    return { title: 'הנתבע', pronoun: 'הוא', possessive: 'שלו' };
  }
  return { title: 'הנתבעת', pronoun: 'היא', possessive: 'שלה' };
}

/**
 * Create section header (large, bold, underlined)
 */
function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    text,
    alignment: AlignmentType.RIGHT,
    spacing: { before: SPACING.SECTION, after: SPACING.SUBSECTION },
    style: 'Heading1',
    run: {
      bold: true,
      size: FONT_SIZES.HEADING_1,
      underline: { type: UnderlineType.SINGLE },
      
    },
  });
}

/**
 * Create subsection header (medium, bold, underlined)
 */
function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    text,
    alignment: AlignmentType.RIGHT,
    spacing: { before: SPACING.SUBSECTION, after: SPACING.PARAGRAPH },
    run: {
      bold: true,
      size: FONT_SIZES.HEADING_2,
      underline: { type: UnderlineType.SINGLE },
      
    },
  });
}

/**
 * Create numbered item header (bold)
 */
function createNumberedHeader(text: string): Paragraph {
  return new Paragraph({
    text,
    alignment: AlignmentType.RIGHT,
    spacing: { before: SPACING.PARAGRAPH, after: SPACING.LINE },
    run: {
      bold: true,
      size: FONT_SIZES.BODY,
      
    },
  });
}

/**
 * Create body paragraph
 */
function createBodyParagraph(text: string, spacing: { before?: number; after?: number } = {}): Paragraph {
  return new Paragraph({
    text,
    alignment: AlignmentType.RIGHT,
    spacing: {
      before: spacing.before || 0,
      after: spacing.after || SPACING.LINE,
      line: 360, // 1.5 line spacing
    },
    run: {
      size: FONT_SIZES.BODY,
      
    },
  });
}

/**
 * Create bullet point
 */
function createBulletPoint(text: string): Paragraph {
  return new Paragraph({
    text: `• ${text}`,
    alignment: AlignmentType.RIGHT,
    spacing: { after: SPACING.MINIMAL },
    run: {
      size: FONT_SIZES.BODY,
      
    },
    indent: {
      right: convertInchesToTwip(0.25),
    },
  });
}

/**
 * Create numbered list item
 */
function createNumberedItem(number: number, text: string): Paragraph {
  return new Paragraph({
    text: `${number}. ${text}`,
    alignment: AlignmentType.RIGHT,
    spacing: { after: SPACING.MINIMAL },
    run: {
      size: FONT_SIZES.BODY,
      
    },
    indent: {
      right: convertInchesToTwip(0.25),
    },
  });
}

/**
 * Determine which law applies based on marriage status
 */
function getLawType(wereMarried: boolean): string {
  return wereMarried
    ? 'חוק יחסי ממון בין בני זוג התשל"ג - 1973'
    : 'חוק הלכת שיתוף';
}

/**
 * Get marriage status text
 */
function getMarriageStatus(wereMarried: boolean): string {
  return wereMarried ? 'נישאו' : 'לא נישאו';
}

/**
 * Count children under 18
 */
function countChildrenUnder18(children: any[]): number {
  const now = new Date();
  return children.filter((child) => {
    const birthDate = new Date(child.birthDate);
    const age = now.getFullYear() - birthDate.getFullYear();
    return age < 18;
  }).length;
}

/**
 * Format child details as bullet point
 * Format: • שם: להב ליאו גמבר ת״ז: 235138419 ת״ל: 2021-08-05 כתובת: יצחק שדה 1113 אזור
 */
function formatChildBullet(child: any): string {
  const address = child.address || child.street || 'לא צוין';
  return `שם: ${child.firstName} ${child.lastName} ת״ז: ${child.idNumber} ת״ל: ${child.birthDate} כתובת: ${address}`;
}

/**
 * Format job details
 */
function formatJobDetails(job: any, personLabel: string): string {
  if (!job || !job.monthlySalary) return '';
  return `שכר חודשי ברוטו: ${job.monthlySalary} ש״ח נמ״ב תלושי משכרות של ${personLabel} כנספח`;
}

/**
 * Format children list for document
 */
function formatChildrenList(children: any[]): string {
  if (!children || children.length === 0) return '';
  return (
    '\n' +
    children.map((child: any) => `• ${formatChildBullet(child)}`).join('\n')
  );
}

/**
 * Get value from property (handles both 'value' and 'amount' fields)
 */
function getPropertyValue(item: any): string {
  const val = item.value || item.amount || 'לא צוין';
  return val;
}

/**
 * Format property section (apartments, vehicles, savings, benefits, debts)
 */
function formatPropertySection(formData: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let itemNumber = 1;

  // Apartments
  if (formData.apartments && formData.apartments.length > 0) {
    formData.apartments.forEach((apt: any) => {
      const value = getPropertyValue(apt);
      const owner = apt.owner ? `, בבעלות: ${apt.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          itemNumber++,
          `${apt.description || 'דירת מגורים'} - שווי: ${value} ש״ח${owner}`
        )
      );
    });
  }

  // Vehicles
  if (formData.vehicles && formData.vehicles.length > 0) {
    formData.vehicles.forEach((vehicle: any) => {
      const value = getPropertyValue(vehicle);
      const owner = vehicle.owner ? `, בבעלות: ${vehicle.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          itemNumber++,
          `${vehicle.description || 'רכב'} - שווי: ${value} ש״ח${owner}`
        )
      );
    });
  }

  // Savings
  if (formData.savings && formData.savings.length > 0) {
    formData.savings.forEach((saving: any) => {
      const value = getPropertyValue(saving);
      const owner = saving.owner ? `, בבעלות: ${saving.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          itemNumber++,
          `${saving.description || 'חשבון חיסכון'} - סכום: ${value} ש״ח${owner}`
        )
      );
    });
  }

  // Benefits (pension, etc.)
  if (formData.benefits && formData.benefits.length > 0) {
    formData.benefits.forEach((benefit: any) => {
      const value = getPropertyValue(benefit);
      const owner = benefit.owner ? `, בבעלות: ${benefit.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          itemNumber++,
          `${benefit.description || 'זכויות סוציאליות'} - שווי: ${value} ש״ח${owner}`
        )
      );
    });
  }

  // Properties (general)
  if (formData.properties && formData.properties.length > 0) {
    formData.properties.forEach((property: any) => {
      const value = getPropertyValue(property);
      const owner = property.owner ? `, בבעלות: ${property.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          itemNumber++,
          `${property.description || 'רכוש'} - שווי: ${value} ש״ח${owner}`
        )
      );
    });
  }

  // Debts
  if (formData.debts && formData.debts.length > 0) {
    paragraphs.push(createSubsectionHeader('חובות'));
    formData.debts.forEach((debt: any, index: number) => {
      const amount = getPropertyValue(debt);
      const debtor = debt.debtor || debt.owner ? `, חייב: ${debt.debtor || debt.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${debt.description || 'חוב'} - סכום: ${amount} ש״ח${debtor}`
        )
      );
    });
  }

  if (paragraphs.length === 0) {
    paragraphs.push(createBodyParagraph('לא צוינו נכסים'));
  }

  return paragraphs;
}

/**
 * Generate Property Claim Document - Full Legal Structure
 */
export async function generatePropertyClaimDocument(
  data: PropertyClaimData
): Promise<Buffer> {
  const { basicInfo, formData } = data;

  // Extract data
  const wereMarried = formData.wereMarried === 'yes';
  const lawType = getLawType(wereMarried);
  const marriageStatus = getMarriageStatus(wereMarried);
  const children = formData.children || [];
  const childrenUnder18 = countChildrenUnder18(children);
  const separationDate =
    formData.separationDate || new Date().toISOString().split('T')[0];
  const childrenList = formatChildrenList(children);

  // Create document with full legal structure
  const doc = new Document({
    sections: [
      {
        properties: {
          
        },
        children: [
          // Header with date
          new Paragraph({
            text: 'תאריך חתימת המסמך:',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            run: {
              underline: { type: UnderlineType.SINGLE },
            },
          }),

          // Court Header
          new Paragraph({
            text: 'בבית המשפט לענייני משפחה',
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            run: {
              bold: true,
              size: 24,
            },
          }),
          new Paragraph({
            text: 'תל"מ',
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: 'בתל אביב',
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "בפני כב' השו'",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Plaintiff (תובעת)
          new Paragraph({
            text: 'התובעת:',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            run: {
              bold: true,
            },
          }),
          new Paragraph({
            text: `${basicInfo.fullName} מ"ז ${basicInfo.idNumber}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: `מרח' ${basicInfo.address}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'באמצעות ב"כ עוה"ד אריאל דרור (מ"ר 31892)',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: "מרח' אבא שאול 15, רמת גן",
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: 'טל: 03-6951408   פקס: 03-6951683',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
          }),

          // "Against" (נגד)
          new Paragraph({
            text: 'נגד',
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            run: {
              bold: true,
            },
          }),

          // Defendant (נתבע)
          new Paragraph({
            text: 'הנתבע:',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            run: {
              bold: true,
            },
          }),
          new Paragraph({
            text: `${basicInfo.fullName2} מ"ז ${basicInfo.idNumber2}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: `טל: ${basicInfo.phone2}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: `דוא"ל: ${basicInfo.email2}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
          }),

          // Title: כתב תביעה
          new Paragraph({
            text: 'כתב תביעה',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          }),

          // Nature of claim
          new Paragraph({
            text: 'מהות התביעה: רכושית, איזון משאבים.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: 'שווי נושא התובענה: סכום לא קצוב.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: 'סכום אגרת בית משפט: 590₪. לפי תקנה א2 לתוספת הראשונה לתקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // Requested remedies
          new Paragraph({
            text: `הסעדים המבוקשים: בית המשפט הנכבד מתבקש לעשות שימוש בסמכותו לפי ${lawType} ולקבוע, בין היתר, כי כל הרכוש יחולק בחלוקה שווה. כמו גם ליתן כל סעד כמבוקש בסיפא של תביעה זאת.`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // Additional proceedings
          new Paragraph({
            text: 'הליכים נוספים ככל שיש:',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
            run: {
              bold: true,
            },
          }),

          // Summons (הזמנה לדין)
          new Paragraph({
            text: 'הזמנה לדין:',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            run: {
              bold: true,
              underline: { type: UnderlineType.SINGLE },
            },
          }),
          new Paragraph({
            text: 'הואיל והתובע הגיש כתב תביעה זה נגדך, אתה מוזמן להגיש כתב הגנה בתוך שלושים ימים מיום שהומצאה לך הזמנה זו, לפי תקנה 13(א) לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'לתשומת לבך, אם לא תגיש כתב הגנה אזי לפי תקנה 130 לתקנות סדר הדין האזרחי, התשע"ט-2018, תהיה לתובעת הזכות לקבל פסק דין שלא בפניך.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
          }),

          // Section B: Main Arguments (עיקר הטענות)
          new Paragraph({
            text: 'ב. עיקר הטענות:',
            alignment: AlignmentType.RIGHT,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),

          // 1. Brief description of parties
          new Paragraph({
            text: `1. תיאור תמציתי של בעלי הדין. ${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} היו במערכת יחסים ו${marriageStatus}, במהלך הקשר נולדו להם ${children.length} קטינים${childrenList}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // 2. Summary of requested remedy
          new Paragraph({
            text: `2. פירוט הסעד המבוקש באופן תמציתי`,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            run: {
              bold: true,
            },
          }),
          new Paragraph({
            text: `בית המשפט הנכבד מתבקש לעשות שימוש בסמכותו לפי ${lawType} ולקבוע, בין היתר, כי כל הרכוש יחולק בחלוקה שווה, לפי ${lawType}. כמו גם ליתן כל סעד כמבוקש בסיפא של תביעה זאת.`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // 3. Summary of facts
          new Paragraph({
            text: '3. תמצית העובדות הנחוצות לביסוסה של עילת התביעה ומתי נולדה',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            run: {
              bold: true,
            },
          }),
          new Paragraph({
            text: `המשטר הרכושי החל על בני הזוג הינו ${lawType}.`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `כבוד בית המשפט מתבקש לאזן הרכוש שווה בשווה לפי ${lawType}.`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // 4. Jurisdiction facts
          new Paragraph({
            text: '4. פירוט העובדות המקנות סמכות לבית המשפט',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            run: {
              bold: true,
            },
          }),
          new Paragraph({
            text: 'המדובר בענייני משפחה ובבני משפחה לפי חוק בית המשפט לענייני משפחה, תשנה – 1995.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
          }),

          // Section C: Detailed Facts (פירוט העובדות)
          new Paragraph({
            text: 'חלק ג - פירוט העובדות המבססות את טענות התובעת',
            alignment: AlignmentType.RIGHT,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),

          // Relationship (מערכת היחסים)
          new Paragraph({
            text: 'מערכת היחסים',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            run: {
              bold: true,
              underline: { type: UnderlineType.SINGLE },
            },
          }),
          new Paragraph({
            text: `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} היו במערכת יחסים ו${marriageStatus}, במהלך הקשר נולדו להם ${children.length} קטינים${childrenList}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `מיום ${separationDate} הצדדים חיים בנפרד`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
          }),

          // Property Section (הרכוש)
          new Paragraph({
            text: 'הרכוש',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 100 },
            run: {
              bold: true,
              underline: { type: UnderlineType.SINGLE },
            },
          }),
          ...formatPropertySection(formData),

          // Employment (השתכרות הצדדים)
          new Paragraph({
            text: 'השתכרות הצדדים',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 100 },
            run: {
              bold: true,
              underline: { type: UnderlineType.SINGLE },
            },
          }),
          ...(formData.job1 || formData.job2
            ? [
                new Paragraph({
                  text: `${basicInfo.fullName} (${formData.jobType || 'עצמאי'}): ${formatJobDetails(formData.job1, 'התובעת') || 'פרטי תעסוקה לא צוינו'}`,
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  text: `${basicInfo.fullName2} (${formData.jobType2 || 'עצמאי'}): ${formatJobDetails(formData.job2, 'הנתבע') || 'פרטי תעסוקה לא צוינו'}`,
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 300 },
                }),
              ]
            : [
                new Paragraph({
                  text: 'פרטי תעסוקה לא צוינו',
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 300 },
                }),
              ]),

          // Determining Date (היום הקובע)
          new Paragraph({
            text: 'היום הקובע',
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 100 },
            run: {
              bold: true,
              underline: { type: UnderlineType.SINGLE },
            },
          }),
          new Paragraph({
            text: `היום הקובע לענייננו הוא מועד הפירוד: ${separationDate}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
          }),

          // Remedies Section (סעדים)
          new Paragraph({
            text: 'סעדים',
            alignment: AlignmentType.RIGHT,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: 'אשר על כן מתבקש בית המשפט הנכבד:',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: '1. לאזן את משאבי הצדדים, וליישם חלוקה הוגנת.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '2. למנות מומחה מתאים (לפי צורך) לשם איזון כולל.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '3. להורות על השבה לתובעת של כל כספים, אם ייקבע שנמשכו או נלקחו שלא כדין.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '4. להורות לנתבע למסור דו״ח מרוכז בדבר כלל הזכויות הסוציאליות והכספים בבעלותו, בכל גוף רלוונטי.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '5. להורות על גילוי מסמכים.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '6. להתיר פיצול סעדים ביחס לעילות/סעדים שטרם נתבררו או נתגבשו.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '7. לתת כל סעד זמני או קבוע הנדרש לשמירת זכויות התובעת עד להשלמת האיזון.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '8. לחייב בהוצאות ושכ״ט עו״ד בצירוף מע״מ כדין.',
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
          }),

          // Signature
          new Paragraph({
            text: '__________________',
            alignment: AlignmentType.LEFT,
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: 'חתימת התובעת',
            alignment: AlignmentType.LEFT,
          }),
        ],
      },
    ],
  });

  // Convert to buffer using Packer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

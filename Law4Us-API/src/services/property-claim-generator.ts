/**
 * Property Claim Document Generator (תביעת רכושית)
 * Generates structured property claim documents without LLM
 * WITH PROPER FORMATTING AND RTL SUPPORT
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  HeadingLevel,
  PageBreak,
  PageNumber,
  NumberFormat,
  Header,
  Footer,
  ImageRun,
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData } from '../types';

// Font sizes (in half-points)
const FONT_SIZES = {
  MAIN_TITLE: 40, // 20pt - for כתב תביעה
  SECTION: 32, // 16pt - for ב. עיקר הטענות, סעדים, etc.
  TITLE: 32, // 16pt - for court name
  SUBSECTION: 28, // 14pt - for מערכת היחסים, הרכוש, etc.
  HEADING_2: 26, // 13pt - for numbered items
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
  signature?: string | Buffer; // Client signature (base64 or Buffer)
  lawyerSignature?: string | Buffer; // Lawyer signature with stamp (base64 or Buffer)
  attachments?: Array<{
    label: string;
    description: string;
    images: Buffer[]
  }>;
}

/**
 * Get gendered term for plaintiff (person 1)
 */
function getPlaintiffTerm(gender?: 'male' | 'female', name?: string): {
  title: string;
  pronoun: string;
  possessive: string;
  name: string;
} {
  if (gender === 'male') {
    return { title: 'התובע', pronoun: 'הוא', possessive: 'שלו', name: name || 'התובע' };
  }
  return { title: 'התובעת', pronoun: 'היא', possessive: 'שלה', name: name || 'התובעת' };
}

/**
 * Get gendered term for defendant (person 2)
 */
function getDefendantTerm(gender?: 'male' | 'female', name?: string): {
  title: string;
  pronoun: string;
  possessive: string;
  name: string;
} {
  if (gender === 'male') {
    return { title: 'הנתבע', pronoun: 'הוא', possessive: 'שלו', name: name || 'הנתבע' };
  }
  return { title: 'הנתבעת', pronoun: 'היא', possessive: 'שלה', name: name || 'הנתבעת' };
}

/**
 * Create section header (16pt, bold, underlined) - for ב. עיקר הטענות, סעדים, etc.
 */
function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.SECTION, // 16pt
        underline: { type: UnderlineType.SINGLE },
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START, // START = right in RTL
    spacing: { before: SPACING.SECTION, after: SPACING.SUBSECTION },
    bidirectional: true,

  });
}

/**
 * Create subsection header (14pt, bold, underlined) - for מערכת היחסים, הרכוש, etc.
 */
function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.SUBSECTION, // 14pt
        underline: { type: UnderlineType.SINGLE },
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { before: SPACING.SUBSECTION, after: SPACING.PARAGRAPH },
    bidirectional: true,

  });
}

/**
 * Create numbered item header (bold, larger, underlined like a section)
 */
function createNumberedHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.HEADING_2, // Larger font for section-like appearance
        underline: { type: UnderlineType.SINGLE }, // Added underline
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { before: SPACING.SUBSECTION, after: SPACING.PARAGRAPH },
    bidirectional: true,

  });
}

/**
 * Create body paragraph with proper line spacing
 */
function createBodyParagraph(
  text: string,
  spacing: { before?: number; after?: number } = {}
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: {
      before: spacing.before || 0,
      after: spacing.after || SPACING.LINE,
      line: 360, // 1.5 line spacing
    },
    bidirectional: true,

  });
}

/**
 * Create bullet point
 */
function createBulletPoint(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `• ${text}`,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.MINIMAL },
    indent: {
      right: convertInchesToTwip(0.25),
    },
    bidirectional: true,

  });
}

/**
 * Create numbered list item
 */
function createNumberedItem(number: number, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${number}. ${text}`,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.MINIMAL },
    indent: {
      right: convertInchesToTwip(0.25),
    },
    bidirectional: true,

  });
}

/**
 * Create centered title
 */
function createCenteredTitle(text: string, size: number): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: SPACING.LINE },
    bidirectional: true,

  });
}

/**
 * Create main title (כתב תביעה)
 */
function createMainTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.MAIN_TITLE,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: SPACING.SUBSECTION, after: SPACING.SUBSECTION },
    bidirectional: true,

  });
}

/**
 * Create info line (label + value)
 * RLM (U+200F) after punctuation keeps it with Hebrew text
 */
function createInfoLine(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}:\u200F `, // RLM after colon
        bold: true,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
      new TextRun({
        text: value,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.MINIMAL },
    bidirectional: true,

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
 * Translate housing type from English to Hebrew
 */
function translateHousingType(type: string): string {
  const translations: Record<string, string> = {
    'jointOwnership': 'בעלות משותפת',
    'applicantOwnership': 'בבעלות המבקש/ת',
    'respondentOwnership': 'בבעלות הנתבע/ת',
    'rental': 'שכירות',
    'other': 'אחר',
  };
  return translations[type] || type;
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
 * Check if there is significant income disparity (one party earns 2x or more)
 * Returns { hasDisparity, higherEarner, ratio }
 */
function checkIncomeDisparity(
  formData: any,
  plaintiff: { title: string; name: string },
  defendant: { title: string; name: string }
): { hasDisparity: boolean; higherEarner: string; lowerEarner: string; ratio: number } {
  const salary1 = parseFloat(formData.job1?.monthlySalary) || 0;
  const salary2 = parseFloat(formData.job2?.monthlySalary) || 0;

  // Need both salaries to compare
  if (salary1 === 0 || salary2 === 0) {
    return { hasDisparity: false, higherEarner: '', lowerEarner: '', ratio: 0 };
  }

  const ratio = Math.max(salary1, salary2) / Math.min(salary1, salary2);

  // Check if ratio is 2.0 or higher
  if (ratio >= 2.0) {
    const higherEarner = salary1 > salary2 ? plaintiff.title : defendant.title;
    const lowerEarner = salary1 > salary2 ? defendant.title : plaintiff.title;
    return { hasDisparity: true, higherEarner, lowerEarner, ratio };
  }

  return { hasDisparity: false, higherEarner: '', lowerEarner: '', ratio };
}

/**
 * Format child details as bullet point
 * RLM after each colon to keep with Hebrew
 */
function formatChildBullet(child: any): string {
  const address = child.address || child.street || 'לא צוין';
  return `שם:\u200F ${child.firstName} ${child.lastName} ת״ז:\u200F ${child.idNumber} ת״ל:\u200F ${child.birthDate} כתובת:\u200F ${address}`;
}

/**
 * Format job details
 * RLM after colons
 */
function formatJobDetails(job: any, personLabel: string): string {
  if (!job || !job.monthlySalary) return '';
  return `שכר חודשי ברוטו:\u200F ${job.monthlySalary} ש״ח נמ״ב תלושי משכרות של ${personLabel} כנספח`;
}

/**
 * Get value from property (handles both 'value' and 'amount' fields)
 */
function getPropertyValue(item: any): string {
  return item.value || item.amount || 'לא צוין';
}

/**
 * Calculate total and breakdown by ownership for a property array
 */
function calculatePropertySummary(items: any[]): {
  total: number;
  byOwner: { [key: string]: { value: number; count: number } };
} {
  let total = 0;
  const byOwner: { [key: string]: { value: number; count: number } } = {};

  items.forEach((item) => {
    const value = parseInt(getPropertyValue(item)) || 0;
    total += value;

    const owner = item.owner || item.debtor || 'לא צוין';
    if (!byOwner[owner]) {
      byOwner[owner] = { value: 0, count: 0 };
    }
    byOwner[owner].value += value;
    byOwner[owner].count += 1;
  });

  return { total, byOwner };
}

/**
 * Create property summary paragraph (total and breakdown by ownership)
 */
function createPropertySummary(
  categoryName: string,
  items: any[],
  isDebt: boolean = false
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const summary = calculatePropertySummary(items);

  // Total line
  const totalText = isDebt
    ? `סך ${categoryName} עולים לסך של ${summary.total.toLocaleString()} ש״ח`
    : `סך ${categoryName} עולה לסך של ${summary.total.toLocaleString()} ש״ח`;

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: totalText,
          size: FONT_SIZES.BODY,
          font: 'David',
      
          bold: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.MINIMAL },
      bidirectional: true,
  
    })
  );

  // Breakdown by ownership (only if there are multiple owners)
  const owners = Object.keys(summary.byOwner);
  if (owners.length > 1 || (owners.length === 1 && owners[0] !== 'שניהם')) {
    const breakdownLabel = isDebt ? `פירוט ${categoryName} לפי חייב:\u200F` : `פירוט ${categoryName} לפי בעלות:\u200F`;
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: breakdownLabel,
            size: FONT_SIZES.BODY,
            font: 'David',
        
            bold: true,
          }),
        ],
        alignment: AlignmentType.START,
        spacing: { after: SPACING.MINIMAL },
        bidirectional: true,
    
      })
    );

    // Sort owners: שניהם first, then others
    const sortedOwners = owners.sort((a, b) => {
      if (a === 'שניהם') return -1;
      if (b === 'שניהם') return 1;
      return 0;
    });

    sortedOwners.forEach((owner) => {
      const ownerData = summary.byOwner[owner];
      const ownerLabel = isDebt
        ? owner === 'שניהם' ? 'חוב משותף' : `חייב ${owner}`
        : owner === 'שניהם' ? 'בבעלות שניהם' : `בבעלות ${owner}`;

      const itemWord = ownerData.count === 1 ? 'פריט' : 'פריטים';

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${ownerLabel}:\u200F ${ownerData.value.toLocaleString()} ש״ח (${ownerData.count} ${itemWord})`,
              size: FONT_SIZES.BODY,
              font: 'David',
          
            }),
          ],
          alignment: AlignmentType.START,
          spacing: { after: SPACING.MINIMAL },
          indent: {
            right: convertInchesToTwip(0.25),
          },
          bidirectional: true,
      
        })
      );
    });

    // Add spacing after breakdown
    paragraphs.push(createBodyParagraph('', { after: SPACING.LINE }));
  }

  return paragraphs;
}

/**
 * Format property section with subsection headers for each property type
 */
function formatPropertySection(formData: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Extract property data (might be nested under formData.property or at top level)
  const propertyData = formData.property || formData;

  // דירות (Apartments)
  if (propertyData.apartments && propertyData.apartments.length > 0) {
    paragraphs.push(createSubsectionHeader('דירות'));
    paragraphs.push(...createPropertySummary('הדירות', propertyData.apartments));
    propertyData.apartments.forEach((apt: any, index: number) => {
      const value = getPropertyValue(apt);
      const owner = apt.owner ? `, בבעלות:\u200F ${apt.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${apt.description || 'דירת מגורים'} - שווי:\u200F ${value} ש״ח${owner}`
        )
      );
    });
  }

  // רכבים (Vehicles)
  if (propertyData.vehicles && propertyData.vehicles.length > 0) {
    paragraphs.push(createSubsectionHeader('רכבים'));
    paragraphs.push(...createPropertySummary('הרכבים', propertyData.vehicles));
    propertyData.vehicles.forEach((vehicle: any, index: number) => {
      const value = getPropertyValue(vehicle);
      const owner = vehicle.owner ? `, בבעלות:\u200F ${vehicle.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${vehicle.description || 'רכב'} - שווי:\u200F ${value} ש״ח${owner}`
        )
      );
    });
  }

  // חסכונות (Savings)
  if (propertyData.savings && propertyData.savings.length > 0) {
    paragraphs.push(createSubsectionHeader('חסכונות'));
    paragraphs.push(...createPropertySummary('החסכונות', propertyData.savings));
    propertyData.savings.forEach((saving: any, index: number) => {
      const value = getPropertyValue(saving);
      const owner = saving.owner ? `, בבעלות:\u200F ${saving.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${saving.description || 'חשבון חיסכון'} - סכום:\u200F ${value} ש״ח${owner}`
        )
      );
    });
  }

  // תנאים סוציאליים (Social Benefits)
  if (propertyData.benefits && propertyData.benefits.length > 0) {
    paragraphs.push(createSubsectionHeader('תנאים סוציאליים'));
    paragraphs.push(...createPropertySummary('התנאים הסוציאליים', propertyData.benefits));
    propertyData.benefits.forEach((benefit: any, index: number) => {
      const value = getPropertyValue(benefit);
      const owner = benefit.owner ? `, בבעלות:\u200F ${benefit.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${benefit.description || 'זכויות סוציאליות'} - שווי:\u200F ${value} ש״ח${owner}`
        )
      );
    });
  }

  // רכוש כללי (General properties) - only add header if there are items
  if (propertyData.properties && propertyData.properties.length > 0) {
    paragraphs.push(createSubsectionHeader('רכוש כללי'));
    paragraphs.push(...createPropertySummary('הרכוש הכללי', propertyData.properties));
    propertyData.properties.forEach((property: any, index: number) => {
      const value = getPropertyValue(property);
      const owner = property.owner ? `, בבעלות:\u200F ${property.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${property.description || 'רכוש'} - שווי:\u200F ${value} ש״ח${owner}`
        )
      );
    });
  }

  // חובות (Debts)
  if (propertyData.debts && propertyData.debts.length > 0) {
    paragraphs.push(createSubsectionHeader('חובות'));
    paragraphs.push(...createPropertySummary('החובות', propertyData.debts, true));
    propertyData.debts.forEach((debt: any, index: number) => {
      const amount = getPropertyValue(debt);
      const debtor = debt.debtor || debt.owner ? `, חייב:\u200F ${debt.debtor || debt.owner}` : '';
      paragraphs.push(
        createNumberedItem(index + 1, `${debt.description || 'חוב'} - סכום:\u200F ${amount} ש״ח${debtor}`)
      );
    });
  }

  if (paragraphs.length === 0) {
    paragraphs.push(createBodyParagraph('לא צוינו נכסים'));
  }

  return paragraphs;
}

/**
 * Generate Property Claim Document - COMPLETE REWRITE WITH PROPER FORMATTING
 */
export async function generatePropertyClaimDocument(
  data: PropertyClaimData
): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature, attachments } = data;

  // Extract gender terms with names
  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Extract data
  const wereMarried = basicInfo.relationshipType === 'married';
  const lawType = getLawType(wereMarried);
  const marriageStatus = getMarriageStatus(wereMarried);
  const propertyData = formData.property || formData;
  const children = propertyData.children || [];
  const childrenUnder18 = countChildrenUnder18(children);
  const separationDate = formData.separationDate || new Date().toISOString().split('T')[0];

  // Create document with full legal structure
  const doc = new Document({
    sections: [
      {
        properties: {
      
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'עמוד ',
                    font: 'David',
                    size: FONT_SIZES.SMALL,
                
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'David',
                    size: FONT_SIZES.SMALL,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                bidirectional: true,
            
              }),
            ],
          }),
        },
        children: [
          // ===== HEADER =====
          createBodyParagraph('תאריך חתימת המסמך:\u200F', { after: SPACING.PARAGRAPH }),

          // ===== COURT INFO =====
          createCenteredTitle('בבית המשפט לענייני משפחה', FONT_SIZES.TITLE),
          createCenteredTitle('תל"מ', FONT_SIZES.BODY),
          createCenteredTitle('בתל אביב', FONT_SIZES.BODY),
          createBodyParagraph("בפני כב' השו'", { after: SPACING.SUBSECTION }),

          // ===== PLAINTIFF =====
          createNumberedHeader(`${plaintiff.title}:\u200F`),
          createInfoLine('שם', basicInfo.fullName),
          createInfoLine('מספר זהות', basicInfo.idNumber),
          createInfoLine('כתובת', basicInfo.address),
          createBodyParagraph('באמצעות ב"כ עוה"ד אריאל דרור (מ"ר 31892)', {
            after: SPACING.MINIMAL,
          }),
          createBodyParagraph("מרח' אבא שאול 15, רמת גן", { after: SPACING.MINIMAL }),
          createBodyParagraph('טל: 03-6951408   פקס: 03-6951683', { after: SPACING.SUBSECTION }),

          // ===== AGAINST =====
          createCenteredTitle('נגד', FONT_SIZES.HEADING_2),

          // ===== DEFENDANT =====
          createNumberedHeader(`${defendant.title}:\u200F`),
          createInfoLine('שם', basicInfo.fullName2),
          createInfoLine('מספר זהות', basicInfo.idNumber2),
          createInfoLine('טלפון', basicInfo.phone2),
          createInfoLine('דואר אלקטרוני', basicInfo.email2),

          // ===== TITLE =====
          createMainTitle('כתב תביעה'),

          // ===== NATURE OF CLAIM =====
          // מהות התביעה - entire line bold
          new Paragraph({
            children: [
              new TextRun({
                text: 'מהות התביעה: רכושית, איזון משאבים.\u200F',
                bold: true,
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.LINE, line: 360 },
            bidirectional: true,
        
          }),
          // שווי נושא התובענה - title bold + underline
          new Paragraph({
            children: [
              new TextRun({
                text: 'שווי נושא התובענה:\u200F',
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
              new TextRun({
                text: ' סכום לא קצוב.\u200F',
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.LINE, line: 360 },
            bidirectional: true,
        
          }),
          // סכום אגרת בית משפט - title bold + underline
          new Paragraph({
            children: [
              new TextRun({
                text: 'סכום אגרת בית משפט:\u200F',
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
              new TextRun({
                text: ' 590₪. לפי תקנה א2 לתוספת הראשונה לתקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.\u200F',
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
        
          }),

          // ===== REQUESTED REMEDIES =====
          // הסעדים המבוקשים - title bold + underline
          new Paragraph({
            children: [
              new TextRun({
                text: 'הסעדים המבוקשים:\u200F',
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
              new TextRun({
                text: ` בית המשפט הנכבד מתבקש לעשות שימוש בסמכותו לפי ${lawType} ולקבוע, בין היתר, כי כל הרכוש יחולק בחלוקה שווה. כמו גם ליתן כל סעד כמבוקש בסיפא של תביעה זאת.\u200F`,
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
        
          }),

          // ===== SUMMONS (MAJOR SECTION) =====
          createSectionHeader('הזמנה לדין:\u200F'),
          createBodyParagraph(
            `הואיל ו${plaintiff.title} הגיש כתב תביעה זה נגדך, אתה מוזמן להגיש כתב הגנה בתוך שלושים ימים מיום שהומצאה לך הזמנה זו, לפי תקנה 13(א) לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.`
          ),
          createBodyParagraph(
            `לתשומת לבך, אם לא תגיש כתב הגנה אזי לפי תקנה 130 לתקנות סדר הדין האזרחי, התשע"ט-2018, תהיה ל${plaintiff.title} הזכות לקבל פסק דין שלא בפניך.`,
            { after: SPACING.SECTION }
          ),

          // ===== SECTION B: MAIN ARGUMENTS =====
          createSectionHeader('ב. עיקר הטענות:\u200F'),

          // 1. Brief description
          createNumberedHeader('1. תיאור תמציתי של בעלי הדין'),
          createBodyParagraph(
            `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} היו במערכת יחסים ו${marriageStatus}, במהלך הקשר נולדו להם ${children.length} קטינים.`
          ),

          // Children list
          ...(children.length > 0
            ? children.map((child: any) => createBulletPoint(formatChildBullet(child)))
            : []),

          // 2. Summary of requested remedy
          createNumberedHeader('2. פירוט הסעד המבוקש באופן תמציתי'),
          createBodyParagraph(
            `בית המשפט הנכבד מתבקש לעשות שימוש בסמכותו לפי ${lawType} ולקבוע, בין היתר, כי כל הרכוש יחולק בחלוקה שווה. כמו גם ליתן כל סעד כמבוקש בסיפא של תביעה זאת.\u200F`
          ),

          // 3. Summary of facts
          createNumberedHeader('3. תמצית העובדות הנחוצות לביסוסה של עילת התביעה ומתי נולדה'),
          createBodyParagraph(`המשטר הרכושי החל על בני הזוג הינו ${lawType}.`),
          createBodyParagraph(`כבוד בית המשפט מתבקש לאזן הרכוש שווה בשווה לפי ${lawType}.`),

          // 4. Jurisdiction
          createNumberedHeader('4. פירוט העובדות המקנות סמכות לבית המשפט'),
          createBodyParagraph(
            'המדובר בענייני משפחה ובבני משפחה לפי חוק בית המשפט לענייני משפחה, תשנה – 1995.',
            { after: SPACING.SECTION }
          ),

          // ===== SECTION C: DETAILED FACTS =====
          createSectionHeader('חלק ג - פירוט העובדות המבססות את טענות ' + plaintiff.title),

          // Relationship
          createSubsectionHeader('מערכת היחסים'),
          createBodyParagraph(
            `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} היו במערכת יחסים ו${marriageStatus}, במהלך הקשר נולדו להם ${children.length} קטינים.`
          ),
          createBodyParagraph(`מיום ${separationDate} הצדדים חיים בנפרד`),

          // Property
          createSubsectionHeader('הרכוש'),
          ...formatPropertySection(formData),

          // Employment
          createSubsectionHeader('השתכרות הצדדים'),
          ...(formData.job1 || formData.job2
            ? [
                createBodyParagraph(
                  `${basicInfo.fullName} (${formData.jobType || 'עצמאי'}): ${formatJobDetails(formData.job1, plaintiff.title) || 'לא צוין'}`
                ),
                createBodyParagraph(
                  `${basicInfo.fullName2} (${formData.jobType2 || 'עצמאי'}): ${formatJobDetails(formData.job2, defendant.title) || 'לא צוין'}`
                ),
              ]
            : [createBodyParagraph('פרטי תעסוקה לא צוינו')]),

          // Determining Date
          createSubsectionHeader('היום הקובע'),
          createBodyParagraph(`היום הקובע לענייננו הוא מועד הפירוד: ${separationDate}`),

          // ===== REMEDIES =====
          createSectionHeader('סעדים'),
          createBodyParagraph('אשר על כן מתבקש בית המשפט הנכבד:\u200F'),

          // Remedy 1: Balance assets and implement fair division
          createNumberedItem(1, 'לאזן את משאבי הצדדים, וליישם חלוקה הוגנת.'),

          // EDGE CASE: If income disparity is 2x+, add special remedy for unequal division
          ...(() => {
            const incomeDisparity = checkIncomeDisparity(formData, plaintiff, defendant);
            if (incomeDisparity.hasDisparity) {
              const disparityText = `לחלק את הרכוש באופן לא שווה, בהתאם להפרשי ההכנסות בין הצדדים, על מנת ליצור שוויון גם לאחר הפירוד. ${incomeDisparity.lowerEarner} משתכר/ת פחות באופן משמעותי מ${incomeDisparity.higherEarner}, ולכן יש להתחשב בכך בחלוקת הרכוש.`;
              return [createNumberedItem(2, disparityText)];
            }
            return [];
          })(),

          // Remaining remedies: numbers shift by 1 if disparity remedy exists
          ...(() => {
            const incomeDisparity = checkIncomeDisparity(formData, plaintiff, defendant);
            const offset = incomeDisparity.hasDisparity ? 1 : 0; // +1 if disparity remedy exists

            return [
              // Appoint expert
              createNumberedItem(2 + offset, 'למנות מומחה מתאים (לפי צורך) לשם איזון כולל.'),

              // Return funds
              createNumberedItem(
                3 + offset,
                `להורות על השבה ל${plaintiff.title} של כל כספים, אם ייקבע שנמשכו או נלקחו שלא כדין.`
              ),

              // Financial disclosure
              createNumberedItem(
                4 + offset,
                `להורות ל${defendant.title} למסור דו״ח מרוכז בדבר כלל הזכויות הסוציאליות והכספים בבעלות${defendant.possessive}, בכל גוף רלוונטי.`
              ),

              // Document disclosure
              createNumberedItem(5 + offset, 'להורות על גילוי מסמכים.'),

              // Split remedies
              createNumberedItem(
                6 + offset,
                'להתיר פיצול סעדים ביחס לעילות/סעדים שטרם נתבררו או נתגבשו.'
              ),

              // Interim relief
              createNumberedItem(
                7 + offset,
                `לתת כל סעד זמני או קבוע הנדרש לשמירת זכויות ${plaintiff.title} עד להשלמת האיזון.`
              ),

              // Legal fees
              createNumberedItem(8 + offset, 'לחייב בהוצאות ושכ״ט עו״ד בצירוף מע״מ כדין.'),
            ];
          })(),

          // ===== SIGNATURE =====
          new Paragraph({
            text: '',
            alignment: AlignmentType.START,
            spacing: { before: SPACING.SECTION },
            bidirectional: true,
        
          }),
          // Client signature - use image if provided, otherwise placeholder
          ...(signature
            ? [createSignatureImage(signature, 250, 125)]
            : [new Paragraph({
                children: [
                  new TextRun({
                    text: '__________________',
                    size: FONT_SIZES.BODY,
                    font: 'David',
                
                  }),
                ],
                alignment: AlignmentType.START,
                spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
                bidirectional: true,
            
              })]),
          new Paragraph({
            children: [
              new TextRun({
                text: `חתימת ${basicInfo.fullName}`,
                size: FONT_SIZES.BODY,
                font: 'David',
            
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.MINIMAL },
            bidirectional: true,
        
          }),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== הרצאת פרטים (FORM 3 - STATEMENT OF DETAILS) =====
          ...generateStatementOfDetails(basicInfo, formData, signature as string),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== ייפוי כוח (POWER OF ATTORNEY) =====
          ...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== תצהיר (AFFIDAVIT) =====
          ...generateAffidavit(basicInfo, formData, lawyerSignature),

          // ===== נספחים (ATTACHMENTS) - if any =====
          ...(attachments && attachments.length > 0
            ? [
                createPageBreak(),
                ...generateAttachmentsSection(attachments, formData)
              ]
            : []
          ),
        ],
      },
    ],
  });

  // Convert to buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Create a page break paragraph
 */
function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

/**
 * Create signature image paragraph from base64 data or Buffer
 */
function createSignatureImage(imageData: string | Buffer, width: number = 200, height: number = 100): Paragraph {
  let buffer: Buffer;

  // Handle Buffer or base64 string
  if (Buffer.isBuffer(imageData)) {
    buffer = imageData;
  } else {
    // Handle both raw base64 and data URL formats
    let base64Clean = imageData;

    // Remove data:image prefix if present
    if (imageData.startsWith('data:')) {
      const matches = imageData.match(/^data:image\/\w+;base64,(.+)$/);
      if (matches && matches[1]) {
        base64Clean = matches[1];
      }
    }

    // Create buffer from base64
    buffer = Buffer.from(base64Clean, 'base64');
  }

  console.log(`📷 Creating signature image: ${buffer.length} bytes`);

  // Convert to Uint8Array which docx library handles better
  const uint8Array = new Uint8Array(buffer);

  return new Paragraph({
    children: [
      new ImageRun({
        data: uint8Array,
        transformation: {
          width,
          height,
        },
      } as any), // Type assertion for docx 9.x compatibility
    ],
    alignment: AlignmentType.START,
    spacing: { before: SPACING.PARAGRAPH, after: SPACING.MINIMAL },
    bidirectional: true,

  });
}

/**
 * Generate הרצאת פרטים (Form 3 - Statement of Details) paragraphs
 */
function generateStatementOfDetails(
  basicInfo: BasicInfo,
  formData: FormData,
  signature?: string
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);
  const propertyData = formData.property || formData;
  const children = propertyData.children || [];

  // Helper to format yes/no answers - handles both Hebrew and English values
  const yesNo = (value: any) => {
    if (value === 'כן' || value === 'yes' || value === true) return 'כן';
    if (value === 'לא' || value === 'no' || value === false) return 'לא';
    return 'לא צוין';
  };

  // Title
  paragraphs.push(createMainTitle('טופס 3'));
  paragraphs.push(createCenteredTitle('(תקנה 12)', FONT_SIZES.BODY));
  paragraphs.push(createMainTitle('הרצאת פרטים בתובענה בין בני זוג'));
  paragraphs.push(createCenteredTitle('(למעט תביעת מזונות)', FONT_SIZES.BODY));

  // Nature of claim
  paragraphs.push(createBodyParagraph(`מהות התובענה:\u200F רכושית, איזון משאבים`, { after: SPACING.PARAGRAPH }));
  paragraphs.push(createBodyParagraph(`מעמדו של ממלא הטופס:\u200F ${plaintiff.title}`, { after: SPACING.SECTION }));

  // Section 1: Personal Details
  paragraphs.push(createSectionHeader('פרטים אישיים:'));
  paragraphs.push(createSubsectionHeader(`1. ${plaintiff.title}:`));
  paragraphs.push(createInfoLine('שם פרטי ושם משפחה', basicInfo.fullName));
  paragraphs.push(createInfoLine('מספר זהות', basicInfo.idNumber));
  paragraphs.push(createInfoLine('תאריך לידה', basicInfo.birthDate || 'לא צוין'));
  paragraphs.push(createInfoLine('כתובת', basicInfo.address));
  paragraphs.push(createInfoLine('טלפון בבית', basicInfo.phone));
  paragraphs.push(createInfoLine('נייד', basicInfo.phone));

  paragraphs.push(createSubsectionHeader('2. בן/בת הזוג:'));
  paragraphs.push(createInfoLine('שם פרטי ושם משפחה', basicInfo.fullName2));
  paragraphs.push(createInfoLine('מספר זהות', basicInfo.idNumber2));
  paragraphs.push(createInfoLine('תאריך לידה', basicInfo.birthDate2 || 'לא צוין'));
  paragraphs.push(createInfoLine('כתובת', basicInfo.address2));
  paragraphs.push(createInfoLine('טלפון בבית', basicInfo.phone2));
  paragraphs.push(createInfoLine('נייד', basicInfo.phone2));

  // Section 4: Marital Status
  paragraphs.push(createSectionHeader('4. פרטים לגבי המצב האישי:'));
  paragraphs.push(createSubsectionHeader(`${plaintiff.name}:`));
  paragraphs.push(createInfoLine('תאריך הנישואים הנוכחיים', basicInfo.weddingDay || 'לא צוין'));
  paragraphs.push(createInfoLine('נישואין קודמים', yesNo(formData.marriedBefore)));
  paragraphs.push(createInfoLine(`האם ל${plaintiff.name} יש ילדים מנישואים קודמים`, yesNo(formData.hadChildrenFromPrevious)));

  paragraphs.push(createSubsectionHeader(`${defendant.name}:`));
  paragraphs.push(createInfoLine('תאריך הנישואים הנוכחיים', basicInfo.weddingDay || 'לא צוין'));
  paragraphs.push(createInfoLine('נישואין קודמים', yesNo(formData.marriedBefore2)));
  paragraphs.push(createInfoLine(`האם ל${defendant.name} יש ילדים מנישואים קודמים`, yesNo(formData.hadChildrenFromPrevious2)));
  paragraphs.push(createBodyParagraph('(בסעיף זה – נישואין לרבות ברית זוגיות.)', { after: SPACING.PARAGRAPH }));

  // Section 6: Children
  paragraphs.push(createSectionHeader('6. ילדים:'));
  if (children.length > 0) {
    children.forEach((child, index) => {
      paragraphs.push(createSubsectionHeader(`ילד/ה ${index + 1}:`));
      paragraphs.push(createInfoLine('שם מלא', `${child.firstName} ${child.lastName}`));
      paragraphs.push(createInfoLine('מספר זהות', child.idNumber));
      paragraphs.push(createInfoLine('תאריך לידה', child.birthDate));
      paragraphs.push(createInfoLine('כתובת', child.address || 'לא צוין'));
    });
  } else {
    paragraphs.push(createBodyParagraph('אין ילדים'));
  }

  // Section 7: Housing
  paragraphs.push(createSectionHeader('7. פרטים לגבי דירת המגורים:'));
  paragraphs.push(createInfoLine(`הדירה שבה גר/ה ${plaintiff.title} היא`, formData.applicantHomeType ? translateHousingType(formData.applicantHomeType) : 'לא צוין'));
  paragraphs.push(createInfoLine('הדירה שבה גר/ה בן/בת הזוג היא', formData.partnerHomeType ? translateHousingType(formData.partnerHomeType) : 'לא צוין'));

  // Section 8: Domestic Violence
  paragraphs.push(createSectionHeader('8. נתונים על אלימות במשפחה:'));
  paragraphs.push(createBodyParagraph('הוגשה בעבר בקשה לבית המשפט או לבית דין דתי למתן צו הגנה לפי החוק למניעת אלימות במשפחה, התשנ"א-1991:'));
  paragraphs.push(createInfoLine('', yesNo(formData.protectionOrderRequested)));
  if (formData.protectionOrderRequested === 'yes') {
    paragraphs.push(createInfoLine('אם כן – מתי', formData.protectionOrderDate || 'לא צוין'));
    paragraphs.push(createInfoLine('כנגד מי', formData.protectionOrderAgainst || 'לא צוין'));
    paragraphs.push(createInfoLine('מספר התיק', formData.protectionOrderCaseNumber || 'לא צוין'));
    paragraphs.push(createInfoLine('בפני מי נדון התיק', formData.protectionOrderJudge || 'לא צוין'));
    paragraphs.push(createInfoLine('האם ניתן צו הגנה', yesNo(formData.protectionOrderGiven)));
    if (formData.protectionOrderGiven === 'yes') {
      paragraphs.push(createInfoLine('ניתן צו הגנה ביום', formData.protectionOrderGivenDate || 'לא צוין'));
      paragraphs.push(createInfoLine('תוכן הצו', formData.protectionOrderContent || 'לא צוין'));
    }
  }
  paragraphs.push(createBodyParagraph('האם היו בעבר אירועי אלימות שהוגשה בגללם תלונה למשטרה ולא הוגשה בקשה לצו הגנה?'));
  paragraphs.push(createInfoLine('', yesNo(formData.pastViolenceReported)));
  if (formData.pastViolenceReported === 'yes') {
    paragraphs.push(createInfoLine('אם כן – פרט/י', formData.pastViolenceReportedDetails || 'לא צוין'));
  }

  // Section 9: Other Family Cases
  paragraphs.push(createSectionHeader('9. נתונים על תיקים אחרים בענייני המשפחה בין בני הזוג:'));
  paragraphs.push(createBodyParagraph('(פרט לגבי כל תיק בנפרד)'));
  if (formData.otherFamilyCases && Array.isArray(formData.otherFamilyCases) && formData.otherFamilyCases.length > 0) {
    formData.otherFamilyCases.forEach((caseItem: any, index: number) => {
      paragraphs.push(createSubsectionHeader(`תיק ${index + 1}:`));
      paragraphs.push(createInfoLine('מספר תיק', caseItem.caseNumber || 'לא צוין'));
      paragraphs.push(createInfoLine('סוג התיק', caseItem.caseType || 'לא צוין'));
      paragraphs.push(createInfoLine('בית המשפט', caseItem.court || 'לא צוין'));
      paragraphs.push(createInfoLine('סטטוס', caseItem.status || 'לא צוין'));
    });
  } else {
    paragraphs.push(createBodyParagraph('אין תיקים אחרים'));
  }

  // Section 10: Therapeutic Contact
  paragraphs.push(createSectionHeader('10. קשר עם גורמים טיפוליים:'));
  paragraphs.push(createInfoLine('האם היית/ם בקשר עם מחלקת הרווחה?', yesNo(formData.contactedWelfare)));
  paragraphs.push(createInfoLine('האם היית/ם בקשר עם ייעוץ נישואין או ייעוץ זוגי?', yesNo(formData.contactedMarriageCounseling)));
  paragraphs.push(createInfoLine('האם את/ה מוכנ/ה לקחת חלק בייעוץ משפחתי?', yesNo(formData.willingToJoinFamilyCounseling)));
  paragraphs.push(createInfoLine('האם את/ה מוכנ/ה לקחת חלק בגישור?', yesNo(formData.willingToJoinMediation)));

  // Declaration
  paragraphs.push(createSectionHeader('הצהרה'));
  paragraphs.push(createBodyParagraph('אני מצהיר כי לפי מיטב ידיעתי הפרטים שמילאתי בטופס נכונים.'));

  // Date and signature
  const today = new Date().toLocaleDateString('he-IL');
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `תאריך:\u200F ${today}`,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { before: SPACING.SECTION, after: SPACING.PARAGRAPH },
    bidirectional: true,

  }));

  // Client signature
  if (signature) {
    paragraphs.push(createSignatureImage(signature, 250, 125));
  } else {
    // Signature placeholder if no signature provided
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: '__________________',
          size: FONT_SIZES.BODY,
          font: 'David',
      
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
      bidirectional: true,
  
    }));
  }

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: basicInfo.fullName,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.MINIMAL },
    bidirectional: true,

  }));

  return paragraphs;
}

/**
 * Generate ייפוי כוח (Power of Attorney) paragraphs
 */
function generatePowerOfAttorney(
  basicInfo: BasicInfo,
  formData: FormData,
  clientSignature?: string | Buffer,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const today = new Date().toLocaleDateString('he-IL');

  // Title
  paragraphs.push(createMainTitle('יפוי כח'));

  // Opening
  paragraphs.push(createBodyParagraph(
    `אני החתום מטה תז ${basicInfo.idNumber}, ${basicInfo.fullName} ממנה בזאת את עוה"ד אריאל דרור להיות ב"כ בענין הכנת תביעת רכושית, איזון משאבים.`
  ));

  paragraphs.push(createBodyParagraph(
    'מבלי לפגוע בכלליות המינוי הנ"ל יהיו באי כחי רשאים לעשות ולפעול בשמי ובמקומי בכל הפעולות הבאות, כולן או מקצתן הכל בקשר לעניין הנ"ל ולכל הנובע ממנו כדלקמן:'
  ));

  // Numbered powers
  const powers = [
    'לחתום על ולהגיש בשמי כל תביעה או תביעה שכנגד, ו/או כל בקשה, הגנה, התנגדות, בקשה למתן רשות לערער, ערעור, דיון נוסף, הודעה, טענה, השגה, ערר, תובענה או כל הליך אחר הנובע מההליך הנ"ל ללא יוצא מן הכלל. ומבלי לפגוע באמור לעיל גם להודות ו/או לכפור בשמי במשפטים פלילים.',
    'לחתום על ו/או לשלוח התראות נוטריוניות או אחרות, לדרוש הכרזת פשיטת רגל, או פירוק גוף משפטי ולעשות את כל הפעולות הקשורות והנובעות מהעניין הנ"ל.',
    'לבקש ולקבל כל חוות דעת רפואית ו/או כל מסמך רפואי אחר מכל רופא או מוסד שבדק אותי ו/או כל חוות דעת אחרת הנוגעת לענין הנ"ל.',
    'לייצגני ולהופיע בשמי ובמקומי בקשר לכל אחת מהפעולות הנ"ל בפני כל בתי המשפט, בתי הדין למיניהם, רשויות ממשלתיות, עיריות, מועצות מקומיות ו/או כל רשות אחרת, עד לערכאתם העליונה, ככל שהדברים נוגעים או קשורים לעניין הנ"ל.',
    'לנקוט בכל הפעולות הכרוכות בייצוג האמור והמותרות על-פי סדרי הדין הקיימים או שיהיו קיימים בעתיד ובכללם הזמנת עדים ומינוי מומחים, והכל על-פי הדין שיחול וכפי שבא כחי ימצא לנכון.',
    'למסור כל עניין הנובע מהעניין האמור לעיל לבוררות ולחתום על שטר בוררות כפי שבא כחי ימצא לנכון.',
    'להתפשר בכל עניין הנוגע או הנובע מהעניינים האמורים לעיל לפי שקול דעתו של בא כחי ולחתום על פשרה כזו בבית המשפט או מחוצה לו.',
    'להוציא לפועל כל פס"ד או החלטה או צו, לדרוש צווי מכירה או פקודות מאסר ולנקוט בכל הפעולות המותרות על פי חוק ההוצאה לפועל ותקנותיו.',
    'לנקוט בכל הפעולות ולחתום על כל מסמך או כתב בלי יוצא מן הכלל אשר בא כחי ימצא לנכון בכל עניין הנובע ו/או הנוגע לעניין הנ"ל.',
    'לגבות את סכום התביעה או כל סכום אחר בכל עניין מהעניינים הנ"ל לרבות הוצאות בית המשפט ושכר טרחת עו"ד, לקבל בשמי כל מסמך וחפץ ולתת קבלות ושחרורים כפי שבא כוחי ימצא לנכון ולמתאים.',
    'לבקש ולקבל מידע שהנני זכאי לקבלו על פי כל דין מכל מאגר מידע של רשות כלשהי הנוגע לעניין הנ"ל.',
    'להופיע בשמי ולייצגני בעניין הנ"ל בפני רשם המקרקעין, בלשכות רישום המקרקעין, לחתום בשמי ובמקומי על כל בקשה, הצהרה ומסמכים אחרים למיניהם ולבצע בשמי כל עסקה המוכרת על פי דין וליתן הצהרות, קבלות ואישורים ולקבל בשמי ובמקומי כל מסמך שאני רשאי לקבלו על פי דין.',
    'לייצגני ולהופיע בשמי בפני רשם החברות, רשם השותפויות ורשם האגודות השיתופיות, לחתום בשמי ובמקומי על כל בקשה או מסמך אחר בקשר לרשום גוף משפטי, לטפל ברישומו או מחיקתו של כל גוף משפטי ולטפל בכל דבר הנוגע לו ולבצע כל פעולה בקשר לאותו גוף משפטי.',
    'לטפל בשמי בכל הקשור לרישום פטנטים, סימני מסחר וכל זכות אחרת המוכרת בדין.',
    'להעביר יפוי כח זה על כל הסמכויות שבו או חלק מהן לעו"ד אחר עם זכות העברה לאחרים, לפטרם ולמנות אחרים במקומם ולנהל את עניני הנ"ל לפי ראות עיניי ובכלל לעשות את כל הצעדים שימצא לנכון ומועיל בקשר עם המשפט או עם עניני הנ"ל והריני מאשר את מעשיו או מעשי ממלאי המקום בתוקף יפוי כח זה מראש.',
  ];

  powers.forEach((power, index) => {
    paragraphs.push(createNumberedItem(index + 1, power));
  });

  paragraphs.push(createBodyParagraph(
    'הכתוב דלעיל ביחיד יכלול את הרבים ולהפך.',
    { before: SPACING.SECTION }
  ));

  paragraphs.push(createBodyParagraph(
    `ולראיה באתי על החתום, היום ${today}`
  ));

  // Client signature - use image if provided, otherwise placeholder
  if (clientSignature) {
    paragraphs.push(createSignatureImage(clientSignature, 250, 125));
  } else {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: '__________________',
          size: FONT_SIZES.BODY,
          font: 'David',
      
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
      bidirectional: true,
  
    }));
  }

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: basicInfo.fullName,
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.SECTION },
    bidirectional: true,

  }));

  // Lawyer confirmation
  paragraphs.push(createBodyParagraph('אני מאשר את חתימת מרשי'));

  // Lawyer signature - use image if provided, otherwise text
  if (lawyerSignature) {
    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150));
  } else {
    paragraphs.push(createBodyParagraph('אריאל דרור, עו"ד'));
  }

  return paragraphs;
}

/**
 * Generate תצהיר (Affidavit) paragraphs
 */
function generateAffidavit(
  basicInfo: BasicInfo,
  formData: FormData,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(createMainTitle('תצהיר בהיוועדות חזותית בישראל'));

  paragraphs.push(createBodyParagraph(
    'אני הח"מ אריאל דרור ת.ז 024081028, לאחר שהוזהרתי כי עלי לומר את האמת וכי אהיה צפוי לעונשים הקבועים בחוק, אם לא אעשה כן, מצהיר בזאת כדלקמן:',
    { after: SPACING.SECTION }
  ));

  paragraphs.push(createNumberedItem(1, 'אני נמצא בתחומי מדינת ישראל.'));
  paragraphs.push(createNumberedItem(2, 'תצהיר זה ניתן בתמיכה לכתב התביעה.'));
  paragraphs.push(createNumberedItem(3, 'הריני מצהיר כי כל האמור בבקשה – אמת.'));
  paragraphs.push(createNumberedItem(4, 'זהו שמי, זו חתימתי ותוכן תצהירי אמת.'));

  // Signature line
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: '__________________',
        size: FONT_SIZES.BODY,
        font: 'David',
    
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { before: SPACING.SECTION, after: SPACING.SECTION },
    bidirectional: true,

  }));

  // Lawyer confirmation section
  paragraphs.push(createBodyParagraph(
    `הריני לאשר כי ${basicInfo.fullName}, הינו לקוח קבוע במשרדי ומוכר לי באופן אישי.`
  ));

  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const gender = basicInfo.gender === 'male' ? 'מר' : 'גב\'';

  paragraphs.push(createBodyParagraph(
    `ביום ${dateStr} בשעה ${timeStr} הופיע בפני, ${gender} ${basicInfo.fullName} ולאחר שהזהרתיו כי עליו לומר את האמת וכי יהיה צפוי לעונשים הקבועים בחוק אם לא יעשה כן, אשר את האמור בתצהיר הנ"ל וחתם עליו.`
  ));

  paragraphs.push(createBodyParagraph(
    'תצהירו וחתימתו כאמור הוצגו לי במהלך היוועדות חזותית והתצהיר נחתם מולי.'
  ));

  paragraphs.push(createBodyParagraph(
    'ההופעה לפניי, בוצעה באמצעות היוועדות חזותית אשר מתועדת אצלי, כאשר המצהיר הופיע בפני על גבי הצג, עת הצהרתו מושא האימות לפניו, והוא מצהיר בפניי, כי הוא מצוי במדינת ישראל בזמן החתימה והאימות, והוא מסכים לתיעוד החזותי ועשיית השימוש בו.'
  ));

  // Lawyer signature - use image if provided, otherwise text
  if (lawyerSignature) {
    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150));
  } else {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: '__________________',
          size: FONT_SIZES.BODY,
          font: 'David',
      
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
      bidirectional: true,
  
    }));
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: 'אריאל דרור, עו"ד',
          size: FONT_SIZES.BODY,
          font: 'David',
      
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.MINIMAL },
      bidirectional: true,
  
    }));
  }

  return paragraphs;
}

/**
 * Generate Hebrew letter label for attachments (א, ב, ג, ד...)
 */
function getHebrewLabel(index: number): string {
  const hebrewLetters = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
    'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
    'ש', 'ת'
  ];

  if (index < hebrewLetters.length) {
    return hebrewLetters[index];
  }

  // For more than 22 attachments, use numbers
  return `${index + 1}`;
}

/**
 * Estimate page count for different document sections
 * More accurate than fixed estimates
 */
function estimatePageCount(formData: any): {
  mainClaim: number;
  form3: number;
  powerOfAttorney: number;
  affidavit: number;
  tocPage: number;
} {
  // Main claim: depends on property count
  const propertyData = formData.property || formData;
  const propertyCount =
    (propertyData.apartments?.length || 0) +
    (propertyData.vehicles?.length || 0) +
    (propertyData.savings?.length || 0) +
    (propertyData.benefits?.length || 0) +
    (propertyData.properties?.length || 0) +
    (propertyData.debts?.length || 0);

  const mainClaim = 2 + Math.ceil(propertyCount / 8); // ~8 properties per page

  // Form 3: depends on children count and other details
  const childrenCount = propertyData.children?.length || 0;
  const form3 = 2 + Math.ceil(childrenCount / 3); // ~3 children per page

  // Power of Attorney: relatively fixed (15 powers)
  const powerOfAttorney = 2;

  // Affidavit: fixed (1 page)
  const affidavit = 1;

  // Calculate TOC page number (sum of all previous pages)
  const tocPage = mainClaim + form3 + powerOfAttorney + affidavit;

  return { mainClaim, form3, powerOfAttorney, affidavit, tocPage };
}

/**
 * Generate נספחים (Attachments) section with manual table of contents
 * Manual TOC works in both Microsoft Word AND Google Docs
 */
function generateAttachmentsSection(
  attachments: Array<{ label: string; description: string; images: Buffer[] }>,
  formData: any
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (!attachments || attachments.length === 0) {
    return paragraphs;
  }

  // Title page
  paragraphs.push(createMainTitle('נספחים'));
  paragraphs.push(createBodyParagraph('', { after: SPACING.SECTION }));

  // Manual Table of Contents with improved page estimation
  paragraphs.push(createSectionHeader('תוכן עניינים'));

  // Calculate page estimates based on actual document content
  const pageEstimates = estimatePageCount(formData);
  // First attachment starts after TOC. Add 2: one for the נספחים title page, one for the TOC itself
  let currentPage = pageEstimates.tocPage + 2;

  // Create TOC entries
  attachments.forEach((attachment, index) => {
    const hebrewLabel = getHebrewLabel(index);
    const label = `נספח ${hebrewLabel}`;

    // Create TOC entry with leader dots
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: `${label} - ${attachment.description}`,
          size: FONT_SIZES.BODY,
          font: 'David',
      
        }),
        new TextRun({
          text: ' '.repeat(5) + '....... ',
          size: FONT_SIZES.BODY,
          font: 'David',
        }),
        new TextRun({
          text: `${currentPage}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          bold: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      bidirectional: true,
  
    }));

    // Each attachment gets pages based on image count (1 image per page approximately)
    currentPage += Math.max(1, attachment.images.length);
  });

  paragraphs.push(createBodyParagraph('', { after: SPACING.SECTION }));

  // Page break after table of contents
  paragraphs.push(createPageBreak());

  // Add each attachment
  attachments.forEach((attachment, index) => {
    const hebrewLabel = getHebrewLabel(index);
    const label = `נספח ${hebrewLabel}`;

    // Attachment title
    paragraphs.push(createSectionHeader(`${label} - ${attachment.description}`));

    // Add each page of the attachment as an image
    attachment.images.forEach((imageBuffer) => {
      // Convert to Uint8Array which docx library handles better
      const uint8Array = new Uint8Array(imageBuffer);

      paragraphs.push(new Paragraph({
        children: [
          new ImageRun({
            data: uint8Array,
            transformation: {
              width: 550, // A4 width in points minus margins
              height: 750, // Maintain aspect ratio for typical document
            },
          } as any), // Type assertion for docx 9.x compatibility
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: SPACING.PARAGRAPH, after: SPACING.PARAGRAPH },
      }));
    });

    // Page break after each attachment (except the last one)
    if (index < attachments.length - 1) {
      paragraphs.push(createPageBreak());
    }
  });

  return paragraphs;
}

/**
 * Shared Document Generators
 * Common functions used across all claim types (Property, Custody, Alimony)
 *
 * Extracted from alimony-claim-generator.ts (most updated versions with LEFT-aligned signatures)
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
  PageBreak,
  PageNumber,
  NumberFormat,
  Header,
  Footer,
  ImageRun,
  Packer,
  TableLayoutType,
} from 'docx';
import { BasicInfo, FormData } from '../types';

// ==================== CONSTANTS ====================

// Font sizes (in half-points)
export const FONT_SIZES = {
  MAIN_TITLE: 40, // 20pt - for כתב תביעה
  SECTION: 32, // 16pt - for major sections
  TITLE: 32, // 16pt - for court name
  SUBSECTION: 28, // 14pt - for subsection headers
  HEADING_2: 26, // 13pt - for numbered items
  BODY: 24, // 12pt - default body text
  SMALL: 22, // 11pt - small text
};

// Spacing (in twips: 1/20 of a point)
export const SPACING = {
  SECTION: 600, // Large gap between sections
  SUBSECTION: 400, // Medium gap between subsections
  PARAGRAPH: 240, // Standard paragraph spacing
  LINE: 120, // Small gap between lines
  MINIMAL: 60, // Minimal spacing
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format currency in Hebrew locale
 */
export function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

/**
 * Format date in Hebrew (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format child information in a natural, human-readable way
 * Example: "משה חיים (ת.ז 123456789, יליד 01/01/2010)"
 */
export function formatChildNaturally(child: any): string {
  const name = child.name || '';
  const idNumber = child.idNumber || '';
  const birthDate = child.birthDate ? formatDate(child.birthDate) : '';

  return `${name} (ת.ז ${idNumber}, יליד ${birthDate})`;
}

/**
 * Generate Hebrew letter label for attachments (א, ב, ג, ד...)
 */
export function getHebrewLabel(index: number): string {
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
 * Check if a child is a minor (under 18 years old)
 */
export function isMinor(birthDate: string): boolean {
  if (!birthDate) return true; // If no birthdate, assume minor

  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return (age - 1) < 18;
  }

  return age < 18;
}

/**
 * Filter children from THIS relationship (nameOfParent matches respondent or applicant)
 * Used to distinguish children from current relationship vs. children from previous marriages
 */
export function filterSharedChildren(children: Array<any>, basicInfo: BasicInfo): Array<any> {
  return children.filter((child: any) => {
    // If no nameOfParent specified, assume it's a shared child
    if (!child.nameOfParent) return true;

    // Check if nameOfParent matches either the applicant or respondent
    // (shared children have the other parent as the respondent/applicant)
    return (
      child.nameOfParent === basicInfo.fullName ||
      child.nameOfParent === basicInfo.fullName2
    );
  });
}

/**
 * Filter children from PREVIOUS marriages (nameOfParent doesn't match respondent)
 * Returns children where the other parent is NOT the current respondent
 */
export function filterPreviousChildren(children: Array<any>, basicInfo: BasicInfo): Array<any> {
  return children.filter((child: any) => {
    // If no nameOfParent, it's assumed to be a shared child
    if (!child.nameOfParent) return false;

    // Check if nameOfParent is someone OTHER than the applicant/respondent
    return (
      child.nameOfParent !== basicInfo.fullName &&
      child.nameOfParent !== basicInfo.fullName2
    );
  });
}

/**
 * Create relationship section (מערכת היחסים)
 * Standardized format across all three claim types
 * Based on alimony implementation (most natural and complete)
 *
 * Format:
 * "המדובר בזוג נשוי, להם נולדו 3 ילדים: [children list]. כיום הצדדים גרים בנפרד מיום [date], כאשר הילדים מתגוררים עם [name]."
 */
export function createRelationshipSection(
  basicInfo: BasicInfo,
  formData: FormData,
  children: Array<any>
): Paragraph {
  const propertyData = formData.property || {};
  const marriageDate = propertyData.marriageDate ? formatDate(propertyData.marriageDate) : '';

  // Filter children by parent
  const sharedChildren = filterSharedChildren(children, basicInfo);
  const previousChildren = filterPreviousChildren(children, basicInfo);

  // Determine marital status for natural wording
  const maritalStatus = marriageDate ? 'נשוי' : 'לא נשואי';

  // Build continuous flowing narrative - use SHARED children only
  const sharedChildrenNames = sharedChildren.map(child => formatChildNaturally(child)).join(', ');

  // Opening paragraph - couple, SHARED children, and living arrangement in one flow
  let relationshipText = '';

  if (sharedChildren.length > 0) {
    relationshipText = marriageDate
      ? `המדובר בזוג נשוי, להם נולדו ${sharedChildren.length === 1 ? 'ילד' : `${sharedChildren.length} ילדים`}: ${sharedChildrenNames}. `
      : `המדובר בזוג לא נשואי, להם נולדו ${sharedChildren.length === 1 ? 'ילד' : `${sharedChildren.length} ילדים`}: ${sharedChildrenNames}. `;
  } else {
    relationshipText = marriageDate
      ? `המדובר בזוג נשוי. `
      : `המדובר בזוג לא נשואי. `;
  }

  // Add separation info
  if (propertyData.separationDate) {
    relationshipText += `כיום הצדדים גרים בנפרד מיום ${formatDate(propertyData.separationDate)}`;
  } else {
    relationshipText += `כיום הצדדים גרים בנפרד`;
  }

  // Add SHARED children living arrangement in same paragraph
  if (sharedChildren.length > 0) {
    // Use custody.currentLivingArrangement if available, otherwise skip living arrangement details
    const livingArrangement = formData.custody?.currentLivingArrangement;

    if (livingArrangement === 'with_applicant') {
      relationshipText += `, כאשר הילדים מתגוררים עם ${basicInfo.fullName}.`;
    } else if (livingArrangement === 'with_respondent') {
      relationshipText += `, כאשר הילדים מתגוררים עם ${basicInfo.fullName2}.`;
    } else if (livingArrangement === 'split') {
      relationshipText += `, כאשר המגורים חלוקים בין ההורים.`;
    } else if (livingArrangement === 'together') {
      relationshipText += `, כאשר כל המשפחה מתגוררת יחד.`;
    } else {
      // No custody data available - just end the sentence
      relationshipText += '.';
    }
  } else {
    relationshipText += '.';
  }

  // Add previous children if any
  if (previousChildren.length > 0) {
    const previousChildrenNames = previousChildren.map(child => formatChildNaturally(child)).join(', ');
    const gender = basicInfo.gender === 'female' ? 'למבקשת' : 'למבקש';
    relationshipText += ` בנוסף, ${gender} ${previousChildren.length === 1 ? 'ילד' : 'ילדים'} מנישואין קודמים: ${previousChildrenNames}.`;
  }

  return new Paragraph({
    children: [
      new TextRun({
        text: relationshipText,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.SUBSECTION },
    bidirectional: true,
  });
}

// ==================== PARAGRAPH CREATORS ====================

/**
 * Create section header (16pt, bold, underlined) - for major sections
 */
export function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.SECTION, // 16pt
        underline: { type: UnderlineType.SINGLE },
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START, // START = right in RTL
    spacing: { before: SPACING.SECTION, after: SPACING.SUBSECTION },
    bidirectional: true,
  });
}

/**
 * Create subsection header (14pt, bold, underlined)
 */
export function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.SUBSECTION, // 14pt
        underline: { type: UnderlineType.SINGLE },
        font: 'David',
        rightToLeft: true,
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
export function createNumberedHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.HEADING_2,
        underline: { type: UnderlineType.SINGLE },
        font: 'David',
        rightToLeft: true,
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
export function createBodyParagraph(
  text: string,
  spacing: { before?: number; after?: number } = {}
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
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
export function createBulletPoint(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `• ${text}`,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
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
export function createNumberedItem(number: number, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${number}. ${text}`,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
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
export function createCenteredTitle(text: string, size: number): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size,
        font: 'David',
        rightToLeft: true,
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
export function createMainTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: FONT_SIZES.MAIN_TITLE,
        font: 'David',
        rightToLeft: true,
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
export function createInfoLine(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}:\u200F `, // RLM after colon
        bold: true,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
      }),
      new TextRun({
        text: value,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.MINIMAL },
    bidirectional: true,
  });
}

/**
 * Create a page break paragraph
 */
export function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

/**
 * Create signature image paragraph from base64 data or Buffer
 *
 * @param imageData - Base64 string or Buffer
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param alignment - Paragraph alignment (default: AlignmentType.LEFT for physical left)
 */
export function createSignatureImage(
  imageData: string | Buffer,
  width: number = 200,
  height: number = 100,
  alignment: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT
): Paragraph {
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
    alignment, // Use provided alignment (default: LEFT)
    spacing: { before: SPACING.PARAGRAPH, after: SPACING.MINIMAL },
    // NO bidirectional - keep as LTR for physical LEFT alignment
  });
}

// ==================== COURT HEADER ====================

/**
 * Create court header section WITH PARTY INFORMATION
 *
 * @param options Configuration for court header
 * @param options.city City name (e.g., "תל אביב", "פתח תקווה")
 * @param options.judgeName Judge's name (e.g., "מירב אליהו")
 * @param options.basicInfo User's basic information
 * @param options.children Array of children with name and idNumber
 * @param options.showChildrenList Whether to show inline children list
 */
export function createCourtHeader(options: {
  city: string;
  judgeName: string;
  basicInfo: BasicInfo;
  children?: Array<{ name: string; idNumber: string }>;
  showChildrenList?: boolean;
}): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Date - TOP RIGHT
  paragraphs.push(createBodyParagraph('תאריך חתימת המסמך: ___________'));

  // Court name - TOP RIGHT (regular body size, not bold)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'בבית המשפט לענייני משפחה',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START, // START = right in RTL
      spacing: { after: SPACING.LINE },
      bidirectional: true,
    })
  );

  // City on RIGHT + Judge on LEFT (using non-breaking spaces)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${options.city}${'\u00A0'.repeat(70)}בפני כב' השו' ${options.judgeName}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.PARAGRAPH / 2 },
      bidirectional: true,
    })
  );

  // Optional children list (inline, comma-separated)
  if (options.showChildrenList && options.children && options.children.length > 0) {
    const childrenList = options.children
      .map((child) => `${child.name} ת"ז ${child.idNumber}`)
      .join(', ');

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'בעניין הקטינים:\u200F ',
            bold: true,
            size: FONT_SIZES.BODY,
            font: 'David',
            rightToLeft: true,
          }),
          new TextRun({
            text: childrenList,
            size: FONT_SIZES.BODY,
            font: 'David',
            rightToLeft: true,
          }),
        ],
        alignment: AlignmentType.START,
        spacing: { after: SPACING.LINE },
        bidirectional: true,
      })
    );

    paragraphs.push(createBodyParagraph('(להלן: "הילדים")', { after: SPACING.PARAGRAPH }));
  }

  // ===== PLAINTIFF INFORMATION =====
  const plaintiffGenderLabel = options.basicInfo.gender === 'female'
    ? '(להלן: "האשה/ האם")'
    : '(להלן: "האיש/ האב")';

  const plaintiffTerm = options.basicInfo.gender === 'female' ? 'התובעת' : 'התובע';

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${plaintiffTerm}:\u200F `,
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
        new TextRun({
          text: `${options.basicInfo.fullName} מ"ז ${options.basicInfo.idNumber}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `מרח' ${options.basicInfo.address}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'באמצעות ב"כ עוה"ד אריאל דרור מ"ר 31892',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "מרח' אבא הלל 15, רמת גן",
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'טל: 03-6951408 פקס: 03-6951683',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'דוא"ל: arieldrorlaw@gmail.com',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(createBodyParagraph(plaintiffGenderLabel, { after: SPACING.PARAGRAPH }));

  // ===== "נגד" CENTERED =====
  paragraphs.push(createCenteredTitle('נגד', FONT_SIZES.BODY));

  // ===== DEFENDANT INFORMATION =====
  const defendantGenderLabel = options.basicInfo.gender2 === 'female'
    ? '(להלן: "האשה/ האם")'
    : '(להלן: "האיש/ האב")';

  const defendantTerm = options.basicInfo.gender2 === 'female' ? 'הנתבעת' : 'הנתבע';

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${defendantTerm}:\u200F `,
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
        new TextRun({
          text: `${options.basicInfo.fullName2} מ"ז ${options.basicInfo.idNumber2}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `מרח' ${options.basicInfo.address2}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `טל: ${options.basicInfo.phone2}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    })
  );

  paragraphs.push(createBodyParagraph(defendantGenderLabel, { after: SPACING.SUBSECTION }));

  return paragraphs;
}

// ==================== POWER OF ATTORNEY ====================

/**
 * Generate ייפוי כוח (Power of Attorney) paragraphs
 *
 * @param basicInfo User's basic information
 * @param formData Form data (not used currently)
 * @param clientSignature Client signature (base64 or Buffer)
 * @param lawyerSignature Lawyer signature with stamp (base64 or Buffer)
 * @param claimType Type of claim for customizing opening text
 */
export function generatePowerOfAttorney(
  basicInfo: BasicInfo,
  formData: FormData,
  clientSignature?: string | Buffer,
  lawyerSignature?: string | Buffer,
  claimType: 'רכושית' | 'משמורת' | 'מזונות' = 'מזונות'
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const today = new Date().toLocaleDateString('he-IL');

  // Customize opening based on claim type
  const claimTypeText =
    claimType === 'רכושית'
      ? 'תביעת רכושית, איזון משאבים'
      : claimType === 'משמורת'
      ? 'תביעת משמורת'
      : 'תביעת מזונות';

  // Title
  paragraphs.push(createMainTitle('יפוי כח'));

  // Opening
  paragraphs.push(
    createBodyParagraph(
      `אני החתום מטה תז ${basicInfo.idNumber}, ${basicInfo.fullName} ממנה בזאת את עוה"ד אריאל דרור להיות ב"כ בענין הכנת ${claimTypeText}.`
    )
  );

  paragraphs.push(
    createBodyParagraph(
      'מבלי לפגוע בכלליות המינוי הנ"ל יהיו באי כחי רשאים לעשות ולפעול בשמי ובמקומי בכל הפעולות הבאות, כולן או מקצתן הכל בקשר לעניין הנ"ל ולכל הנובע ממנו כדלקמן:'
    )
  );

  // Numbered powers (15 items - IDENTICAL across all claim types)
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

  paragraphs.push(
    createBodyParagraph('הכתוב דלעיל ביחיד יכלול את הרבים ולהפך.', { before: SPACING.SECTION })
  );

  paragraphs.push(createBodyParagraph(`ולראיה באתי על החתום, היום ${today}`));

  // Client signature - LEFT ALIGNED per lawyer request
  if (clientSignature) {
    paragraphs.push(createSignatureImage(clientSignature, 250, 125)); // Uses LEFT alignment
  } else {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '__________________',
            size: FONT_SIZES.BODY,
            font: 'David',
            // No rightToLeft - keep as LTR
          }),
        ],
        alignment: AlignmentType.LEFT, // Physical LEFT
        spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
        // NO bidirectional - keep as LTR for physical LEFT alignment
      })
    );
  }

  // Client name - LEFT ALIGNED
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: basicInfo.fullName,
          size: FONT_SIZES.BODY,
          font: 'David',
          // No rightToLeft - keep as LTR
        }),
      ],
      alignment: AlignmentType.LEFT, // Physical LEFT
      spacing: { after: SPACING.SECTION },
      // NO bidirectional - keep as LTR for physical LEFT alignment
    })
  );

  // Lawyer confirmation - LEFT ALIGNED
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'אני מאשר את חתימת מרשי',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.LEFT, // Physical LEFT
      spacing: { after: SPACING.LINE },
      // NO bidirectional - keep as LTR for physical LEFT alignment
    })
  );

  // Lawyer signature - LEFT ALIGNED per lawyer request
  if (lawyerSignature) {
    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150)); // Uses LEFT alignment
  } else {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'אריאל דרור, עו"ד',
            size: FONT_SIZES.BODY,
            font: 'David',
            // No rightToLeft - keep as LTR
          }),
        ],
        alignment: AlignmentType.LEFT, // Physical LEFT
        spacing: { after: SPACING.MINIMAL },
        // NO bidirectional - keep as LTR for physical LEFT alignment
      })
    );
  }

  return paragraphs;
}

/**
 * Generate תצהיר בהיוועדות חזותית בישראל (Affidavit with Visual Meeting in Israel)
 * Used in all claim types
 */
export function generateAffidavit(
  basicInfo: BasicInfo,
  formData: FormData,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(createMainTitle('תצהיר בהיוועדות חזותית בישראל'));

  paragraphs.push(
    createBodyParagraph(
      'אני הח"מ אריאל דרור ת.ז 024081028, לאחר שהוזהרתי כי עלי לומר את האמת וכי אהיה צפוי לעונשים הקבועים בחוק, אם לא אעשה כן, מצהיר בזאת כדלקמן:',
      { after: SPACING.SECTION }
    )
  );

  paragraphs.push(createNumberedItem(1, 'אני נמצא בתחומי מדינת ישראל.'));
  paragraphs.push(createNumberedItem(2, 'תצהיר זה ניתן בתמיכה לכתב התביעה.'));
  paragraphs.push(createNumberedItem(3, 'הריני מצהיר כי כל האמור בבקשה – אמת.'));
  paragraphs.push(createNumberedItem(4, 'זהו שמי, זו חתימתי ותוכן תצהירי אמת.'));

  // Signature line (placeholder for lawyer signature)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '__________________',
          size: FONT_SIZES.BODY,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.LEFT, // Physical LEFT
      spacing: { before: SPACING.SECTION, after: SPACING.SECTION },
      // NO bidirectional - keep as LTR for physical LEFT alignment
    })
  );

  // Lawyer confirmation section
  paragraphs.push(
    createBodyParagraph(
      `הריני לאשר כי ${basicInfo.fullName}, הינו לקוח קבוע במשרדי ומוכר לי באופן אישי.`
    )
  );

  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const gender = basicInfo.gender === 'male' ? 'מר' : "גב'";

  paragraphs.push(
    createBodyParagraph(
      `ביום ${dateStr} בשעה ${timeStr} הופיע בפני, ${gender} ${basicInfo.fullName} ולאחר שהזהרתיו כי עליו לומר את האמת וכי יהיה צפוי לעונשים הקבועים בחוק אם לא יעשה כן, אשר את האמור בתצהיר הנ"ל וחתם עליו.`
    )
  );

  paragraphs.push(
    createBodyParagraph(
      'תצהירו וחתימתו כאמור הוצגו לי במהלך היוועדות חזותית והתצהיר נחתם מולי.'
    )
  );

  paragraphs.push(
    createBodyParagraph(
      'ההופעה לפניי, בוצעה באמצעות היוועדות חזותית אשר מתועדת אצלי, כאשר המצהיר הופיע בפני על גבי הצג, עת הצהרתו מושא האימות לפניו, והוא מצהיר בפניי, כי הוא מצוי במדינת ישראל בזמן החתימה והאימות, והוא מסכים לתיעוד החזותי ועשיית השימוש בו.'
    )
  );

  // Lawyer signature - LEFT ALIGNED per lawyer request
  if (lawyerSignature) {
    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150)); // Default: AlignmentType.LEFT
  } else {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '__________________',
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.LEFT, // Physical LEFT
        spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
        // NO bidirectional - keep as LTR for physical LEFT alignment
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'אריאל דרור, עו"ד',
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.LEFT, // Physical LEFT
        spacing: { after: SPACING.MINIMAL },
        // NO bidirectional - keep as LTR for physical LEFT alignment
      })
    );
  }

  return paragraphs;
}

/**
 * Generate נספחים (Attachments) section with automatic table of contents and page ranges
 * @param attachments Array of attachments with labels, descriptions, and images
 * @param tocPage The page number where the table of contents starts (last page before attachments)
 */
export function generateAttachmentsSection(
  attachments: Array<{ label: string; description: string; images: Buffer[] }>,
  tocPage: number
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (!attachments || attachments.length === 0) {
    return paragraphs;
  }

  // Title page
  paragraphs.push(createMainTitle('נספחים'));
  paragraphs.push(createBodyParagraph('', { after: SPACING.SECTION }));

  // Table of Contents with page ranges
  paragraphs.push(createSubsectionHeader('תוכן עניינים'));

  // First attachment starts after TOC. Add 3: +1 for נספחים title, +1 for TOC page, +1 to start first attachment
  let currentPage = tocPage + 3;

  // Create TOC entries with page ranges
  attachments.forEach((attachment, index) => {
    const hebrewLabel = getHebrewLabel(index);
    const label = `נספח ${hebrewLabel}`;
    const imageCount = attachment.images.length;
    const endPage = currentPage + imageCount - 1;

    // Page range format: "עמודים 7-8" or "עמוד 7" for single page
    const pageRange =
      imageCount === 1 ? `עמוד ${currentPage}` : `עמודים ${currentPage}-${endPage}`;

    // Create TOC entry with leader dots
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${label} - ${attachment.description}`,
            size: FONT_SIZES.BODY,
            font: 'David',
            rightToLeft: true,
          }),
          new TextRun({
            text: ' '.repeat(5) + '....... ',
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
          new TextRun({
            text: pageRange,
            size: FONT_SIZES.BODY,
            font: 'David',
            bold: true,
            rightToLeft: true,
          }),
        ],
        alignment: AlignmentType.START,
        spacing: { after: SPACING.LINE },
        bidirectional: true,
      })
    );

    // Each attachment gets pages based on image count (1 image per page)
    currentPage += imageCount;
  });

  paragraphs.push(createBodyParagraph('', { after: SPACING.SECTION }));

  // Page break after table of contents
  paragraphs.push(createPageBreak());

  // Add each attachment
  attachments.forEach((attachment, index) => {
    const hebrewLabel = getHebrewLabel(index);
    const label = `נספח ${hebrewLabel}`;

    // Attachment title
    paragraphs.push(createSubsectionHeader(`${label} - ${attachment.description}`));

    // Add each page of the attachment as an image
    attachment.images.forEach((imageBuffer) => {
      // Convert to Uint8Array which docx library handles better
      const uint8Array = new Uint8Array(imageBuffer);

      paragraphs.push(
        new Paragraph({
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
        })
      );
    });

    // Page break after each attachment (except the last one)
    if (index < attachments.length - 1) {
      paragraphs.push(createPageBreak());
    }
  });

  return paragraphs;
}

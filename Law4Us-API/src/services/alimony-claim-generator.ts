/**
 * Alimony Claim Generator (מזונות)
 * Generates comprehensive alimony claim documents with Form 4 images
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
import { transformWithGroq } from './groq-service';
import { mapFormDataToForm4Data } from './form4-filler';
import { fillForm4WithTextOverlay } from './form4-text-overlay';
import { BasicInfo, FormData } from '../types';

interface AlimonyClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer;
  lawyerSignature?: string | Buffer;
}

// Font sizes (in half-points) - matches property and custody generators
const FONT_SIZES = {
  MAIN_TITLE: 40, // 20pt - for כתב תביעה
  SECTION: 32, // 16pt - for major sections
  TITLE: 32, // 16pt - for court name
  SUBSECTION: 28, // 14pt - for subsection headers
  HEADING_2: 26, // 13pt - for numbered items
  BODY: 24, // 12pt - default body text
  SMALL: 22, // 11pt - small text
};

// Spacing (in twips: 1/20 of a point) - matches property and custody generators
const SPACING = {
  SECTION: 600, // Large gap between sections
  SUBSECTION: 400, // Medium gap between subsections
  PARAGRAPH: 240, // Standard paragraph spacing
  LINE: 120, // Small gap between lines
  MINIMAL: 60, // Minimal spacing
};

/**
 * Format currency in Hebrew locale
 */
function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`;
}

/**
 * Format date in Hebrew (DD/MM/YYYY)
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Create section header (16pt, bold, underlined) - for major sections
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
function createSubsectionHeader(text: string): Paragraph {
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
function createNumberedHeader(text: string): Paragraph {
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
function createBulletPoint(text: string): Paragraph {
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
function createNumberedItem(number: number, text: string): Paragraph {
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
function createCenteredTitle(text: string, size: number): Paragraph {
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
function createMainTitle(text: string): Paragraph {
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
function createInfoLine(label: string, value: string): Paragraph {
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
 * Create court header section
 */
function createCourtHeader(data: AlimonyClaimData): Paragraph[] {
  const children = data.formData.property?.children || [];
  const minorChildren = children.filter((child) => {
    if (!child.birthDate) return false;
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  });

  const childrenList = minorChildren
    .map((child) => `${child.name} ת"ז ${child.idNumber}`)
    .join(', ');

  return [
    createBodyParagraph('תאריך חתימת המסמך: ___________', { after: SPACING.PARAGRAPH }),
    createCenteredTitle('בבית המשפט לענייני משפחה', FONT_SIZES.TITLE),
    createCenteredTitle('בפתח תקווה', FONT_SIZES.BODY),
    createBodyParagraph("בפני כב' השו' מירב אליהו", { after: SPACING.PARAGRAPH }),
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
    }),
    createBodyParagraph('(להלן: "הילדים")', { after: SPACING.PARAGRAPH }),
  ];
}

/**
 * Create party information section
 */
function createPartyInfo(data: AlimonyClaimData): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'התובעת:\u200F ',
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
        new TextRun({
          text: `${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      bidirectional: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `מרח' ${data.basicInfo.address}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    }),
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
    }),
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
    }),
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
    }),
    createBodyParagraph('(להלן: "האשה/ האם")', { after: SPACING.PARAGRAPH }),
    createCenteredTitle('נגד', FONT_SIZES.BODY),
    new Paragraph({
      children: [
        new TextRun({
          text: 'הנתבע:\u200F ',
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
        new TextRun({
          text: `${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      bidirectional: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `מרח' ${data.basicInfo.address2}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `טל: ${data.basicInfo.phone2}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.LINE },
      indent: { right: convertInchesToTwip(0.5) },
      bidirectional: true,
    }),
    createBodyParagraph('(להלן: "האיש/ הנתבע")', { after: SPACING.SUBSECTION }),
  ];
}

/**
 * Create claim title and fee information
 */
function createClaimTitle(): Paragraph[] {
  return [
    createMainTitle('כתב תביעה'),
    createBodyParagraph(
      'התובעת מתכבדת להגיש לכבוד בית המשפט את כתב התביעה בעניין מזונות הקטינים.',
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      'סכום אגרת בית משפט: 361 ₪ לפי סעיף 6ב לתוספת הראשונה לתקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.',
      { after: SPACING.SUBSECTION }
    ),
  ];
}

/**
 * Create summons section (הזמנה לדין)
 */
function createSummons(): Paragraph[] {
  return [
    createSubsectionHeader('הליכים נוספים:'),
    new Paragraph({
      children: [
        new TextRun({
          text: 'הזמנה לדין:',
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.PARAGRAPH },
      indent: { right: convertInchesToTwip(0.25) },
      bidirectional: true,
    }),
    createBodyParagraph(
      'הואיל והתובעת הגישה נגדך תביעה למזונות כמפורט בכתב התביעה המצורף בזה על נספחיו.',
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      'אם יש בדעתך להתגונן, אתה מוזמן להגיש כתב הגנה לתובענה, יחד עם הרצאת פרטים לפי טופס 4 שבתוספת הראשונה לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.',
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      'כתב ההגנה על נספחיו, יאומת בתצהיר שלך ויוגש לבית המשפט תוך 30 ימים מהיום שהומצאה לך הזמנה זו, לפי תקנה 13(א) לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.',
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      'אם לא תעשה כן, תהיה לתובעת הזכות לקבל פסק דין שלא בפניך, לפי תקנה 130 לתקנות סדר הדין האזרחי, התשע"ט-2018.',
      { after: SPACING.SUBSECTION }
    ),
  ];
}

/**
 * Create Part B - Summary of claim (חלק ב – תמצית התביעה)
 */
function createPartB(data: AlimonyClaimData): Paragraph[] {
  const children = data.formData.property?.children || [];
  const minorChildren = children.filter((child) => {
    if (!child.birthDate) return false;
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  });

  const marriageDate = data.formData.property?.marriageDate
    ? formatDate(data.formData.property.marriageDate)
    : '';

  return [
    createSectionHeader('חלק ב – תמצית התביעה'),

    // 1. Brief description of parties - SIMPLE, NO LLM
    createNumberedHeader('1. תיאור תמציתי של בעלי הדין'),
    createBodyParagraph(
      `${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2} נישאו ביום ${marriageDate}, במהלך הנישואין נולדו להם ${minorChildren.length} קטינים.`,
      { after: SPACING.PARAGRAPH }
    ),
    ...minorChildren.map((child) =>
      createBulletPoint(
        `שם: ${child.name} ת"ז: ${child.idNumber} ת"ל: ${formatDate(child.birthDate)}`
      )
    ),
    createBodyParagraph('', { after: SPACING.SUBSECTION }),

    // 2. Relief requested - NUMBERED
    createNumberedHeader('2. פירוט הסעד המבוקש באופן תמציתי'),
    createNumberedItem(1, 'כבוד בית המשפט יפסוק מזונות לפי הפרמטרים שבפניו.'),
    createNumberedItem(
      2,
      'כמו כן, מתבקש בית המשפט לחייב עבור הוצאות שונות, לרבות, הוצאות חינוך והוצאות רפואיות בהתאם לפרמטרים שהובאו בפני כבוד בית המשפט.'
    ),
    createBodyParagraph('', { after: SPACING.SUBSECTION }),

    // 3. Summary of facts
    createNumberedHeader('3. תמצית העובדות הנחוצות לביסוסה של עילת התביעה ומתי נולדה'),
    createBodyParagraph(
      `המדובר בזוג ${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2} וילדיהם המשותפים:`,
      { after: SPACING.PARAGRAPH }
    ),
    ...minorChildren.map((child) =>
      createBulletPoint(`שם: ${child.name} ת"ז: ${child.idNumber} ת"ל: ${formatDate(child.birthDate)}`)
    ),
    createBodyParagraph('', { after: SPACING.SUBSECTION }),

    // 4. Jurisdiction facts
    createNumberedHeader('4. פירוט העובדות המקנות סמכות לבית המשפט'),
    createBodyParagraph(
      'מדובר בבני זוג ובילדיהם שהסמכות נתונה לבית המשפט לענייני משפחה.',
      { after: SPACING.SUBSECTION }
    ),
  ];
}

/**
 * Create Part C - Detailed facts (חלק ג - פירוט העובדות)
 */
function createPartC(data: AlimonyClaimData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const children = data.formData.property?.children || [];
  const minorChildren = children.filter((child) => {
    if (!child.birthDate) return false;
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  });

  // Part C title
  paragraphs.push(createSectionHeader('חלק ג - פירוט העובדות המשמשות יסוד לכתב הטענות'));

  // מערכת היחסים - Relationship section
  paragraphs.push(createSubsectionHeader('מערכת היחסים'));
  paragraphs.push(
    createBodyParagraph(
      `המדובר בזוג ${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2} וילדיהם המשותפים:`,
      { after: SPACING.PARAGRAPH }
    )
  );

  minorChildren.forEach((child) => {
    paragraphs.push(
      createBulletPoint(
        `שם: ${child.name} ת"ז: ${child.idNumber} ת"ל: ${formatDate(child.birthDate)}`
      )
    );
  });

  paragraphs.push(createBodyParagraph('', { after: SPACING.PARAGRAPH }));

  // Separation date
  if (data.formData.property?.separationDate) {
    paragraphs.push(
      createBodyParagraph(
        `מיום ${formatDate(data.formData.property.separationDate)} הצדדים חיים בנפרד.`,
        { after: SPACING.SUBSECTION }
      )
    );
  }

  // Where children reside
  paragraphs.push(createSubsectionHeader('היכן נמצאים הילדים:'));

  minorChildren.forEach((child) => {
    const residingWith =
      child.residingWith === 'applicant'
        ? data.basicInfo.fullName
        : child.residingWith === 'respondent'
        ? data.basicInfo.fullName2
        : 'שני ההורים';

    paragraphs.push(
      createBulletPoint(`${child.name} מתגורר/ת אצל ${residingWith}.`)
    );
  });

  paragraphs.push(createBodyParagraph('', { after: SPACING.SUBSECTION }));

  return paragraphs;
}

/**
 * Create employment sections for applicant and respondent
 */
function createEmploymentSections(data: AlimonyClaimData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const property = data.formData.property || {};

  // Husband's (respondent's) employment
  paragraphs.push(createSubsectionHeader('השתכרות הבעל:'));

  if (property.respondentEmploymentStatus === 'employed' && property.respondentEmployer) {
    paragraphs.push(
      createBodyParagraph(
        `הנתבע מועסק אצל ${property.respondentEmployer}.`,
        { after: SPACING.LINE }
      )
    );
  }

  if (property.respondentEstimatedIncome) {
    paragraphs.push(
      createBodyParagraph(
        `הכנסתו המשוערת: ${formatCurrency(property.respondentEstimatedIncome)} לחודש.`,
        { after: SPACING.LINE }
      )
    );
  }

  if (property.respondentAdditionalIncome) {
    paragraphs.push(
      createBodyParagraph(
        `הכנסות נוספות: ${property.respondentAdditionalIncome}`,
        { after: SPACING.LINE }
      )
    );
  }

  paragraphs.push(createBodyParagraph('', { after: SPACING.SUBSECTION }));

  // Wife's (applicant's) employment
  paragraphs.push(createSubsectionHeader('השתכרות האישה:'));

  if (property.applicantEmploymentStatus === 'employed' && property.applicantEmployer) {
    paragraphs.push(
      createBodyParagraph(
        `התובעת מועסקת אצל ${property.applicantEmployer}.`,
        { after: SPACING.LINE }
      )
    );
  }

  if (property.applicantGrossSalary) {
    paragraphs.push(
      createBodyParagraph(
        `משכורת ברוטו: ${formatCurrency(property.applicantGrossSalary)} לחודש.`,
        { after: SPACING.LINE }
      )
    );
  }

  if (property.applicantAdditionalIncome) {
    paragraphs.push(
      createBodyParagraph(
        `הכנסות נוספות: ${property.applicantAdditionalIncome}`,
        { after: SPACING.LINE }
      )
    );
  }

  paragraphs.push(createBodyParagraph('', { after: SPACING.SUBSECTION }));

  return paragraphs;
}

/**
 * Create children's needs table - ONE table with kids as columns
 * With visuallyRightToLeft: true, the array order is LOGICAL (not visual)
 * Array: קטגוריה | Child1 | Child2 | Child3 | סה"כ
 * Visual (RTL): קטגוריה (right) | Children (middle) | סה"כ (left)
 */
function createChildrenNeedsTable(
  children: Array<{ name: string; birthDate?: string }>,
  expenses: Array<{ category: string; description: string; monthlyAmount: number; childName?: string }>
): (Paragraph | Table)[] {
  if (!expenses || expenses.length === 0 || children.length === 0) {
    return [];
  }

  const paragraphs: (Paragraph | Table)[] = [];

  paragraphs.push(createSubsectionHeader('צרכי הקטינים:'));

  const tableRows: TableRow[] = [];

  // Calculate column widths - better proportions for readability
  const numChildren = children.length;
  const categoryWidth = 2000; // Category column (22%)
  const totalWidth = 1500; // Total column (17%)
  const childColumnWidth = Math.floor(5500 / numChildren); // Divide 61% of width among children

  // Header row - With visuallyRightToLeft: true, first column appears on RIGHT
  // Array order: קטגוריה (→ right), kids (→ middle), סה"כ (→ left)
  const headerCells: TableCell[] = [];

  // First in array: קטגוריה (appears on right with visuallyRightToLeft)
  headerCells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'קטגוריה',
              bold: true,
              size: FONT_SIZES.BODY,
              font: 'David',
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          bidirectional: true,
        }),
      ],
      width: { size: categoryWidth, type: WidthType.DXA },
      shading: { fill: 'E3E6E8' },
    })
  );

  // Child columns (middle) - NORMAL order (Word will display them correctly)
  children.forEach((child) => {
    headerCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: child.name,
                bold: true,
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            bidirectional: true,
          }),
        ],
        width: { size: childColumnWidth, type: WidthType.DXA },
        shading: { fill: 'E3E6E8' },
      })
    );
  });

  // Last in array: סה"כ (appears on left with visuallyRightToLeft)
  headerCells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'סה"כ',
              bold: true,
              size: FONT_SIZES.BODY,
              font: 'David',
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          bidirectional: true,
        }),
      ],
      width: { size: totalWidth, type: WidthType.DXA },
      shading: { fill: 'E3E6E8' },
    })
  );

  tableRows.push(new TableRow({ children: headerCells }));

  // Data rows - Same order as header (visuallyRightToLeft handles RTL display)
  expenses.forEach((expense) => {
    const dataCells: TableCell[] = [];
    const amountPerChild = Math.round(expense.monthlyAmount / numChildren);
    const rowTotal = amountPerChild * numChildren;

    // First cell: Category (→ right side with visuallyRightToLeft)
    dataCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: expense.category,
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.START,
            bidirectional: true,
          }),
        ],
      })
    );

    // Amount cells for each child (middle) - normal order
    children.forEach(() => {
      dataCells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(amountPerChild),
                  size: FONT_SIZES.BODY,
                  font: 'David',
                  rightToLeft: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              bidirectional: true,
            }),
          ],
        })
      );
    });

    // Last cell: Total (→ left side with visuallyRightToLeft)
    dataCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: formatCurrency(rowTotal),
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            bidirectional: true,
          }),
        ],
      })
    );

    tableRows.push(new TableRow({ children: dataCells }));
  });

  // Total row - Same order as header
  const totalCells: TableCell[] = [];
  const grandTotalPerChild = Math.round(
    expenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0) / numChildren
  );
  const grandTotal = grandTotalPerChild * numChildren;

  // First: "סה"כ" label (→ right side)
  totalCells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'סה"כ',
              bold: true,
              size: FONT_SIZES.BODY,
              font: 'David',
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.START,
          bidirectional: true,
        }),
      ],
      shading: { fill: 'F9FAFB' },
    })
  );

  // Child totals (middle) - normal order
  children.forEach(() => {
    totalCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: formatCurrency(grandTotalPerChild),
                bold: true,
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            bidirectional: true,
          }),
        ],
        shading: { fill: 'F9FAFB' },
      })
    );
  });

  // Last: Grand total (→ left side)
  totalCells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: formatCurrency(grandTotal),
              bold: true,
              size: FONT_SIZES.BODY,
              font: 'David',
              rightToLeft: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          bidirectional: true,
        }),
      ],
      shading: { fill: 'F9FAFB' },
    })
  );

  tableRows.push(new TableRow({ children: totalCells }));

  // Create table with RTL support
  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }, // Full width
    layout: TableLayoutType.FIXED,
    margins: {
      top: convertInchesToTwip(0.05),
      bottom: convertInchesToTwip(0.05),
      right: convertInchesToTwip(0.05),
      left: convertInchesToTwip(0.05),
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
    },
    visuallyRightToLeft: true, // THIS IS THE KEY FOR RTL TABLES!
  });

  paragraphs.push(table);
  paragraphs.push(createBodyParagraph('', { after: SPACING.PARAGRAPH }));

  return paragraphs;
}

/**
 * Create household needs table - simple 2 columns
 * Visual RTL layout: סכום חודשי (left) | קטגוריה (right)
 */
function createHouseholdNeedsTable(
  expenses: Array<{ category: string; description: string; monthlyAmount: number }>
): (Paragraph | Table)[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const total = expenses.reduce((sum, exp) => sum + exp.monthlyAmount, 0);

  const paragraphs: (Paragraph | Table)[] = [];

  paragraphs.push(createSubsectionHeader('צורכי המדור:'));

  // Create table
  const tableRows: TableRow[] = [];

  // Header row - With visuallyRightToLeft: Category (→ right), Amount (→ left)
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'קטגוריה',
                  bold: true,
                  size: FONT_SIZES.BODY,
                  font: 'David',
                  rightToLeft: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              bidirectional: true,
            }),
          ],
          width: { size: 6300, type: WidthType.DXA }, // 70%
          shading: { fill: 'E3E6E8' },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'סכום חודשי',
                  bold: true,
                  size: FONT_SIZES.BODY,
                  font: 'David',
                  rightToLeft: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              bidirectional: true,
            }),
          ],
          width: { size: 2700, type: WidthType.DXA }, // 30%
          shading: { fill: 'E3E6E8' },
        }),
      ],
    })
  );

  // Data rows - Normal order: Category first, Amount second
  expenses.forEach((expense) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: expense.category,
                    size: FONT_SIZES.BODY,
                    font: 'David',
                    rightToLeft: true,
                  }),
                ],
                alignment: AlignmentType.START,
                bidirectional: true,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatCurrency(expense.monthlyAmount),
                    size: FONT_SIZES.BODY,
                    font: 'David',
                    rightToLeft: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                bidirectional: true,
              }),
            ],
          }),
        ],
      })
    );
  });

  // Total row - Normal order: "סה"כ" label first, Total amount second
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'סה"כ',
                  bold: true,
                  size: FONT_SIZES.BODY,
                  font: 'David',
                  rightToLeft: true,
                }),
              ],
              alignment: AlignmentType.START,
              bidirectional: true,
            }),
          ],
          shading: { fill: 'F9FAFB' },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: formatCurrency(total),
                  bold: true,
                  size: FONT_SIZES.BODY,
                  font: 'David',
                  rightToLeft: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              bidirectional: true,
            }),
          ],
          shading: { fill: 'F9FAFB' },
        }),
      ],
    })
  );

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }, // Full width
    layout: TableLayoutType.FIXED,
    margins: {
      top: convertInchesToTwip(0.05),
      bottom: convertInchesToTwip(0.05),
      right: convertInchesToTwip(0.05),
      left: convertInchesToTwip(0.05),
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
    },
    visuallyRightToLeft: true, // RTL support for household table
  });

  // Add table directly
  paragraphs.push(table);

  // Add spacing after table
  paragraphs.push(createBodyParagraph('', { after: SPACING.PARAGRAPH }));

  return paragraphs;
}

/**
 * Create relief requested section (סעדים)
 */
function createReliefSection(): Paragraph[] {
  return [
    createSectionHeader('סעדים'),
    createNumberedItem(1, 'כבוד בית המשפט יפסוק מזונות לפי הפרמטרים שבפניו.'),
    createNumberedItem(
      2,
      'כמו כן, מתבקש בית המשפט לחייב עבור הוצאות שונות, לרבות, הוצאות חינוך והוצאות רפואיות בהתאם לפרמטרים שהובאו בפני כבוד בית המשפט.'
    ),
    createNumberedItem(3, 'סעדים זמנים ככל שידרשו.'),
    createNumberedItem(4, 'פסיקת מזונות זמנים.'),
    createBodyParagraph('', { after: SPACING.SUBSECTION }),
  ];
}

/**
 * Create Form 4 section with PNG images and text overlay
 */
async function createForm4Section(data: AlimonyClaimData): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  console.log('📋 Processing Form 4 with PNG overlay...');

  try {
    // Import the PNG overlay service
    const { generateForm4PngWithOverlay } = await import('./form4-png-overlay');
    const { mapFormDataToForm4Data } = await import('./form4-filler');

    // Map data to Form4Data structure
    const form4Data = mapFormDataToForm4Data(data.basicInfo, data.formData);

    // Generate high-quality PNG images with text overlay (150 DPI - good balance of quality and file size)
    const images = await generateForm4PngWithOverlay(form4Data, 150);

    // Add Form 4 title
    paragraphs.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'הרצאת פרטים (טופס 4)',
            bold: true,
            size: FONT_SIZES.MAIN_TITLE,
            font: 'David',
            rightToLeft: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: SPACING.SUBSECTION, after: SPACING.SUBSECTION },
        bidirectional: true,
      })
    );

    // Insert each page as high-quality image at proper A4 size
    // PNG is 1654×2339 pixels at 150 DPI
    // A4 at 72 DPI (Word standard) = 595×842 points
    for (let i = 0; i < images.length; i++) {
      paragraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: images[i],
              transformation: {
                width: 595,  // Full A4 width (8.27 inches at 72 DPI)
                height: 842, // Full A4 height (11.69 inches at 72 DPI)
              },
            } as any), // Type assertion for docx 9.x compatibility
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );

      // Add page break between images (except after last image)
      if (i < images.length - 1) {
        paragraphs.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    }

    console.log(`✅ Form 4 section created with ${images.length} high-quality PNG images (150 DPI)`);
  } catch (error) {
    console.error('❌ Error creating Form 4 section:', error);

    // Fallback to placeholder with error message
    paragraphs.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'הרצאת פרטים (טופס 4)',
            bold: true,
            size: FONT_SIZES.MAIN_TITLE,
            font: 'David',
            rightToLeft: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: SPACING.SUBSECTION, after: SPACING.SUBSECTION },
        bidirectional: true,
      }),
      createBodyParagraph(
        'שגיאה ביצירת טופס 4 אוטומטי. נא למלא ידנית.',
        { after: SPACING.PARAGRAPH }
      )
    );
  }

  return paragraphs;
}

/**
 * Generate ייפוי כוח (Power of Attorney) paragraphs - EXACT COPY FROM PROPERTY GENERATOR
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
    `אני החתום מטה תז ${basicInfo.idNumber}, ${basicInfo.fullName} ממנה בזאת את עוה"ד אריאל דרור להיות ב"כ בענין הכנת תביעת מזונות.`
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
          rightToLeft: true,
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
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.SECTION },
    bidirectional: true,
  }));

  // Lawyer confirmation
  paragraphs.push(createBodyParagraph('אני מאשר את חתימת מרשי'));

  // Lawyer signature - EXACTLY like property generator
  if (lawyerSignature) {
    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150));
  } else {
    paragraphs.push(createBodyParagraph('אריאל דרור, עו"ד'));
  }

  return paragraphs;
}

/**
 * Generate תצהיר (Affidavit) paragraphs - EXACT COPY FROM PROPERTY GENERATOR
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
        rightToLeft: true,
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

  // Lawyer signature - EXACTLY like property generator
  if (lawyerSignature) {
    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150));
  } else {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: '__________________',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
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
          rightToLeft: true,
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
 * Generate תוכן עניינים (Table of Contents) - Simple version for alimony claims
 */
function generateTableOfContents(): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(createMainTitle('תוכן עניינים'));

  // Manual Table of Contents entries
  paragraphs.push(createNumberedItem(1, 'כתב תביעה'));
  paragraphs.push(createNumberedItem(2, 'הרצאת פרטים (טופס 4)'));
  paragraphs.push(createNumberedItem(3, 'ייפוי כוח'));
  paragraphs.push(createNumberedItem(4, 'תצהיר'));

  paragraphs.push(createBodyParagraph('', { after: SPACING.SECTION }));

  return paragraphs;
}

/**
 * Main function to generate alimony claim document
 */
export async function generateAlimonyClaim(data: AlimonyClaimData): Promise<Document> {
  console.log('\n' + '🔵'.repeat(40));
  console.log('📋 GENERATING ALIMONY CLAIM (מזונות)');
  console.log('🔵'.repeat(40));

  const sections: (Paragraph | Table)[] = [];

  // 1. Court header
  sections.push(...createCourtHeader(data));

  // 2. Party information
  sections.push(...createPartyInfo(data));

  // 3. Claim title and fees
  sections.push(...createClaimTitle());

  // 4. Summons
  sections.push(...createSummons());

  // 5. Part B - Summary
  sections.push(...createPartB(data));

  // 6. Part C - Detailed facts
  sections.push(...createPartC(data));

  // 7. Employment sections
  sections.push(...createEmploymentSections(data));

  // Get minor children (under 18)
  const children = data.formData.property?.children || [];
  const minorChildren = children.filter((child) => {
    if (!child.birthDate) return false;
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  });

  // 8. Children's needs table - organized by child
  console.log(`📊 Children needs data:`, data.formData.alimony?.childrenNeeds);
  if (data.formData.alimony?.childrenNeeds && minorChildren.length > 0) {
    console.log(`✅ Adding children needs table for ${minorChildren.length} children with ${data.formData.alimony.childrenNeeds.length} expense categories`);
    sections.push(
      ...createChildrenNeedsTable(minorChildren, data.formData.alimony.childrenNeeds)
    );
  } else {
    console.log(`⚠️ No children needs data found or no minor children`);
  }

  // 9. Household needs table - simple 2 columns
  console.log(`📊 Household needs data:`, data.formData.alimony?.householdNeeds);
  if (data.formData.alimony?.householdNeeds) {
    console.log(`✅ Adding household needs table with ${data.formData.alimony.householdNeeds.length} items`);
    sections.push(
      ...createHouseholdNeedsTable(data.formData.alimony.householdNeeds)
    );
  } else {
    console.log(`⚠️ No household needs data found`);
  }

  // 10. Relief requested
  sections.push(...createReliefSection());

  // 11. Form 4 images
  sections.push(...(await createForm4Section(data)));

  // 12. Power of Attorney (with page break)
  sections.push(createPageBreak());
  sections.push(...generatePowerOfAttorney(data.basicInfo, data.formData, data.signature, data.lawyerSignature));

  // 13. Affidavit (with page break)
  sections.push(createPageBreak());
  sections.push(...generateAffidavit(data.basicInfo, data.formData, data.lawyerSignature));

  // 14. Table of Contents (at the end, with page break)
  sections.push(createPageBreak());
  sections.push(...generateTableOfContents());

  console.log('🔵'.repeat(40));
  console.log('✅ ALIMONY CLAIM GENERATED SUCCESSFULLY');
  console.log('🔵'.repeat(40) + '\n');

  // DEBUG: Log sections array details
  console.log(`📊 DEBUG: sections.length = ${sections.length}`);
  const tableCount = sections.filter(s => s.constructor.name === 'Table').length;
  const paragraphCount = sections.filter(s => s.constructor.name === 'Paragraph').length;
  console.log(`📊 DEBUG: Tables=${tableCount}, Paragraphs=${paragraphCount}`);

  return new Document({
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
                    rightToLeft: true,
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
        children: sections,
      },
    ],
  });
}

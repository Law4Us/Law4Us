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
import { BasicInfo, FormData } from '../types';
import {
  FONT_SIZES,
  SPACING,
  formatCurrency,
  formatDate,
  formatChildNaturally,
  getHebrewLabel,
  isMinor,
  createSectionHeader,
  createSubsectionHeader,
  createNumberedHeader,
  createBodyParagraph,
  createBulletPoint,
  createNumberedItem,
  createCenteredTitle,
  createMainTitle,
  createInfoLine,
  createPageBreak,
  createSignatureImage,
  createCourtHeader,
  generatePowerOfAttorney,
  generateAffidavit,
  generateAttachmentsSection,
} from './shared-document-generators';

interface AlimonyClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer;
  lawyerSignature?: string | Buffer;
  attachments?: Array<{ label: string; description: string; images: Buffer[] }>;
}

/**
 * Local wrapper for court header - extracts data and calls shared function
 */
function localCreateCourtHeader(data: AlimonyClaimData): Paragraph[] {
  const children = data.formData.children || [];
  const minorChildren = children.filter((child) => isMinor(child.birthDate || ''));

  return createCourtHeader({
    city: 'בפתח תקווה',
    judgeName: 'מירב אליהו',
    basicInfo: data.basicInfo,
    children: minorChildren.map(c => ({ name: c.name || '', idNumber: c.idNumber || '' })),
    showChildrenList: true,
  });
}

// ALIMONY-SPECIFIC FUNCTIONS START HERE

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
  const children = data.formData.children || [];
  const minorChildren = children.filter((child) => {
    if (!child.birthDate) return false;
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  });

  const marriageDate = data.basicInfo.weddingDay
    ? formatDate(data.basicInfo.weddingDay)
    : '';

  return [
    createSectionHeader('חלק ב – תמצית התביעה'),

    // 1. Brief description of parties - SIMPLE, NO LLM
    createNumberedHeader('1. תיאור תמציתי של בעלי הדין'),
    createBodyParagraph(
      `${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2} נישאו ביום ${marriageDate}, במהלך הנישואין נולדו להם ${minorChildren.length} קטינים: ${minorChildren.map(child => formatChildNaturally(child)).join(', ')}.`,
      { after: SPACING.SUBSECTION }
    ),

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
      `המדובר בזוג ${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2} וילדיהם המשותפים: ${minorChildren.map(child => formatChildNaturally(child)).join(', ')}.`,
      { after: SPACING.SUBSECTION }
    ),

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
 * More natural, flowing narrative as requested by lawyer
 */
function createPartC(data: AlimonyClaimData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const children = data.formData.children || [];
  const minorChildren = children.filter((child) => {
    if (!child.birthDate) return false;
    const birthDate = new Date(child.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  });

  const marriageDate = data.basicInfo.weddingDay
    ? formatDate(data.basicInfo.weddingDay)
    : '';

  // Determine marital status for natural wording
  const maritalStatus = marriageDate ? 'נשוי' : 'לא נשואי';

  // Part C title
  paragraphs.push(createSectionHeader('חלק ג - פירוט העובדות המשמשות יסוד לכתב הטענות'));

  // מערכת היחסים - Relationship section (flowing narrative)
  paragraphs.push(createSubsectionHeader('מערכת היחסים'));

  // Build continuous flowing narrative
  const childrenNames = minorChildren.map(child => formatChildNaturally(child)).join(', ');

  // Opening paragraph - couple, children, and living arrangement in one flow
  let relationshipText = marriageDate
    ? `המדובר בזוג נשוי, להם נולדו ${minorChildren.length === 1 ? 'ילד' : `${minorChildren.length} ילדים`}: ${childrenNames}. `
    : `המדובר בזוג לא נשואי, להם נולדו ${minorChildren.length === 1 ? 'ילד' : `${minorChildren.length} ילדים`}: ${childrenNames}. `;

  // Add separation info
  if (data.formData.property?.separationDate) {
    relationshipText += `כיום הצדדים גרים בנפרד מיום ${formatDate(data.formData.property.separationDate)}`;
  } else {
    relationshipText += `כיום הצדדים גרים בנפרד`;
  }

  // Add children living arrangement in same paragraph
  if (minorChildren.length > 0) {
    const allWithApplicant = minorChildren.every((c) => c.residingWith === 'applicant');
    const allWithRespondent = minorChildren.every((c) => c.residingWith === 'respondent');
    const allWithBoth = minorChildren.every((c) => c.residingWith === 'both');

    if (allWithApplicant) {
      relationshipText += `, כאשר הילדים מתגוררים עם ${data.basicInfo.fullName}.`;
    } else if (allWithRespondent) {
      relationshipText += `, כאשר הילדים מתגוררים עם ${data.basicInfo.fullName2}.`;
    } else if (allWithBoth) {
      relationshipText += `, כאשר המגורים חלוקים בצורה שוויונית בין ההורים.`;
    } else {
      // Mixed arrangement
      const childArrangements = minorChildren.map((child) => {
        const residingWith =
          child.residingWith === 'applicant'
            ? data.basicInfo.fullName
            : child.residingWith === 'respondent'
            ? data.basicInfo.fullName2
            : 'שני ההורים';
        return `${child.name} מתגורר/ת אצל ${residingWith}`;
      }).join(', ');
      relationshipText += `, כאשר ${childArrangements}.`;
    }
  } else {
    relationshipText += '.';
  }

  paragraphs.push(createBodyParagraph(relationshipText, { after: SPACING.SUBSECTION }));

  return paragraphs;
}

/**
 * Create employment sections for applicant and respondent
 * Now at SECTION level (same as "מערכת היחסים") per lawyer request
 */
function createEmploymentSections(data: AlimonyClaimData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const property = data.formData.property || {};

  // Husband's (respondent's) employment - SECTION level
  paragraphs.push(createSubsectionHeader('השתכרות הבעל'));

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

  // Wife's (applicant's) employment - SECTION level
  paragraphs.push(createSubsectionHeader('השתכרות האישה'));

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

  // Calculate column widths - wider columns for readability
  const numChildren = children.length;
  const tableWidth = convertInchesToTwip(6.5); // leaves comfortable margins
  const categoryWidth = Math.round(tableWidth * 0.33);
  const totalWidth = Math.round(tableWidth * 0.15);
  const remainingWidth = tableWidth - categoryWidth - totalWidth;
  const baseChildWidth = Math.floor(remainingWidth / numChildren);

  const childColumnWidths = new Array(numChildren).fill(baseChildWidth);
  let widthRemainder = remainingWidth - baseChildWidth * numChildren;
  let distributeIndex = 0;
  while (widthRemainder > 0 && childColumnWidths.length > 0) {
    childColumnWidths[distributeIndex % childColumnWidths.length] += 1;
    distributeIndex += 1;
    widthRemainder -= 1;
  }

  const columnWidths = [categoryWidth, ...childColumnWidths, totalWidth];

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
      width: { size: columnWidths[0], type: WidthType.DXA },
      shading: { fill: 'E3E6E8' },
    })
  );

  // Child columns (middle) - NORMAL order (Word will display them correctly)
  children.forEach((child, childIndex) => {
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
        width: { size: columnWidths[childIndex + 1], type: WidthType.DXA },
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
      width: { size: columnWidths[columnWidths.length - 1], type: WidthType.DXA },
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
        width: { size: columnWidths[0], type: WidthType.DXA }, // Match header width
      })
    );

    // Amount cells for each child (middle) - normal order
    children.forEach((_, childIndex) => {
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
          width: { size: columnWidths[childIndex + 1], type: WidthType.DXA }, // Match header width
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
        width: { size: columnWidths[columnWidths.length - 1], type: WidthType.DXA }, // Match header width
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
      width: { size: columnWidths[0], type: WidthType.DXA }, // Match header width
      shading: { fill: 'F9FAFB' },
    })
  );

  // Child totals (middle) - normal order
  children.forEach((_, childIndex) => {
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
        width: { size: columnWidths[childIndex + 1], type: WidthType.DXA }, // Match header width
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
        width: { size: columnWidths[columnWidths.length - 1], type: WidthType.DXA }, // Match header width
      shading: { fill: 'F9FAFB' },
    })
  );

  tableRows.push(new TableRow({ children: totalCells }));

  // Create table with RTL support
  const table = new Table({
    rows: tableRows,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths,
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
  const tableWidth = convertInchesToTwip(6.5);
  const categoryWidth = Math.round(tableWidth * 0.68);
  const amountWidth = tableWidth - categoryWidth;
  const columnWidths = [categoryWidth, amountWidth];

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
          width: { size: columnWidths[0], type: WidthType.DXA },
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
          width: { size: columnWidths[1], type: WidthType.DXA },
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
            width: { size: columnWidths[0], type: WidthType.DXA }, // Match header
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
            width: { size: columnWidths[1], type: WidthType.DXA }, // Match header
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
          width: { size: columnWidths[0], type: WidthType.DXA }, // Match header
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
          width: { size: columnWidths[1], type: WidthType.DXA }, // Match header
          shading: { fill: 'F9FAFB' },
        }),
      ],
    })
  );

  const table = new Table({
    rows: tableRows,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths,
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
 * Estimate page count for alimony document sections
 * Used for calculating attachment table of contents page numbers
 */
function estimatePageCountForAlimony(formData: any): {
  mainClaim: number;
  form4: number;
  powerOfAttorney: number;
  affidavit: number;
  tocPage: number;
} {
  // Main claim: depends on children count and expenses
  const propertyData = formData.property || formData;
  const childrenCount = propertyData.children?.length || 0;
  const alimonyData = formData.alimony || {};

  // Base pages + children needs table + household needs table
  const mainClaim = 5 + Math.ceil(childrenCount / 3); // ~5-6 pages base + children columns

  // Form 4: 6 PNG pages (fixed)
  const form4 = 6;

  // Power of Attorney: 2 pages (15 powers)
  const powerOfAttorney = 2;

  // Affidavit: 1 page (fixed)
  const affidavit = 1;

  // Calculate last page before attachments (sum of all previous pages)
  const tocPage = mainClaim + form4 + powerOfAttorney + affidavit;

  return { mainClaim, form4, powerOfAttorney, affidavit, tocPage };
}

/**
 * Main function to generate alimony claim document
 */
export async function generateAlimonyClaim(data: AlimonyClaimData): Promise<Document> {
  console.log('\n' + '🔵'.repeat(40));
  console.log('📋 GENERATING ALIMONY CLAIM (מזונות)');
  console.log('🔵'.repeat(40));

  const sections: (Paragraph | Table)[] = [];

  // 1. Court header with party info
  sections.push(...localCreateCourtHeader(data));

  // 2. Claim title and fees
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
  const children = data.formData.children || [];
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
  sections.push(...generatePowerOfAttorney(data.basicInfo, data.formData, data.signature, data.lawyerSignature, 'מזונות'));

  // 13. Affidavit (with page break)
  sections.push(createPageBreak());
  sections.push(...generateAffidavit(data.basicInfo, data.formData, data.lawyerSignature));

  // 14. Attachments (if any) - with page break
  if (data.attachments && data.attachments.length > 0) {
    console.log(`📎 Adding ${data.attachments.length} attachments with page ranges`);
    sections.push(createPageBreak());
    const pageEstimates = estimatePageCountForAlimony(data.formData);
    sections.push(...generateAttachmentsSection(data.attachments, pageEstimates.tocPage));
  } else {
    console.log(`ℹ️ No attachments to add`);
  }

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

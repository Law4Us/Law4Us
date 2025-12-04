/**
 * Divorce Claim Document Generator (תביעת גירושין כרוכה)
 * Generates bundled divorce claim documents for Rabbinical Court (בית הדין הרבני)
 *
 * Structure (based on lawyer-approved template):
 * א. רקע עובדתי - Factual Background
 * ב. מזונות ילדים - Child Support
 * ג. משמורת והסדרי ראייה - Custody and Visitation
 * ד. רכוש - Property Division
 * ה. סעדים - Reliefs
 * + Power of Attorney, Affidavit, Attachments
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  PageBreak,
  PageNumber,
  NumberFormat,
  Footer,
  ImageRun,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from 'docx';
import { BasicInfo, FormData, Child, ClaimType } from '@/lib/api/types';
import { transformToLegalLanguage } from './groq-service';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  formatChildNaturally,
  formatCurrency,
  createSectionHeader,
  createSubsectionHeader,
  createNumberedHeader,
  createBodyParagraph,
  createBulletPoint,
  createNumberedItem,
  createMainTitle,
  createPageBreak,
  createSignatureImage,
  createCourtHeader,
  createRelationshipSection,
  generatePowerOfAttorney,
  generateAttachmentsSection,
  createLetteredHeader,
} from './shared-document-generators';

// ==================== TYPES ====================

interface DivorceClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer;
  lawyerSignature?: string | Buffer;
  attachments?: Array<{
    label: string;
    description: string;
    images: Buffer[];
  }>;
  selectedClaims?: ClaimType[];
}

interface GenderTerms {
  title: string;       // התובע/התובעת
  pronoun: string;     // הוא/היא
  possessive: string;  // שלו/שלה
  name: string;        // Full name
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get gendered terms for plaintiff (person 1)
 */
function getPlaintiffTerm(gender?: 'male' | 'female', name?: string): GenderTerms {
  if (gender === 'male') {
    return { title: 'התובע', pronoun: 'הוא', possessive: 'שלו', name: name || 'התובע' };
  }
  return { title: 'התובעת', pronoun: 'היא', possessive: 'שלה', name: name || 'התובעת' };
}

/**
 * Get gendered terms for defendant (person 2)
 */
function getDefendantTerm(gender?: 'male' | 'female', name?: string): GenderTerms {
  if (gender === 'male') {
    return { title: 'הנתבע', pronoun: 'הוא', possessive: 'שלו', name: name || 'הנתבע' };
  }
  return { title: 'הנתבעת', pronoun: 'היא', possessive: 'שלה', name: name || 'הנתבעת' };
}

/**
 * Get parent title (האב/האם)
 */
function getParentTitle(gender?: 'male' | 'female'): string {
  return gender === 'male' ? 'האב' : 'האם';
}

/**
 * Normalize amount to number
 */
function normalizeAmount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const sanitized = value.replace(/[^\d.-]/g, '');
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Calculate age from birthdate
 */
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format child with age
 */
function formatChildWithAge(child: Child): string {
  const name = `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'קטין/ה';
  const idText = child.idNumber ? `(ת.ז ${child.idNumber})` : '';
  const birthText = child.birthDate ? `, יליד ${formatDate(child.birthDate)}` : '';
  const age = child.birthDate ? calculateAge(child.birthDate) : null;
  const ageText = age !== null ? `, כיום בן ${age}` : '';
  return `${name} ${idText}${birthText}${ageText}`;
}

// ==================== TABLE HELPER FUNCTIONS ====================

/**
 * Create a simple 2-column table for children's needs
 * Columns: פירוט ההוצאה | סכום חודשי
 */
function createNeedsTable(
  expenses: Array<{ category?: string; description?: string; monthlyAmount?: number; amount?: number }>
): (Paragraph | Table)[] {
  if (!expenses || expenses.length === 0) {
    return [];
  }

  const elements: (Paragraph | Table)[] = [];
  const tableRows: TableRow[] = [];

  const tableWidth = convertInchesToTwip(6.5);
  const descWidth = Math.round(tableWidth * 0.70);
  const amountWidth = tableWidth - descWidth;
  const columnWidths = [descWidth, amountWidth];

  // Header row
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'פירוט ההוצאה',
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

  // Data rows
  let total = 0;
  expenses.forEach((expense) => {
    const desc = expense.description || expense.category || 'הוצאה';
    const amount = normalizeAmount(expense.monthlyAmount || expense.amount || 0);
    total += amount;

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: desc,
                    size: FONT_SIZES.BODY,
                    font: 'David',
                    rightToLeft: true,
                  }),
                ],
                alignment: AlignmentType.START,
                bidirectional: true,
              }),
            ],
            width: { size: columnWidths[0], type: WidthType.DXA },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${amount.toLocaleString('he-IL')} ש"ח`,
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
          }),
        ],
      })
    );
  });

  // Create table with RTL support
  const table = new Table({
    rows: tableRows,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths,
    margins: {
      top: convertInchesToTwip(0.05),
      bottom: convertInchesToTwip(0.05),
      right: convertInchesToTwip(0.08),
      left: convertInchesToTwip(0.08),
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
    },
    visuallyRightToLeft: true,
  });

  elements.push(table);

  // Total line
  elements.push(
    createBodyParagraph(`סה"כ הוצאות חודשיות לקטינים: ${total.toLocaleString('he-IL')} ש"ח.`)
  );

  return elements;
}

/**
 * Create a 3-column property table
 * Columns: תיאור | בעלות | שווי משוער (or סכום for debts)
 */
function createPropertyTable(
  items: Array<any>,
  type: 'property' | 'vehicles' | 'savings' | 'debts'
): (Paragraph | Table)[] {
  if (!items || items.length === 0) {
    return [];
  }

  const elements: (Paragraph | Table)[] = [];
  const tableRows: TableRow[] = [];

  const tableWidth = convertInchesToTwip(6.5);
  const descWidth = Math.round(tableWidth * 0.45);
  const ownerWidth = Math.round(tableWidth * 0.25);
  const valueWidth = tableWidth - descWidth - ownerWidth;
  const columnWidths = [descWidth, ownerWidth, valueWidth];

  // Determine headers based on type
  const valueHeader = type === 'debts' ? 'סכום' : 'שווי משוער';
  const ownerHeader = type === 'debts' ? 'בעל החוב' : 'בעלות';

  // Header row
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'תיאור',
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
                  text: ownerHeader,
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
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: valueHeader,
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
          width: { size: columnWidths[2], type: WidthType.DXA },
          shading: { fill: 'E3E6E8' },
        }),
      ],
    })
  );

  // Data rows
  items.forEach((item) => {
    // Get description based on item type
    let desc = '';
    if (type === 'property') {
      desc = item.address || item.description || 'נכס';
    } else if (type === 'vehicles') {
      const make = item.make || item.manufacturer || '';
      const model = item.model || '';
      const year = item.year || '';
      const plate = item.plateNumber || item.licensePlate || '';
      desc = `${make} ${model} ${year}`.trim() || 'רכב';
      if (plate) desc += ` (${plate})`;
    } else if (type === 'savings') {
      desc = item.description || item.bankName || item.type || 'חיסכון';
    } else if (type === 'debts') {
      desc = item.description || item.type || 'חוב';
    }

    const owner = item.owner || item.ownership || 'שני הצדדים';
    const value = item.value || item.amount || item.estimatedValue || '';
    const valueText = value ? `${normalizeAmount(value).toLocaleString('he-IL')} ש"ח` : 'לא צוין';

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: desc,
                    size: FONT_SIZES.BODY,
                    font: 'David',
                    rightToLeft: true,
                  }),
                ],
                alignment: AlignmentType.START,
                bidirectional: true,
              }),
            ],
            width: { size: columnWidths[0], type: WidthType.DXA },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: owner,
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
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: valueText,
                    size: FONT_SIZES.BODY,
                    font: 'David',
                    rightToLeft: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                bidirectional: true,
              }),
            ],
            width: { size: columnWidths[2], type: WidthType.DXA },
          }),
        ],
      })
    );
  });

  // Create table with RTL support
  const table = new Table({
    rows: tableRows,
    width: { size: tableWidth, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths,
    margins: {
      top: convertInchesToTwip(0.05),
      bottom: convertInchesToTwip(0.05),
      right: convertInchesToTwip(0.08),
      left: convertInchesToTwip(0.08),
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '515F61' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E3E6E8' },
    },
    visuallyRightToLeft: true,
  });

  elements.push(table);

  return elements;
}

// ==================== SECTION GENERATORS ====================

/**
 * Section א - Factual Background (רקע עובדתי)
 * Includes marriage details, children, separation, mediation, and BLAME LANGUAGE
 */
function generateFactualBackgroundSection(
  basicInfo: BasicInfo,
  formData: FormData,
  divorceData: any,
  children: Child[],
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(createLetteredHeader('א', 'רקע עובדתי'));

  // Marriage details - dynamic based on available data
  const marriageDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '';
  const weddingCity = divorceData.weddingCity || '';
  const isReligiousMarriage = divorceData.religiousMarriage === 'כן';

  // Build marriage sentence dynamically
  let marriageText = 'הצדדים הם בני זוג';
  if (isReligiousMarriage) {
    marriageText += `, אשר נישאו כדמו"י`;
  } else {
    marriageText += ', אשר נישאו';
  }
  if (marriageDate) {
    marriageText += ` בתאריך ${marriageDate}`;
  }
  if (weddingCity) {
    marriageText += ` ב${weddingCity}`;
  }
  marriageText += '.';
  paragraphs.push(createBodyParagraph(marriageText));

  // Children details
  if (children.length > 0) {
    const childrenList = children.map((child) => formatChildWithAge(child)).join('; ו');
    const childrenText = children.length === 1
      ? `מנישואי הצדדים נולד להם ילד אחד: ${childrenList}.`
      : `מנישואי הצדדים נולדו להם ${children.length} ילדים: ${childrenList}.`;
    paragraphs.push(createBodyParagraph(childrenText));
  }

  // Marital problems description (AI-transformed if available)
  // Note: GROQ transforms this to a flowing story style, no need for "לטענת" prefix
  if (divorceData.whoWantsDivorceAndWhy) {
    paragraphs.push(createBodyParagraph(divorceData.whoWantsDivorceAndWhy));
  } else {
    // Fallback: basic statement if no detailed story provided
    paragraphs.push(createBodyParagraph(
      'במהלך השנים האחרונות התגלעו חילוקי דעות משמעותיים בין הצדדים, אשר הובילו לפירוק מערכת היחסים הזוגית.'
    ));
  }

  // Separation status
  const livingSeparately = formData.livingSeparately === 'כן';
  const separationDate = formData.separationDate;
  if (livingSeparately) {
    let sepText = 'כיום הצדדים גרים בנפרד';
    if (separationDate) {
      sepText += ` מיום ${formatDate(separationDate)}`;
    }
    sepText += '.';
    paragraphs.push(createBodyParagraph(sepText));
  }

  // Police complaints - with proper gendered language
  if (divorceData.policeComplaints === 'כן') {
    let policeText = 'הוגשו תלונות במשטרה';
    if (divorceData.policeComplaintsWho) {
      // Determine gender based on who filed
      const whoFiled = divorceData.policeComplaintsWho;
      const isPlaintiffFiling = whoFiled === plaintiff.name || whoFiled === 'התובע' || whoFiled === 'התובעת';
      const filedVerb = isPlaintiffFiling
        ? (plaintiff.pronoun === 'הוא' ? 'הגיש' : 'הגישה')
        : (defendant.pronoun === 'הוא' ? 'הגיש' : 'הגישה');
      policeText = `${whoFiled} ${filedVerb} תלונות במשטרה`;
    }
    if (divorceData.policeComplaintsWhere) {
      policeText += ` ב${divorceData.policeComplaintsWhere}`;
    }
    if (divorceData.policeComplaintsDate) {
      policeText += ` ביום ${formatDate(divorceData.policeComplaintsDate)}`;
    }
    policeText += '.';
    paragraphs.push(createBodyParagraph(policeText));

    if (divorceData.policeComplaintsOutcome) {
      paragraphs.push(createBodyParagraph(`תוצאות ההליך: ${divorceData.policeComplaintsOutcome}`));
    }
  }

  // Mediation attempts - flows as a story
  if (divorceData.hadPreviousMediation === 'כן') {
    if (divorceData.previousMediationDetails) {
      // The details usually include "הצדדים פנו..." so we just add "הצדדים ניסו הליך גישור." before
      paragraphs.push(createBodyParagraph(`הצדדים ניסו הליך גישור. ${divorceData.previousMediationDetails}`));
    } else {
      paragraphs.push(createBodyParagraph('הצדדים ניסו הליך גישור, אולם הגישור לא צלח.'));
    }
  }

  // Marriage counseling - flows as a story (no label)
  if (divorceData.marriageCounselingDetails) {
    // The details usually start with "טיפול זוגי התקיים..." so we just use it directly
    paragraphs.push(createBodyParagraph(divorceData.marriageCounselingDetails));
  }

  // BLAME LANGUAGE (lawyer's requirement) - with proper punctuation
  const blameWord = defendant.pronoun === 'היא' ? 'בעטיה של' : 'בעטיו של';
  let blameText = '';

  if (divorceData.hadPreviousMediation === 'כן') {
    blameText = `${blameWord} ${defendant.title}, הגישור לא צלח והנישואין הגיעו למבוי סתום.`;
  } else if (livingSeparately) {
    blameText = `${blameWord} ${defendant.title}, נוצר פירוד בין הצדדים אשר אין סיכוי לגשר עליו.`;
  } else {
    blameText = `${blameWord} ${defendant.title}, נוצר נתק בין הצדדים ואין אפשרות להמשיך בחיים משותפים.`;
  }
  paragraphs.push(createBodyParagraph(blameText));

  // Closing - proper gendered form
  const requestVerb = plaintiff.pronoun === 'הוא' ? 'מבקש' : 'מבקשת';
  paragraphs.push(createBodyParagraph(
    `לאור המצב, ${plaintiff.title} ${requestVerb} מכבוד בית הדין להורות על גירושין.`
  ));

  return paragraphs;
}

/**
 * Section ב - Alimony (מזונות ילדים)
 * Includes children's needs table and income information
 */
function generateSimpleAlimonySection(
  basicInfo: BasicInfo,
  formData: FormData,
  children: Child[],
  plaintiff: GenderTerms,
  defendant: GenderTerms
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createLetteredHeader('ב', 'מזונות ילדים'));

  if (children.length === 0) {
    elements.push(createBodyParagraph('לצדדים אין ילדים משותפים.'));
    return elements;
  }

  // List children
  const childNames = children.map(c => `${c.firstName || ''} ${c.lastName || ''}`.trim()).join(', ');
  elements.push(createBodyParagraph(
    `לצדדים ${children.length === 1 ? 'ילד אחד' : `${children.length} ילדים`}: ${childNames}.`
  ));

  // Children's needs table
  const childrenNeeds = formData.alimony?.childrenNeeds || [];
  if (childrenNeeds.length > 0) {
    elements.push(createBodyParagraph('להלן פירוט צרכי הקטינים החודשיים:'));
    elements.push(...createNeedsTable(childrenNeeds));
    elements.push(new Paragraph({ children: [], spacing: { after: SPACING.LINE } }));
  }

  // Income information
  const applicantIncome = formData.property?.applicantIncome || formData.alimony?.applicantIncome;
  const respondentIncome = formData.property?.respondentIncome || formData.alimony?.respondentIncome;

  if (applicantIncome || respondentIncome) {
    const fatherTitle = basicInfo.gender === 'male' ? 'האב' : 'האם';
    const motherTitle = basicInfo.gender === 'male' ? 'האם' : 'האב';

    let incomeText = 'באשר להכנסות הצדדים: ';
    if (applicantIncome) {
      incomeText += `הכנסת ${fatherTitle} ${normalizeAmount(applicantIncome).toLocaleString('he-IL')} ש"ח ברוטו לחודש`;
    }
    if (applicantIncome && respondentIncome) {
      incomeText += ', ';
    }
    if (respondentIncome) {
      incomeText += `הכנסת ${motherTitle} ${normalizeAmount(respondentIncome).toLocaleString('he-IL')} ש"ח ברוטו לחודש`;
    }
    incomeText += '.';
    elements.push(createBodyParagraph(incomeText));
  }

  // Request
  elements.push(createBodyParagraph(
    'מבוקש מכבוד בית הדין לפסוק מזונות לקטינים בהתאם לצרכיהם ולרמת החיים לה היו רגילים, תוך התחשבות ביכולת ההשתכרות של כל אחד מההורים.'
  ));

  return elements;
}

/**
 * Section ג - Custody and Visitation (משמורת והסדרי ראייה)
 * Includes current arrangement, requested arrangement, full reasoning, and acknowledgment
 */
function generateSimpleCustodySection(
  basicInfo: BasicInfo,
  formData: FormData,
  children: Child[],
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(createLetteredHeader('ג', 'משמורת והסדרי ראייה'));

  if (children.length === 0) {
    paragraphs.push(createBodyParagraph('לצדדים אין ילדים משותפים.'));
    return paragraphs;
  }

  const custodyData = formData.custody || {};
  const plaintiffParentTitle = getParentTitle(basicInfo.gender);
  const defendantParentTitle = getParentTitle(basicInfo.gender2);

  // Current living arrangement
  const currentArrangement = custodyData.currentLivingArrangement;
  const separationDate = formData.separationDate || custodyData.sinceWhen;

  if (currentArrangement) {
    // Use proper singular/plural based on children count
    const childWord = children.length === 1 ? 'הקטין מתגורר' : 'הקטינים מתגוררים';
    let currentText = '';

    if (currentArrangement === 'with_me') {
      currentText = `${childWord} כיום עם ${plaintiff.title}`;
    } else if (currentArrangement === 'with_partner' || currentArrangement === 'with_respondent') {
      currentText = `${childWord} כיום עם ${defendant.title}`;
    } else if (currentArrangement === 'split_children') {
      currentText = 'הילדים מתגוררים בחלוקה בין הצדדים';
    } else if (currentArrangement === 'alternating') {
      currentText = 'הילדים מתגוררים לסירוגין אצל שני ההורים';
    } else {
      currentText = `${childWord} כיום עם ${defendant.title}`;
    }

    if (separationDate) {
      currentText += ` מאז ${formatDate(separationDate)}`;
    }
    currentText += '.';
    paragraphs.push(createBodyParagraph(currentText));
  }

  // Current visitation arrangement (check both field names)
  const visitationDetails = custodyData.currentVisitationArrangement || custodyData.currentVisitationDetails;
  if (visitationDetails) {
    paragraphs.push(createBodyParagraph(
      `הסדר הראייה הנוכחי: ${visitationDetails}`
    ));
  }

  // Requested arrangement - CORRECT VALUES
  const requestedArrangement = custodyData.requestedArrangement;

  if (requestedArrangement === 'joint_custody') {
    paragraphs.push(createBodyParagraph(
      'מבוקשת משמורת משותפת, בה שני ההורים ישאו באחריות שווה לגידול הילדים.'
    ));
  } else if (requestedArrangement === 'full_custody') {
    paragraphs.push(createBodyParagraph(
      `מבוקשת משמורת מלאה ל${plaintiff.title}.`
    ));
  } else if (requestedArrangement === 'primary_with_visits') {
    paragraphs.push(createBodyParagraph(
      `מבוקשת משמורת ראשית ל${plaintiff.title}, תוך קביעת הסדרי ראיה נרחבים ל${defendant.title}.`
    ));
  } else {
    // Default to joint if not specified
    paragraphs.push(createBodyParagraph(
      'מבוקשת משמורת משותפת, בה שני ההורים ישאו באחריות שווה לגידול הילדים.'
    ));
  }

  // Reasoning - why plaintiff should have custody (whoShouldHaveCustody)
  if (custodyData.whoShouldHaveCustody) {
    paragraphs.push(createBodyParagraph(custodyData.whoShouldHaveCustody));
  }

  // Acknowledgment of other parent (whyNotOtherParent)
  if (custodyData.whyNotOtherParent) {
    paragraphs.push(createBodyParagraph(custodyData.whyNotOtherParent));
  }

  // Final request to court
  paragraphs.push(createBodyParagraph(
    'מבוקש מכבוד בית הדין לקבוע הסדרי משמורת וזמני שהות לטובת הקטינים, תוך שמירה על קשר רציף ומשמעותי עם שני ההורים.'
  ));

  return paragraphs;
}

/**
 * Section ד - Property (רכוש)
 * Includes tables for real estate, vehicles, savings, and debts
 */
function generateSimplePropertySection(
  basicInfo: BasicInfo,
  formData: FormData,
  plaintiff: GenderTerms,
  defendant: GenderTerms
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createLetteredHeader('ד', 'רכוש'));
  elements.push(createBodyParagraph('להלן פירוט הרכוש המשותף של הצדדים:'));

  const apartments = formData.apartments || [];
  const vehicles = formData.vehicles || [];
  const savings = formData.savings || [];
  const benefits = formData.benefits || [];
  const debts = formData.debts || [];

  // Real estate
  if (apartments.length > 0) {
    elements.push(createSubsectionHeader('נכסי מקרקעין:'));
    elements.push(...createPropertyTable(apartments, 'property'));
    elements.push(new Paragraph({ children: [], spacing: { after: SPACING.LINE } }));
  }

  // Vehicles
  if (vehicles.length > 0) {
    elements.push(createSubsectionHeader('כלי רכב:'));
    elements.push(...createPropertyTable(vehicles, 'vehicles'));
    elements.push(new Paragraph({ children: [], spacing: { after: SPACING.LINE } }));
  }

  // Savings and benefits
  const allSavings = [...savings, ...benefits];
  if (allSavings.length > 0) {
    elements.push(createSubsectionHeader('חסכונות וכספים:'));
    elements.push(...createPropertyTable(allSavings, 'savings'));
    elements.push(new Paragraph({ children: [], spacing: { after: SPACING.LINE } }));
  }

  // Debts
  if (debts.length > 0) {
    elements.push(createSubsectionHeader('חובות והתחייבויות:'));
    elements.push(...createPropertyTable(debts, 'debts'));
    elements.push(new Paragraph({ children: [], spacing: { after: SPACING.LINE } }));
  }

  // No property case
  if (apartments.length === 0 && vehicles.length === 0 && allSavings.length === 0 && debts.length === 0) {
    elements.push(createBodyParagraph('פרטי הרכוש יפורטו בדיון או בכתב טענות נפרד.'));
  }

  // Request
  elements.push(createBodyParagraph(
    'מבוקש מכבוד בית הדין לחלק את הרכוש המשותף בין הצדדים בהתאם לחוק יחסי ממון בין בני זוג, תשל"ג-1973, ובהתחשב בתרומתו של כל צד לרכישת הרכוש ולרווחת המשפחה.'
  ));

  return elements;
}

/**
 * Section ה - Reliefs (סעדים)
 * Numbered list of requested reliefs
 */
function generateReliefsSection(
  children: Child[],
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(createLetteredHeader('ה', 'סעדים'));
  paragraphs.push(createBodyParagraph('לפיכך, מתבקש כבוד בית הדין:'));

  // Numbered reliefs
  paragraphs.push(createNumberedItem(1, 'להורות לצדדים להתגרש לאלתר ולקבוע מועד לסידור גט.'));

  if (children.length > 0) {
    paragraphs.push(createNumberedItem(2, 'לפסוק מזונות לקטינים בהתאם לצרכיהם.'));
    paragraphs.push(createNumberedItem(3, 'לקבוע הסדרי משמורת וזמני שהות לטובת הקטינים.'));
    paragraphs.push(createNumberedItem(4, 'לחלק את הרכוש המשותף בהתאם לחוק.'));
    paragraphs.push(createNumberedItem(5, `לחייב את ${defendant.title} בהוצאות משפט.`));
  } else {
    paragraphs.push(createNumberedItem(2, 'לחלק את הרכוש המשותף בהתאם לחוק.'));
    paragraphs.push(createNumberedItem(3, `לחייב את ${defendant.title} בהוצאות משפט.`));
  }

  return paragraphs;
}

/**
 * Create signature section
 */
function createSignatureSection(
  basicInfo: BasicInfo,
  signature?: string | Buffer,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Spacing before signature
  paragraphs.push(new Paragraph({ children: [], spacing: { before: SPACING.SECTION } }));

  // Plaintiff signature line
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
    spacing: { after: SPACING.LINE },
    bidirectional: true,
  }));

  // Lawyer signature
  if (lawyerSignature) {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: 'ב"כ התובע/ת:',
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.MINIMAL },
      bidirectional: true,
    }));
    paragraphs.push(createSignatureImage(lawyerSignature, 200, 80, AlignmentType.START));
  }

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: 'עו"ד אריאל דרור, ב"כ התובע/ת',
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.SECTION },
    bidirectional: true,
  }));

  return paragraphs;
}

// ==================== MAIN GENERATOR ====================

/**
 * Main export function - generates complete divorce claim document
 */
export async function generateDivorceClaim(data: DivorceClaimData): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature, attachments, selectedClaims } = data;

  console.log('📋 Generating bundled divorce claim (תביעת גירושין כרוכה)...');

  // Extract gender terms
  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Extract data
  const divorceData = formData.divorce || {};
  const children = formData.children || [];

  // Transform free-text fields to legal language using GROQ AI
  if (divorceData.whoWantsDivorceAndWhy) {
    try {
      console.log('🤖 Transforming divorce grounds to legal language...');
      divorceData.whoWantsDivorceAndWhy = await transformToLegalLanguage(
        divorceData.whoWantsDivorceAndWhy,
        {
          claimType: 'תביעת גירושין',
          applicantName: basicInfo.fullName,
          respondentName: basicInfo.fullName2,
          fieldLabel: 'הרקע לבקשת הגירושין',
          additionalContext: 'בית הדין הרבני',
        }
      );
    } catch (error) {
      console.error('Error transforming divorce grounds:', error);
    }
  }

  // Build document sections
  const documentChildren: (Paragraph | Table)[] = [];

  // ===== COURT HEADER =====
  documentChildren.push(
    ...createCourtHeader({
      city: divorceData.weddingCity || 'ירושלים',
      judgeName: 'דיין',
      basicInfo: basicInfo,
      showChildrenList: false,
      forum: 'בבית הדין הרבני',
      docketNumberPlaceholder: 'תיק ____________',
      showDateLine: false,
      showJudgeLine: false,
    })
  );

  // ===== TITLE =====
  documentChildren.push(createMainTitle('תביעת גירושין'));

  // ===== CLAIM NATURE =====
  const bundledText = children.length > 0
    ? 'מהות התביעה: גירושין (ובכרוך: מזונות, משמורת, רכוש)'
    : 'מהות התביעה: גירושין (ובכרוך: רכוש)';

  documentChildren.push(new Paragraph({
    children: [
      new TextRun({
        text: bundledText,
        bold: true,
        size: FONT_SIZES.BODY,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: SPACING.PARAGRAPH, line: 360 },
    bidirectional: true,
  }));

  // ===== SECTION א - FACTUAL BACKGROUND =====
  documentChildren.push(
    ...generateFactualBackgroundSection(basicInfo, formData, divorceData, children, plaintiff, defendant)
  );

  // ===== SECTION ב - ALIMONY =====
  if (children.length > 0) {
    documentChildren.push(
      ...generateSimpleAlimonySection(basicInfo, formData, children, plaintiff, defendant)
    );
  }

  // ===== SECTION ג - CUSTODY =====
  if (children.length > 0) {
    documentChildren.push(
      ...generateSimpleCustodySection(basicInfo, formData, children, plaintiff, defendant)
    );
  }

  // ===== SECTION ד - PROPERTY =====
  documentChildren.push(
    ...generateSimplePropertySection(basicInfo, formData, plaintiff, defendant)
  );

  // ===== SECTION ה - RELIEFS =====
  documentChildren.push(
    ...generateReliefsSection(children, plaintiff, defendant)
  );

  // ===== SIGNATURES =====
  documentChildren.push(
    ...createSignatureSection(basicInfo, signature, lawyerSignature)
  );

  // ===== PAGE BREAK =====
  documentChildren.push(createPageBreak());

  // ===== POWER OF ATTORNEY =====
  documentChildren.push(
    ...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature, 'גירושין')
  );

  // ===== ATTACHMENTS (if any) =====
  if (attachments && attachments.length > 0) {
    console.log(`📎 Adding ${attachments.length} attachments to divorce claim`);
    documentChildren.push(createPageBreak());
    documentChildren.push(...generateAttachmentsSection(attachments, 0));
  }

  // Create document
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
        children: documentChildren,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  console.log('✅ Bundled divorce claim generated successfully');
  return buffer;
}

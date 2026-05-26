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
import { BasicInfo, FormData, Child } from '@/lib/api/types';
import { COURT_FEES_BY_PROCEDURE } from '@/lib/constants/claims';
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
  createRelationshipSection,
  generatePowerOfAttorney,
  generateAffidavit,
  generateAttachmentsSection,
} from './shared-document-generators';

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
 * Note: Address removed per lawyer feedback (children obviously live with parents)
 */
function formatChildBullet(child: any): string {
  return `שם:\u200F ${child.firstName} ${child.lastName} ת״ז:\u200F ${child.idNumber} ת״ל:\u200F ${child.birthDate}`;
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
 * Format purchase date for property items
 */
function formatPurchaseDate(purchaseDate: string): string {
  if (!purchaseDate) return '';
  try {
    const date = new Date(purchaseDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `, נרכש/ה ביום:\u200F ${day}/${month}/${year}`;
  } catch {
    return '';
  }
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

  // Total line - using "כ-" prefix for estimates per lawyer feedback
  const totalText = isDebt
    ? `סך ${categoryName} עולים לסך של כ-${summary.total.toLocaleString()} ש״ח`
    : `סך ${categoryName} עולה לסך של כ-${summary.total.toLocaleString()} ש״ח`;

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
              text: `• ${ownerLabel}:\u200F כ-${ownerData.value.toLocaleString()} ש״ח (${ownerData.count} ${itemWord})`,
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
      const purchaseDate = formatPurchaseDate(apt.purchaseDate);
      const owner = apt.owner ? `, בבעלות:\u200F ${apt.owner}` : '';
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${apt.description || 'דירת מגורים'}${purchaseDate} - שווי:\u200F כ-${value} ש״ח${owner}`
        )
      );
    });
  }

  // רכבים (Vehicles) - per lawyer: assets during marriage belong to both
  if (propertyData.vehicles && propertyData.vehicles.length > 0) {
    paragraphs.push(createSubsectionHeader('רכבים'));
    paragraphs.push(...createPropertySummary('הרכבים', propertyData.vehicles));
    propertyData.vehicles.forEach((vehicle: any, index: number) => {
      const value = getPropertyValue(vehicle);
      const purchaseDate = formatPurchaseDate(vehicle.purchaseDate);
      // If individually registered, show as joint with usage note
      let ownerText = '';
      if (vehicle.owner && vehicle.owner !== 'שניהם') {
        ownerText = `, בבעלות שניהם (בשימוש:\u200F ${vehicle.owner})`;
      } else if (vehicle.owner === 'שניהם') {
        ownerText = ', בבעלות:\u200F שניהם';
      }
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${vehicle.description || 'רכב'}${purchaseDate} - שווי:\u200F כ-${value} ש״ח${ownerText}`
        )
      );
    });
  }

  // חסכונות (Savings) - per lawyer: savings during marriage belong to both
  if (propertyData.savings && propertyData.savings.length > 0) {
    paragraphs.push(createSubsectionHeader('חסכונות'));
    paragraphs.push(...createPropertySummary('החסכונות', propertyData.savings));
    propertyData.savings.forEach((saving: any, index: number) => {
      const value = getPropertyValue(saving);
      // If individually registered, show as joint with registration note
      let ownerText = '';
      if (saving.owner && saving.owner !== 'שניהם') {
        ownerText = `, בבעלות שניהם (ע"ש:\u200F ${saving.owner})`;
      } else if (saving.owner === 'שניהם') {
        ownerText = ', בבעלות:\u200F שניהם';
      }
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${saving.description || 'חשבון חיסכון'} - סכום:\u200F כ-${value} ש״ח${ownerText}`
        )
      );
    });
  }

  // תנאים סוציאליים (Social Benefits) - per lawyer: benefits belong to both
  if (propertyData.benefits && propertyData.benefits.length > 0) {
    paragraphs.push(createSubsectionHeader('תנאים סוציאליים'));
    paragraphs.push(...createPropertySummary('התנאים הסוציאליים', propertyData.benefits));
    propertyData.benefits.forEach((benefit: any, index: number) => {
      const value = getPropertyValue(benefit);
      // If individually registered, show as joint with registration note
      let ownerText = '';
      if (benefit.owner && benefit.owner !== 'שניהם') {
        ownerText = `, בבעלות שניהם (ע"ש:\u200F ${benefit.owner})`;
      } else if (benefit.owner === 'שניהם') {
        ownerText = ', בבעלות:\u200F שניהם';
      }
      paragraphs.push(
        createNumberedItem(
          index + 1,
          `${benefit.description || 'זכויות סוציאליות'} - שווי:\u200F כ-${value} ש״ח${ownerText}`
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
          `${property.description || 'רכוש'} - שווי:\u200F כ-${value} ש״ח${owner}`
        )
      );
    });
  }

  // חובות (Debts) - updated with date/purpose per lawyer feedback
  if (propertyData.debts && propertyData.debts.length > 0) {
    paragraphs.push(createSubsectionHeader('חובות'));
    paragraphs.push(...createPropertySummary('החובות', propertyData.debts, true));
    propertyData.debts.forEach((debt: any, index: number) => {
      const amount = getPropertyValue(debt);
      const debtor = debt.debtor || debt.owner ? `, חייב:\u200F ${debt.debtor || debt.owner}` : '';
      // Add debt date and purpose if available
      const debtDate = debt.debtDate ? `, נלקח ביום:\u200F ${formatDate(debt.debtDate)}` : '';
      const debtPurpose = debt.debtPurpose ? `, למטרת:\u200F ${debt.debtPurpose}` : '';
      paragraphs.push(
        createNumberedItem(index + 1, `${debt.description || 'חוב'} - סכום:\u200F כ-${amount} ש״ח${debtDate}${debtPurpose}${debtor}`)
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

  // Log attachments for debugging
  if (attachments && attachments.length > 0) {
    console.log(`📎 Property claim received ${attachments.length} attachments`);
  } else {
    console.log(`ℹ️ Property claim received no attachments`);
  }

  // Extract gender terms with names
  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Extract data
  const wereMarried = basicInfo.relationshipType === 'married';
  const lawType = getLawType(wereMarried);
  const marriageStatus = getMarriageStatus(wereMarried);
  const propertyData = formData.property || formData;
  const children = formData.children || [];
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
          // ===== COURT HEADER WITH PARTY INFO =====
          ...createCourtHeader({
            city: 'בתל אביב',
            judgeName: 'שופט',
            basicInfo: basicInfo,
            showChildrenList: false, // Property claims don't show children list in header
          }),

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
                text: ` ${COURT_FEES_BY_PROCEDURE.property}₪. לפי תקנה א2 לתוספת הראשונה לתקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.\u200F`,
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

          // 1. Brief description - improved per lawyer feedback
          createNumberedHeader('1. תיאור תמציתי של בעלי הדין'),
          createBodyParagraph(
            (() => {
              const weddingDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '';
              const childrenText = children.length > 0
                ? `, במהלך הנישואין נולדו להם ${children.length} קטינים.`
                : '.';

              if (wereMarried && weddingDate) {
                return `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} נישאו ביום ${weddingDate}${childrenText}`;
              } else if (wereMarried) {
                return `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} נישאו${childrenText}`;
              } else {
                return `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2}${children.length > 0 ? `, להם נולדו ${children.length} ילדים.` : '.'}`;
              }
            })()
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

          // 3. Summary of facts - includes marriage date per lawyer feedback
          createNumberedHeader('3. תמצית העובדות הנחוצות לביסוסה של עילת התביעה ומתי נולדה'),
          createBodyParagraph(
            basicInfo.weddingDay
              ? `בני הזוג נישאו ביום ${formatDate(basicInfo.weddingDay)}. המשטר הרכושי החל על בני הזוג הינו ${lawType}.`
              : `המשטר הרכושי החל על בני הזוג הינו ${lawType}.`
          ),
          createBodyParagraph(`כבוד בית המשפט מתבקש לאזן הרכוש שווה בשווה לפי ${lawType}.`),

          // 4. Jurisdiction
          createNumberedHeader('4. פירוט העובדות המקנות סמכות לבית המשפט'),
          createBodyParagraph(
            'המדובר בענייני משפחה ובבני משפחה לפי חוק בית המשפט לענייני משפחה, תשנה – 1995.',
            { after: SPACING.SECTION }
          ),

          // ===== SECTION C: DETAILED FACTS =====
          createSectionHeader('חלק ג - פירוט העובדות המבססות את טענות ' + plaintiff.title),

          // Relationship (standardized format)
          createSubsectionHeader('מערכת היחסים'),
          createRelationshipSection(basicInfo, formData, children),

          // Property
          createSubsectionHeader('הרכוש'),
          ...formatPropertySection(formData),

          // Employment
          createSubsectionHeader('השתכרות הצדדים'),
          ...(() => {
            const property = propertyData;
            const hasApplicantInfo = property.applicantEmploymentStatus || property.applicantEmployer || property.applicantGrossSalary || property.applicantGrossIncome;
            const hasRespondentInfo = property.respondentEmploymentStatus || property.respondentEmployer || property.respondentGrossSalary || property.respondentGrossIncome;

            if (!hasApplicantInfo && !hasRespondentInfo) {
              return [createBodyParagraph('פרטי תעסוקה לא צוינו')];
            }

            const paragraphs: any[] = [];

            // Applicant employment
            if (hasApplicantInfo) {
              let applicantText = `${basicInfo.fullName}: `;

              if (property.applicantEmploymentStatus === 'employee') {
                applicantText += 'שכיר/ה';
                if (property.applicantEmployer) {
                  applicantText += `, מועסק/ת אצל ${property.applicantEmployer}`;
                }
                if (property.applicantGrossSalary) {
                  applicantText += `, שכר ברוטו: ${property.applicantGrossSalary.toLocaleString('he-IL')} ₪`;
                }
              } else if (property.applicantEmploymentStatus === 'selfEmployed') {
                applicantText += 'עצמאי/ת';
                if (property.applicantGrossIncome) {
                  applicantText += `, הכנסה ברוטו: ${property.applicantGrossIncome.toLocaleString('he-IL')} ₪`;
                }
              } else if (property.applicantEmploymentStatus === 'unemployed') {
                applicantText += 'לא עובד/ת כיום';
              }

              paragraphs.push(createBodyParagraph(applicantText));
            }

            // Respondent employment
            if (hasRespondentInfo) {
              let respondentText = `${basicInfo.fullName2}: `;

              if (property.respondentEmploymentStatus === 'employee') {
                respondentText += 'שכיר/ה';
                if (property.respondentEmployer) {
                  respondentText += `, מועסק/ת אצל ${property.respondentEmployer}`;
                }
                if (property.respondentGrossSalary) {
                  respondentText += `, שכר ברוטו: ${property.respondentGrossSalary.toLocaleString('he-IL')} ₪`;
                }
              } else if (property.respondentEmploymentStatus === 'selfEmployed') {
                respondentText += 'עצמאי/ת';
                if (property.respondentGrossIncome) {
                  respondentText += `, הכנסה ברוטו: ${property.respondentGrossIncome.toLocaleString('he-IL')} ₪`;
                }
              } else if (property.respondentEmploymentStatus === 'unemployed') {
                respondentText += 'לא עובד/ת כיום';
              }

              paragraphs.push(createBodyParagraph(respondentText));
            }

            return paragraphs;
          })(),

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

              // Financial disclosure - updated per lawyer feedback
              createNumberedItem(
                4 + offset,
                `${plaintiff.title} ${basicInfo.gender === 'male' ? 'מבקש' : 'מבקשת'} מ${defendant.title} למסור דו״ח מרוכז בדבר כלל הזכויות הסוציאליות והכספים בבעלות${defendant.possessive}, בכל גוף רלוונטי.`
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
          ...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature, 'רכושית'),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== תצהיר (AFFIDAVIT) =====
          ...generateAffidavit(basicInfo, formData, lawyerSignature),

          // ===== נספחים (ATTACHMENTS) - if any =====
          ...(attachments && attachments.length > 0
            ? [
                createPageBreak(),
                ...generateAttachmentsSection(attachments, estimatePageCount(formData).tocPage)
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
  paragraphs.push(createSectionHeader('1. פרטים אישיים:'));
  paragraphs.push(createSubsectionHeader(`${plaintiff.title}:`));
  paragraphs.push(createInfoLine('שם משפחה', basicInfo.fullName.split(' ').slice(-1)[0] || basicInfo.fullName));
  paragraphs.push(createInfoLine('שם פרטי', basicInfo.fullName.split(' ').slice(0, -1).join(' ') || basicInfo.fullName));
  paragraphs.push(createInfoLine('מס\' זהות', basicInfo.idNumber));
  paragraphs.push(createInfoLine('תאריך לידה', basicInfo.birthDate || 'לא צוין'));
  paragraphs.push(createInfoLine('כתובת מגורים', basicInfo.address));
  paragraphs.push(createInfoLine('טל\' בבית', basicInfo.phone));
  paragraphs.push(createInfoLine('טל\' נייד', basicInfo.phone));
  paragraphs.push(createInfoLine('מקום עבודה', 'לא צוין'));
  paragraphs.push(createInfoLine('טל\' עבודה', 'לא צוין'));
  paragraphs.push(createInfoLine('כתובת עבודה', 'לא צוין'));
  paragraphs.push(createInfoLine('שם עורך הדין', 'עו"ד אריאל דרור'));
  paragraphs.push(createInfoLine('טל\' עורך דין', '03-6389500'));
  paragraphs.push(createInfoLine('מען עורך הדין', 'רחוב ז\'בוטינסקי 7, רמת גן'));

  paragraphs.push(createSubsectionHeader('בן/בת הזוג:'));
  paragraphs.push(createInfoLine('שם משפחה', basicInfo.fullName2.split(' ').slice(-1)[0] || basicInfo.fullName2));
  paragraphs.push(createInfoLine('שם פרטי', basicInfo.fullName2.split(' ').slice(0, -1).join(' ') || basicInfo.fullName2));
  paragraphs.push(createInfoLine('מס\' זהות', basicInfo.idNumber2));
  paragraphs.push(createInfoLine('תאריך לידה', basicInfo.birthDate2 || 'לא צוין'));
  paragraphs.push(createInfoLine('כתובת מגורים', basicInfo.address2));
  paragraphs.push(createInfoLine('טל\' בבית', basicInfo.phone2));
  paragraphs.push(createInfoLine('טל\' נייד', basicInfo.phone2));
  paragraphs.push(createInfoLine('מקום עבודה', 'לא צוין'));
  paragraphs.push(createInfoLine('טל\' עבודה', 'לא צוין'));
  paragraphs.push(createInfoLine('כתובת עבודה', 'לא צוין'));
  paragraphs.push(createInfoLine('שם עורך הדין', 'לא צוין'));
  paragraphs.push(createInfoLine('טל\' עורך דין', 'לא צוין'));
  paragraphs.push(createInfoLine('מען עורך הדין', 'לא צוין'));

  // Section 2: Marital Status
  paragraphs.push(createSectionHeader('2. פרטים לגבי המצב האישי:'));
  paragraphs.push(createSubsectionHeader(`${plaintiff.name}:`));
  paragraphs.push(createInfoLine('תאריך הנישואים הנוכחיים', basicInfo.weddingDay || 'לא צוין'));
  paragraphs.push(createInfoLine('נישואין קודמים', yesNo(formData.marriedBefore)));
  paragraphs.push(createInfoLine(`האם ל${plaintiff.name} יש ילדים מנישואים קודמים`, yesNo(formData.hadChildrenFromPrevious)));

  paragraphs.push(createSubsectionHeader(`${defendant.name}:`));
  paragraphs.push(createInfoLine('תאריך הנישואים הנוכחיים', basicInfo.weddingDay || 'לא צוין'));
  paragraphs.push(createInfoLine('נישואין קודמים', yesNo(formData.marriedBefore2)));
  paragraphs.push(createInfoLine(`האם ל${defendant.name} יש ילדים מנישואים קודמים`, yesNo(formData.hadChildrenFromPrevious2)));
  paragraphs.push(createBodyParagraph('(בסעיף זה – נישואין לרבות ברית זוגיות.)', { after: SPACING.PARAGRAPH }));

  // Section 3: Children
  paragraphs.push(createSectionHeader('3. ילדים:'));
  if (children.length > 0) {
    children.forEach((child: Child, index: number) => {
      paragraphs.push(createSubsectionHeader(`ילד/ה ${index + 1}:`));
      paragraphs.push(createInfoLine('שם', `${child.firstName} ${child.lastName}`));
      paragraphs.push(createInfoLine('תאריך לידה', child.birthDate));
      paragraphs.push(createInfoLine('שם ההורה (שאינו המבקש)', 'לא צוין'));
      paragraphs.push(createInfoLine('מקום מגורי הילד', child.address || 'לא צוין'));
    });
  } else {
    paragraphs.push(createBodyParagraph('אין ילדים'));
  }

  // Section 4: Housing
  paragraphs.push(createSectionHeader('4. פרטים לגבי דירת המגורים:'));
  paragraphs.push(createInfoLine(`הדירה שבה גר/ה ${plaintiff.title} היא`, formData.applicantHomeType ? translateHousingType(formData.applicantHomeType) : 'לא צוין'));
  paragraphs.push(createInfoLine('הדירה שבה גר/ה בן/בת הזוג היא', formData.partnerHomeType ? translateHousingType(formData.partnerHomeType) : 'לא צוין'));

  // Section 5: Domestic Violence
  paragraphs.push(createSectionHeader('5. נתונים על אלימות במשפחה:'));
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

  // Section 6: Other Family Cases
  paragraphs.push(createSectionHeader('6. נתונים על תיקים אחרים בענייני המשפחה בין בני הזוג שנידונו או נידונים בבית משפט:'));
  paragraphs.push(createBodyParagraph('(פרט לגבי כל תיק נפרד)'));
  if (formData.otherFamilyCases && Array.isArray(formData.otherFamilyCases) && formData.otherFamilyCases.length > 0) {
    formData.otherFamilyCases.forEach((caseItem: any, index: number) => {
      paragraphs.push(createSubsectionHeader(`תיק ${index + 1}:`));
      paragraphs.push(createInfoLine('מס\' תיק', caseItem.caseNumber || 'לא צוין'));
      paragraphs.push(createInfoLine('בפני מי נדון התיק', caseItem.court || 'לא צוין'));
      paragraphs.push(createInfoLine('מתי הסתיים הדיון', caseItem.status || 'לא צוין'));
      paragraphs.push(createInfoLine('מהות התיק', caseItem.caseType || 'לא צוין'));
    });
  } else {
    paragraphs.push(createBodyParagraph('אין תיקים אחרים'));
  }

  // Section 7: Therapeutic Contact
  paragraphs.push(createSectionHeader('7. קשר עם גורמים טיפוליים:'));
  paragraphs.push(createBodyParagraph('האם היית/ם בקשר עם:'));
  paragraphs.push(createInfoLine('מחלקת הרווחה', yesNo(formData.contactedWelfare)));
  paragraphs.push(createInfoLine('ייעוץ נישואין', yesNo(formData.contactedMarriageCounseling)));
  paragraphs.push(createInfoLine('ייעוץ משפחתי', yesNo(formData.contactedFamilyCounseling)));
  paragraphs.push(createInfoLine('גישור', yesNo(formData.contactedMediation)));
  paragraphs.push(createBodyParagraph('האם את/ה מוכנ/ה לקחת חלק ב:'));
  paragraphs.push(createInfoLine('ייעוץ משפחתי', yesNo(formData.willingToJoinFamilyCounseling)));
  paragraphs.push(createInfoLine('גישור', yesNo(formData.willingToJoinMediation)));

  // Section 8: Declaration
  paragraphs.push(createSectionHeader('8. הצהרה'));
  paragraphs.push(createBodyParagraph(`אני ${basicInfo.fullName} מצהיר/ה כי לפי מיטב ידיעתי הפרטים שמילאתי בטופס נכונים.`));

  // Add spacing before signature section
  paragraphs.push(new Paragraph({
    children: [],
    spacing: { before: SPACING.SECTION },
  }));

  // Client signature
  if (signature) {
    paragraphs.push(createSignatureImage(signature, 250, 125));
  } else {
    // Signature placeholder if no signature provided
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: '___________________',
          size: FONT_SIZES.BODY,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SPACING.PARAGRAPH, after: SPACING.MINIMAL },
      bidirectional: true,
    }));
  }

  // Signature label
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `חתימת ${plaintiff.title}`,
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

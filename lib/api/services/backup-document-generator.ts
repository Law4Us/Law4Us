/**
 * Backup Document Generator
 *
 * Generates a comprehensive Q&A document with all user responses
 * for lawyer reference and backup purposes
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData, ClaimType } from '@/lib/api/types';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  createMainTitle,
  createSectionHeader,
  createSubsectionHeader,
  createBodyParagraph,
  createInfoLine,
} from './shared-document-generators';

interface BackupDocumentData {
  basicInfo: BasicInfo;
  formData: FormData;
  selectedClaims: ClaimType[];
  submittedAt: string;
}

/**
 * Translate common English values to Hebrew
 */
function translateToHebrew(value: string): string {
  const translations: Record<string, string> = {
    // Common yes/no variations
    yes: 'כן',
    no: 'לא',
    'Yes': 'כן',
    'No': 'לא',

    // Gender
    male: 'זכר',
    female: 'נקבה',

    // Relationship types
    married: 'נשוי/ה',
    commonLaw: 'ידועים בציבור',

    // Job types
    employee: 'שכיר',
    selfEmployed: 'עצמאי',
    unemployed: 'לא עובד/ת',

    // Property agreement types
    equalSplit: 'חלוקה שווה',
    customSplit: 'חלוקה מותאמת אישית',
    noSplit: 'ללא חלוקה',

    // Custody agreement types
    jointCustody: 'משמורת משותפת',
    soleCustody: 'משמורת בלעדית',
    customArrangement: 'הסדר מותאם אישית',

    // Alimony agreement types
    noAlimony: 'ללא מזונות',
    specificAmount: 'סכום קבוע',

    // Court proceedings
    'not yet': 'עדיין לא',
    'in progress': 'בתהליך',
    completed: 'הושלם',
  };

  return translations[value] || value;
}

/**
 * Format any value to a readable string in Hebrew
 */
function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '---';
  }

  if (typeof value === 'boolean') {
    return value ? 'כן' : 'לא';
  }

  if (typeof value === 'string') {
    // Try to format as date if it looks like one
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        return formatDate(value);
      } catch {
        return value;
      }
    }

    // Translate common English values to Hebrew
    const translated = translateToHebrew(value);
    return translated;
  }

  if (typeof value === 'number') {
    return value.toLocaleString('he-IL');
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '---';
    return value.map((v, i) => `${i + 1}. ${formatValue(v)}`).join('\n');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

/**
 * Get Hebrew label for claim type
 */
function getClaimLabel(claimType: ClaimType): string {
  const labels: Record<ClaimType, string> = {
    disputeResolution: 'בקשה ליישוב סכסוך',
    property: 'תביעה רכושית',
    custody: 'תביעת משמורת',
    alimony: 'תביעת מזונות',
    divorce: 'תביעת גירושין',
    divorceAgreement: 'הסכם גירושין',
    shalomBayit: 'תביעה לשלום בית',
    divorceRabbinical: 'תביעת גירושין (בית דין רבני)',
  };
  return labels[claimType] || claimType;
}

/**
 * Table width constants (matching other claim generators)
 */
const TABLE_WIDTH = convertInchesToTwip(6.5); // 6.5 inches leaves comfortable margins
const QUESTION_WIDTH = Math.round(TABLE_WIDTH * 0.35); // 35% for question
const ANSWER_WIDTH = TABLE_WIDTH - QUESTION_WIDTH; // 65% for answer

/**
 * Create a simple two-column table for Q&A
 */
function createQARow(question: string, answer: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: question,
                font: 'David',
                size: FONT_SIZES.BODY,
                bold: true,
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { before: 100, after: 100 },
            bidirectional: true,
          }),
        ],
        width: { size: QUESTION_WIDTH, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: answer,
                font: 'David',
                size: FONT_SIZES.BODY,
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { before: 100, after: 100 },
            bidirectional: true,
          }),
        ],
        width: { size: ANSWER_WIDTH, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
      }),
    ],
  });
}

/**
 * Create properly configured Q&A table (matching other claim generators)
 */
function createQATable(rows: TableRow[]): Table {
  return new Table({
    rows,
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [QUESTION_WIDTH, ANSWER_WIDTH],
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
    visuallyRightToLeft: true, // RTL support
  });
}

/**
 * Generate backup Q&A document
 */
export async function generateBackupDocument(data: BackupDocumentData): Promise<Buffer> {
  const { basicInfo, formData, selectedClaims, submittedAt } = data;

  console.log('📋 Generating backup Q&A document...');

  const paragraphs: (Paragraph | Table)[] = [];

  // ========== TITLE ==========
  paragraphs.push(createMainTitle('גיבוי מידע - תשובות מלאות'));
  paragraphs.push(
    createBodyParagraph(
      'מסמך זה מכיל את כל התשובות שהמשתמש מילא בשאלון, לצורך עיון והשלמה',
      { after: SPACING.SECTION }
    )
  );

  // ========== METADATA ==========
  paragraphs.push(createSectionHeader('פרטי הגשה'));
  paragraphs.push(createInfoLine('תאריך הגשה', formatDate(submittedAt)));
  paragraphs.push(
    createInfoLine('תביעות שנבחרו', selectedClaims.map(getClaimLabel).join(', '))
  );
  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.SECTION },
    })
  );

  // ========== BASIC INFO - PART 1 ==========
  paragraphs.push(createSectionHeader('פרטים אישיים - מבקש/ת'));

  const basicInfoTable1 = createQATable([
    createQARow('שם מלא', basicInfo.fullName || '---'),
    createQARow('מספר תעודת זהות', basicInfo.idNumber || '---'),
    createQARow('כתובת', basicInfo.address || '---'),
    createQARow('טלפון', basicInfo.phone || '---'),
    createQARow('דוא"ל', basicInfo.email || '---'),
    createQARow('תאריך לידה', formatValue(basicInfo.birthDate)),
    createQARow('מגדר', formatValue(basicInfo.gender)),
  ]);

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.MINIMAL },
    })
  );

  // Tables must be added directly, not wrapped in paragraphs
  paragraphs.push(basicInfoTable1);

  // ========== BASIC INFO - PART 2 ==========
  paragraphs.push(createSectionHeader('פרטים אישיים - משיב/ה'));

  const basicInfoTable2 = createQATable([
    createQARow('שם מלא', basicInfo.fullName2 || '---'),
    createQARow('מספר תעודת זהות', basicInfo.idNumber2 || '---'),
    createQARow('כתובת', basicInfo.address2 || '---'),
    createQARow('טלפון', basicInfo.phone2 || '---'),
    createQARow('דוא"ל', basicInfo.email2 || '---'),
    createQARow('תאריך לידה', formatValue(basicInfo.birthDate2)),
    createQARow('מגדר', formatValue(basicInfo.gender2)),
  ]);

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.MINIMAL },
    })
  );

  paragraphs.push(basicInfoTable2);

  // ========== RELATIONSHIP INFO ==========
  paragraphs.push(createSectionHeader('פרטי קשר'));

  const relationshipRows = [
    createQARow('סטטוס מערכת יחסים', formatValue(basicInfo.relationshipType)),
  ];

  if (basicInfo.weddingDay) {
    relationshipRows.push(createQARow('תאריך נישואין', formatValue(basicInfo.weddingDay)));
  }

  const relationshipTable = createQATable(relationshipRows);

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.MINIMAL },
    })
  );

  paragraphs.push(relationshipTable);

  // ========== CHILDREN ==========
  if (formData.children && formData.children.length > 0) {
    paragraphs.push(createSectionHeader('ילדים'));

    formData.children.forEach((child: any, index: number) => {
      paragraphs.push(createSubsectionHeader(`ילד/ה ${index + 1}`));

      const childRows = [
        createQARow('שם פרטי', child.firstName || '---'),
        createQARow('שם משפחה', child.lastName || '---'),
        createQARow('תעודת זהות', child.idNumber || '---'),
        createQARow('תאריך לידה', formatValue(child.birthDate)),
        createQARow('כתובת', child.address || '---'),
        createQARow('שם ההורה השני', child.nameOfParent || '---'),
      ];

      if (child.childRelationship) {
        childRows.push(createQARow('תיאור מערכת יחסים', child.childRelationship));
      }

      const childTable = createQATable(childRows);

      paragraphs.push(
        new Paragraph({
          children: [],
          spacing: { after: SPACING.MINIMAL },
        })
      );

      paragraphs.push(childTable);
    });
  }

  // ========== GLOBAL QUESTIONS ==========
  paragraphs.push(createSectionHeader('שאלות כלליות'));

  const globalRows = [];

  if (formData.livingSeparately) {
    globalRows.push(createQARow('האם גרים בנפרד?', formatValue(formData.livingSeparately)));
  }

  if (formData.separationDate) {
    globalRows.push(createQARow('תאריך הפרדה', formatValue(formData.separationDate)));
  }

  if (formData.courtProceedings) {
    globalRows.push(createQARow('הליכים משפטיים', formatValue(formData.courtProceedings)));
  }

  if (formData.contactedWelfare) {
    globalRows.push(createQARow('פנייה לרווחה', formatValue(formData.contactedWelfare)));
  }

  if (formData.contactedMarriageCounseling) {
    globalRows.push(
      createQARow('פנייה לייעוץ זוגי', formatValue(formData.contactedMarriageCounseling))
    );
  }

  if (formData.willingToJoinFamilyCounseling) {
    globalRows.push(
      createQARow('נכונות לטיפול משפחתי', formatValue(formData.willingToJoinFamilyCounseling))
    );
  }

  if (formData.willingToJoinMediation) {
    globalRows.push(createQARow('נכונות לגישור', formatValue(formData.willingToJoinMediation)));
  }

  if (globalRows.length > 0) {
    const globalTable = createQATable(globalRows);

    paragraphs.push(
      new Paragraph({
        children: [],
        spacing: { after: SPACING.MINIMAL },
      })
    );

    paragraphs.push(globalTable);
  }

  // ========== CLAIM-SPECIFIC DATA ==========

  // Property claim
  if (selectedClaims.includes('property') && formData.property) {
    paragraphs.push(createSectionHeader('תביעה רכושית'));

    const propData = formData.property;
    const propRows = [];

    // Add employment info
    if (propData.applicantEmploymentStatus) {
      propRows.push(
        createQARow('מצב תעסוקתי (מבקש/ת)', formatValue(propData.applicantEmploymentStatus))
      );
    }
    if (propData.applicantGrossSalary) {
      propRows.push(createQARow('משכורת ברוטו (מבקש/ת)', `₪${formatValue(propData.applicantGrossSalary)}`));
    }
    if (propData.respondentEmploymentStatus) {
      propRows.push(
        createQARow('מצב תעסוקתי (משיב/ה)', formatValue(propData.respondentEmploymentStatus))
      );
    }
    if (propData.respondentGrossSalary) {
      propRows.push(
        createQARow('משכורת ברוטו (משיב/ה)', `₪${formatValue(propData.respondentGrossSalary)}`)
      );
    }

    if (propRows.length > 0) {
      const propTable = createQATable(propRows);

      paragraphs.push(
        new Paragraph({
          children: [],
          spacing: { after: SPACING.MINIMAL },
        })
      );

      paragraphs.push(propTable);
    }

    // Assets
    if (propData.apartments && propData.apartments.length > 0) {
      paragraphs.push(createSubsectionHeader('דירות'));
      propData.apartments.forEach((apt: any, i: number) => {
        const aptRows = [
          createQARow(`דירה ${i + 1} - תיאור`, formatValue(apt.description)),
          createQARow('שווי', `₪${formatValue(apt.value)}`),
          createQARow('בעלים', formatValue(apt.owner)),
          createQARow('תאריך רכישה', formatValue(apt.purchaseDate)),
        ];
        const aptTable = createQATable(aptRows);
        paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
        paragraphs.push(aptTable);
      });
    }

    if (propData.vehicles && propData.vehicles.length > 0) {
      paragraphs.push(createSubsectionHeader('כלי רכב'));
      propData.vehicles.forEach((vehicle: any, i: number) => {
        const vehicleRows = [
          createQARow(`רכב ${i + 1} - תיאור`, formatValue(vehicle.description)),
          createQARow('שווי', `₪${formatValue(vehicle.value)}`),
          createQARow('בעלים', formatValue(vehicle.owner)),
          createQARow('תאריך רכישה', formatValue(vehicle.purchaseDate)),
        ];
        const vehicleTable = createQATable(vehicleRows);
        paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
        paragraphs.push(vehicleTable);
      });
    }
  }

  // Custody claim
  if (selectedClaims.includes('custody') && formData.custody) {
    paragraphs.push(createSectionHeader('תביעת משמורת'));

    const custodyRows = [
      createQARow('מצב מגורים נוכחי', formatValue(formData.custody.currentLivingArrangement)),
      createQARow('מאז מתי', formatValue(formData.custody.sinceWhen)),
      createQARow('הסדר ביקורים נוכחי', formatValue(formData.custody.currentVisitationArrangement)),
      createQARow('מי צריך משמורת ולמה', formatValue(formData.custody.whoShouldHaveCustody)),
      createQARow('הסדר מבוקש', formatValue(formData.custody.requestedArrangement)),
      createQARow('למה לא ההורה השני', formatValue(formData.custody.whyNotOtherParent)),
    ];

    const custodyTable = createQATable(custodyRows);

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(custodyTable);
  }

  // Alimony claim
  if (selectedClaims.includes('alimony') && formData.alimony) {
    paragraphs.push(createSectionHeader('תביעת מזונות'));

    // Fallback chain for narrative text
    const alimonyNarrativeText =
      formData.relationshipDescription ||
      formData['divorce.whoWantsDivorceAndWhy'] ||
      formData['shalomBayit.crisisReasons'] ||
      '';

    const alimonyRows = [
      createQARow('תיאור מערכת יחסים', formatValue(alimonyNarrativeText)),
      createQARow('מזונות קודמים', formatValue(formData.alimony.wasPreviousAlimony)),
      createQARow('יש חשבונות בנק', formatValue(formData.alimony.hasBankAccounts)),
      createQARow('יש רכב', formatValue(formData.alimony.hasVehicle)),
      createQARow('פרטי רכב', formatValue(formData.alimony.vehicleDetails)),
    ];

    const alimonyTable = createQATable(alimonyRows);

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(alimonyTable);
  }

  // Divorce claim
  if (selectedClaims.includes('divorce') && formData.divorce) {
    paragraphs.push(createSectionHeader('תביעת גירושין'));

    // Fallback chain for narrative text
    const divorceNarrativeText =
      formData.relationshipDescription ||
      formData['divorce.whoWantsDivorceAndWhy'] ||
      '';

    const divorceRows = [
      createQARow('תיאור מערכת יחסים', formatValue(divorceNarrativeText)),
      createQARow('מי רוצה גירושין ולמה', formatValue(formData.divorce.whoWantsDivorceAndWhy)),
      createQARow('עיר נישואין', formatValue(formData.divorce.weddingCity)),
      createQARow('נישואין דתיים', formatValue(formData.divorce.religiousMarriage)),
      createQARow('מועצה דתית', formatValue(formData.divorce.religiousCouncil)),
      createQARow('תלונות במשטרה', formatValue(formData.divorce.policeComplaints)),
      createQARow('סיבות לגירושין', formatValue(formData.divorce.divorceReasons)),
      createQARow('גישור קודם', formatValue(formData.divorce.hadPreviousMediation)),
      createQARow('פרטי גישור', formatValue(formData.divorce.previousMediationDetails)),
      createQARow('פרטי טיפול זוגי', formatValue(formData.divorce.marriageCounselingDetails)),
      createQARow('סכום כתובה', formatValue(formData.divorce.ketubahAmount)),
      createQARow('בקשה לכתובה', formatValue(formData.divorce.ketubahRequest)),
    ];

    const divorceTable = createQATable(divorceRows);

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(divorceTable);
  }

  // Divorce agreement
  if (selectedClaims.includes('divorceAgreement') && formData.divorceAgreement) {
    paragraphs.push(createSectionHeader('הסכם גירושין'));

    const agreementRows = [
      createQARow('הסדר רכוש', formatValue(formData.divorceAgreement.propertyAgreement)),
      createQARow('פירוט רכוש', formatValue(formData.divorceAgreement.propertyCustom)),
      createQARow('הסדר משמורת', formatValue(formData.divorceAgreement.custodyAgreement)),
      createQARow('פירוט משמורת', formatValue(formData.divorceAgreement.custodyCustom)),
      createQARow('לוח ביקורים', formatValue(formData.divorceAgreement.visitationSchedule)),
      createQARow('הסדר מזונות', formatValue(formData.divorceAgreement.alimonyAgreement)),
      createQARow('סכום מזונות', `₪${formatValue(formData.divorceAgreement.alimonyAmount)}`),
      createQARow('תנאים נוספים', formatValue(formData.divorceAgreement.additionalTerms)),
    ];

    const agreementTable = createQATable(agreementRows);

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(agreementTable);
  }

  // ========== CREATE DOCUMENT ==========
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  console.log('✅ Backup Q&A document generated');

  return await Packer.toBuffer(doc);
}

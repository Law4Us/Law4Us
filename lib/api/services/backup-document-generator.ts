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
 * Format any value to a readable string
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
    return value;
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
    property: 'תביעה רכושית',
    custody: 'תביעת משמורת',
    alimony: 'תביעת מזונות',
    divorce: 'תביעת גירושין',
    divorceAgreement: 'הסכם גירושין',
  };
  return labels[claimType] || claimType;
}

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
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
            bidirectional: true,
          }),
        ],
        width: { size: 40, type: WidthType.PERCENTAGE },
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
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
            bidirectional: true,
          }),
        ],
        width: { size: 60, type: WidthType.PERCENTAGE },
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
 * Generate backup Q&A document
 */
export async function generateBackupDocument(data: BackupDocumentData): Promise<Buffer> {
  const { basicInfo, formData, selectedClaims, submittedAt } = data;

  console.log('📋 Generating backup Q&A document...');

  const paragraphs: Paragraph[] = [];

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

  const basicInfoTable1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createQARow('שם מלא', basicInfo.fullName || '---'),
      createQARow('מספר תעודת זהות', basicInfo.idNumber || '---'),
      createQARow('כתובת', basicInfo.address || '---'),
      createQARow('טלפון', basicInfo.phone || '---'),
      createQARow('דוא"ל', basicInfo.email || '---'),
      createQARow('תאריך לידה', formatValue(basicInfo.birthDate)),
      createQARow('מגדר', basicInfo.gender === 'male' ? 'זכר' : 'נקבה'),
    ],
  });

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.MINIMAL },
    })
  );

  paragraphs.push(new Paragraph({ children: [basicInfoTable1] }));

  // ========== BASIC INFO - PART 2 ==========
  paragraphs.push(createSectionHeader('פרטים אישיים - משיב/ה'));

  const basicInfoTable2 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createQARow('שם מלא', basicInfo.fullName2 || '---'),
      createQARow('מספר תעודת זהות', basicInfo.idNumber2 || '---'),
      createQARow('כתובת', basicInfo.address2 || '---'),
      createQARow('טלפון', basicInfo.phone2 || '---'),
      createQARow('דוא"ל', basicInfo.email2 || '---'),
      createQARow('תאריך לידה', formatValue(basicInfo.birthDate2)),
      createQARow('מגדר', basicInfo.gender2 === 'male' ? 'זכר' : 'נקבה'),
    ],
  });

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.MINIMAL },
    })
  );

  paragraphs.push(new Paragraph({ children: [basicInfoTable2] }));

  // ========== RELATIONSHIP INFO ==========
  paragraphs.push(createSectionHeader('פרטי קשר'));

  const relationshipRows = [
    createQARow(
      'סטטוס מערכת יחסים',
      basicInfo.relationshipType === 'married'
        ? 'נשוי/ה'
        : basicInfo.relationshipType === 'commonLaw'
        ? 'ידועים בציבור'
        : 'לא צוין'
    ),
  ];

  if (basicInfo.weddingDay) {
    relationshipRows.push(createQARow('תאריך נישואין', formatValue(basicInfo.weddingDay)));
  }

  const relationshipTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: relationshipRows,
  });

  paragraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: SPACING.MINIMAL },
    })
  );

  paragraphs.push(new Paragraph({ children: [relationshipTable] }));

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

      const childTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: childRows,
      });

      paragraphs.push(
        new Paragraph({
          children: [],
          spacing: { after: SPACING.MINIMAL },
        })
      );

      paragraphs.push(new Paragraph({ children: [childTable] }));
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
    const globalTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: globalRows,
    });

    paragraphs.push(
      new Paragraph({
        children: [],
        spacing: { after: SPACING.MINIMAL },
      })
    );

    paragraphs.push(new Paragraph({ children: [globalTable] }));
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
      const propTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: propRows,
      });

      paragraphs.push(
        new Paragraph({
          children: [],
          spacing: { after: SPACING.MINIMAL },
        })
      );

      paragraphs.push(new Paragraph({ children: [propTable] }));
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
        const aptTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: aptRows,
        });
        paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
        paragraphs.push(new Paragraph({ children: [aptTable] }));
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
        const vehicleTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: vehicleRows,
        });
        paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
        paragraphs.push(new Paragraph({ children: [vehicleTable] }));
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

    const custodyTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: custodyRows,
    });

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(new Paragraph({ children: [custodyTable] }));
  }

  // Alimony claim
  if (selectedClaims.includes('alimony') && formData.alimony) {
    paragraphs.push(createSectionHeader('תביעת מזונות'));

    const alimonyRows = [
      createQARow('תיאור מערכת יחסים', formatValue(formData.alimony.relationshipDescription)),
      createQARow('מזונות קודמים', formatValue(formData.alimony.wasPreviousAlimony)),
      createQARow('יש חשבונות בנק', formatValue(formData.alimony.hasBankAccounts)),
      createQARow('יש רכב', formatValue(formData.alimony.hasVehicle)),
      createQARow('פרטי רכב', formatValue(formData.alimony.vehicleDetails)),
    ];

    const alimonyTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: alimonyRows,
    });

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(new Paragraph({ children: [alimonyTable] }));
  }

  // Divorce claim
  if (selectedClaims.includes('divorce') && formData.divorce) {
    paragraphs.push(createSectionHeader('תביעת גירושין'));

    const divorceRows = [
      createQARow('תיאור מערכת יחסים', formatValue(formData.divorce.relationshipDescription)),
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

    const divorceTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: divorceRows,
    });

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(new Paragraph({ children: [divorceTable] }));
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

    const agreementTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: agreementRows,
    });

    paragraphs.push(new Paragraph({ children: [], spacing: { after: SPACING.MINIMAL } }));
    paragraphs.push(new Paragraph({ children: [agreementTable] }));
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

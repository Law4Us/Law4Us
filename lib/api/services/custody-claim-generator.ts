/**
 * Custody Claim Document Generator (תביעת משמורת)
 * Generates structured custody claim documents with AI-enhanced text transformation
 * WITH PROPER FORMATTING AND RTL SUPPORT
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
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData } from '@/lib/api/types';
import { transformToLegalLanguage, TransformContext } from './groq-service';
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

interface CustodyClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer; // Client signature (base64 or Buffer)
  lawyerSignature?: string | Buffer; // Lawyer signature with stamp (base64 or Buffer)
}

/**
 * Get gendered term for plaintiff (person 1)
 * CUSTODY-SPECIFIC: Uses "מבקש/ת" instead of "תובע/ת"
 */
function getPlaintiffTerm(gender?: 'male' | 'female', name?: string): {
  title: string;
  pronoun: string;
  possessive: string;
  name: string;
} {
  if (gender === 'male') {
    return { title: 'המבקש', pronoun: 'הוא', possessive: 'שלו', name: name || 'המבקש' };
  }
  return { title: 'המבקשת', pronoun: 'היא', possessive: 'שלה', name: name || 'המבקשת' };
}

/**
 * Get gendered term for defendant (person 2)
 * CUSTODY-SPECIFIC: Uses "משיב/ה" instead of "נתבע/ת"
 */
function getDefendantTerm(gender?: 'male' | 'female', name?: string): {
  title: string;
  pronoun: string;
  possessive: string;
  name: string;
} {
  if (gender === 'male') {
    return { title: 'המשיב', pronoun: 'הוא', possessive: 'שלו', name: name || 'המשיב' };
  }
  return { title: 'המשיבה', pronoun: 'היא', possessive: 'שלה', name: name || 'המשיבה' };
}

/**
 * Local wrapper for court header with children list for custody claims
 */
function localCreateCourtHeader(data: CustodyClaimData): Paragraph[] {
  const custodyData = data.formData.custody || {};
  const propertyData = data.formData.property || data.formData;
  const children = data.formData.children || [];
  const minorChildren = children.filter((child: any) => isMinor(child.birthDate || ''));

  return createCourtHeader({
    city: 'בתל אביב',
    judgeName: 'שמעון כהן',
    basicInfo: data.basicInfo,
    children: minorChildren.map((c: any) => ({
      name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'קטין',
      idNumber: c.idNumber || '',
    })),
    showChildrenList: true, // Custody claims show children list
  });
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

function formatChildNamesList(children: any[]): string {
  if (!children || children.length === 0) {
    return '';
  }
  return children
    .map((child: any) => `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'הקטין/ה')
    .join(children.length > 1 ? ', ' : '');
}

/**
 * Generate custody claim document
 */
export async function generateCustodyClaim(data: CustodyClaimData): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature } = data;

  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Extract custody data
  const custodyData = formData.custody || {};
  const propertyData = formData.property || formData;
  // Children are now in global formData.children (shared across all claims)
  const children = formData.children || [];

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
        children: [
          // ===== HEADER (court header with party info and children list) =====
          ...localCreateCourtHeader(data),

          // ===== TITLE =====
          createMainTitle('תביעת משמורת'),

          // ===== INTRODUCTION =====
          createBodyParagraph(
            `${plaintiff.title} מתכבד${plaintiff.title === 'המבקשת' ? 'ת' : ''} להגיש לכבוד בית המשפט את כתב התביעה בעניין משמורת הקטינים.`
          ),

          // ===== COURT FEE =====
          new Paragraph({
            children: [
              new TextRun({
                text: 'סכום אגרת בית משפט:\u200F ',
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
              new TextRun({
                text: '388₪ לפי סעיף 6ב לתוספת הראשונה לתקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.',
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
          }),

          // ===== ADDITIONAL PROCEEDINGS =====
          new Paragraph({
            children: [
              new TextRun({
                text: 'הליכים נוספים ככל שיש:\u200F',
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                size: FONT_SIZES.BODY,
                font: 'David',
                rightToLeft: true,
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
          }),

          // ===== SUMMONS (MAJOR SECTION) =====
          createSectionHeader('הזמנה לדין:\u200F'),
          createBodyParagraph(
            `הואיל ו${plaintiff.title} הגיש${plaintiff.title === 'המבקשת' ? 'ה' : ''} כתב תביעה זה נגדך, אתה מוזמן להגיש כתב הגנה בתוך שלושים ימים מיום שהומצאה לך הזמנה זו, לפי תקנה 13(א) לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.`
          ),
          createBodyParagraph(
            `לתשומת לבך, אם לא תגיש כתב הגנה אזי לפי תקנה 130 לתקנות סדר הדין האזרחי, התשע"ט-2018, תהיה ל${plaintiff.title} הזכות לקבל פסק דין שלא בפניך.`,
            { after: SPACING.SECTION }
          ),

          // ===== SECTION B: MAIN ARGUMENTS =====
          createSectionHeader('חלק ב: עיקר הטענות'),

          createNumberedHeader('1. תיאור תמציתי של בעלי הדין'),
          ...createPartiesDescription(basicInfo, formData, plaintiff, defendant),

          createNumberedHeader('2. פירוט הסעד המבוקש באופן תמציתי'),
          createNumberedItem(1, 'למנות פקיד סעד שיתן תסקיר.'),
          createNumberedItem(2, 'לקבוע הסדרי ראיה, וחלוקת זמנים בפועל, לפי טובת הילדים.'),
          createNumberedItem(3, 'ליתן סעדים זמנים, ככל שבית המשפט יחשוב שזה עולה בקנה אחד עם טובת הילדים.'),

          // Section C: Facts
          createSectionHeader('חלק ג: פירוט העובדות המבססות את טענות ' + plaintiff.title),

          ...(await createFactsSection(basicInfo, formData, children, custodyData, plaintiff, defendant)),

          // Remedies
          createSectionHeader('סעדים'),
          createNumberedItem(1, 'למנות פקיד סעד שיתן תסקיר.'),
          createNumberedItem(2, 'לקבוע הסדרי ראיה, וחלוקת זמנים בפועל, לפי טובת הילדים.'),
          createNumberedItem(3, 'ליתן סעדים זמנים, ככל שבית המשפט יחשוב שזה עולה בקנה אחד עם טובת הילדים.'),

          // ===== LAWYER SIGNATURE AT END OF MAIN CLAIM (LEFT-aligned) =====
          ...(lawyerSignature
            ? [createSignatureImage(lawyerSignature, 300, 150, AlignmentType.LEFT)]
            : []),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== הרצאת פרטים (FORM 3 - STATEMENT OF DETAILS) =====
          ...generateStatementOfDetails(basicInfo, formData, signature as string),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== ייפוי כוח (POWER OF ATTORNEY) =====
          ...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature, 'משמורת'),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== תצהיר (AFFIDAVIT) =====
          ...generateAffidavit(basicInfo, formData, lawyerSignature),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Format child bullet for parties description
 */
function formatChildBullet(child: any): string {
  const address = child.address || child.street || 'לא צוין';
  return `שם:\u200F ${child.firstName} ${child.lastName} ת״ז:\u200F ${child.idNumber} ת״ל:\u200F ${child.birthDate} כתובת:\u200F ${address}`;
}

/**
 * Create parties description - FOR CUSTODY: Show parents info + only קטינים (minors)
 */
function createPartiesDescription(
  basicInfo: BasicInfo,
  formData: any,
  plaintiff: ReturnType<typeof getPlaintiffTerm>,
  defendant: ReturnType<typeof getDefendantTerm>
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Get children data
  const custodyData = formData.custody || {};
  const propertyData = formData.property || formData;
  const children = formData.children || [];

  // Filter only minors (קטינים)
  const minors = children.filter((child: any) => isMinor(child.birthDate));

  const wereMarried = basicInfo.relationshipType === 'married';
  const marriageDate = basicInfo.weddingDay
    ? new Date(basicInfo.weddingDay).toLocaleDateString('he-IL')
    : 'לא צוין';

  const marriageStatus = wereMarried ? `נישאו ביום ${marriageDate}` : 'לא נישאו';
  const relationshipPhrase = wereMarried
    ? 'במהלך הנישואין נולדו להם'
    : 'ובמהלך הקשר נולדו להם';

  // Main description paragraph with MINORS count (קטינים, not ילדים)
  paragraphs.push(
    createBodyParagraph(
      `${plaintiff.name} מ״ז ${basicInfo.idNumber} ו${defendant.name} מ״ז ${basicInfo.idNumber2} ${marriageStatus}, ${relationshipPhrase} ${minors.length} ${minors.length === 1 ? 'קטין' : 'קטינים'}.`
    )
  );

  // List only MINORS with full details (bullet points)
  if (minors.length > 0) {
    minors.forEach((child: any) => {
      paragraphs.push(createBulletPoint(formatChildBullet(child)));
    });

    // If there's exactly ONE minor, define them as "הקטין" for later references
    if (minors.length === 1) {
      paragraphs.push(createBodyParagraph('להלן: "הקטין".'));
    }
  }

  return paragraphs;
}

/**
 * Create facts section with children details
 * NOW WITH GROQ AI TRANSFORMATION
 */
async function createFactsSection(
  basicInfo: BasicInfo,
  formData: any,
  children: any[],
  custodyData: any,
  plaintiff: ReturnType<typeof getPlaintiffTerm>,
  defendant: ReturnType<typeof getDefendantTerm>
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  // Relationship description (מערכת היחסים) - standardized format
  // Already includes all children information, so no separate children section needed
  const minorChildren = children.filter((child: any) => isMinor(child.birthDate || ''));

  // Determine term for minor(s): "הקטין" for one child, "הקטינים" for multiple
  const minorTerm = minorChildren.length === 1 ? 'הקטין' : 'הקטינים';

  paragraphs.push(createSubsectionHeader('מערכת היחסים'));
  paragraphs.push(createRelationshipSection(basicInfo, formData, minorChildren));

  // Add general relationship description if provided (with fallback chain)
  const narrativeText =
    formData.relationshipDescription ||
    formData['divorce.whoWantsDivorceAndWhy'] ||
    formData['shalomBayit.crisisReasons'] ||
    '';

  if (narrativeText) {
    console.log(`🤖 Transforming relationship description with Groq AI...`);
    try {
      const transformedRelationship = await transformToLegalLanguage(
        narrativeText,
        {
          claimType: 'תביעת משמורת',
          applicantName: plaintiff.name,
          respondentName: defendant.name,
          fieldLabel: 'תיאור מערכת היחסים',
        }
      );
      paragraphs.push(createBodyParagraph(transformedRelationship));
    } catch (error) {
      console.error('❌ Error transforming relationship description:', error);
      // Fallback to original text if transformation fails
      paragraphs.push(createBodyParagraph(narrativeText));
    }
  }

  // Add per-child relationship paragraphs with Groq AI transformation
  console.log(`\n📝 Processing individual child relationships...`);
  for (const child of minorChildren) {
    if (child.childRelationship && child.childRelationship.trim().length > 0) {
      const childName = `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'הקטין/ה';
      console.log(`  🤖 Transforming relationship with ${childName}...`);

      try {
        const transformedChildRelationship = await transformToLegalLanguage(
          child.childRelationship,
          {
            claimType: 'תביעת משמורת',
            applicantName: plaintiff.name,
            respondentName: defendant.name,
            fieldLabel: `מערכת היחסים עם ${childName}`,
            additionalContext: `תיאור מערכת היחסים של ${plaintiff.title} עם הקטין/ה ${childName}`,
          }
        );

        // Add child name as subsection header
        paragraphs.push(
          createSubsectionHeader(`מערכת היחסים עם ${childName}`)
        );

        // Add transformed relationship paragraph
        paragraphs.push(createBodyParagraph(transformedChildRelationship));

        console.log(`  ✅ Transformed relationship with ${childName}`);
      } catch (error) {
        console.error(`  ❌ Error transforming relationship with ${childName}:`, error);
        // Fallback to original text if transformation fails
        paragraphs.push(
          createSubsectionHeader(`מערכת היחסים עם ${childName}`)
        );
        paragraphs.push(createBodyParagraph(child.childRelationship));
      }
    }
  }

  // Current living arrangement (factual description)
  paragraphs.push(createSubsectionHeader('מצב מגורים נוכחי'));

  const currentLiving = custodyData.currentLivingArrangement;

  if (currentLiving === 'together') {
    paragraphs.push(createBodyParagraph(`${minorTerm} מתגורר${minorChildren.length === 1 ? '' : 'ים'} תחת קורת גג אחת, עם הוריהם.`));
  } else if (currentLiving === 'with_applicant') {
    let visitationText = '';
    if (custodyData.currentVisitationArrangement) {
      // Transform visitation text with Groq AI
      console.log(`🤖 Transforming visitation arrangement with Groq AI...`);
      try {
        const transformedVisitation = await transformToLegalLanguage(
          custodyData.currentVisitationArrangement,
          {
            claimType: 'תביעת משמורת',
            applicantName: plaintiff.name,
            respondentName: defendant.name,
            fieldLabel: `הסדרי ראיה עם ${defendant.title}`,
          }
        );
        visitationText = ` הסדרי הראיה עם ${defendant.title}: ${transformedVisitation}`;
      } catch (error) {
        console.error('❌ Error transforming visitation arrangement:', error);
        visitationText = ` הסדרי הראיה עם ${defendant.title}: ${custodyData.currentVisitationArrangement}`;
      }
    }
    paragraphs.push(createBodyParagraph(
      `${minorTerm} מתגורר${minorChildren.length === 1 ? '' : 'ים'} אצל ${plaintiff.title}.${visitationText}`
    ));
  } else if (currentLiving === 'with_respondent') {
    let visitationText = '';
    if (custodyData.currentVisitationArrangement) {
      // Transform visitation text with Groq AI
      console.log(`🤖 Transforming visitation arrangement with Groq AI...`);
      try {
        const transformedVisitation = await transformToLegalLanguage(
          custodyData.currentVisitationArrangement,
          {
            claimType: 'תביעת משמורת',
            applicantName: plaintiff.name,
            respondentName: defendant.name,
            fieldLabel: `הסדרי ראיה עם ${plaintiff.title}`,
          }
        );
        visitationText = ` הסדרי הראיה עם ${plaintiff.title}: ${transformedVisitation}`;
      } catch (error) {
        console.error('❌ Error transforming visitation arrangement:', error);
        visitationText = ` הסדרי הראיה עם ${plaintiff.title}: ${custodyData.currentVisitationArrangement}`;
      }
    }
    paragraphs.push(createBodyParagraph(
      `${minorTerm} מתגורר${minorChildren.length === 1 ? '' : 'ים'} אצל ${defendant.title}.${visitationText}`
    ));
  } else if (currentLiving === 'split') {
    let splitDetails = 'הזמן מתחלק בין שני ההורים';
    if (custodyData.splitArrangementDetails) {
      // Transform split arrangement details with Groq AI
      console.log(`🤖 Transforming split arrangement details with Groq AI...`);
      try {
        splitDetails = await transformToLegalLanguage(
          custodyData.splitArrangementDetails,
          {
            claimType: 'תביעת משמורת',
            applicantName: plaintiff.name,
            respondentName: defendant.name,
            fieldLabel: 'פירוט חלוקת הזמנים',
          }
        );
      } catch (error) {
        console.error('❌ Error transforming split arrangement:', error);
        splitDetails = custodyData.splitArrangementDetails;
      }
    }
    paragraphs.push(createBodyParagraph(
      `${minorTerm} מתגורר${minorChildren.length === 1 ? '' : 'ים'} חלק מהזמן אצל כל אחד מההורים. ${splitDetails}`
    ));
  } else if (currentLiving === 'split_children') {
    const applicantChildren = minorChildren.filter((child: any) => (child.residingWith || 'applicant') === 'applicant');
    const respondentChildren = minorChildren.filter((child: any) => child.residingWith === 'respondent');
    const sharedChildren = minorChildren.filter((child: any) => child.residingWith === 'both');

    const summaryParts: string[] = [];
    if (applicantChildren.length) {
      const names = formatChildNamesList(applicantChildren) || 'חלק מהילדים';
      summaryParts.push(
        `${names} מתגורר${applicantChildren.length > 1 ? 'ים' : ''} אצל ${plaintiff.title}`
      );
    }
    if (respondentChildren.length) {
      const names = formatChildNamesList(respondentChildren) || 'חלק מהילדים';
      summaryParts.push(
        `${names} מתגורר${respondentChildren.length > 1 ? 'ים' : ''} אצל ${defendant.title}`
      );
    }
    if (sharedChildren.length) {
      const names = formatChildNamesList(sharedChildren) || 'ילדים נוספים';
      summaryParts.push(
        `${names} מחלק${sharedChildren.length > 1 ? 'ים' : ''} את זמנם באופן שווה בין שני ההורים`
      );
    }

    const summaryText = summaryParts.length
      ? `${summaryParts.join('. ')}.`
      : 'הקטינים מחולקים בין ההורים באופן קבוע.';

    paragraphs.push(createBodyParagraph(summaryText));

    if (custodyData.splitChildrenDetails) {
      console.log(`🤖 Transforming split-children details with Groq AI...`);
      try {
        const transformedSplitChildrenDetails = await transformToLegalLanguage(
          custodyData.splitChildrenDetails,
          {
            claimType: 'תביעת משמורת',
            applicantName: plaintiff.name,
            respondentName: defendant.name,
            fieldLabel: 'פירוט מגורי הילדים',
          }
        );
        paragraphs.push(createBodyParagraph(transformedSplitChildrenDetails));
      } catch (error) {
        console.error('❌ Error transforming split-children details:', error);
        paragraphs.push(createBodyParagraph(custodyData.splitChildrenDetails));
      }
    }
  }

  // Add "since when" if provided
  if (custodyData.sinceWhen && currentLiving !== 'together') {
    const sinceDate = new Date(custodyData.sinceWhen).toLocaleDateString('he-IL');
    paragraphs.push(createBodyParagraph(`מצב זה החל מיום ${sinceDate}.`));
  }

  // Custody situation summary - Transform with Groq AI
  if (custodyData.whoShouldHaveCustody) {
    console.log(`🤖 Transforming custody summary with Groq AI...`);
    paragraphs.push(createSubsectionHeader('עולה מהאמור לעיל'));

    try {
      const transformedCustodySummary = await transformToLegalLanguage(
        custodyData.whoShouldHaveCustody,
        {
          claimType: 'תביעת משמורת',
          applicantName: plaintiff.name,
          respondentName: defendant.name,
          fieldLabel: 'עולה מהאמור לעיל - למה המשמורת צריכה להיות אצל המבקש/ת',
        }
      );
      paragraphs.push(createBodyParagraph(transformedCustodySummary));
    } catch (error) {
      console.error('❌ Error transforming custody summary:', error);
      // Fallback to original text if AI fails
      paragraphs.push(createBodyParagraph(custodyData.whoShouldHaveCustody));
    }
  }

  // Additional reason - why custody shouldn't be with other parent
  if (custodyData.whyNotOtherParent) {
    console.log(`🤖 Transforming "why not other parent" with Groq AI...`);

    try {
      const transformedWhyNot = await transformToLegalLanguage(
        custodyData.whyNotOtherParent,
        {
          claimType: 'תביעת משמורת',
          applicantName: plaintiff.name,
          respondentName: defendant.name,
          fieldLabel: 'למה המשמורת לא צריכה להיות אצל ההורה השני',
        }
      );
      paragraphs.push(createBodyParagraph(transformedWhyNot));
    } catch (error) {
      console.error('❌ Error transforming "why not other parent":', error);
      // Fallback to original text if AI fails
      paragraphs.push(createBodyParagraph(custodyData.whyNotOtherParent));
    }
  }

  // Legal section: Best Interest of the Child (עיקרון טובת הילד)
  paragraphs.push(
    createSubsectionHeader('ב. טובת הילד "עקרון על"')
  );

  paragraphs.push(
    createNumberedItem(
      3,
      'כידוע, טובת הילד הוא "עיקרון העל" שמנחה את פסיקותיו של בית המשפט לענייני משפחה בכל החלטה הקשורה למצב הילד, לגורלו ועתידו החולש על ההכרעה בסוגיות הנוגעות לגורלו של הקטין לאחר פירוק התא המשפחתי בע"מ 10060/07 פלונית נ\' פלוני, פסקה 28; דנ"א 9201/08 פלוני נ\' פלונית.'
    )
  );

  paragraphs.push(
    createNumberedItem(
      4,
      'על עניין עקרון טובת הילד ניתן לעמוד על מהותו ברע"א 3411/16 פלוני נ\' משרד הרווחה ירושלים, (פסקאות 18-17) וכך נכתב בפסקאות 17-18 לפסק הדין:'
    )
  );

  paragraphs.push(
    createBodyParagraph(
      '"עיקרון טובת הילד משמיע לנו עוד מראשית פסיקתו של בית משפט זה כי הילד איננו אובייקט השייך להוריו, אלא הוא בעל אינטרסים וצרכים עצמאיים משלו [...] זהו עיקרון בעל \'רקמה פתוחה\', שאליה יוצקים בתי המשפט הדנים בעניינם של קטינים תוכן בהתאם לנסיבות המקרה. הוא \'נשקל בקפידה על ידי מעגלים שונים של שיקולים שבמרכזם הקטין. שיקולים חומריים-פיזיים-טבעיים, שיקולים רוחניים חברתיים, אתיים-מוסריים, שיקולי בריאות ושיקולים נפשיים, שיקולים בטווח המיידי ושיקולים לעתיד לבוא\' [...] ההכרעה מה יטיב עם הקטין היא מורכבת וסבוכה. זוהי מלאכה עדינה הדורשת איזון בין מכלול האינטרסים והפרמטרים של צרכי הקטין".'
    )
  );

  return paragraphs;
}

/**
 * Generate הרצאת פרטים (Form 3 - Statement of Details) paragraphs
 * Adapted for custody claims
 */
function generateStatementOfDetails(
  basicInfo: BasicInfo,
  formData: FormData,
  signature?: string
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);
  const custodyData = formData.custody || {};
  const propertyData = formData.property || formData;
  // Children are now in global formData.children (shared across all claims)
  const children = formData.children || [];

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
  paragraphs.push(createBodyParagraph(`מהות התובענה:\u200F משמורת`));
  paragraphs.push(createBodyParagraph(`מעמדו של ממלא הטופס:\u200F ${plaintiff.title}`));

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
  paragraphs.push(createBodyParagraph('(בסעיף זה – נישואין לרבות ברית זוגיות.)'));

  // Section 3: Children
  paragraphs.push(createSectionHeader('3. ילדים:'));
  if (children.length > 0) {
    children.forEach((child: any, index: number) => {
      paragraphs.push(createSubsectionHeader(`ילד/ה ${index + 1}:`));
      paragraphs.push(createInfoLine('שם', `${child.firstName || ''} ${child.lastName || ''}`));
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
  if (formData.protectionOrderRequested === 'yes' || formData.protectionOrderRequested === 'כן') {
    paragraphs.push(createInfoLine('אם כן – מתי', formData.protectionOrderDate || 'לא צוין'));
    paragraphs.push(createInfoLine('כנגד מי', formData.protectionOrderAgainst || 'לא צוין'));
    paragraphs.push(createInfoLine('מספר התיק', formData.protectionOrderCaseNumber || 'לא צוין'));
    paragraphs.push(createInfoLine('בפני מי נדון התיק', formData.protectionOrderJudge || 'לא צוין'));
    paragraphs.push(createInfoLine('האם ניתן צו הגנה', yesNo(formData.protectionOrderGiven)));
    if (formData.protectionOrderGiven === 'yes' || formData.protectionOrderGiven === 'כן') {
      paragraphs.push(createInfoLine('ניתן צו הגנה ביום', formData.protectionOrderGivenDate || 'לא צוין'));
      paragraphs.push(createInfoLine('תוכן הצו', formData.protectionOrderContent || 'לא צוין'));
    }
  }
  paragraphs.push(createBodyParagraph('האם היו בעבר אירועי אלימות שהוגשה בגללם תלונה למשטרה ולא הוגשה בקשה לצו הגנה?'));
  paragraphs.push(createInfoLine('', yesNo(formData.pastViolenceReported)));
  if (formData.pastViolenceReported === 'yes' || formData.pastViolenceReported === 'כן') {
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

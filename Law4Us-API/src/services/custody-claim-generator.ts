/**
 * Custody Claim Document Generator (תביעת משמורת)
 * Generates structured custody claim documents without LLM
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
import { transformToLegalLanguage, TransformContext } from './groq-service';

// Font sizes (in half-points)
const FONT_SIZES = {
  MAIN_TITLE: 40, // 20pt - for כתב תביעה
  SECTION: 32, // 16pt - for ב. עיקר הטענות, סעדים, etc.
  TITLE: 32, // 16pt - for court name
  SUBSECTION: 28, // 14pt - for תיאור בעלי הדין, etc.
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

interface CustodyClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer; // Client signature (base64 or Buffer)
  lawyerSignature?: string | Buffer; // Lawyer signature with stamp (base64 or Buffer)
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
 * Create section header (16pt, bold, underlined) - EXACT copy from property-claim-generator.ts
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
 * Create subsection header (14pt, bold, underlined) - EXACT copy from property-claim-generator.ts
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
 * Create numbered header (bold, larger, underlined) - EXACT copy from property-claim-generator.ts
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
 * Create body paragraph (12pt)
 */
function createBodyParagraph(
  text: string,
  spacing: { before?: number; after?: number } = {}
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: FONT_SIZES.BODY, // 12pt
        font: 'David',
        
      }),
    ],
    alignment: AlignmentType.START,
    spacing: {
      before: spacing.before || 0,
      after: spacing.after || SPACING.LINE,
      line: 360, // 1.5 line spacing (same as property claim)
    },
    bidirectional: true,
    
  });
}

/**
 * Create numbered item (EXACT copy from property-claim-generator.ts)
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
      right: convertInchesToTwip(0.25), // RIGHT indent for RTL!
    },
    bidirectional: true,
    
  });
}

/**
 * Create bullet point (EXACT copy from property-claim-generator.ts)
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
      right: convertInchesToTwip(0.25), // RIGHT indent for RTL!
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
 * Generate custody claim document
 */
export async function generateCustodyClaim(data: CustodyClaimData): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature } = data;

  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Extract custody data
  const custodyData = formData.custody || {};
  const propertyData = formData.property || formData;
  // Children can be either in custody.children or property.children (backwards compatibility)
  const children = custodyData.children || propertyData.children || [];

  // Format children list for header - bullet points with ID
  const formatChildForHeader = (child: any) => {
    const name = child.name || `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'קטין';
    const id = child.idNumber || '';
    return id ? `${name} ת״ז: ${id}` : name;
  };

  const childrenListForHeader = children.length > 0
    ? children.map(formatChildForHeader)
    : ['הקטינים'];

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
        children: [
          // ===== HEADER (now in children, not header section) =====
          createBodyParagraph('תאריך חתימת המסמך:\u200F'),

          // ===== COURT INFO =====
          createCenteredTitle('בבית המשפט לענייני משפחה', FONT_SIZES.TITLE),
          createCenteredTitle('תל"מ', FONT_SIZES.BODY),
          createCenteredTitle('בתל אביב', FONT_SIZES.BODY),

          // ===== IN THE MATTER OF =====
          createBodyParagraph('בעניין הקטינים:\u200F'),
          ...(childrenListForHeader.map(childText => createBulletPoint(childText))),
          new Paragraph({
            children: [new TextRun({ text: '', size: FONT_SIZES.BODY })],
            spacing: { after: SPACING.PARAGRAPH },
          }),

          // ===== PLAINTIFF =====
          createNumberedHeader(`${plaintiff.title}:\u200F`),
          createInfoLine('שם', basicInfo.fullName),
          createInfoLine('מספר זהות', basicInfo.idNumber),
          createInfoLine('כתובת', basicInfo.address),
          createBodyParagraph('באמצעות ב"כ עוה"ד אריאל דרור (מ"ר 31892)'),
          createBodyParagraph("מרח' אבא שאול 15, רמת גן"),
          createBodyParagraph('טל: 03-6951408   פקס: 03-6951683'),

          // ===== AGAINST =====
          createCenteredTitle('נגד', FONT_SIZES.HEADING_2),

          // ===== DEFENDANT =====
          createNumberedHeader(`${defendant.title}:\u200F`),
          createInfoLine('שם', basicInfo.fullName2),
          createInfoLine('מספר זהות', basicInfo.idNumber2),
          createInfoLine('טלפון', basicInfo.phone2),
          createInfoLine('דואר אלקטרוני', basicInfo.email2),

          // ===== TITLE =====
          createMainTitle('תביעת משמורת'),

          // ===== INTRODUCTION =====
          createBodyParagraph(
            `${plaintiff.title} מתכבד${plaintiff.title === 'התובעת' ? 'ת' : ''} להגיש לכבוד בית המשפט את כתב התביעה בעניין משמורת הקטינים.`
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
                
              }),
              new TextRun({
                text: '388₪ לפי סעיף 6ב לתוספת הראשונה לתקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.',
                size: FONT_SIZES.BODY,
                font: 'David',
                
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
                
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
            
          }),

          // ===== SUMMONS (MAJOR SECTION) =====
          createSectionHeader('הזמנה לדין:\u200F'),
          createBodyParagraph(
            `הואיל ו${plaintiff.title} הגיש${plaintiff.title === 'התובעת' ? 'ה' : ''} כתב תביעה זה נגדך, אתה מוזמן להגיש כתב הגנה בתוך שלושים ימים מיום שהומצאה לך הזמנה זו, לפי תקנה 13(א) לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.`
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

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== TABLE OF CONTENTS =====
          createSectionHeader('תוכן עניינים'),
          createBodyParagraph('1. הרצאת פרטים (טופס 3)'),
          createBodyParagraph('2. ייפוי כוח'),
          createBodyParagraph('3. תצהיר'),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Format child bullet for parties description (EXACT copy from property-claim-generator.ts)
 */
function formatChildBullet(child: any): string {
  const address = child.address || child.street || 'לא צוין';
  return `שם:\u200F ${child.firstName} ${child.lastName} ת״ז:\u200F ${child.idNumber} ת״ל:\u200F ${child.birthDate} כתובת:\u200F ${address}`;
}

/**
 * Check if a child is a minor (under 18 years old)
 */
function isMinor(birthDate: string): boolean {
  if (!birthDate) return true; // If no birthdate, assume minor for custody cases

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
  const children = custodyData.children || propertyData.children || [];

  // Filter only minors (קטינים)
  const minors = children.filter((child: any) => isMinor(child.birthDate));

  const wereMarried = basicInfo.relationshipType === 'married';
  const marriageDate = formData?.property?.marriageDate
    ? new Date(formData.property.marriageDate).toLocaleDateString('he-IL')
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

  // Marriage/relationship date
  const wereMarried = basicInfo.relationshipType === 'married';
  const marriageDate = formData?.property?.marriageDate
    ? new Date(formData.property.marriageDate).toLocaleDateString('he-IL')
    : 'לא צוין';

  paragraphs.push(
    createSubsectionHeader('תאריך נישואין'),
    createBodyParagraph(
      wereMarried
        ? `הצדדים נישאו ביום ${marriageDate}.`
        : `הצדדים חיו בידועים.`
    )
  );

  // Children section
  paragraphs.push(createSubsectionHeader('ילדים'));

  if (children.length > 0) {
    // Use for...of instead of forEach to support async/await
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      const birthDate = child.birthDate
        ? new Date(child.birthDate).toLocaleDateString('he-IL')
        : 'לא צוין';

      const childName = child.name || `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'לא צוין';
      const childAddress = child.address || 'לא צוין';

      // Bullet point with child details (matching template format)
      paragraphs.push(
        createBulletPoint(
          `שם: ${childName} ת״ז: ${child.idNumber || 'לא צוין'} ת״ל: ${birthDate} כתובת: ${childAddress}`
        )
      );

      // Name of other parent
      const otherParentName = plaintiff.name === basicInfo.fullName ? basicInfo.fullName2 : basicInfo.fullName;
      paragraphs.push(
        createBodyParagraph(`שם ההורה השני: ${otherParentName}`, { before: SPACING.MINIMAL, after: SPACING.MINIMAL })
      );

      // Transform relationship description with Groq AI
      const relationshipText = child.relationshipDescription || child.childRelationship;
      if (relationshipText) {
        console.log(`🤖 Transforming child relationship description with Groq AI...`);
        try {
          const transformedText = await transformToLegalLanguage(
            relationshipText,
            {
              claimType: 'תביעת משמורת',
              applicantName: plaintiff.name,
              respondentName: defendant.name,
              fieldLabel: `מערכת יחסים עם ${childName}`,
            }
          );
          paragraphs.push(createBodyParagraph(transformedText, { after: SPACING.PARAGRAPH }));
        } catch (error) {
          console.error('❌ Error transforming child relationship:', error);
          // Fallback to original text if AI fails
          paragraphs.push(createBodyParagraph(relationshipText, { after: SPACING.PARAGRAPH }));
        }
      }
    }
  } else {
    paragraphs.push(createBodyParagraph('לא צוינו ילדים.'));
  }

  // Current living arrangement (factual description)
  paragraphs.push(createSubsectionHeader('מצב מגורים נוכחי'));

  const currentLiving = custodyData.currentLivingArrangement;

  if (currentLiving === 'together') {
    paragraphs.push(createBodyParagraph('הקטינים מתגוררים תחת קורת גג אחת, עם הוריהם.'));
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
      `הקטינים מתגוררים אצל ${plaintiff.title}.${visitationText}`
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
      `הקטינים מתגוררים אצל ${defendant.title}.${visitationText}`
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
      `הקטינים מתגוררים חלק מהזמן אצל כל אחד מההורים. ${splitDetails}`
    ));
  }

  // Add "since when" if provided
  if (custodyData.sinceWhen && currentLiving !== 'together') {
    const sinceDate = new Date(custodyData.sinceWhen).toLocaleDateString('he-IL');
    paragraphs.push(createBodyParagraph(`מצב זה החל מיום ${sinceDate}.`));
  }

  // Custody situation summary - Transform with Groq AI
  if (custodyData.whoShouldHaveCustody) {
    console.log(`🤖 Transforming custody summary with Groq AI...`);
    paragraphs.push(createSubsectionHeader('סיכום מצב המשמורת'));

    try {
      const transformedCustodySummary = await transformToLegalLanguage(
        custodyData.whoShouldHaveCustody,
        {
          claimType: 'תביעת משמורת',
          applicantName: plaintiff.name,
          respondentName: defendant.name,
          fieldLabel: 'סיכום מצב המשמורת - למה המשמורת צריכה להיות אצל המבקש/ת',
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
  // Children can be either in custody.children or property.children
  const children = custodyData.children || propertyData.children || [];

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
  paragraphs.push(createBodyParagraph('(בסעיף זה – נישואין לרבות ברית זוגיות.)'));

  // Section 6: Children
  paragraphs.push(createSectionHeader('6. ילדים:'));
  if (children.length > 0) {
    children.forEach((child: any, index: number) => {
      paragraphs.push(createSubsectionHeader(`ילד/ה ${index + 1}:`));
      paragraphs.push(createInfoLine('שם מלא', `${child.firstName || ''} ${child.lastName || ''}`));
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
    `אני החתום מטה תז ${basicInfo.idNumber}, ${basicInfo.fullName} ממנה בזאת את עוה"ד אריאל דרור להיות ב"כ בענין הכנת תביעת משמורת.`
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
    'הכתוב דלעיל ביחיד יכלול את הרבים ולהפך.'
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
    'אני הח"מ אריאל דרור ת.ז 024081028, לאחר שהוזהרתי כי עלי לומר את האמת וכי אהיה צפוי לעונשים הקבועים בחוק, אם לא אעשה כן, מצהיר בזאת כדלקמן:'
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

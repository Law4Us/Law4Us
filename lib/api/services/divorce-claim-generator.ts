/**
 * Divorce Claim Document Generator (תביעת גירושין)
 * Generates structured divorce claim documents with proper formatting and RTL support
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
} from 'docx';
import { BasicInfo, FormData, Child, ClaimType } from '@/lib/api/types';
import { transformToLegalLanguage } from './groq-service';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  formatChildNaturally,
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
  generateAffidavit,
  generateAttachmentsSection,
} from './shared-document-generators';

interface DivorceClaimData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer; // Client signature (base64 or Buffer)
  lawyerSignature?: string | Buffer; // Lawyer signature with stamp (base64 or Buffer)
  attachments?: Array<{
    label: string;
    description: string;
    images: Buffer[];
  }>;
  selectedClaims?: ClaimType[];
}

const RELATED_CLAIM_LABELS: Partial<Record<ClaimType, string>> = {
  property: 'תביעה רכושית',
  alimony: 'תביעת מזונות',
  custody: 'תביעת משמורת',
};

function formatHebrewList(items: string[]): string {
  if (items.length <= 1) {
    return items[0] || '';
  }
  const head = items.slice(0, -1).join(', ');
  const tail = items[items.length - 1];
  return `${head} ו${tail}`;
}

function getRelatedClaimsNotice(selectedClaims?: ClaimType[]): string | null {
  if (!selectedClaims || selectedClaims.length === 0) {
    return null;
  }

  const related = selectedClaims
    .filter((claim) => claim !== 'divorce' && claim !== 'divorceAgreement')
    .map((claim) => RELATED_CLAIM_LABELS[claim])
    .filter((label): label is string => Boolean(label));

  if (related.length === 0) {
    return null;
  }

  const isPlural = related.length > 1;
  const list = formatHebrewList(related);
  return `בנוסף לכתב תביעה זה ${isPlural ? 'הוגשו' : 'הוגשה'} במקביל ${isPlural ? 'התביעות' : 'תביעה'} ${list} בכתבי תביעה נפרדים, המתנהלים במקביל להליך זה.`;
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
 * Format child details as bullet point
 */
function formatChildBullet(child: any): string {
  const address = child.address || child.street || 'לא צוין';
  return `שם:\u200F ${child.firstName} ${child.lastName} ת״ז:\u200F ${child.idNumber} ת״ל:\u200F ${child.birthDate} כתובת:\u200F ${address}`;
}

/**
 * Main export function - generates complete divorce claim document
 */
export async function generateDivorceClaim(data: DivorceClaimData): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature, attachments, selectedClaims } = data;

  // Log attachments for debugging
  if (attachments && attachments.length > 0) {
    console.log(`📎 Divorce claim received ${attachments.length} attachments`);
  } else {
    console.log(`ℹ️ Divorce claim received no attachments`);
  }

  // Extract gender terms with names
  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Extract divorce-specific data
  const divorceData = formData.divorce || {};
  const children = formData.children || [];
  const weddingDate = basicInfo.weddingDay || '';
  const marriageStatus = basicInfo.relationshipType === 'married' ? 'נשואים' : 'לא נשואים';

  // Transform free-text fields to legal language using GROQ AI
  console.log('🤖 Transforming divorce grounds to legal language...');

  let groundsForDivorce = '';
  if (divorceData.whoWantsDivorceAndWhy) {
    try {
      groundsForDivorce = await transformToLegalLanguage(divorceData.whoWantsDivorceAndWhy, {
        claimType: 'תביעת גירושין',
        applicantName: basicInfo.fullName,
        respondentName: basicInfo.fullName2,
        fieldLabel: 'הרקע לבקשת הגירושין',
        additionalContext: 'סיבות ורקע לבקשת הגירושין',
      });
    } catch (error) {
      console.error('Error transforming grounds for divorce:', error);
      groundsForDivorce = divorceData.whoWantsDivorceAndWhy;
    }
  }

  let divorceReasons = '';
  if (divorceData.divorceReasons) {
    try {
      divorceReasons = await transformToLegalLanguage(divorceData.divorceReasons, {
        claimType: 'תביעת גירושין',
        applicantName: basicInfo.fullName,
        respondentName: basicInfo.fullName2,
        fieldLabel: 'עילות הגירושין',
        additionalContext: 'סיבות משפטיות לגירושין',
      });
    } catch (error) {
      console.error('Error transforming divorce reasons:', error);
      divorceReasons = divorceData.divorceReasons;
    }
  }

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
            showChildrenList: false, // Divorce claims don't show children list in header
          }),

          // ===== TITLE =====
          createMainTitle('כתב תביעה'),

          // ===== NATURE OF CLAIM =====
          new Paragraph({
            children: [
              new TextRun({
                text: 'מהות התביעה:\u200F גירושין',
                bold: true,
                size: FONT_SIZES.BODY,
                font: 'David',
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.LINE, line: 360 },
            bidirectional: true,
          }),

          // שווי נושא התובענה
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
                text: ' לא קצוב.\u200F',
                size: FONT_SIZES.BODY,
                font: 'David',
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.LINE, line: 360 },
            bidirectional: true,
          }),

          // סכום אגרת בית משפט
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
                text: ' בית המשפט הנכבד מתבקש להורות על פירוק הנישואין בין הצדדים וליתן כל סעד כמבוקש בסיפא של תביעה זאת.\u200F',
                size: FONT_SIZES.BODY,
                font: 'David',
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
          }),

          ...(getRelatedClaimsNotice(selectedClaims)
            ? [createBodyParagraph(getRelatedClaimsNotice(selectedClaims))]
            : []),

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
            `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} הינם ${marriageStatus}${weddingDate ? `, נישאו ביום ${formatDate(weddingDate)}` : ''}${children.length > 0 ? `, ולהם ${children.length === 1 ? 'ילד אחד' : `${children.length} ילדים`}` : ''}.`
          ),

          // Children list
          ...(children.length > 0
            ? children.map((child: any) => createBulletPoint(formatChildBullet(child)))
            : []),

          // 2. Summary of requested remedy
          createNumberedHeader('2. פירוט הסעד המבוקש באופן תמציתי'),
          createBodyParagraph(
            'בית המשפט הנכבד מתבקש להורות על פירוק הנישואין בין הצדדים ולקבוע את מלוא הסעדים המבוקשים בתביעה זו.\u200F'
          ),

          // 3. Summary of facts
          createNumberedHeader('3. תמצית העובדות הנחוצות לביסוסה של עילת התביעה'),
          createBodyParagraph(
            `הצדדים ${marriageStatus}${weddingDate ? ` מאז ${formatDate(weddingDate)}` : ''}. במהלך הנישואין התגוררו ${plaintiff.title} ו${defendant.title} יחד, אך מערכת היחסים התדרדרה עד כדי התמוטטות מוחלטת. ${plaintiff.title} מבקש/ת להתגרש מ${defendant.title} מהסיבות שיפורטו בהמשך.\u200F`
          ),

          // 4. Jurisdiction
          createNumberedHeader('4. פירוט העובדות המקנות סמכות לבית המשפט'),
          createBodyParagraph(
            'המדובר בענייני משפחה ובבני משפחה לפי חוק בית המשפט לענייני משפחה, תשנ״ה – 1995. בית המשפט לענייני משפחה מוסמך לדון בתביעות גירושין.',
            { after: SPACING.SECTION }
          ),

          // ===== SECTION C: DETAILED FACTS =====
          createSectionHeader('חלק ג - פירוט העובדות המבססות את טענות ' + plaintiff.title),

          // Relationship (standardized format - uses shared function)
          createSubsectionHeader('מערכת היחסים'),
          createRelationshipSection(basicInfo, formData, children),

          // Grounds for divorce
          ...(groundsForDivorce
            ? [
                createSubsectionHeader('הרקע לבקשת הגירושין'),
                createBodyParagraph(groundsForDivorce),
              ]
            : []),

          // Divorce reasons (legal grounds)
          ...(divorceReasons
            ? [
                createSubsectionHeader('עילות הגירושין'),
                createBodyParagraph(divorceReasons),
              ]
            : []),

          // Marriage details
          ...(divorceData.weddingCity || divorceData.religiousMarriage
            ? [
                createSubsectionHeader('פרטי הנישואין'),
                ...(divorceData.weddingCity
                  ? [createBodyParagraph(`הנישואין נערכו בעיר ${divorceData.weddingCity}.`)]
                  : []),
                ...(divorceData.religiousMarriage === 'כן'
                  ? [
                      createBodyParagraph('הנישואין נערכו בטקס דתי.'),
                      ...(divorceData.religiousCouncil
                        ? [createBodyParagraph(`הצדדים רשומים במועצה הדתית ${divorceData.religiousCouncil}.`)]
                        : []),
                    ]
                  : divorceData.religiousMarriage === 'לא'
                  ? [createBodyParagraph('הנישואין לא נערכו בטקס דתי.')]
                  : []),
              ]
            : []),

          // Police complaints (if any)
          ...(divorceData.policeComplaints === 'כן'
            ? [
                createSubsectionHeader('תלונות במשטרה'),
                createBodyParagraph(
                  `${divorceData.policeComplaintsWho ? `${divorceData.policeComplaintsWho} ` : ''}הגיש/ה תלונות במשטרה${divorceData.policeComplaintsWhere ? ` ב${divorceData.policeComplaintsWhere}` : ''}${divorceData.policeComplaintsDate ? ` ביום ${divorceData.policeComplaintsDate}` : ''}.`
                ),
                ...(divorceData.policeComplaintsOutcome
                  ? [createBodyParagraph(`תוצאות ההליך: ${divorceData.policeComplaintsOutcome}`)]
                  : []),
              ]
            : []),

          // Mediation history (if any)
          ...(divorceData.hadPreviousMediation === 'כן' && divorceData.previousMediationDetails
            ? [
                createSubsectionHeader('נסיונות גישור קודמים'),
                createBodyParagraph(divorceData.previousMediationDetails),
              ]
            : []),

          // Marriage counseling/therapy details (if any)
          ...(divorceData.marriageCounselingDetails
            ? [
                createSubsectionHeader('טיפול משפחתי וייעוץ זוגי'),
                createBodyParagraph(divorceData.marriageCounselingDetails),
              ]
            : []),

          // Ketubah (if religious marriage)
          ...(divorceData.religiousMarriage === 'כן' && (divorceData.ketubahAmount || divorceData.ketubahRequest)
            ? [
                createSubsectionHeader('כתובה'),
                ...(divorceData.ketubahAmount
                  ? [createBodyParagraph(`סכום הכתובה: ${divorceData.ketubahAmount}`)]
                  : []),
                ...(divorceData.ketubahRequest
                  ? [createBodyParagraph(`בקשה בעניין הכתובה: ${divorceData.ketubahRequest}`)]
                  : []),
              ]
            : []),

          // ===== REMEDIES SECTION =====
          createSectionHeader('סעדים'),
          createBodyParagraph('אשר על כן מתבקש בית המשפט הנכבד:'),
          createNumberedItem(1, 'להורות על פירוק הנישואין בין הצדדים.'),
          createNumberedItem(2, 'לקבוע את ההסדרים הנדרשים לגבי הילדים, ככל שישנם קטינים משותפים.'),
          createNumberedItem(3, 'לקבוע את ההסדרים הנדרשים לגבי הרכוש והחובות, ככל שלא הוסדרו.'),
          createNumberedItem(4, 'לחייב את הנתבע/ת בהוצאות המשפט ושכר טרחת עו"ד.'),
          createNumberedItem(5, 'ליתן כל סעד אחר שבית המשפט ימצא לנכון.'),

          // ===== SIGNATURE =====
          new Paragraph({
            children: [],
            spacing: { before: SPACING.SECTION, after: SPACING.LINE },
          }),
          ...(signature
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'חתימת בא כוח: ',
                      size: FONT_SIZES.BODY,
                      font: 'David',
                    }),
                  ],
                  alignment: AlignmentType.START,
                  spacing: { after: SPACING.MINIMAL },
                  bidirectional: true,
                }),
                createSignatureImage(signature, 200, 80, AlignmentType.START),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'עו"ד אריאל דרור',
                      size: FONT_SIZES.BODY,
                      font: 'David',
                    }),
                  ],
                  alignment: AlignmentType.START,
                  spacing: { after: SPACING.SECTION },
                  bidirectional: true,
                }),
              ]
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '__________________',
                      size: FONT_SIZES.BODY,
                      font: 'David',
                    }),
                  ],
                  alignment: AlignmentType.START,
                  spacing: { after: SPACING.MINIMAL },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'עו"ד אריאל דרור',
                      size: FONT_SIZES.BODY,
                      font: 'David',
                    }),
                  ],
                  alignment: AlignmentType.START,
                  spacing: { after: SPACING.SECTION },
                  bidirectional: true,
                }),
              ]),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== טופס 3 (FORM 3 - STATEMENT OF DETAILS) =====
          ...generateStatementOfDetails(basicInfo, formData, divorceData, signature as string),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== ייפוי כוח (POWER OF ATTORNEY) =====
          ...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature, 'גירושין'),

          // ===== PAGE BREAK =====
          createPageBreak(),

          // ===== תצהיר (AFFIDAVIT) =====
          ...generateAffidavit(basicInfo, formData, lawyerSignature),

          // ===== ATTACHMENTS (if any) =====
          ...(attachments && attachments.length > 0
            ? [createPageBreak(), ...generateAttachmentsSection(attachments, 0)]
            : []),
        ],
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Generate טופס 3 (Form 3 - Statement of Details) for divorce claim
 */
function generateStatementOfDetails(
  basicInfo: BasicInfo,
  formData: FormData,
  divorceData: any,
  signature?: string
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);
  const children = formData.children || [];

  // Title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'טופס 3 - הרצאת פרטים',
          size: FONT_SIZES.SECTION,
          font: 'David',
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: SPACING.SECTION },
      bidirectional: true,
    })
  );

  // 1. Personal Details
  paragraphs.push(
    createNumberedHeader('1. פרטי הצדדים'),
    createBodyParagraph(`${plaintiff.title}: ${basicInfo.fullName}, ת.ז ${basicInfo.idNumber}`),
    createBodyParagraph(`כתובת: ${basicInfo.address || 'לא צוין'}`),
    createBodyParagraph(`טלפון: ${basicInfo.phone || 'לא צוין'}`),
    createBodyParagraph(`דוא"ל: ${basicInfo.email || 'לא צוין'}`),
    new Paragraph({ children: [], spacing: { after: SPACING.LINE } }),
    createBodyParagraph(`${defendant.title}: ${basicInfo.fullName2}, ת.ז ${basicInfo.idNumber2}`),
    createBodyParagraph(`כתובת: ${basicInfo.address2 || 'לא צוין'}`),
    createBodyParagraph(`טלפון: ${basicInfo.phone2 || 'לא צוין'}`),
    createBodyParagraph(`דוא"ל: ${basicInfo.email2 || 'לא צוין'}`)
  );

  // 2. Marital Status
  paragraphs.push(
    createNumberedHeader('2. מצב משפחתי'),
    createBodyParagraph(
      `סטטוס נישואין: ${basicInfo.relationshipType === 'married' ? 'נשואים' : 'לא נשואים'}`
    ),
    ...(basicInfo.weddingDay
      ? [createBodyParagraph(`תאריך נישואין: ${formatDate(basicInfo.weddingDay)}`)]
      : []),
    ...(divorceData.weddingCity ? [createBodyParagraph(`מקום הנישואין: ${divorceData.weddingCity}`)] : []),
    ...(formData.separationDate
      ? [createBodyParagraph(`תאריך הפרדה: ${formatDate(formData.separationDate)}`)]
      : [])
  );

  // 3. Children
  if (children.length > 0) {
    paragraphs.push(
      createNumberedHeader('3. ילדים'),
      createBodyParagraph(`מספר ילדים: ${children.length}`)
    );

    children.forEach((child: any, index: number) => {
      paragraphs.push(
        createBodyParagraph(`\nילד ${index + 1}:`),
        createBodyParagraph(`שם: ${child.firstName} ${child.lastName}`),
        createBodyParagraph(`ת.ז: ${child.idNumber}`),
        createBodyParagraph(`תאריך לידה: ${child.birthDate}`),
        createBodyParagraph(`כתובת: ${child.address || 'לא צוין'}`)
      );
    });
  } else {
    paragraphs.push(createNumberedHeader('3. ילדים'), createBodyParagraph('אין ילדים משותפים.'));
  }

  // 4. Housing
  paragraphs.push(
    createNumberedHeader('4. מגורים'),
    createBodyParagraph(`האם גרים בנפרד: ${formData.livingSeparately === 'כן' ? 'כן' : 'לא'}`),
    ...(formData.separationDate
      ? [createBodyParagraph(`תאריך הפרדה: ${formatDate(formData.separationDate)}`)]
      : [])
  );

  // 5. Domestic Violence
  paragraphs.push(
    createNumberedHeader('5. אלימות במשפחה'),
    createBodyParagraph(
      divorceData.policeComplaints === 'כן'
        ? `הוגשו תלונות במשטרה: ${divorceData.policeComplaintsWho || ''} ${divorceData.policeComplaintsWhere || ''}`
        : 'לא הוגשו תלונות במשטרה.'
    )
  );

  // 6. Other family cases
  paragraphs.push(
    createNumberedHeader('6. הליכים משפטיים נוספים'),
    createBodyParagraph(formData.courtProceedings === 'yes' ? 'קיימים הליכים משפטיים נוספים.' : 'לא קיימים הליכים משפטיים נוספים.')
  );

  // 7. Therapeutic contact
  paragraphs.push(
    createNumberedHeader('7. פניה לגורמים טיפוליים'),
    createBodyParagraph(
      formData.contactedWelfare === 'yes' || formData.contactedMarriageCounseling === 'yes'
        ? 'הצדדים פנו לגורמים טיפוליים.'
        : 'הצדדים לא פנו לגורמים טיפוליים.'
    )
  );

  // 8. Declaration and signature
  paragraphs.push(
    createNumberedHeader('8. הצהרה'),
    createBodyParagraph(
      `אני הח"מ, ${basicInfo.fullName}, מצהיר/ה בזאת כי כל הפרטים שמסרתי לעיל הינם נכונים ומדויקים למיטב ידיעתי.`
    ),
    new Paragraph({ children: [], spacing: { before: SPACING.SECTION, after: SPACING.LINE } })
  );

  // Signature
  if (signature) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'חתימה: ',
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.START,
        spacing: { after: SPACING.MINIMAL },
        bidirectional: true,
      }),
      createSignatureImage(signature, 200, 80, AlignmentType.START),
      new Paragraph({
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
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `תאריך: ${formatDate(new Date().toISOString())}`,
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.START,
        bidirectional: true,
      })
    );
  } else {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'חתימה: __________________',
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.START,
        spacing: { after: SPACING.MINIMAL },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `תאריך: ${formatDate(new Date().toISOString())}`,
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.START,
        bidirectional: true,
      })
    );
  }

  return paragraphs;
}

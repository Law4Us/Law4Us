/**
 * Divorce Agreement Document Generator (הסכם גירושין) - COMPACT VERSION
 *
 * Features:
 * - Smart referencing: References other claims (property/custody/alimony) when they exist
 * - Structured format: Uses radio options instead of free-text for reliability
 * - Groq AI transformation: Transforms small custom text fields to legal language
 * - Compact output: Avoids redundancy with other submitted claims
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData } from '../types';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  formatChildNaturally,
  formatCurrency,
  isMinor,
  createSectionHeader,
  createSubsectionHeader,
  createBodyParagraph,
  createNumberedItem,
  createBulletPoint,
  createMainTitle,
  createCenteredTitle,
  createInfoLine,
  createPageBreak,
  createSignatureImage,
  createCourtHeader,
  createRelationshipSection,
  generatePowerOfAttorney,
  generateAffidavit,
  generateAttachmentsSection,
} from './shared-document-generators';
import { transformToLegalLanguage, TransformContext } from './groq-service';

interface DivorceAgreementData {
  basicInfo: BasicInfo;
  formData: FormData;
  applicantSignature?: string | Buffer;
  respondentSignature?: string | Buffer;
  lawyerSignature?: string | Buffer;
  attachments?: Array<{
    label: string;
    description: string;
    images: Buffer[];
  }>;
  selectedClaims?: string[]; // To detect if other claims exist
}

/**
 * Get gendered conjugation for parties
 */
function getGenderedTerms(gender1?: 'male' | 'female', gender2?: 'male' | 'female'): {
  applicantTerm: string;
  respondentTerm: string;
  pluralAgreed: string;
  pluralDeclare: string;
  pluralUnderstand: string;
} {
  const g1 = gender1 || 'male';
  const g2 = gender2 || 'male';
  const useMalePlural = g1 === 'male' || g2 === 'male';

  return {
    applicantTerm: g1 === 'male' ? 'בעל' : 'אישה',
    respondentTerm: g2 === 'male' ? 'בעל' : 'אישה',
    pluralAgreed: useMalePlural ? 'המסכימים' : 'המסכימות',
    pluralDeclare: useMalePlural ? 'מצהירים' : 'מצהירות',
    pluralUnderstand: useMalePlural ? 'מבינים' : 'מבינות',
  };
}

/**
 * Convert number to Hebrew letter (1 = א, 2 = ב, etc.)
 */
function numberToHebrewLetter(num: number): string {
  const letters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
  return letters[num - 1] || String(num);
}

/**
 * Get marriage duration text
 */
function getMarriageDuration(weddingDay?: string): string {
  if (!weddingDay) return '';

  const wedding = new Date(weddingDay);
  const today = new Date();
  const years = today.getFullYear() - wedding.getFullYear();

  if (years <= 0) return '';
  if (years === 1) return ' (נישואים בני שנה)';
  return ` (נישואים בני ${years} שנים)`;
}

/**
 * Generate divorce agreement document - COMPACT VERSION
 */
export async function generateDivorceAgreement(data: DivorceAgreementData): Promise<Buffer> {
  const {
    basicInfo,
    formData,
    applicantSignature,
    respondentSignature,
    lawyerSignature,
    attachments,
    selectedClaims = [],
  } = data;

  console.log('📝 Generating Compact Divorce Agreement Document...');

  const divorceData = formData.divorceAgreement || {};
  const propertyData = formData.property || {};
  const children = propertyData.children || [];
  const minors = children.filter((child: any) => isMinor(child.birthDate));

  const terms = getGenderedTerms(basicInfo.gender, basicInfo.gender2);

  // Detect if other claims exist
  const hasPropertyClaim = selectedClaims.includes('property');
  const hasCustodyClaim = selectedClaims.includes('custody');
  const hasAlimonyClaim = selectedClaims.includes('alimony');

  console.log(`📋 Other claims: Property=${hasPropertyClaim}, Custody=${hasCustodyClaim}, Alimony=${hasAlimonyClaim}`);

  // Context for Groq transformations
  const groqContext: Omit<TransformContext, 'fieldLabel' | 'additionalContext'> = {
    claimType: 'הסכם גירושין',
    applicantName: basicInfo.fullName || 'המבקש/ת',
    respondentName: basicInfo.fullName2 || 'המשיב/ה',
  };

  const paragraphs: Paragraph[] = [];

  // ========== 1. MAIN TITLE ==========
  // Note: This is an AGREEMENT (הסכם), not a CLAIM (תביעה)
  // Therefore, we don't use court header with plaintiff/defendant terminology
  paragraphs.push(createMainTitle('הסכם גירושין'));

  // ========== 2. PARTIES HEADER ==========
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'בין:',
          bold: true,
          size: FONT_SIZES.HEADING_2,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
      bidirectional: true,
    })
  );

  // Party 1 (Applicant)
  paragraphs.push(createInfoLine('שם מלא', basicInfo.fullName || ''));
  paragraphs.push(createInfoLine('ת.ז', basicInfo.idNumber || ''));
  paragraphs.push(createInfoLine('כתובת', basicInfo.address || ''));

  paragraphs.push(createCenteredTitle('לבין:', FONT_SIZES.HEADING_2));

  // Party 2 (Respondent)
  paragraphs.push(createInfoLine('שם מלא', basicInfo.fullName2 || ''));
  paragraphs.push(createInfoLine('ת.ז', basicInfo.idNumber2 || ''));
  paragraphs.push(createInfoLine('כתובת', basicInfo.address2 || ''));

  // ========== 3. REGARDING MINORS (if applicable) ==========
  if (minors.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `בעניין ${minors.length === 1 ? 'הקטין/ה' : 'הקטינים'}:`,
            bold: true,
            size: FONT_SIZES.HEADING_2,
            font: 'David',
            rightToLeft: true,
          }),
        ],
        alignment: AlignmentType.START,
        spacing: { before: SPACING.PARAGRAPH, after: SPACING.MINIMAL },
        bidirectional: true,
      })
    );

    minors.forEach((child: any) => {
      paragraphs.push(
        createBulletPoint(formatChildNaturally(child))
      );
    });

    paragraphs.push(
      new Paragraph({
        children: [],
        spacing: { after: SPACING.SECTION },
      })
    );
  }

  // ========== 4. OPENING STATEMENT ==========
  paragraphs.push(createSectionHeader('פתיח'));

  const weddingDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '__________';
  const marriageDuration = getMarriageDuration(basicInfo.weddingDay);

  paragraphs.push(
    createBodyParagraph(
      `${basicInfo.fullName} ו${basicInfo.fullName2} נישאו ביום ${weddingDate}${marriageDuration}.`
    )
  );

  // Use shared relationship section for consistency (all children, not just minors)
  const relationshipParagraph = createRelationshipSection(basicInfo, formData, children);
  paragraphs.push(relationshipParagraph);

  // Mutual agreement statement
  paragraphs.push(
    createBodyParagraph(
      `בני הזוג ${terms.pluralAgreed} בזאת להתגרש בהסכמה ולסיים את חיי הנישואין המשותפים ביניהם.`,
      { after: SPACING.SECTION }
    )
  );

  // ========== 5. AGREEMENT TERMS ==========
  paragraphs.push(createSectionHeader('תנאי ההסכם'));

  paragraphs.push(
    createBodyParagraph(
      `בני הזוג הגיעו להסכמות הבאות בכל הנושאים הקשורים לגירושיהם, והם ${terms.pluralDeclare} כי הסכמות אלה נעשו מרצון חופשי, ללא כפייה או לחץ, ומתוך הבנה מלאה של המשמעויות המשפטיות של ההסכם.`
    )
  );

  let sectionCounter = 0;

  // ========== SECTION A: PROPERTY DIVISION ==========
  sectionCounter++;
  paragraphs.push(createSubsectionHeader(`סעיף ${numberToHebrewLetter(sectionCounter)} - חלוקת רכוש`));

  const propertyAgreement = divorceData.propertyAgreement;

  if (propertyAgreement === 'referenceClaim' && hasPropertyClaim) {
    paragraphs.push(
      createBodyParagraph(
        'חלוקת הרכוש המשותף בין בני הזוג תתבצע כמפורט בתביעה הרכושית הנפרדת שהוגשה לבית המשפט.'
      )
    );
  } else if (propertyAgreement === 'eachKeepsOwn') {
    paragraphs.push(
      createBodyParagraph(
        'בני הזוג הסכימו כי כל צד שומר על הרכוש שברשותו ולא תהיה כל תביעה רכושית הדדית בין הצדדים.'
      )
    );
  } else if (propertyAgreement === 'equalSplit') {
    paragraphs.push(
      createBodyParagraph(
        'בני הזוג הסכימו על חלוקה שווה של כל הרכוש המשותף שנצבר במהלך הנישואין, לרבות נכסים, כלי רכב, חשבונות בנק וזכויות סוציאליות.'
      )
    );
  } else if (propertyAgreement === 'custom' && divorceData.propertyCustom) {
    // Transform user text with Groq
    console.log('🤖 Transforming property custom text with Groq...');
    const transformedText = await transformToLegalLanguage(divorceData.propertyCustom, {
      ...groqContext,
      fieldLabel: 'חלוקת רכוש',
      additionalContext: 'תיאור ההסכמה על חלוקת הרכוש המשותף',
    });
    paragraphs.push(createBodyParagraph(transformedText || divorceData.propertyCustom));
  } else {
    paragraphs.push(
      createBodyParagraph('בני הזוג הסכימו על הסדר חלוקת רכוש על-פי תנאים שהוסכמו ביניהם.')
    );
  }

  // ========== SECTION B: CUSTODY & VISITATION (if children exist) ==========
  if (minors.length > 0) {
    sectionCounter++;
    paragraphs.push(
      createSubsectionHeader(`סעיף ${numberToHebrewLetter(sectionCounter)} - משמורת והסדרי ראייה`)
    );

    const custodyAgreement = divorceData.custodyAgreement;
    const visitationAgreement = divorceData.visitationAgreement;

    // Custody
    if (custodyAgreement === 'referenceClaim' && hasCustodyClaim) {
      paragraphs.push(
        createBodyParagraph(
          'הסדרי המשמורת על הקטינים יהיו כמפורט בתביעת המשמורת הנפרדת שהוגשה לבית המשפט.'
        )
      );
    } else if (custodyAgreement === 'jointCustody') {
      paragraphs.push(
        createBodyParagraph(
          `בני הזוג הסכימו על משמורת משותפת על ${minors.length === 1 ? 'הקטין/ה' : 'הקטינים'}.`
        )
      );
    } else if (custodyAgreement === 'applicantCustody') {
      paragraphs.push(
        createBodyParagraph(
          `בני הזוג הסכימו כי משמורת מלאה על ${minors.length === 1 ? 'הקטין/ה' : 'הקטינים'} תהיה ל${basicInfo.fullName}.`
        )
      );
    } else if (custodyAgreement === 'respondentCustody') {
      paragraphs.push(
        createBodyParagraph(
          `בני הזוג הסכימו כי משמורת מלאה על ${minors.length === 1 ? 'הקטין/ה' : 'הקטינים'} תהיה ל${basicInfo.fullName2}.`
        )
      );
    } else if (custodyAgreement === 'custom' && divorceData.custodyCustom) {
      // Transform user text with Groq
      console.log('🤖 Transforming custody custom text with Groq...');
      const transformedText = await transformToLegalLanguage(divorceData.custodyCustom, {
        ...groqContext,
        fieldLabel: 'הסדר משמורת',
        additionalContext: 'תיאור ההסכמה על משמורת הקטינים',
      });
      paragraphs.push(createBodyParagraph(transformedText || divorceData.custodyCustom));
    }

    // Visitation
    if (visitationAgreement === 'referenceClaim' && hasCustodyClaim) {
      paragraphs.push(
        createBodyParagraph(
          'הסדרי הראייה יהיו כמפורט בתביעת המשמורת הנפרדת.'
        )
      );
    } else if (visitationAgreement === 'flexible') {
      paragraphs.push(
        createBodyParagraph(
          'הסדרי הראייה יהיו גמישים ויתואמו בהסכמה בין ההורים, תוך שמירה על טובת הקטינים.'
        )
      );
    } else if (visitationAgreement === 'fixed') {
      paragraphs.push(
        createBodyParagraph(
          'הסדרי הראייה יהיו קבועים ויתואמו מראש בין ההורים, על מנת לשמור על יציבות עבור הקטינים.'
        )
      );
    } else if (visitationAgreement === 'custom' && divorceData.visitationCustom) {
      // Transform user text with Groq
      console.log('🤖 Transforming visitation custom text with Groq...');
      const transformedText = await transformToLegalLanguage(divorceData.visitationCustom, {
        ...groqContext,
        fieldLabel: 'הסדרי ראייה',
        additionalContext: 'תיאור הסדרי הראייה המוסכמים',
      });
      paragraphs.push(createBodyParagraph(transformedText || divorceData.visitationCustom));
    }
  }

  // ========== SECTION C: ALIMONY (if relevant) ==========
  if (minors.length > 0 || divorceData.alimonyAgreement) {
    sectionCounter++;
    paragraphs.push(
      createSubsectionHeader(`סעיף ${numberToHebrewLetter(sectionCounter)} - מזונות`)
    );

    const alimonyAgreement = divorceData.alimonyAgreement;

    if (alimonyAgreement === 'referenceClaim' && hasAlimonyClaim) {
      paragraphs.push(
        createBodyParagraph(
          'הסדרי המזונות יהיו כמפורט בתביעת המזונות הנפרדת שהוגשה לבית המשפט.'
        )
      );
    } else if (alimonyAgreement === 'specificAmount' && divorceData.alimonyAmount) {
      const amount = formatCurrency(divorceData.alimonyAmount);
      paragraphs.push(
        createBodyParagraph(
          `בני הזוג הסכימו כי ${basicInfo.fullName2} ישלם/תשלם מזונות בסך ${amount} לחודש.`
        )
      );
    } else if (alimonyAgreement === 'none') {
      paragraphs.push(
        createBodyParagraph(
          'בני הזוג הסכימו כי אין חיוב במזונות בין הצדדים, וכל צד מוותר על כל תביעת מזונות כלפי האחר.'
        )
      );
    } else if (alimonyAgreement === 'custom' && divorceData.alimonyCustom) {
      // Transform user text with Groq
      console.log('🤖 Transforming alimony custom text with Groq...');
      const transformedText = await transformToLegalLanguage(divorceData.alimonyCustom, {
        ...groqContext,
        fieldLabel: 'הסדר מזונות',
        additionalContext: 'תיאור ההסכמה על מזונות',
      });
      paragraphs.push(createBodyParagraph(transformedText || divorceData.alimonyCustom));
    } else {
      paragraphs.push(
        createBodyParagraph('בני הזוג הסכימו על הסדר מזונות על-פי תנאים שהוסכמו ביניהם.')
      );
    }
  }

  // ========== SECTION D: ADDITIONAL TERMS ==========
  if (divorceData.additionalTerms && divorceData.additionalTerms.trim().length > 0) {
    sectionCounter++;
    paragraphs.push(
      createSubsectionHeader(`סעיף ${numberToHebrewLetter(sectionCounter)} - תנאים נוספים`)
    );

    // Transform user text with Groq
    console.log('🤖 Transforming additional terms with Groq...');
    const transformedText = await transformToLegalLanguage(divorceData.additionalTerms, {
      ...groqContext,
      fieldLabel: 'תנאים נוספים',
      additionalContext: 'תיאור הסכמות נוספות כגון ביטוחים, הוצאות, ירושה',
    });
    paragraphs.push(createBodyParagraph(transformedText || divorceData.additionalTerms));
  }

  // ========== SECTION E: GENERAL PROVISIONS ==========
  sectionCounter++;
  paragraphs.push(
    createSubsectionHeader(`סעיף ${numberToHebrewLetter(sectionCounter)} - הוראות כלליות`)
  );

  paragraphs.push(
    createNumberedItem(
      1,
      'בני הזוג מוותרים בזאת באופן סופי ובלתי חוזר על כל טענה, תביעה או זכות שיש או שתהיה לאחד כלפי השני, למעט האמור במפורש בהסכם זה.'
    )
  );

  paragraphs.push(
    createNumberedItem(
      2,
      'הסכם זה ממצה את כל ההסכמות בין הצדדים בנושא הגירושין, ואין כל הסכם אחר, בכתב או בעל-פה, אשר לא נכלל בהסכם זה.'
    )
  );

  paragraphs.push(
    createNumberedItem(
      3,
      'כל שינוי בהסכם זה יהיה תקף רק אם ייעשה בכתב ויחתם על-ידי שני הצדדים.'
    )
  );

  paragraphs.push(
    createNumberedItem(
      4,
      'הסכם זה כפוף לאישור בית המשפט לענייני משפחה ו/או בית הדין הרבני, לפי העניין.'
    )
  );

  // ========== 6. DECLARATIONS ==========
  paragraphs.push(createSectionHeader('הצהרות'));

  paragraphs.push(
    createNumberedItem(
      1,
      `${basicInfo.fullName} ו${basicInfo.fullName2} ${terms.pluralDeclare} בזאת כי הסכם זה נחתם מרצונם החופשי, ללא כל כפייה, איום או לחץ מצד כלשהו.`
    )
  );

  paragraphs.push(
    createNumberedItem(
      2,
      `בני הזוג ${terms.pluralDeclare} כי הם ${terms.pluralUnderstand} את כל תנאי ההסכם ואת המשמעויות המשפטיות שלו.`
    )
  );

  paragraphs.push(
    createNumberedItem(
      3,
      'בני הזוג הוזהרו ונתנה להם ההזדמנות לקבל ייעוץ משפטי עצמאי טרם חתימת הסכם זה.'
    )
  );

  paragraphs.push(
    createNumberedItem(
      4,
      'בני הזוג מתחייבים לפעול בתום לב ליישום הסכם זה ולשתף פעולה זה עם זה לשם כך.'
    )
  );

  // ========== 7. CLOSING & SIGNATURES ==========
  paragraphs.push(
    createBodyParagraph(
      'ולראיה באו הצדדים על החתום:',
      { before: SPACING.SECTION, after: SPACING.SECTION }
    )
  );

  const today = new Date().toLocaleDateString('he-IL');
  paragraphs.push(createBodyParagraph(`תאריך: ${today}`, { after: SPACING.SECTION }));

  // Applicant signature (visual RIGHT side in RTL)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${basicInfo.fullName} (${terms.applicantTerm})`,
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START, // RIGHT in RTL
      spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
      bidirectional: true,
    })
  );

  if (applicantSignature) {
    paragraphs.push(createSignatureImage(applicantSignature, 250, 125, AlignmentType.LEFT));
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
        alignment: AlignmentType.START,
        spacing: { before: SPACING.PARAGRAPH, after: SPACING.SECTION },
        bidirectional: true,
      })
    );
  }

  // Respondent signature (visual LEFT side in RTL)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${basicInfo.fullName2} (${terms.respondentTerm})`,
          bold: true,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.END, // LEFT in RTL
      spacing: { before: SPACING.SECTION, after: SPACING.MINIMAL },
      bidirectional: true,
    })
  );

  if (respondentSignature) {
    paragraphs.push(createSignatureImage(respondentSignature, 250, 125, AlignmentType.RIGHT));
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
        alignment: AlignmentType.END,
        spacing: { before: SPACING.PARAGRAPH, after: SPACING.SECTION },
        bidirectional: true,
      })
    );
  }

  // ========== 8. LAWYER CONFIRMATION ==========
  if (lawyerSignature) {
    paragraphs.push(createPageBreak());

    paragraphs.push(createSectionHeader('אישור עורך דין'));

    paragraphs.push(
      createBodyParagraph(
        `אני החתום מטה, עוה"ד אריאל דרור מ"ר 31892, מאשר בזאת כי הסכם זה נחתם בפניי על-ידי ${basicInfo.fullName} ו${basicInfo.fullName2} לאחר שהוסברו להם תנאיו והשלכותיו המשפטיות.`
      )
    );

    paragraphs.push(
      createBodyParagraph(
        'הצדדים חתמו על ההסכם מרצונם החופשי ובהבנה מלאה של תוכנו.',
        { after: SPACING.SECTION }
      )
    );

    paragraphs.push(createBodyParagraph(`תאריך: ${today}`, { after: SPACING.SECTION }));

    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150, AlignmentType.LEFT));

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'אריאל דרור, עו"ד',
            size: FONT_SIZES.BODY,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: SPACING.MINIMAL },
      })
    );
  }

  // ========== 9. FORM 3 - STATEMENT OF DETAILS ==========
  paragraphs.push(createPageBreak());
  const form3Paragraphs = generateForm3(basicInfo, formData, applicantSignature);
  paragraphs.push(...form3Paragraphs);

  // ========== 10. POWER OF ATTORNEY ==========
  paragraphs.push(createPageBreak());
  const powerOfAttorneyParagraphs = generatePowerOfAttorney(
    basicInfo,
    formData,
    applicantSignature,
    lawyerSignature,
    'הסכם גירושין' as any
  );
  paragraphs.push(...powerOfAttorneyParagraphs);

  // ========== 11. AFFIDAVIT ==========
  paragraphs.push(createPageBreak());
  const affidavitParagraphs = generateAffidavit(basicInfo, formData, lawyerSignature);
  paragraphs.push(...affidavitParagraphs);

  // ========== 12. ATTACHMENTS ==========
  if (attachments && attachments.length > 0) {
    paragraphs.push(createPageBreak());

    const mainContentPages = 3;
    const powerOfAttorneyPages = 2;
    const affidavitPages = 1;
    const tocPage = mainContentPages + powerOfAttorneyPages + affidavitPages;

    const attachmentParagraphs = generateAttachmentsSection(attachments, tocPage);
    paragraphs.push(...attachmentParagraphs);
  }

  // ==================== CREATE DOCUMENT ====================
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  console.log('✅ Compact divorce agreement document generated successfully');

  return await Packer.toBuffer(doc);
}

/**
 * Generate Form 3 (הרצאת פרטים) for Divorce Agreement
 */
function generateForm3(
  basicInfo: BasicInfo,
  formData: FormData,
  signature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const propertyData = formData.property || {};
  const children = propertyData.children || [];

  const yesNo = (value: any) => {
    if (value === 'כן' || value === 'yes' || value === true) return 'כן';
    if (value === 'לא' || value === 'no' || value === false) return 'לא';
    return 'לא צוין';
  };

  // Title
  paragraphs.push(createMainTitle('טופס 3'));
  paragraphs.push(createCenteredTitle('(תקנה 12)', FONT_SIZES.BODY));
  paragraphs.push(createMainTitle('הרצאת פרטים בהסכם גירושין'));

  paragraphs.push(
    createBodyParagraph(`מהות ההסכם:\u200F הסכם גירושין בהסכמה`, { after: SPACING.PARAGRAPH })
  );
  paragraphs.push(
    createBodyParagraph(`מעמדו של ממלא הטופס:\u200F מבקש/ת`, { after: SPACING.SECTION })
  );

  // Section 1: Personal Details
  paragraphs.push(createSectionHeader('פרטים אישיים:'));
  paragraphs.push(createSubsectionHeader(`1. המבקש/ת:`));
  paragraphs.push(createInfoLine('שם מלא', basicInfo.fullName || ''));
  paragraphs.push(createInfoLine('ת.ז', basicInfo.idNumber || ''));
  paragraphs.push(createInfoLine('תאריך לידה', basicInfo.birthDate ? formatDate(basicInfo.birthDate) : ''));
  paragraphs.push(createInfoLine('מען', basicInfo.address || ''));
  paragraphs.push(createInfoLine('טלפון', basicInfo.phone || ''));

  paragraphs.push(createSubsectionHeader(`2. המשיב/ה:`));
  paragraphs.push(createInfoLine('שם מלא', basicInfo.fullName2 || ''));
  paragraphs.push(createInfoLine('ת.ז', basicInfo.idNumber2 || ''));
  paragraphs.push(createInfoLine('תאריך לידה', basicInfo.birthDate2 ? formatDate(basicInfo.birthDate2) : ''));
  paragraphs.push(createInfoLine('מען', basicInfo.address2 || ''));
  paragraphs.push(createInfoLine('טלפון', basicInfo.phone2 || ''));

  // Section 2: Marital Status
  paragraphs.push(createSectionHeader('מצב משפחתי:'));
  paragraphs.push(createInfoLine('תאריך נישואין', basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : ''));
  paragraphs.push(createInfoLine('נישואים קודמים (מבקש/ת)', yesNo(formData.marriedBefore)));
  paragraphs.push(createInfoLine('נישואים קודמים (משיב/ה)', yesNo(formData.marriedBefore2)));

  // Section 3: Children
  if (children.length > 0) {
    paragraphs.push(createSectionHeader('ילדים:'));
    children.forEach((child: any, index: number) => {
      paragraphs.push(createSubsectionHeader(`${index + 1}. ${child.name || ''}`));
      paragraphs.push(createInfoLine('ת.ז', child.idNumber || ''));
      paragraphs.push(createInfoLine('תאריך לידה', child.birthDate ? formatDate(child.birthDate) : ''));
      paragraphs.push(createInfoLine('כתובת', child.address || ''));
    });
  }

  // Section 4: Other Information
  paragraphs.push(createSectionHeader('מידע נוסף:'));
  paragraphs.push(createInfoLine('בקשת צו הגנה', yesNo(formData.protectionOrderRequested)));
  paragraphs.push(createInfoLine('אלימות בעבר', yesNo(formData.pastViolenceReported)));
  paragraphs.push(createInfoLine('פנייה לשירותי רווחה', yesNo(formData.contactedWelfare)));
  paragraphs.push(createInfoLine('פנייה לייעוץ נישואין', yesNo(formData.contactedMarriageCounseling)));

  // Signature
  paragraphs.push(
    createBodyParagraph(
      'אני מצהיר/ה בזאת כי הפרטים לעיל נכונים ומלאים.',
      { before: SPACING.SECTION, after: SPACING.SECTION }
    )
  );

  const today = new Date().toLocaleDateString('he-IL');
  paragraphs.push(createBodyParagraph(`תאריך: ${today}`, { after: SPACING.SECTION }));

  if (signature) {
    paragraphs.push(createSignatureImage(signature, 250, 125, AlignmentType.LEFT));
  }

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `חתימת המבקש/ת: ${basicInfo.fullName || ''}`,
          size: FONT_SIZES.BODY,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: SPACING.SECTION },
      bidirectional: true,
    })
  );

  return paragraphs;
}

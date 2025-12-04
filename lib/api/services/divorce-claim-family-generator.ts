/**
 * Family Court Divorce Claim Generator (תביעת גירושין - בית משפט לענייני משפחה)
 * Generates divorce petition for Family Court (בית משפט לענייני משפחה)
 * Used when routing determines family court is more appropriate
 *
 * Key differences from rabbinical court:
 * - Uses civil law jurisdiction
 * - No ketubah section
 * - Different legal citations
 * - Simpler format - divorce petition only, other claims are separate
 *
 * Structure matches other family court claims (alimony, custody):
 * 1. Court header
 * 2. Claim title + fees
 * 3. Summons (הזמנה לדין)
 * 4. Part B - Summary
 * 5. Part C - Detailed facts
 * 6. Relief section
 * 7. Form 4 (טופס 4)
 * 8. Power of Attorney (ייפוי כוח)
 * 9. Affidavit (הצהרה)
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageNumber,
  NumberFormat,
  Footer,
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData, Child } from '@/lib/api/types';
import { transformToLegalLanguage, TransformContext } from './groq-service';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  formatChildNaturally,
  isMinor,
  createSectionHeader,
  createSubsectionHeader,
  createNumberedHeader,
  createBodyParagraph,
  createBulletPoint,
  createNumberedItem,
  createMainTitle,
  createCenteredTitle,
  createInfoLine,
  createPageBreak,
  createSignatureImage,
  createCourtHeader,
  generatePowerOfAttorney,
  generateAffidavit,
  generateAttachmentsSection,
} from './shared-document-generators';

interface DivorceClaimFamilyData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer;
  lawyerSignature?: string | Buffer;
  attachments?: Array<{ label: string; description: string; images: Buffer[] }>;
}

type GenderForm = 'male' | 'female';

const getApplicantGender = (basicInfo: BasicInfo): GenderForm =>
  basicInfo.gender === 'male' ? 'male' : 'female';

const getRespondentGender = (basicInfo: BasicInfo): GenderForm =>
  basicInfo.gender2 === 'female' ? 'female' : 'male';

const getApplicantTitle = (basicInfo: BasicInfo): string =>
  getApplicantGender(basicInfo) === 'male' ? 'התובע' : 'התובעת';

const getRespondentTitle = (basicInfo: BasicInfo): string =>
  getRespondentGender(basicInfo) === 'male' ? 'הנתבע' : 'הנתבעת';

const getGenderedWord = (gender: GenderForm, maleForm: string, femaleForm: string): string =>
  gender === 'male' ? maleForm : femaleForm;

/**
 * Local wrapper for court header - extracts data and calls shared function
 */
function localCreateCourtHeader(data: DivorceClaimFamilyData): Paragraph[] {
  const children = data.formData.children || [];
  const minorChildren = children.filter((child) => isMinor(child.birthDate || ''));

  return createCourtHeader({
    city: 'בפתח תקווה',
    judgeName: 'השופט/ת',
    basicInfo: data.basicInfo,
    children: minorChildren.map(c => ({ name: `${c.firstName || ''} ${c.lastName || ''}`.trim(), idNumber: c.idNumber || '' })),
    showChildrenList: minorChildren.length > 0,
    forum: 'בבית המשפט לענייני משפחה',
  });
}

/**
 * Create claim title and fee information
 */
function createClaimTitle(data: DivorceClaimFamilyData): Paragraph[] {
  const applicantGender = getApplicantGender(data.basicInfo);
  const applicantTitle = getApplicantTitle(data.basicInfo);
  const honorificVerb = getGenderedWord(applicantGender, 'מתכבד', 'מתכבדת');

  return [
    createMainTitle('כתב תביעה לגירושין'),
    createBodyParagraph(
      `${applicantTitle} ${honorificVerb} להגיש לכבוד בית המשפט את כתב התביעה לגירושין.`,
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      'סכום אגרת בית משפט: לפי תקנות בית המשפט לענייני משפחה (אגרות), תשנ"ו-1995.',
      { after: SPACING.SUBSECTION }
    ),
  ];
}

/**
 * Create summons section (הזמנה לדין)
 */
function createSummons(data: DivorceClaimFamilyData): Paragraph[] {
  const applicantGender = getApplicantGender(data.basicInfo);
  const respondentGender = getRespondentGender(data.basicInfo);
  const applicantTitle = getApplicantTitle(data.basicInfo);
  const respondentTitle = getRespondentTitle(data.basicInfo);
  const applicantFiledVerb = getGenderedWord(applicantGender, 'הגיש', 'הגישה');

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
      `הואיל ו${applicantTitle} ${applicantFiledVerb} נגד ${respondentTitle} תביעה לגירושין כמפורט בכתב התביעה המצורף בזה על נספחיו.`,
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      `על ${respondentTitle} להגיש כתב הגנה לתובענה, יחד עם הרצאת פרטים לפי טופס 4 שבתוספת הראשונה לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.`,
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      `כתב ההגנה על נספחיו יאומת בתצהיר ${respondentTitle} ויוגש לבית המשפט תוך 30 ימים מהיום שהומצאה הזמנה זו, לפי תקנה 13(א) לתקנות בית משפט לענייני משפחה (סדרי דין), התשפ"א-2020.`,
      { after: SPACING.PARAGRAPH }
    ),
    createBodyParagraph(
      `אי הגשת כתב הגנה במועד תאפשר ל${applicantTitle} לקבל פסק דין שלא בפני ${respondentTitle}, לפי תקנה 130 לתקנות סדר הדין האזרחי, התשע"ט-2018.`,
      { after: SPACING.SUBSECTION }
    ),
  ];
}

/**
 * Create Part B - Summary of claim (חלק ב – תמצית התביעה)
 */
function createPartB(data: DivorceClaimFamilyData): Paragraph[] {
  const children = data.formData.children || [];
  const minorChildren = children.filter((child) => isMinor(child.birthDate || ''));

  const marriageDate = data.basicInfo.weddingDay
    ? formatDate(data.basicInfo.weddingDay)
    : '';

  // Get separation date from formData
  const separationDate = data.formData.property?.separationDate || data.formData.separationDate;
  const separationText = separationDate ? `. כיום הצדדים גרים בנפרד מיום ${formatDate(separationDate)}` : '';

  const childrenText = minorChildren.length > 0
    ? `, במהלך הנישואין נולדו להם ${minorChildren.length} ${minorChildren.length === 1 ? 'ילד' : 'ילדים'}: ${minorChildren.map(child => formatChildNaturally(child)).join(', ')}`
    : ', לא נולדו ילדים משותפים';

  return [
    createSectionHeader('חלק ב – תמצית התביעה'),

    // 1. Brief description of parties
    createNumberedHeader('1. תיאור תמציתי של בעלי הדין'),
    createBodyParagraph(
      `${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2} נישאו ביום ${marriageDate}${childrenText}${separationText}.`,
      { after: SPACING.SUBSECTION }
    ),

    // 2. Relief requested
    createNumberedHeader('2. פירוט הסעד המבוקש באופן תמציתי'),
    createNumberedItem(1, 'להכריז על גירושי הצדדים.'),
    createNumberedItem(2, 'להפנות את הצדדים לבית הדין הרבני לסידור הגט.'),
    createNumberedItem(3, 'לחייב את הנתבע/ת בהוצאות משפט ושכ"ט עו"ד.'),
    createBodyParagraph('', { after: SPACING.SUBSECTION }),

    // 3. Summary of facts
    createNumberedHeader('3. תמצית העובדות הנחוצות לביסוסה של עילת התביעה ומתי נולדה'),
    createBodyParagraph(
      `הצדדים, ${data.basicInfo.fullName} מ"ז ${data.basicInfo.idNumber} ו${data.basicInfo.fullName2} מ"ז ${data.basicInfo.idNumber2}, נישאו זה לזה כדת משה וישראל ביום ${marriageDate}. במהלך חיי הנישואין התגלעו בין הצדדים חילוקי דעות ומחלוקות אשר הביאו לפירוד ביניהם${separationText}. לאור האמור, אין עוד אפשרות לקיים חיי נישואין תקינים ומתבקשת הכרזה על גירושי הצדדים.`,
      { after: SPACING.SUBSECTION }
    ),

    // 4. Jurisdiction facts
    createNumberedHeader('4. פירוט העובדות המקנות סמכות לבית המשפט'),
    createBodyParagraph(
      'סמכות השיפוט מוקנית לבית משפט זה לפי חוק בית המשפט לענייני משפחה, התשנ"ה-1995, וזאת בהתאם למקום המגורים האחרון המשותף של הצדדים בתחום שיפוט בית משפט נכבד זה.',
      { after: SPACING.SUBSECTION }
    ),
  ];
}

/**
 * Create Part C - Detailed facts (חלק ג - פירוט העובדות)
 */
async function createPartC(data: DivorceClaimFamilyData): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  const children = data.formData.children || [];
  const minorChildren = children.filter((child) => isMinor(child.birthDate || ''));
  const divorceData = data.formData.divorce || {};

  const marriageDate = data.basicInfo.weddingDay
    ? formatDate(data.basicInfo.weddingDay)
    : '';
  const weddingCity = divorceData.weddingCity || 'לא צוין';

  // Part C title
  paragraphs.push(createSectionHeader('חלק ג - פירוט העובדות המשמשות יסוד לכתב הטענות'));

  // מערכת היחסים - Relationship section
  paragraphs.push(createSubsectionHeader('רקע הנישואין'));

  // Marriage background
  paragraphs.push(
    createBodyParagraph(
      `הצדדים נישאו זה לזה כדת משה וישראל ביום ${marriageDate} ב${weddingCity}.`,
      { after: SPACING.LINE }
    )
  );

  // Children info
  if (minorChildren.length > 0) {
    paragraphs.push(
      createBodyParagraph(
        `מנישואי הצדדים נולדו ${minorChildren.length} ${minorChildren.length === 1 ? 'ילד' : 'ילדים'}:`,
        { after: SPACING.LINE }
      )
    );
    minorChildren.forEach((child) => {
      paragraphs.push(createBulletPoint(formatChildNaturally(child)));
    });
    paragraphs.push(createBodyParagraph('', { after: SPACING.LINE }));
  } else {
    paragraphs.push(
      createBodyParagraph('מנישואי הצדדים לא נולדו ילדים משותפים.', { after: SPACING.LINE })
    );
  }

  // Living situation
  const livingSeparately = data.formData.livingSeparately === 'כן';
  const separationDate = data.formData.separationDate ? formatDate(data.formData.separationDate) : '';

  if (livingSeparately) {
    paragraphs.push(
      createBodyParagraph(
        `הצדדים גרים בנפרד${separationDate ? ` מאז ${separationDate}` : ''}.`,
        { after: SPACING.SUBSECTION }
      )
    );
  } else {
    paragraphs.push(
      createBodyParagraph('הצדדים גרים תחת קורת גג אחת.', { after: SPACING.SUBSECTION })
    );
  }

  // עילות הגירושין - Divorce grounds section
  paragraphs.push(createSubsectionHeader('עילות התביעה'));

  // Transform story text if provided
  let storyText = divorceData.whoWantsDivorceAndWhy || '';
  let reasonsText = divorceData.divorceReasons || '';

  try {
    if (storyText) {
      const storyContext: TransformContext = {
        claimType: 'גירושין',
        applicantName: data.basicInfo.fullName,
        respondentName: data.basicInfo.fullName2,
        fieldLabel: 'רקע לבקשת הגירושין',
      };
      storyText = await transformToLegalLanguage(storyText, storyContext);
      console.log('✅ Story text transformed successfully');
    }
    if (reasonsText) {
      const reasonsContext: TransformContext = {
        claimType: 'גירושין',
        applicantName: data.basicInfo.fullName,
        respondentName: data.basicInfo.fullName2,
        fieldLabel: 'עילות לגירושין',
      };
      reasonsText = await transformToLegalLanguage(reasonsText, reasonsContext);
      console.log('✅ Reasons text transformed successfully');
    }
  } catch (error) {
    console.warn('AI transformation failed, using original text:', error);
  }

  if (storyText) {
    paragraphs.push(createBodyParagraph(storyText, { after: SPACING.LINE }));
  }

  if (reasonsText) {
    paragraphs.push(createBodyParagraph(reasonsText, { after: SPACING.SUBSECTION }));
  }

  // Default grounds if nothing provided
  if (!storyText && !reasonsText) {
    paragraphs.push(
      createBodyParagraph(
        'הנישואין בין הצדדים עלו על שרטון ולא ניתן עוד להמשיך בחיים משותפים. חיי הנישואין מאופיינים בחוסר הבנה וניכור בין הצדדים.',
        { after: SPACING.SUBSECTION }
      )
    );
  }

  // Previous proceedings
  if (divorceData.parallelCases === 'כן' && divorceData.parallelCasesDetails) {
    paragraphs.push(createBodyParagraph(divorceData.parallelCasesDetails, { after: SPACING.SUBSECTION }));
  }

  // Mediation attempts - flow naturally without header
  if (divorceData.hadPreviousMediation === 'כן' && divorceData.previousMediationDetails) {
    paragraphs.push(createBodyParagraph(divorceData.previousMediationDetails, { after: SPACING.SUBSECTION }));
  }

  return paragraphs;
}

/**
 * Create relief section (סעדים)
 */
function createReliefSection(): Paragraph[] {
  return [
    createSectionHeader('סעדים'),
    createBodyParagraph(
      'לאור כל האמור לעיל, מתבקש בית המשפט הנכבד:',
      { after: SPACING.LINE }
    ),
    createNumberedItem(1, 'להכריז על פירוק נישואי הצדדים.'),
    createNumberedItem(2, 'להפנות את הצדדים לבית הדין הרבני לסידור הגט.'),
    createNumberedItem(3, 'לחייב את הנתבע/ת בהוצאות משפט ושכ"ט עו"ד.'),
    createNumberedItem(4, 'ליתן כל סעד אחר שבית המשפט הנכבד ימצא לנכון.'),
    createBodyParagraph('', { after: SPACING.SUBSECTION }),
  ];
}

/**
 * Helper to translate housing type to Hebrew
 */
function translateHousingType(type: string): string {
  const translations: Record<string, string> = {
    'owned': 'בבעלות',
    'rented': 'בשכירות',
    'parents': 'אצל ההורים',
    'other': 'אחר',
  };
  return translations[type] || type || 'לא צוין';
}

/**
 * Helper to format yes/no answers
 */
function yesNo(value: any): string {
  if (value === 'כן' || value === 'yes' || value === true) return 'כן';
  if (value === 'לא' || value === 'no' || value === false) return 'לא';
  return 'לא צוין';
}

/**
 * Generate הרצאת פרטים (Form 3 - Statement of Details) for divorce claims
 * Form 3 is used for claims between spouses (except alimony)
 */
function generateForm3Section(data: DivorceClaimFamilyData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const { basicInfo, formData, signature } = data;

  const plaintiff = getApplicantTitle(basicInfo);
  const defendant = getRespondentTitle(basicInfo);
  const divorceData = formData.divorce || {};
  const children = formData.children || [];

  console.log('📋 Generating Form 3 (הרצאת פרטים) for divorce claim...');

  // Title
  paragraphs.push(createMainTitle('טופס 3'));
  paragraphs.push(createCenteredTitle('(תקנה 12)', FONT_SIZES.BODY));
  paragraphs.push(createMainTitle('הרצאת פרטים בתובענה בין בני זוג'));
  paragraphs.push(createCenteredTitle('(למעט תביעת מזונות)', FONT_SIZES.BODY));

  // Nature of claim
  paragraphs.push(createBodyParagraph(`מהות התובענה:\u200F גירושין`));
  paragraphs.push(createBodyParagraph(`מעמדו של ממלא הטופס:\u200F ${plaintiff}`));

  // Section 1: Personal Details
  paragraphs.push(createSectionHeader('1. פרטים אישיים:'));
  paragraphs.push(createSubsectionHeader(`${plaintiff}:`));
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
  paragraphs.push(createSubsectionHeader(`${plaintiff}:`));
  paragraphs.push(createInfoLine('תאריך הנישואים הנוכחיים', basicInfo.weddingDay || 'לא צוין'));
  paragraphs.push(createInfoLine('נישואין קודמים', yesNo(formData.marriedBefore)));
  paragraphs.push(createInfoLine(`האם ל${plaintiff} יש ילדים מנישואים קודמים`, yesNo(formData.hadChildrenFromPrevious)));

  paragraphs.push(createSubsectionHeader(`${defendant}:`));
  paragraphs.push(createInfoLine('תאריך הנישואים הנוכחיים', basicInfo.weddingDay || 'לא צוין'));
  paragraphs.push(createInfoLine('נישואין קודמים', yesNo(formData.marriedBefore2)));
  paragraphs.push(createInfoLine(`האם ל${defendant} יש ילדים מנישואים קודמים`, yesNo(formData.hadChildrenFromPrevious2)));
  paragraphs.push(createBodyParagraph('(בסעיף זה – נישואין לרבות ברית זוגיות.)'));

  // Section 3: Children
  paragraphs.push(createSectionHeader('3. ילדים:'));
  if (children.length > 0) {
    children.forEach((child: Child, index: number) => {
      paragraphs.push(createSubsectionHeader(`ילד/ה ${index + 1}:`));
      paragraphs.push(createInfoLine('שם', `${child.firstName || ''} ${child.lastName || ''}`));
      paragraphs.push(createInfoLine('תאריך לידה', child.birthDate));
      paragraphs.push(createInfoLine('שם ההורה (שאינו המבקש)', basicInfo.fullName2));
      paragraphs.push(createInfoLine('מקום מגורי הילד', child.address || basicInfo.address || 'לא צוין'));
    });
  } else {
    paragraphs.push(createBodyParagraph('אין ילדים'));
  }

  // Section 4: Housing
  paragraphs.push(createSectionHeader('4. פרטים לגבי דירת המגורים:'));
  paragraphs.push(createInfoLine(`הדירה שבה גר/ה ${plaintiff} היא`, formData.applicantHomeType ? translateHousingType(formData.applicantHomeType) : 'לא צוין'));
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
  if (divorceData.parallelCases === 'כן' && divorceData.parallelCasesDetails) {
    paragraphs.push(createBodyParagraph(divorceData.parallelCasesDetails));
  } else if (formData.otherFamilyCases && Array.isArray(formData.otherFamilyCases) && formData.otherFamilyCases.length > 0) {
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
  paragraphs.push(createInfoLine('גישור', yesNo(divorceData.hadPreviousMediation)));
  paragraphs.push(createBodyParagraph('האם את/ה מוכנ/ה לקחת חלק ב:'));
  paragraphs.push(createInfoLine('ייעוץ משפחתי', yesNo(formData.willingToJoinFamilyCounseling)));
  paragraphs.push(createInfoLine('גישור', yesNo(formData.willingToJoinMediation)));

  // Section 8: Declaration
  paragraphs.push(createSectionHeader('8. הצהרה'));
  paragraphs.push(createBodyParagraph(
    `אני החתום/ה מטה מצהיר/ה כי כל הפרטים שמסרתי לעיל הם נכונים ומלאים.`
  ));

  // Date and signature
  paragraphs.push(createBodyParagraph(`תאריך: ${formatDate(new Date().toISOString())}`));

  console.log('✅ Form 3 section generated successfully');

  return paragraphs;
}

/**
 * Estimate page count for divorce document sections
 * Used for calculating attachment table of contents page numbers
 */
function estimatePageCount(formData: FormData): {
  mainClaim: number;
  form3: number;
  powerOfAttorney: number;
  affidavit: number;
  tocPage: number;
} {
  const children = formData.children || [];
  const minorChildren = children.filter((child: Child) => isMinor(child.birthDate || ''));
  const divorceData = formData.divorce || {};

  let mainClaim = 3; // Core narrative (header, summons, parts B/C, relief)

  // Add pages for children
  if (minorChildren.length > 2) {
    mainClaim += Math.ceil((minorChildren.length - 2) / 3);
  }

  // Add pages for detailed divorce grounds
  if (divorceData.whoWantsDivorceAndWhy || divorceData.divorceReasons) {
    mainClaim += 1;
  }

  // Add pages for previous proceedings/mediation
  if (divorceData.parallelCasesDetails || divorceData.previousMediationDetails) {
    mainClaim += 1;
  }

  const form3 = 3; // Form 3 typically 3 pages
  const powerOfAttorney = 2;
  const affidavit = 1;
  const tocPage = mainClaim + form3 + powerOfAttorney + affidavit;

  return { mainClaim, form3, powerOfAttorney, affidavit, tocPage };
}

/**
 * Generate divorce claim document for Family Court
 * Full structure matching other family court claims
 */
export async function generateDivorceClaimFamily(data: DivorceClaimFamilyData): Promise<Buffer> {
  console.log('\n' + '🔵'.repeat(40));
  console.log('📋 GENERATING FAMILY COURT DIVORCE CLAIM (תביעת גירושין - בית משפט לענייני משפחה)');
  console.log('🔵'.repeat(40));

  const { attachments } = data;

  // Log attachments for debugging
  if (attachments && attachments.length > 0) {
    console.log(`📎 Family court divorce claim received ${attachments.length} attachments`);
  } else {
    console.log(`ℹ️ Family court divorce claim received no attachments`);
  }

  const sections: Paragraph[] = [];

  // 1. Court header with party info
  sections.push(...localCreateCourtHeader(data));

  // 2. Claim title and fees
  sections.push(...createClaimTitle(data));

  // 3. Summons
  sections.push(...createSummons(data));

  // 4. Part B - Summary
  sections.push(...createPartB(data));

  // 5. Part C - Detailed facts
  sections.push(...(await createPartC(data)));

  // 6. Relief section
  sections.push(...createReliefSection());

  // 7. Form 3 - הרצאת פרטים (with page break)
  sections.push(createPageBreak());
  sections.push(...generateForm3Section(data));

  // 8. Power of Attorney (with page break)
  sections.push(createPageBreak());
  sections.push(...generatePowerOfAttorney(data.basicInfo, data.formData, data.signature, data.lawyerSignature, 'גירושין'));

  // 9. Affidavit (with page break)
  sections.push(createPageBreak());
  sections.push(...generateAffidavit(data.basicInfo, data.formData, data.lawyerSignature));

  // 10. Attachments (נספחים) - if any
  if (attachments && attachments.length > 0) {
    console.log(`📎 Adding ${attachments.length} attachments with page ranges`);
    sections.push(createPageBreak());
    const pageEstimates = estimatePageCount(data.formData);
    sections.push(...generateAttachmentsSection(attachments, pageEstimates.tocPage));
  } else {
    console.log(`ℹ️ No attachments to add`);
  }

  console.log('🔵'.repeat(40));
  console.log('✅ FAMILY COURT DIVORCE CLAIM GENERATED SUCCESSFULLY');
  console.log('🔵'.repeat(40) + '\n');

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
        children: sections,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/**
 * Shalom Bayit Claim Document Generator (תביעה לשלום בית)
 * Generates reconciliation claim documents for Rabbinical Court (בית הדין הרבני)
 *
 * Structure (based on lawyer-approved template):
 * - Court header with docket number
 * - Parties section (plaintiff/defendant)
 * - Main title: תביעה לשלום בית
 * - א. כללי - רקע (General Background)
 * - ב. יש למצות את הליך שלום הבית (The reconciliation process must be exhausted)
 * - Request section
 * - Signatures
 * - Power of Attorney
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
  UnderlineType,
} from 'docx';
import { BasicInfo, FormData, ClaimType, Child } from '@/lib/api/types';
import { transformToLegalLanguage, TransformContext } from './groq-service';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  createBodyParagraph,
  createPageBreak,
  createSignatureImage,
  generatePowerOfAttorney,
  isMinor,
} from './shared-document-generators';

// Constants for spacing
const LINE_SPACING = 360; // 1.5 line spacing
const PARAGRAPH_SPACING = 240;

// ==================== TYPES ====================

interface ShalomBayitData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer;
  lawyerSignature?: string | Buffer;
  selectedClaims?: ClaimType[];
}

interface GenderTerms {
  title: string;       // התובע/התובעת
  pronoun: string;     // הוא/היא
  possessive: string;  // שלו/שלה
  name: string;        // Full name
  hebrewTitle: string; // הבעל/האישה
}

// ==================== HELPER FUNCTIONS ====================

function getPlaintiffTerm(gender?: 'male' | 'female', name?: string): GenderTerms {
  if (gender === 'male') {
    return { title: 'התובע', pronoun: 'הוא', possessive: 'שלו', name: name || 'התובע', hebrewTitle: 'הבעל' };
  }
  return { title: 'התובעת', pronoun: 'היא', possessive: 'שלה', name: name || 'התובעת', hebrewTitle: 'האישה' };
}

function getDefendantTerm(gender?: 'male' | 'female', name?: string): GenderTerms {
  if (gender === 'male') {
    return { title: 'הנתבע', pronoun: 'הוא', possessive: 'שלו', name: name || 'הנתבע', hebrewTitle: 'הבעל' };
  }
  return { title: 'הנתבעת', pronoun: 'היא', possessive: 'שלה', name: name || 'הנתבעת', hebrewTitle: 'האישה' };
}

function getSpouseTitle(gender?: 'male' | 'female'): string {
  return gender === 'male' ? 'בעלה' : 'אשתו';
}

function getMarriageQualityText(value: string): string {
  switch (value) {
    case 'excellent': return 'מצוינת - הייתה ביניהם אהבה והרמוניה';
    case 'good': return 'טובה - עם עליות וירידות רגילות';
    case 'difficult': return 'קשה מההתחלה';
    default: return value;
  }
}

function getCrisisDurationText(value: string): string {
  switch (value) {
    case 'recent': return 'לאחרונה (פחות מחודש)';
    case 'months': return 'מספר חודשים';
    case 'year': return 'כשנה';
    case 'years': return 'מספר שנים';
    default: return value;
  }
}

function getPreviousAttemptsText(value: string): string {
  switch (value) {
    case 'none': return 'לא נעשו ניסיונות קודמים לשיקום הנישואין';
    case 'ourselves': return 'הצדדים ניסו בעצמם לפתור את הבעיות';
    case 'family': return 'נעשו ניסיונות לשיקום הקשר בעזרת בני משפחה וחברים';
    case 'professional': return 'נעשו ניסיונות לשיקום הקשר בעזרת איש מקצוע (יועץ/מטפל)';
    default: return value;
  }
}

function getCommitmentText(value: string, plaintiff: GenderTerms): string {
  const verb = plaintiff.pronoun === 'היא' ? 'מביעה' : 'מביע';
  const committed = plaintiff.pronoun === 'היא' ? 'מחויבת' : 'מחויב';
  const willing = plaintiff.pronoun === 'היא' ? 'מוכנה' : 'מוכן';

  switch (value) {
    case 'full': return `${plaintiff.title} ${verb} מחויבות מלאה להצלת הנישואין ולשיקום התא המשפחתי`;
    case 'willing': return `${plaintiff.title} ${verb} נכונות אמיתית וכנה לעשות הכל על מנת לשקם את הנישואין`;
    case 'conditional': return `${plaintiff.title} ${willing} לנסות לשקם את הנישואין בתנאים מסוימים`;
    case 'lastResort': return `${plaintiff.title} רואה בתביעה זו הזדמנות אחרונה לשקם את הנישואין`;
    default: return value;
  }
}

function getLivingArrangementText(value: string): string {
  switch (value) {
    case 'together': return 'הצדדים גרים יחד תחת קורת גג אחת';
    case 'separated': return 'הצדדים גרים בנפרד כיום';
    case 'sameHouseSeparate': return 'הצדדים גרים באותו בית אך בחדרים נפרדים';
    default: return value;
  }
}

function getPartnerWillingnessText(value: string, defendant: GenderTerms): string {
  switch (value) {
    case 'yes': return `${defendant.title} הביע${defendant.pronoun === 'היא' ? 'ה' : ''} נכונות לנסות לשקם את הנישואין`;
    case 'maybe': return `${defendant.title} אינ${defendant.pronoun === 'היא' ? 'ה' : 'ו'} בטוח${defendant.pronoun === 'היא' ? 'ה' : ''} לגבי עמדת${defendant.pronoun === 'היא' ? 'ה' : 'ו'} אך לא שלל${defendant.pronoun === 'היא' ? 'ה' : ''} את האפשרות לשלום בית`;
    case 'no': return `${defendant.title} הביע${defendant.pronoun === 'היא' ? 'ה' : ''} רצון להתגרש, אולם ${plaintiff.title} מאמין${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי ניתן לשנות עמדה זו`;
    case 'unknown': return `עמדת${defendant.pronoun === 'היא' ? 'ה' : 'ו'} של ${defendant.title} אינה ידועה בוודאות`;
    default: return value;
  }
}

// Variable for plaintiff in partner willingness context
let plaintiff: GenderTerms;

function formatChildWithAge(child: Child): string {
  const name = `${child.firstName || ''} ${child.lastName || ''}`.trim() || 'קטין/ה';
  const idText = child.idNumber ? ` ת.ז ${child.idNumber}` : '';
  const birthText = child.birthDate ? `, יליד/ת ${formatDate(child.birthDate)}` : '';
  return `${name}${idText}${birthText}`;
}

// ==================== DOCUMENT FORMATTING FUNCTIONS ====================

/**
 * Create court header matching lawyer's format exactly
 */
function createRabbinicalCourtHeader(city: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Line 1: בבית הדין הרבני + תיק מס' (80 spaces between)
  const spaces80 = ' '.repeat(80);
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `בבית הדין הרבני${spaces80}תיק מס'`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING / 2 },
    })
  );

  // Line 2: City
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `ב${city}`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING * 2 },
    })
  );

  return paragraphs;
}

/**
 * Create parties section matching lawyer's format
 */
function createPartiesSection(
  basicInfo: BasicInfo,
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Plaintiff header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `התובע:\t\t\t ${basicInfo.fullName} ת.ז. ${basicInfo.idNumber}`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING / 2 },
    })
  );

  // (הבעל/האישה)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `(${plaintiff.hebrewTitle})\t\t\tע"י ב"כ עוה"ד  אריאל דרור`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING / 2 },
    })
  );

  // Lawyer address
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '\t\t\tרח\' היצירה 3 רמת גן',
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING / 2 },
    })
  );

  // Lawyer phone/fax
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '\t\t\tטל\' 03-6951408  פקס\' 03-6951683',
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING },
    })
  );

  // - נגד -
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '\t\t\t\t-    נגד   - ',
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING * 2, before: PARAGRAPH_SPACING },
    })
  );

  // Defendant header
  const phone2 = basicInfo.phone2 ? ` פלאפון מספר ${basicInfo.phone2}` : '';
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `הנתבע${defendant.pronoun === 'היא' ? 'ת' : ''}:\t\t`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
        new TextRun({
          text: `${basicInfo.fullName2} ת.ז. ${basicInfo.idNumber2}${phone2}`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING / 2 },
    })
  );

  // (הבעל/האישה)
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `(${defendant.hebrewTitle})\t\t\tמרחוב ${basicInfo.address2 || ''}`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      bidirectional: true,
      spacing: { after: PARAGRAPH_SPACING * 2 },
    })
  );

  return paragraphs;
}

/**
 * Create main title (underlined, centered)
 */
function createClaimTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: ` ${text}`,
        bold: true,
        underline: { type: UnderlineType.SINGLE },
        size: 40, // 20pt
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { before: PARAGRAPH_SPACING, after: PARAGRAPH_SPACING * 2 },
  });
}

/**
 * Create lettered section header (e.g., א.	כללי- רקע:)
 * Note: Underlined header matching lawyer's format
 */
function createLetteredSectionHeader(letter: string, title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${letter}.\t`,
        bold: true,
        underline: { type: UnderlineType.SINGLE },
        size: 32, // 16pt
        font: 'David',
        rightToLeft: true,
      }),
      new TextRun({
        text: `${title}:`,
        bold: true,
        underline: { type: UnderlineType.SINGLE },
        size: 32, // 16pt
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    bidirectional: true,
    spacing: { before: PARAGRAPH_SPACING * 2, after: PARAGRAPH_SPACING },
  });
}

/**
 * Create numbered paragraph item - with space after number for proper spacing
 */
function createNumberedParagraph(num: number, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${num}.  `, // Two spaces after period
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
      new TextRun({
        text: text,
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    bidirectional: true,
    spacing: { after: PARAGRAPH_SPACING, line: LINE_SPACING },
  });
}

/**
 * Create empty line for spacing
 */
function createEmptyLine(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: '',
        size: 24,
        font: 'David',
      }),
    ],
    spacing: { after: PARAGRAPH_SPACING },
  });
}

// ==================== SECTION GENERATORS ====================

/**
 * Section א - כללי - רקע (General Background)
 * Based on lawyer template structure
 * Returns paragraphs and last item number for continuous numbering
 */
async function generateBackgroundSection(
  basicInfo: BasicInfo,
  formData: FormData,
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Promise<{ paragraphs: Paragraph[], lastItemNum: number }> {
  const paragraphs: Paragraph[] = [];
  const shalomBayitData = formData.shalomBayit || {};
  const children = formData.children || [];
  const minorChildren = children.filter((child: Child) => isMinor(child.birthDate || ''));

  paragraphs.push(createLetteredSectionHeader('א', 'כללי- רקע'));

  // Paragraph 1: Marriage details
  const marriageDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '';
  let marriageText = `${plaintiff.title} (להלן: "${plaintiff.title}" ו/או "${plaintiff.hebrewTitle}") ו${defendant.title} (להלן: "${defendant.title}" ו/או "${defendant.hebrewTitle}") (להלן: "הצדדים" ו/או "בני הזוג") נישאו זה לזו כדת משה וישראל`;
  if (marriageDate) {
    marriageText += ` ביום ${marriageDate}`;
  }
  marriageText += '.';
  paragraphs.push(createNumberedParagraph(1, marriageText));

  // Paragraph 2: Children
  if (minorChildren.length > 0) {
    const childrenList = minorChildren.map(formatChildWithAge).join('; ו');
    const childWord = minorChildren.length === 1 ? 'ילדם/ילדתם' : `${minorChildren.length} ילדיהם`;
    const childrenText = `מנישואי בני הזוג נולד${minorChildren.length === 1 ? '' : 'ו'} לצדדים ${childWord}: ${childrenList}.`;
    paragraphs.push(createNumberedParagraph(2, childrenText));
  }

  // Paragraph 3: Marriage quality and relationship
  let nextNum = minorChildren.length > 0 ? 3 : 2;
  const marriageQuality = shalomBayitData.marriageQuality;
  if (marriageQuality) {
    const qualityText = getMarriageQualityText(marriageQuality);
    const believeVerb = plaintiff.pronoun === 'היא' ? 'מאמינה' : 'מאמין';
    paragraphs.push(createNumberedParagraph(nextNum++,
      `${plaintiff.title}, אשר נישא${plaintiff.pronoun === 'היא' ? 'ה' : ''} ל${defendant.title} מאהבה ומתוך תקווה לבנות עמ${defendant.pronoun === 'היא' ? 'ה' : 'ו'} בית חם ומשפחה, ${believeVerb} כי ניתן לשקם את הנישואין. מערכת היחסים בתחילת הנישואין הייתה ${qualityText}.`
    ));
  }

  // Paragraph 4: Crisis details
  const crisisDuration = shalomBayitData.crisisDuration;
  const crisisReasons = shalomBayitData.crisisReasons;

  if (crisisDuration || crisisReasons) {
    let crisisText = '';
    if (crisisDuration) {
      crisisText = `המשבר הנוכחי בין הצדדים החל לפני ${getCrisisDurationText(crisisDuration)}.`;
    }

    // For Shalom Bayit: Don't detail crisis reasons in accusatory way
    // Instead, acknowledge crisis exists while expressing faith in reconciliation
    // Use plaintiff.hebrewTitle (הבעל/האישה) after ל to avoid "להתובע"
    const faithText = `חרף המשבר שפוקד את בני הזוג, ל${plaintiff.hebrewTitle} אמונה מלאה כי ניתן לאחות את השברים ולחבר את בני הזוג לחיים משותפים ככל בני הזוג.`;

    if (crisisDuration) {
      // Just mention duration + faith, don't detail reasons in blaming way
      paragraphs.push(createNumberedParagraph(nextNum++, crisisText + ' ' + faithText));
    } else if (crisisReasons) {
      // If no duration but reasons provided, just express faith without details
      paragraphs.push(createNumberedParagraph(nextNum++, faithText));
    }
  }

  // Living arrangement and separation
  const livingArrangement = shalomBayitData.livingArrangement;
  const livingSeparately = formData.livingSeparately;
  const separationDate = formData.separationDate;

  if (livingArrangement || livingSeparately === 'כן') {
    let livingText = getLivingArrangementText(livingArrangement || 'separated');
    if (separationDate && (livingSeparately === 'כן' || livingArrangement === 'separated' || livingArrangement === 'sameHouseSeparate')) {
      livingText += `, וזאת מאז ${formatDate(separationDate)}`;
    }
    livingText += '.';
    paragraphs.push(createNumberedParagraph(nextNum++, livingText));
  }

  // Additional info about the situation (if provided)
  const additionalInfo = shalomBayitData.additionalInfo;
  if (additionalInfo && typeof additionalInfo === 'string' && additionalInfo.trim()) {
    try {
      const context: TransformContext = {
        claimType: 'תביעה לשלום בית',
        applicantName: plaintiff.name,
        respondentName: defendant.name,
        fieldLabel: 'מידע נוסף',
        additionalContext: 'יש לכתוב בגוף שלישי, בצורה עניינית, כפי שנכתב במסמך משפטי לבית דין רבני',
      };
      const transformed = await transformToLegalLanguage(additionalInfo, context);
      paragraphs.push(createNumberedParagraph(nextNum++, transformed));
    } catch {
      paragraphs.push(createNumberedParagraph(nextNum++, additionalInfo));
    }
  }

  return { paragraphs, lastItemNum: nextNum - 1 };
}

/**
 * Section ב - יש למצות את הליך שלום הבית
 * (The reconciliation process must be exhausted)
 * Note: Final request paragraph is included at the end of this section
 */
async function generateReconciliationSection(
  basicInfo: BasicInfo,
  formData: FormData,
  plaintiff: GenderTerms,
  defendant: GenderTerms,
  startingItemNum: number
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  const shalomBayitData = formData.shalomBayit || {};
  const children = formData.children || [];
  const minorChildren = children.filter((child: Child) => isMinor(child.birthDate || ''));

  paragraphs.push(createEmptyLine());
  paragraphs.push(createLetteredSectionHeader('ב', 'יש למצות את הליך שלום הבית- וזאת מהסיבות הבאות'));

  let itemNum = startingItemNum;
  const believeVerb = plaintiff.pronoun === 'היא' ? 'תטען' : 'יטען';
  const marriedVerb = plaintiff.pronoun === 'היא' ? 'התחתנה' : 'התחתן';

  // Main argument - reconciliation hasn't been exhausted
  paragraphs.push(createNumberedParagraph(itemNum++,
    `${plaintiff.title} ${believeVerb} כי ניסיון שלום הבית לא מוצה. בקשר בין בני זוג תמיד יש ותמיד יהיו עליות ומורדות, ועליהם לדעת להתמודד איתם. ${plaintiff.title} לא ${marriedVerb} כדי להתגרש, ו${plaintiff.pronoun} מאמין${plaintiff.pronoun === 'היא' ? 'ה' : ''} בלב שלם כי ניתן לתקן הכל.`
  ));

  // Children argument (like in the reference: "וכאשר בתווך מצויה ילדה...")
  if (minorChildren.length > 0) {
    const childRef = minorChildren.length === 1 ? 'ילד/ה' : 'ילדים';
    const deserveWord = minorChildren.length === 1 ? 'ראוי/ה' : 'ראויים';
    paragraphs.push(createNumberedParagraph(itemNum++,
      `לצדדים ${minorChildren.length === 1 ? 'ילד/ה קטין/ה' : `${minorChildren.length} ילדים קטינים`} אשר ${deserveWord} לגור עם שני הוריהם בתא משפחתי שלם ומתפקד. על כן מגיש/ה כעת ${plaintiff.title} תביעה זו, על מנת ליתן סיכוי אמיתי לשקם הנישואין ולחזור לשלום בית, למען המשפחה.`
    ));
  }

  // Previous attempts - for Shalom Bayit, downplay failures and express optimism
  const previousAttempts = shalomBayitData.previousAttempts;
  if (previousAttempts === 'professional') {
    // Don't detail what failed - express optimism about court-sponsored therapy
    paragraphs.push(createNumberedParagraph(itemNum++,
      `הצדדים ניסו לשקם את הקשר בעזרת איש מקצוע. ${plaintiff.title} סבור${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי טיפול בחסות בית הדין, בוודאי יתן את פירותיו.`
    ));
  } else if (previousAttempts) {
    paragraphs.push(createNumberedParagraph(itemNum++, getPreviousAttemptsText(previousAttempts)));
  }

  // Partner willingness
  const partnerWillingness = shalomBayitData.partnerWillingness;
  if (partnerWillingness) {
    paragraphs.push(createNumberedParagraph(itemNum++, getPartnerWillingnessText(partnerWillingness, defendant)));
  }

  // What would help
  const whatWouldHelp = shalomBayitData.whatWouldHelp;
  if (whatWouldHelp && typeof whatWouldHelp === 'string' && whatWouldHelp.trim()) {
    try {
      const context: TransformContext = {
        claimType: 'תביעה לשלום בית',
        applicantName: plaintiff.name,
        respondentName: defendant.name,
        fieldLabel: 'מה יכול לסייע בשיקום הנישואין',
        additionalContext: 'יש לכתוב בגוף שלישי, בצורה עניינית כמסמך משפטי',
      };
      const transformed = await transformToLegalLanguage(whatWouldHelp, context);
      paragraphs.push(createNumberedParagraph(itemNum++, `${plaintiff.title} סבור${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי ${transformed}`));
    } catch {
      paragraphs.push(createNumberedParagraph(itemNum++, `${plaintiff.title} סבור${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי: ${whatWouldHelp}`));
    }
  }

  // Commitment
  const commitment = shalomBayitData.commitment;
  if (commitment) {
    paragraphs.push(createNumberedParagraph(itemNum++, getCommitmentText(commitment, plaintiff)));
  }

  // No grounds for divorce
  paragraphs.push(createNumberedParagraph(itemNum++,
    `יודגש כי לא קיימת כל עילת גירושין בין הצדדים אשר יש בה כדי למנוע את מיצוי הליך שלום הבית. ${plaintiff.title} מאמין${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי גם המשברים הקיימים הינם נפוצים, מצויים אצל זוגות רבים, וניתנים לתיקון.`
  ));

  // Willingness to do everything
  const readyVerb = plaintiff.pronoun === 'היא' ? 'מוכנה' : 'מוכן';
  paragraphs.push(createNumberedParagraph(itemNum++,
    `${plaintiff.title} ${readyVerb} ללכת לכל סוג של ייעוץ, ולבצע את כל שיוטל עלי${plaintiff.pronoun === 'היא' ? 'ה' : 'ו'} על מנת לנסות ולשקם הנישואין, בצורה כנה ואמיתית.`
  ));

  // Final request - as part of section ב (like in lawyer's template - item 15)
  paragraphs.push(createNumberedParagraph(itemNum++,
    `אשר על כן, מבוקש כי כב' ביה"ד יורה על שלום בית, לרבות שליחת הצדדים לטיפול זוגי מקיף לצורך פתרון המשבר אליו נקלעו.`
  ));

  return paragraphs;
}

// Request section removed - request is now part of section ב (final numbered item)

/**
 * Generate signature section matching lawyer's format
 */
function generateSignatureSection(
  basicInfo: BasicInfo,
  plaintiff: GenderTerms,
  signature?: string | Buffer,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Spacing before signatures
  paragraphs.push(createEmptyLine());
  paragraphs.push(createEmptyLine());
  paragraphs.push(createEmptyLine());

  // Two-column signature layout (plaintiff on right, lawyer on left)
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: '_____________\t\t\t\t\t\t____________',
        font: 'David',
        size: 24,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: PARAGRAPH_SPACING / 2 },
  }));

  // Names
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `${basicInfo.fullName}\t\t\t\t\t\t   אריאל דרור, עו"ד`,
        font: 'David',
        size: 24,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: PARAGRAPH_SPACING / 2 },
  }));

  // Titles
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `${plaintiff.title}\t\t\t\t\t\t\t\tב"כ ${plaintiff.title}`,
        font: 'David',
        size: 24,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
  }));

  return paragraphs;
}

// ==================== MAIN EXPORT FUNCTION ====================

export async function generateShalomBayitClaim(data: ShalomBayitData): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature } = data;

  console.log('📋 Generating Shalom Bayit claim (תביעה לשלום בית)...');

  // Get gendered terms
  plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Build document sections
  const sections: Paragraph[] = [];

  // Court header (matching lawyer's format)
  const city = basicInfo.address?.split(',').pop()?.trim() || 'תל אביב';
  sections.push(...createRabbinicalCourtHeader(city));

  // Parties section (plaintiff/defendant)
  sections.push(...createPartiesSection(basicInfo, plaintiff, defendant));

  // Main title (underlined, centered)
  sections.push(createClaimTitle('תביעה לשלום בית'));

  // Section א - Background
  const { paragraphs: backgroundParagraphs, lastItemNum } = await generateBackgroundSection(basicInfo, formData, plaintiff, defendant);
  sections.push(...backgroundParagraphs);

  // Section ב - Reconciliation must be exhausted (continues numbering from section א)
  sections.push(...await generateReconciliationSection(basicInfo, formData, plaintiff, defendant, lastItemNum + 1));

  // Signature section
  sections.push(...generateSignatureSection(basicInfo, plaintiff, signature, lawyerSignature));

  // Page break before Power of Attorney
  sections.push(createPageBreak());

  // Power of Attorney (for Rabbinical Court)
  sections.push(...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature, 'שלום בית'));

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
          },
        },
        children: sections,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'David',
                    size: FONT_SIZES.SMALL,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'David',
            size: FONT_SIZES.BODY,
          },
        },
      },
    },
  });

  console.log('✅ Shalom Bayit claim generated successfully');
  return await Packer.toBuffer(doc);
}

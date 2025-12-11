/**
 * Shalom Bayit Claim Document Generator (תביעה לשלום בית)
 * Generates reconciliation claim documents for Rabbinical Court (בית הדין הרבני)
 *
 * Structure (based on lawyer-approved template):
 * א. כללי - רקע (General Background)
 * ב. יש למצות את הליך שלום הבית (The reconciliation process must be exhausted)
 * + Request section
 * + Power of Attorney
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
} from 'docx';
import { BasicInfo, FormData, ClaimType, Child } from '@/lib/api/types';
import { transformToLegalLanguage, TransformContext } from './groq-service';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  createBodyParagraph,
  createMainTitle,
  createSectionHeader,
  createSubsectionHeader,
  createPageBreak,
  createSignatureImage,
  createCourtHeader,
  generatePowerOfAttorney,
  createLetteredHeader,
  createNumberedItem,
  isMinor,
} from './shared-document-generators';

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
    case 'no': return `${defendant.title} הביע${defendant.pronoun === 'היא' ? 'ה' : ''} רצון להתגרש, אולם ${plaintiff.title} מאמינ${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי ניתן לשנות עמדה זו`;
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

// ==================== SECTION GENERATORS ====================

/**
 * Section א - כללי - רקע (General Background)
 * Based on lawyer template structure
 */
async function generateBackgroundSection(
  basicInfo: BasicInfo,
  formData: FormData,
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  const shalomBayitData = formData.shalomBayit || {};
  const children = formData.children || [];
  const minorChildren = children.filter((child: Child) => isMinor(child.birthDate || ''));

  paragraphs.push(createLetteredHeader('א', 'כללי - רקע'));

  // Paragraph 1: Marriage details
  const marriageDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '';
  let marriageText = `${plaintiff.title} (להלן: "${plaintiff.title}" ו/או "${plaintiff.hebrewTitle}") ו${defendant.title} (להלן: "${defendant.title}" ו/או "${defendant.hebrewTitle}") (להלן: "הצדדים" ו/או "בני הזוג") נישאו זה לזו כדת משה וישראל`;
  if (marriageDate) {
    marriageText += ` ביום ${marriageDate}`;
  }
  marriageText += '.';
  paragraphs.push(createNumberedItem(1, marriageText));

  // Paragraph 2: Children
  if (minorChildren.length > 0) {
    const childrenList = minorChildren.map(formatChildWithAge).join('; ו');
    const childWord = minorChildren.length === 1 ? 'ילדם/ילדתם' : `${minorChildren.length} ילדיהם`;
    const childrenText = `מנישואי בני הזוג נולד${minorChildren.length === 1 ? '' : 'ו'} לצדדים ${childWord}: ${childrenList}.`;
    paragraphs.push(createNumberedItem(2, childrenText));
  }

  // Paragraph 3: Marriage quality and relationship
  let nextNum = minorChildren.length > 0 ? 3 : 2;
  const marriageQuality = shalomBayitData.marriageQuality;
  if (marriageQuality) {
    const qualityText = getMarriageQualityText(marriageQuality);
    const believeVerb = plaintiff.pronoun === 'היא' ? 'מאמינה' : 'מאמין';
    paragraphs.push(createNumberedItem(nextNum++,
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

    if (crisisReasons && typeof crisisReasons === 'string' && crisisReasons.trim()) {
      try {
        const context: TransformContext = {
          claimType: 'תביעה לשלום בית',
          applicantName: plaintiff.name,
          respondentName: defendant.name,
          fieldLabel: 'רקע למשבר',
          additionalContext: 'יש לכתוב בגוף שלישי, בצורה עניינית, כפי שנכתב במסמך משפטי לבית דין רבני',
        };
        const transformed = await transformToLegalLanguage(crisisReasons, context);
        crisisText += crisisText ? ' ' + transformed : transformed;
      } catch {
        crisisText += crisisText ? ' ' + crisisReasons : crisisReasons;
      }
    }

    if (crisisText) {
      paragraphs.push(createNumberedItem(nextNum++, crisisText));
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
    paragraphs.push(createNumberedItem(nextNum++, livingText));
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
      paragraphs.push(createNumberedItem(nextNum++, transformed));
    } catch {
      paragraphs.push(createNumberedItem(nextNum++, additionalInfo));
    }
  }

  return paragraphs;
}

/**
 * Section ב - יש למצות את הליך שלום הבית
 * (The reconciliation process must be exhausted)
 */
async function generateReconciliationSection(
  basicInfo: BasicInfo,
  formData: FormData,
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  const shalomBayitData = formData.shalomBayit || {};
  const children = formData.children || [];
  const minorChildren = children.filter((child: Child) => isMinor(child.birthDate || ''));

  paragraphs.push(createLetteredHeader('ב', 'יש למצות את הליך שלום הבית - מהסיבות הבאות'));

  let itemNum = 1;
  const believeVerb = plaintiff.pronoun === 'היא' ? 'תטען' : 'יטען';
  const marriedVerb = plaintiff.pronoun === 'היא' ? 'התחתנה' : 'התחתן';

  // Main argument - reconciliation hasn't been exhausted
  paragraphs.push(createNumberedItem(itemNum++,
    `${plaintiff.title} ${believeVerb} כי ניסיון שלום הבית לא מוצה. בקשר בין בני זוג תמיד יש ותמיד יהיו עליות ומורדות, ועליהם לדעת להתמודד איתם. ${plaintiff.title} לא ${marriedVerb} כדי להתגרש, ו${plaintiff.pronoun} מאמינ${plaintiff.pronoun === 'היא' ? 'ה' : ''} בלב שלם כי ניתן לתקן הכל.`
  ));

  // Children argument
  if (minorChildren.length > 0) {
    const childWord = minorChildren.length === 1 ? 'ילדה' : 'ילדים';
    const deserveWord = minorChildren.length === 1 ? 'ראוי/ה' : 'ראויים';
    paragraphs.push(createNumberedItem(itemNum++,
      `לצדדים ${minorChildren.length === 1 ? 'ילד/ה קטין/ה' : `${minorChildren.length} ילדים קטינים`} אשר ${deserveWord} לגור עם שני הוריהם בתא משפחתי שלם ומתפקד. על כן מגיש/ה כעת ${plaintiff.title} תביעה זו, על מנת ליתן סיכוי אמיתי לשקם הנישואין ולחזור לשלום בית, למען המשפחה.`
    ));
  }

  // Previous attempts
  const previousAttempts = shalomBayitData.previousAttempts;
  if (previousAttempts) {
    paragraphs.push(createNumberedItem(itemNum++, getPreviousAttemptsText(previousAttempts)));
  }

  // Counseling details
  const counselingDetails = shalomBayitData.counselingDetails;
  if (previousAttempts === 'professional' && counselingDetails) {
    try {
      const context: TransformContext = {
        claimType: 'תביעה לשלום בית',
        applicantName: plaintiff.name,
        respondentName: defendant.name,
        fieldLabel: 'פרטי הטיפול/ייעוץ',
        additionalContext: 'יש לכתוב בגוף שלישי, כמסמך משפטי, ולציין כי הטיפול לא מוצה',
      };
      const transformed = await transformToLegalLanguage(counselingDetails, context);
      paragraphs.push(createNumberedItem(itemNum++, transformed));
    } catch {
      paragraphs.push(createNumberedItem(itemNum++, `פרטי הטיפול: ${counselingDetails}`));
    }
  }

  // Partner willingness
  const partnerWillingness = shalomBayitData.partnerWillingness;
  if (partnerWillingness) {
    paragraphs.push(createNumberedItem(itemNum++, getPartnerWillingnessText(partnerWillingness, defendant)));
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
      paragraphs.push(createNumberedItem(itemNum++, `${plaintiff.title} סבור${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי ${transformed}`));
    } catch {
      paragraphs.push(createNumberedItem(itemNum++, `${plaintiff.title} סבור${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי: ${whatWouldHelp}`));
    }
  }

  // Commitment
  const commitment = shalomBayitData.commitment;
  if (commitment) {
    paragraphs.push(createNumberedItem(itemNum++, getCommitmentText(commitment, plaintiff)));
  }

  // No grounds for divorce
  paragraphs.push(createNumberedItem(itemNum++,
    `יודגש כי לא קיימת כל עילת גירושין בין הצדדים אשר יש בה כדי למנוע את מיצוי הליך שלום הבית. ${plaintiff.title} מאמינ${plaintiff.pronoun === 'היא' ? 'ה' : ''} כי גם המשברים הקיימים הינם נפוצים, מצויים אצל זוגות רבים, וניתנים לתיקון.`
  ));

  // Willingness to do everything
  const readyVerb = plaintiff.pronoun === 'היא' ? 'מוכנה' : 'מוכן';
  paragraphs.push(createNumberedItem(itemNum++,
    `${plaintiff.title} ${readyVerb} ללכת לכל סוג של ייעוץ, ולבצע את כל שיוטל עלי${plaintiff.pronoun === 'היא' ? 'ה' : 'ו'} על מנת לנסות ולשקם הנישואין, בצורה כנה ואמיתית.`
  ));

  return paragraphs;
}

/**
 * Generate request section
 */
function generateRequestSection(
  plaintiff: GenderTerms,
  defendant: GenderTerms
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(createSectionHeader('הבקשה'));

  paragraphs.push(createBodyParagraph(
    `אשר על כן, מבקש/ת ${plaintiff.title} מכבוד בית הדין:`
  ));

  paragraphs.push(createNumberedItem(1, 'להורות על שלום בית.'));
  paragraphs.push(createNumberedItem(2, 'לשלוח את הצדדים לטיפול זוגי מקיף לצורך פתרון המשבר אליו נקלעו.'));
  paragraphs.push(createNumberedItem(3, 'להפנות את הצדדים ליחידת הסיוע לצורך ייעוץ.'));
  paragraphs.push(createNumberedItem(4, `לחייב את ${defendant.title} לשוב לחיי שלום בית עם ${plaintiff.title}.`));
  paragraphs.push(createNumberedItem(5, 'כל סעד אחר שכבוד בית הדין ימצא לנכון.'));

  return paragraphs;
}

/**
 * Generate signature section
 */
function generateSignatureSection(
  basicInfo: BasicInfo,
  plaintiff: GenderTerms,
  signature?: string | Buffer,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Spacing before signatures
  paragraphs.push(new Paragraph({ children: [], spacing: { before: SPACING.SECTION * 2 } }));

  // Two-column signature layout (plaintiff on right, lawyer on left)
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: '_____________\t\t\t\t_____________',
        font: 'David',
        size: FONT_SIZES.BODY,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: SPACING.MINIMAL },
  }));

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `${basicInfo.fullName}\t\t\t\t\tעו"ד אריאל דרור`,
        font: 'David',
        size: FONT_SIZES.BODY,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: SPACING.MINIMAL },
  }));

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `${plaintiff.title}\t\t\t\t\tב"כ ${plaintiff.title}`,
        font: 'David',
        size: FONT_SIZES.BODY,
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

  // Court header
  const city = basicInfo.address?.split(',').pop()?.trim() || 'תל אביב';
  sections.push(...createCourtHeader({
    city,
    judgeName: '',
    basicInfo,
    forum: 'בבית הדין הרבני',
    showJudgeLine: false,
    showChildrenList: false,
    docketNumberPlaceholder: 'תיק מס\' ____________',
  }));

  // Main title
  sections.push(createMainTitle('תביעה לשלום בית'));

  // Section א - Background
  sections.push(...await generateBackgroundSection(basicInfo, formData, plaintiff, defendant));

  // Section ב - Reconciliation must be exhausted
  sections.push(...await generateReconciliationSection(basicInfo, formData, plaintiff, defendant));

  // Request section
  sections.push(...generateRequestSection(plaintiff, defendant));

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

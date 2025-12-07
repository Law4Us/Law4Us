/**
 * Shalom Bayit Claim Document Generator (תביעה לשלום בית)
 * Generates reconciliation claim documents for Rabbinical Court (בית הדין הרבני)
 *
 * Structure:
 * א. פתיחה - Opening
 * ב. רקע - Background
 * ג. ניסיונות פיוס - Previous Reconciliation Attempts
 * ד. בקשה - Request
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
  ImageRun,
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData, ClaimType } from '@/lib/api/types';
import { transformToLegalLanguage } from './groq-service';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  createBodyParagraph,
  createMainTitle,
  createPageBreak,
  createSignatureImage,
  createCourtHeader,
  generatePowerOfAttorney,
  createLetteredHeader,
} from './shared-document-generators';
import { TransformContext } from './groq-service';

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
}

// ==================== HELPER FUNCTIONS ====================

function getPlaintiffTerm(gender?: 'male' | 'female', name?: string): GenderTerms {
  if (gender === 'male') {
    return { title: 'התובע', pronoun: 'הוא', possessive: 'שלו', name: name || 'התובע' };
  }
  return { title: 'התובעת', pronoun: 'היא', possessive: 'שלה', name: name || 'התובעת' };
}

function getDefendantTerm(gender?: 'male' | 'female', name?: string): GenderTerms {
  if (gender === 'male') {
    return { title: 'הנתבע', pronoun: 'הוא', possessive: 'שלו', name: name || 'הנתבע' };
  }
  return { title: 'הנתבעת', pronoun: 'היא', possessive: 'שלה', name: name || 'הנתבעת' };
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
    case 'months': return 'לפני מספר חודשים';
    case 'year': return 'לפני כשנה';
    case 'years': return 'כבר שנים';
    default: return value;
  }
}

function getPreviousAttemptsText(value: string): string {
  switch (value) {
    case 'none': return 'לא נעשו ניסיונות קודמים';
    case 'ourselves': return 'הצדדים ניסו בעצמם לפתור את הבעיות';
    case 'family': return 'נעשו ניסיונות בעזרת בני משפחה וחברים';
    case 'professional': return 'נעשו ניסיונות בעזרת איש מקצוע (יועץ/מטפל)';
    default: return value;
  }
}

function getCommitmentText(value: string): string {
  switch (value) {
    case 'full': return 'מחויבות מלאה להצלת הנישואין';
    case 'willing': return 'נכונות רצינית לנסות';
    case 'conditional': return 'בתנאים מסוימים';
    case 'lastResort': return 'הזדמנות אחרונה';
    default: return value;
  }
}

function getLivingArrangementText(value: string): string {
  switch (value) {
    case 'together': return 'הצדדים גרים יחד';
    case 'separated': return 'הצדדים גרים בנפרד';
    case 'sameHouseSeparate': return 'הצדדים גרים באותו בית אך בנפרד';
    default: return value;
  }
}

// ==================== SECTION GENERATORS ====================

function generateOpeningSection(
  plaintiff: GenderTerms,
  defendant: GenderTerms,
  basicInfo: BasicInfo
): Paragraph[] {
  const marriageDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '';
  const spouseTitle = getSpouseTitle(basicInfo.gender2);

  return [
    createLetteredHeader('א', 'פתיחה'),
    createBodyParagraph(
      `${plaintiff.title}, ${plaintiff.name}, ת.ז ${basicInfo.idNumber}, מגיש/ה בזאת תביעה לשלום בית כנגד ${spouseTitle}, ${defendant.name}, ת.ז ${basicInfo.idNumber2}.`
    ),
    createBodyParagraph(
      `הצדדים נישאו זה לזו בתאריך ${marriageDate} כדת משה וישראל.`
    ),
    createBodyParagraph(
      `${plaintiff.title} מבקש/ת להציל את הנישואין ולשוב לחיי שלום בית עם ${defendant.title}.`
    ),
  ];
}

async function generateBackgroundSection(
  plaintiff: GenderTerms,
  defendant: GenderTerms,
  formData: FormData
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [
    createLetteredHeader('ב', 'רקע'),
  ];

  // Marriage quality
  const marriageQuality = formData['shalomBayit.marriageQuality'];
  if (marriageQuality) {
    paragraphs.push(createBodyParagraph(
      `מערכת היחסים בתחילת הנישואין הייתה ${getMarriageQualityText(marriageQuality)}.`
    ));
  }

  // Crisis duration
  const crisisDuration = formData['shalomBayit.crisisDuration'];
  if (crisisDuration) {
    paragraphs.push(createBodyParagraph(
      `המשבר הנוכחי החל ${getCrisisDurationText(crisisDuration)}.`
    ));
  }

  // Crisis reasons - transform with AI
  const crisisReasons = formData['shalomBayit.crisisReasons'];
  if (crisisReasons && typeof crisisReasons === 'string' && crisisReasons.trim()) {
    try {
      const context: TransformContext = {
        claimType: 'תביעה לשלום בית',
        applicantName: plaintiff.name,
        respondentName: defendant.name,
        fieldLabel: 'סיבות המשבר',
      };
      const transformed = await transformToLegalLanguage(crisisReasons, context);
      paragraphs.push(createBodyParagraph(transformed));
    } catch {
      paragraphs.push(createBodyParagraph(crisisReasons));
    }
  }

  // Living arrangement
  const livingArrangement = formData['shalomBayit.livingArrangement'];
  if (livingArrangement) {
    paragraphs.push(createBodyParagraph(getLivingArrangementText(livingArrangement)));
  }

  return paragraphs;
}

function generateReconciliationAttemptsSection(
  formData: FormData
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    createLetteredHeader('ג', 'ניסיונות פיוס קודמים'),
  ];

  const previousAttempts = formData['shalomBayit.previousAttempts'];
  if (previousAttempts) {
    paragraphs.push(createBodyParagraph(getPreviousAttemptsText(previousAttempts)));
  }

  // Counseling details if professional help was sought
  const counselingDetails = formData['shalomBayit.counselingDetails'];
  if (previousAttempts === 'professional' && counselingDetails) {
    paragraphs.push(createBodyParagraph(`פרטי הטיפול: ${counselingDetails}`));
  }

  // Partner willingness
  const partnerWillingness = formData['shalomBayit.partnerWillingness'];
  if (partnerWillingness) {
    let willingnessText = '';
    switch (partnerWillingness) {
      case 'yes': willingnessText = 'בן/בת הזוג הביע/ה נכונות לנסות שלום בית.'; break;
      case 'maybe': willingnessText = 'בן/בת הזוג אינו/ה בטוח/ה לגבי נכונותו/ה לשלום בית.'; break;
      case 'no': willingnessText = 'בן/בת הזוג הביע/ה רצון להתגרש.'; break;
      case 'unknown': willingnessText = 'עמדת בן/בת הזוג אינה ידועה.'; break;
    }
    if (willingnessText) {
      paragraphs.push(createBodyParagraph(willingnessText));
    }
  }

  return paragraphs;
}

async function generateRequestSection(
  plaintiff: GenderTerms,
  defendant: GenderTerms,
  formData: FormData
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [
    createLetteredHeader('ד', 'הבקשה'),
  ];

  // Commitment level
  const commitment = formData['shalomBayit.commitment'];
  if (commitment) {
    paragraphs.push(createBodyParagraph(
      `${plaintiff.title} מביע/ה ${getCommitmentText(commitment)}.`
    ));
  }

  // What would help
  const whatWouldHelp = formData['shalomBayit.whatWouldHelp'];
  if (whatWouldHelp && typeof whatWouldHelp === 'string' && whatWouldHelp.trim()) {
    try {
      const context: TransformContext = {
        claimType: 'תביעה לשלום בית',
        applicantName: plaintiff.name,
        respondentName: defendant.name,
        fieldLabel: 'מה יכול לעזור',
      };
      const transformed = await transformToLegalLanguage(whatWouldHelp, context);
      paragraphs.push(createBodyParagraph(`${plaintiff.title} סבור/ה כי: ${transformed}`));
    } catch {
      paragraphs.push(createBodyParagraph(`${plaintiff.title} סבור/ה כי: ${whatWouldHelp}`));
    }
  }

  // Additional info
  const additionalInfo = formData['shalomBayit.additionalInfo'];
  if (additionalInfo && typeof additionalInfo === 'string' && additionalInfo.trim()) {
    paragraphs.push(createBodyParagraph(additionalInfo));
  }

  // Final request
  paragraphs.push(createBodyParagraph(
    `לאור האמור לעיל, מבקש/ת ${plaintiff.title} מבית הדין הנכבד:`
  ));
  paragraphs.push(createBodyParagraph('1. לזמן את הצדדים לדיון בעניין שלום הבית.'));
  paragraphs.push(createBodyParagraph('2. להפנות את הצדדים לייעוץ זוגי/גישור במידת הצורך.'));
  paragraphs.push(createBodyParagraph('3. לקבוע הסדרים זמניים שיסייעו לשיקום הקשר.'));
  paragraphs.push(createBodyParagraph(`4. לחייב את ${defendant.title} לשוב לחיי שלום בית עם ${plaintiff.title}.`));
  paragraphs.push(createBodyParagraph('5. כל סעד אחר שבית הדין ימצא לנכון.'));

  return paragraphs;
}

function generateSignatureSection(
  basicInfo: BasicInfo,
  signature?: string | Buffer,
  lawyerSignature?: string | Buffer
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(new Paragraph({
    children: [],
    spacing: { before: SPACING.SECTION },
  }));

  // Date
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `תאריך: ${formatDate(new Date().toISOString())}`,
        font: 'David',
        size: FONT_SIZES.BODY,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.LEFT,
    bidirectional: true,
    spacing: { after: SPACING.PARAGRAPH },
  }));

  // Plaintiff name
  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: `בכבוד רב,`,
        font: 'David',
        size: FONT_SIZES.BODY,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.LEFT,
    bidirectional: true,
    spacing: { after: SPACING.PARAGRAPH },
  }));

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: basicInfo.fullName,
        font: 'David',
        size: FONT_SIZES.BODY,
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.LEFT,
    bidirectional: true,
    spacing: { after: SPACING.MINIMAL },
  }));

  // Client signature
  if (signature) {
    const signatureImage = createSignatureImage(signature);
    if (signatureImage) {
      paragraphs.push(new Paragraph({
        children: [signatureImage],
        alignment: AlignmentType.LEFT,
        spacing: { before: SPACING.MINIMAL },
      }));
    }
  }

  // Lawyer signature
  if (lawyerSignature) {
    paragraphs.push(new Paragraph({
      children: [],
      spacing: { before: SPACING.SUBSECTION },
    }));

    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: 'באמצעות ב"כ:',
          font: 'David',
          size: FONT_SIZES.BODY,
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.LEFT,
      bidirectional: true,
      spacing: { after: SPACING.MINIMAL },
    }));

    const lawyerSigImage = createSignatureImage(lawyerSignature);
    if (lawyerSigImage) {
      paragraphs.push(new Paragraph({
        children: [lawyerSigImage],
        alignment: AlignmentType.LEFT,
        spacing: { before: SPACING.MINIMAL },
      }));
    }
  }

  return paragraphs;
}

// ==================== MAIN EXPORT FUNCTION ====================

export async function generateShalomBayitClaim(data: ShalomBayitData): Promise<Buffer> {
  const { basicInfo, formData, signature, lawyerSignature } = data;

  // Get gendered terms
  const plaintiff = getPlaintiffTerm(basicInfo.gender, basicInfo.fullName);
  const defendant = getDefendantTerm(basicInfo.gender2, basicInfo.fullName2);

  // Build document sections
  const sections: Paragraph[] = [];

  // Court header
  const city = basicInfo.address?.split(',')[0]?.trim() || '';
  sections.push(...createCourtHeader({
    city,
    judgeName: '',
    basicInfo,
    forum: 'בבית הדין הרבני',
    showJudgeLine: false,
  }));

  // Main title
  sections.push(createMainTitle('תביעה לשלום בית'));

  // Opening section
  sections.push(...generateOpeningSection(plaintiff, defendant, basicInfo));

  // Background section (async for AI transformation)
  sections.push(...await generateBackgroundSection(plaintiff, defendant, formData));

  // Reconciliation attempts section
  sections.push(...generateReconciliationAttemptsSection(formData));

  // Request section (async for AI transformation)
  sections.push(...await generateRequestSection(plaintiff, defendant, formData));

  // Signature section
  sections.push(...generateSignatureSection(basicInfo, signature, lawyerSignature));

  // Page break before Power of Attorney
  sections.push(createPageBreak());

  // Power of Attorney
  sections.push(...generatePowerOfAttorney(basicInfo, formData, signature, lawyerSignature, 'גירושין'));

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

  // Generate buffer
  return await Packer.toBuffer(doc);
}

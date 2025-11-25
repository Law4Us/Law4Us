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
  createLetteredHeader,
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

function ensureRabbinicalCourt(text: string): string {
  if (!text) return text;
  return text.replace(/בית המשפט/gu, 'בית הדין הרבני');
}

function formatPropertyItem(item: any, fallbackOwner: string = ''): string {
  const desc = item.description || item.address || 'פריט רכוש';
  const owner = item.owner || fallbackOwner || 'לא צוין';
  const value = item.value || item.amount || '';
  const extra = item.purchaseDate ? `, נרכש בשנת ${item.purchaseDate}` : '';
  const suffix = value ? `, שווי מוערך: ${value}` : '';
  return `${desc} (בבעלות ${owner}${extra}${suffix})`;
}

function buildAnnexList(attachments?: Array<{ label: string; description: string }>): string[] {
  if (!attachments || attachments.length === 0) return [];
  return attachments.map((att, idx) => `${att.label || `נספח ${idx + 1}`}: ${att.description || 'מסמך מצורף'}`);
}

type DivorceTrack = 'divorce_only' | 'divorce_with_reliefs' | 'shalom_bayit_alt';

function resolveDivorceTrack(
  divorceData: any,
  formData: FormData,
  selectedClaims?: ClaimType[]
): DivorceTrack {
  const wantsReconciliation = divorceData?.reconcileNow === 'כן';
  const wantsDivorce = divorceData?.wantDivorceNow !== 'לא';

  const flaggedChildren = divorceData?.childrenDispute === 'כן';
  const flaggedSupport = divorceData?.needSupport === 'כן';
  const flaggedProperty = divorceData?.propertyDispute === 'כן';
  const flaggedUrgent = divorceData?.urgentRelief === 'כן';

  const relatedClaimsSelected = Array.isArray(selectedClaims)
    ? selectedClaims.some((claim) => claim === 'property' || claim === 'alimony' || claim === 'custody')
    : false;

  const hasChildren = Array.isArray(formData.children) && formData.children.length > 0;
  const hasAssets =
    (formData.property && formData.property.hasAssets === 'yes') ||
    (Array.isArray(formData.apartments) && formData.apartments.length > 0) ||
    (Array.isArray(formData.vehicles) && formData.vehicles.length > 0) ||
    (Array.isArray(formData.savings) && formData.savings.length > 0) ||
    (Array.isArray(formData.benefits) && formData.benefits.length > 0) ||
    (Array.isArray(formData.debts) && formData.debts.length > 0);

  const needsReliefs = flaggedChildren || flaggedSupport || flaggedProperty || flaggedUrgent || relatedClaimsSelected || hasChildren || hasAssets;

  if (wantsReconciliation) {
    return 'shalom_bayit_alt';
  }

  if (wantsDivorce && needsReliefs) {
    return 'divorce_with_reliefs';
  }

  if (wantsDivorce) {
    return 'divorce_only';
  }

  return needsReliefs ? 'divorce_with_reliefs' : 'divorce_only';
}

function getRequestedReliefs(
  track: DivorceTrack,
  divorceData: any,
  formData: FormData
): string[] {
  const reliefs: string[] = [];

  if (track === 'shalom_bayit_alt') {
    reliefs.push('להורות על ניסיון שלום בית ולחילופין להורות על גירושין ולתאם סידור גט במועד קרוב.');
  } else {
    reliefs.push('להורות על פירוק הנישואין בין הצדדים ולתאם מועד לסידור גט.');
  }

  if (divorceData?.childrenDispute === 'כן' || (Array.isArray(formData.children) && formData.children.length > 0 && track !== 'divorce_only')) {
    reliefs.push('לקבוע משמורת, הסדרי שהות וסמכויות חינוך ובריאות לפי טובת הילדים.');
  }

  if (divorceData?.needSupport === 'כן') {
    reliefs.push('לקבוע מזונות ילדים ו/או מזונות אישה בהתאם לנתוני ההכנסה וההוצאות שיוצגו.');
  }

  if (divorceData?.propertyDispute === 'כן') {
    reliefs.push('לדון בחלוקת רכוש, זכויות וחובות, ולתת צווים לשמירת נכסים במידת הצורך.');
  }

  if (divorceData?.urgentRelief === 'כן') {
    reliefs.push(
      `לתת סעדים זמניים ודחופים (${divorceData.urgentReliefDetails || 'כגון צווי מניעה/עיקול, מזונות זמניים או משמורת זמנית לפי הצורך'}).`
    );
  }

  reliefs.push('לחייב את הנתבע/ת בהוצאות ההליך ושכ"ט עו"ד וליתן כל סעד נוסף שבית הדין ימצא לנכון.');

  return reliefs;
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
  const track = resolveDivorceTrack(divorceData, formData, selectedClaims);
  const requestedReliefs = getRequestedReliefs(track, divorceData, formData);
  const attachmentsList = buildAnnexList(
    attachments?.map((att) => ({
      label: att.label,
      description: att.description,
    }))
  );
  const claimNatureText =
    track === 'shalom_bayit_alt'
      ? 'מהות התביעה:\u200F שלום בית ולחילופין גירושין (כולל סעדים נלווים לפי הצורך)'
      : track === 'divorce_with_reliefs'
      ? 'מהות התביעה:\u200F גירושין וסעדים נלווים (מזונות/משמורת/רכוש לפי הצורך)'
      : 'מהות התביעה:\u200F גירושין';

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
      groundsForDivorce = ensureRabbinicalCourt(groundsForDivorce);
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
      divorceReasons = ensureRabbinicalCourt(divorceReasons);
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
            judgeName: 'דיין',
            basicInfo: basicInfo,
            showChildrenList: false, // Divorce claims don't show children list in header
            forum: 'בבית הדין הרבני',
            docketNumberPlaceholder: 'תיק ____________',
            showDateLine: false,
            showJudgeLine: false,
          }),

          // ===== TITLE =====
          createMainTitle('תביעת גירושין'),

          // ===== NATURE OF CLAIM =====
          new Paragraph({
            children: [
              new TextRun({
                text: claimNatureText,
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
                text: ' לא קצוב (הליך בבית הדין הרבני).\u200F',
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
                text: 'סכום אגרת בית דין (ככל שקיימת):\u200F',
                bold: true,
                underline: { type: UnderlineType.SINGLE },
                size: FONT_SIZES.BODY,
                font: 'David',
              }),
              new TextRun({
                text: ' בהתאם לתקנות ולנהלי בית הדין הרבני.\u200F',
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
                text:
                  track === 'shalom_bayit_alt'
                    ? ' בית הדין הרבני הנכבד מתבקש להורות על ניסיון שלום בית, ולחילופין להורות על גירושין ולדון בסעדים הנלווים כמפורט להלן.\u200F'
                    : track === 'divorce_with_reliefs'
                    ? ' בית הדין הרבני הנכבד מתבקש להורות על פירוק הנישואין ולדון במזונות, משמורת ורכוש לפי הצורך כמפורט בהמשך.\u200F'
                    : ' בית הדין הרבני הנכבד מתבקש להורות על פירוק הנישואין בין הצדדים ולתאם מועד לסידור גט.\u200F',
                size: FONT_SIZES.BODY,
                font: 'David',
              }),
            ],
            alignment: AlignmentType.START,
            spacing: { after: SPACING.PARAGRAPH, line: 360 },
            bidirectional: true,
          }),

          ...(() => {
            const relatedClaimsNotice = getRelatedClaimsNotice(selectedClaims);
            return relatedClaimsNotice ? [createBodyParagraph(relatedClaimsNotice)] : [];
          })(),

          // ===== SUMMONS (MAJOR SECTION) =====
          createSectionHeader('הזמנה לדין:\u200F'),
          createBodyParagraph(
            `הואיל ו${plaintiff.title} הגיש כתב תביעה זה נגדך, הנך מוזמן/ת להגיש כתב הגנה ולהתייצב לדיון שייקבע בבית הדין. אי הגשת כתב הגנה או אי התייצבות עלולים להביא למתן החלטה בהיעדרך.`,
            { after: SPACING.SECTION }
          ),

          // ===== LETTERED SECTIONS =====
          createLetteredHeader('א', 'מערכת היחסים והעובדות'),
          createBodyParagraph(
            `${basicInfo.fullName} מ״ז ${basicInfo.idNumber} ו${basicInfo.fullName2} מ״ז ${basicInfo.idNumber2} הינם ${marriageStatus}${weddingDate ? `, נישאו ביום ${formatDate(weddingDate)}` : ''}${children.length > 0 ? `, ולהם ${children.length === 1 ? 'ילד אחד' : `${children.length} ילדים`}` : ''}.`
          ),
          createRelationshipSection(basicInfo, formData, children),
          ...(divorceData.policeComplaints === 'כן'
            ? [
                createBodyParagraph(
                  `${divorceData.policeComplaintsWho ? `${divorceData.policeComplaintsWho} ` : ''}הגיש/ה תלונות במשטרה${divorceData.policeComplaintsWhere ? ` ב${divorceData.policeComplaintsWhere}` : ''}${divorceData.policeComplaintsDate ? ` ביום ${divorceData.policeComplaintsDate}` : ''}.`
                ),
                ...(divorceData.policeComplaintsOutcome
                  ? [createBodyParagraph(`תוצאות ההליך: ${divorceData.policeComplaintsOutcome}`)]
                  : []),
              ]
            : []),
          ...(divorceData.hadPreviousMediation === 'כן' && divorceData.previousMediationDetails
            ? [createBodyParagraph(`נסיונות גישור קודמים: ${divorceData.previousMediationDetails}`)]
            : []),
          ...(divorceData.marriageCounselingDetails
            ? [createBodyParagraph(`טיפול זוגי/משפחתי: ${divorceData.marriageCounselingDetails}`)]
            : []),
          ...(divorceData.religiousMarriage === 'כן' && (divorceData.ketubahAmount || divorceData.ketubahRequest)
            ? [
                createBodyParagraph(
                  `כתובה: ${divorceData.ketubahAmount ? `סכום ${divorceData.ketubahAmount}` : ''}${
                    divorceData.ketubahRequest ? `; בקשה: ${divorceData.ketubahRequest}` : ''
                  }`
                ),
              ]
            : []),
          ...(divorceData.parallelCases === 'כן' || divorceData.parallelCasesDetails
            ? [
                createBodyParagraph(
                  divorceData.parallelCasesDetails ||
                    'קיימים הליכים נוספים בבית משפט או בית דין אחר; פרטים מלאים יצורפו ככל שנדרש.'
                ),
              ]
            : []),
          ...(divorceData.urgentRelief === 'כן'
            ? [
                createBodyParagraph(
                  `סעדים זמניים מבוקשים: ${
                    divorceData.urgentReliefDetails ||
                    'מבוקשים סעדים זמניים לשמירת המצב הקיים ולהגנה על זכויות הצדדים והקטינים.'
                  }`
                ),
              ]
            : []),

          createLetteredHeader('ב', 'עילות וסמכות'),
          createBodyParagraph(
            'המדובר בענייני נישואין וגירושין של בני זוג יהודים; לפיכך סמכות הייחודית נתונה לבית הדין הרבני לפי חוק שיפוט בתי דין רבניים (נישואין וגירושין), התשי״ג–1953. התביעה מוגשת בכנות, והכריכה בעניינים הנלווים (ככל שקיימת) נעשית כדין לשם מיצוי ההליך במסגרת בית הדין.'
          ),
          ...(groundsForDivorce ? [createBodyParagraph(`הרקע לבקשת הגירושין: ${groundsForDivorce}`)] : []),
          ...(divorceReasons ? [createBodyParagraph(`עילות הגירושין: ${divorceReasons}`)] : []),

          // Property summary
          ...(() => {
            const propertyData = formData.property || {};
            const apartments = formData.apartments || [];
            const vehicles = formData.vehicles || [];
            const savings = formData.savings || [];
            const benefits = formData.benefits || [];
            const debts = formData.debts || [];
            const hasConcreteProperty =
              propertyData.hasAssets === 'yes' ||
              apartments.length > 0 ||
              vehicles.length > 0 ||
              savings.length > 0 ||
              benefits.length > 0 ||
              debts.length > 0;
            const showProperty = divorceData.propertyDispute === 'כן' || hasConcreteProperty;
            if (!showProperty) return [];
            const propertyParagraphs: Paragraph[] = [];
            propertyParagraphs.push(createLetteredHeader('ג', 'רכוש וחובות'));
            if (apartments.length) {
              propertyParagraphs.push(createBodyParagraph('דירות ונכסי מקרקעין:'));
              propertyParagraphs.push(
                ...apartments.map((apt: any) => createBulletPoint(formatPropertyItem(apt, apt.owner || 'שני הצדדים')))
              );
            }
            if (vehicles.length) {
              propertyParagraphs.push(createBodyParagraph('כלי רכב:'));
              propertyParagraphs.push(
                ...vehicles.map((v: any) => createBulletPoint(formatPropertyItem(v, v.owner || 'שני הצדדים')))
              );
            }
            if (savings.length || benefits.length) {
              propertyParagraphs.push(createBodyParagraph('חסכונות וזכויות כספיות:'));
              propertyParagraphs.push(
                ...[...savings, ...benefits].map((s: any) => createBulletPoint(formatPropertyItem(s, s.owner || 'שני הצדדים')))
              );
            }
            if (debts.length) {
              propertyParagraphs.push(createBodyParagraph('חובות והתחייבויות:'));
              propertyParagraphs.push(
                ...debts.map((d: any) =>
                  createBulletPoint(
                    `${d.description || 'חוב'}${d.amount ? ` בסך ${d.amount}` : ''}${d.date ? ` ממועד ${formatDate(d.date)}` : ''}${
                      d.purpose ? ` (מטרה: ${d.purpose})` : ''
                    }`
                  )
                )
              );
            }
            if (!hasConcreteProperty) {
              propertyParagraphs.push(
                createBodyParagraph('קיימת מחלוקת רכושית כללית; פרטים מדויקים יפורטו בנספחים או בכתב טענות נפרד.')
              );
            }
            return propertyParagraphs;
          })(),

          // Custody / support
          ...(() => {
            const showChildren = children.length > 0 || divorceData.childrenDispute === 'כן' || divorceData.needSupport === 'כן';
            if (!showChildren) return [];
            const paragraphs: Paragraph[] = [];
            paragraphs.push(createLetteredHeader('ד', 'משמורת, שהות ומזונות'));
            if (children.length > 0) {
              paragraphs.push(createBodyParagraph(`הצדדים הורים ל${children.length === 1 ? 'ילד אחד' : `${children.length} ילדים`} משותפים.`));
            }
            if (divorceData.childrenDispute === 'כן') {
              paragraphs.push(createBodyParagraph('קיימת מחלוקת לגבי משמורת/הסדרי שהות/חינוך ובריאות הקטינים.'));
            }
            if (divorceData.needSupport === 'כן') {
              paragraphs.push(createBodyParagraph('מבוקש לדון במזונות קטינים ו/או מזונות אישה בהתאם לנתוני ההכנסה וההוצאות.'));
            }
            return paragraphs;
          })(),

          // Remedies
          createLetteredHeader('ה', 'סעדים'),
          createBodyParagraph('אשר על כן מתבקש בית הדין הנכבד:'),
          ...requestedReliefs.map((relief, index) => createNumberedItem(index + 1, relief)),

          // Summary / costs
          createLetteredHeader('ו', 'סיכום והוצאות'),
          createBodyParagraph(
            'התביעה מוגשת בתום לב, ומבוקש לאשר את הסמכות הנלווית ולהורות על כל סעד שיימצא צודק וראוי. כן מתבקש לחייב את הנתבע/ת בהוצאות ושכ"ט עו"ד.'
          ),

          // Annexes
          ...(attachmentsList.length > 0
            ? [
                createLetteredHeader('ז', 'נספחים'),
                ...attachmentsList.map((att) => createBulletPoint(att)),
              ]
            : []),

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
    createBodyParagraph(
      divorceData?.parallelCases === 'כן' || formData.courtProceedings === 'yes'
        ? divorceData?.parallelCasesDetails || 'קיימים הליכים משפטיים נוספים.'
        : 'לא קיימים הליכים משפטיים נוספים.'
    )
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

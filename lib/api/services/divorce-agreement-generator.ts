/**
 * Divorce Agreement Document Generator (הסכם גירושין)
 * Format based on lawyer's approved templates - ready for court submission.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  TabStopType,
  TabStopPosition,
  convertInchesToTwip,
} from 'docx';
import { BasicInfo, FormData } from '@/lib/api/types';
import {
  FONT_SIZES,
  SPACING,
  formatDate,
  isMinor,
  createPageBreak,
  createSignatureImage,
  generatePowerOfAttorney,
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
  selectedClaims?: string[];
}

// Constants for formatting
const TWIPS_PER_CM = 567;
const INDENT_SMALL = TWIPS_PER_CM * 0.5;
const INDENT_MEDIUM = TWIPS_PER_CM * 1;
const INDENT_LARGE = TWIPS_PER_CM * 1.5;
const LINE_SPACING = 360; // 1.5 line spacing
const PARAGRAPH_SPACING = 240;
const SECTION_SPACING = 480;

/**
 * Get Hebrew month name
 */
function getHebrewMonth(month: number): string {
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  return months[month] || '';
}

/**
 * Format date like "09 נובמבר 2021"
 */
function formatHebrewDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = getHebrewMonth(date.getMonth());
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format currency with ₪ symbol
 */
function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('he-IL')} ₪`;
}

/**
 * Generate standard visitation schedule for joint custody (50/50)
 */
function getJointCustodySchedule(childRef: string): string[] {
  return [
    `מוסכם על הצדדים, כי ${childRef} ${childRef === 'הילד/ה' ? 'יהיה/תהיה' : 'יהיו'} במשמורת משותפת של שני ההורים.`,
    `הסדרי השהייה יהיו כדלקמן:`,
    `שגרה שבועית: ${childRef} ${childRef === 'הילד/ה' ? 'ישהה/תשהה' : 'ישהו'} אצל האם מיום ראשון בבוקר עד יום רביעי בבוקר, ואצל האב מיום רביעי בבוקר עד יום ראשון בבוקר.`,
    `חגים ומועדים: ראש השנה ויום כיפור - לסירוגין בין ההורים. סוכות - לסירוגין. חנוכה - מחצית ראשונה אצל הורה אחד, מחצית שנייה אצל ההורה השני. פסח (ליל הסדר) - בשנים זוגיות אצל האם, בשנים אי-זוגיות אצל האב. שבועות - לסירוגין.`,
    `חופשות: חופשת הקיץ תחולק שווה בשווה - כל הורה יהיה זכאי לשלושה שבועות רצופים עם ${childRef}. מועדי החופשות יתואמו מראש בין ההורים.`,
    `ימי הולדת: ${childRef === 'הילד/ה' ? 'הילד/ה ישהה/תשהה' : 'הילדים ישהו'} ביום ההולדת עם ההורה שאצלו נמצא/ת באותו יום על פי הסדרי השהייה הרגילים. ההורה השני יהיה רשאי לקיים חגיגה נפרדת.`,
  ];
}

/**
 * Generate standard visitation schedule for primary custody with one parent
 */
function getPrimaryCustodySchedule(childRef: string, custodialParent: string, otherParent: string): string[] {
  return [
    `מוסכם על הצדדים, כי ${childRef} ${childRef === 'הילד/ה' ? 'יהיה/תהיה' : 'יהיו'} במשמורת ${custodialParent}.`,
    `הסדרי השהייה עם ${otherParent} יהיו כדלקמן:`,
    `שגרה שבועית: ${childRef} ${childRef === 'הילד/ה' ? 'ישהה/תשהה' : 'ישהו'} אצל ${otherParent} בסופי שבוע לסירוגין - מיום שישי בשעה 16:00 עד יום ראשון בשעה 08:00, וכן ביום רביעי אחה"צ משעה 16:00 עד שעה 20:00.`,
    `חגים ומועדים: ראש השנה ויום כיפור - לסירוגין בין ההורים. סוכות - לסירוגין. חנוכה - מחצית ראשונה אצל הורה אחד, מחצית שנייה אצל ההורה השני. פסח (ליל הסדר) - בשנים זוגיות אצל האם, בשנים אי-זוגיות אצל האב. שבועות - לסירוגין.`,
    `חופשות: ${otherParent} יהיה/תהיה זכאי/ת לשלושה שבועות רצופים עם ${childRef} בחופשת הקיץ. מועדי החופשות יתואמו מראש בין ההורים.`,
    `ימי הולדת: ${childRef === 'הילד/ה' ? 'הילד/ה ישהה/תשהה' : 'הילדים ישהו'} ביום ההולדת עם ההורה שאצלו נמצא/ת באותו יום על פי הסדרי השהייה הרגילים. ההורה השני יהיה רשאי לקיים חגיגה נפרדת.`,
  ];
}

/**
 * Create main title paragraph
 */
function createTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: SECTION_SPACING },
    bidirectional: true,
  });
}

/**
 * Create date line
 */
function createDateLine(city: string, date: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `שנערך ונחתם ב${city} ביום ${date}`,
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: SECTION_SPACING },
    bidirectional: true,
  });
}

/**
 * Create section header (bold, underlined) - with extra spacing before/after
 */
function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        underline: { type: UnderlineType.SINGLE },
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { before: SECTION_SPACING * 1.5, after: PARAGRAPH_SPACING },
    bidirectional: true,
  });
}

/**
 * Create subsection header (bold only)
 */
function createSubsectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { before: PARAGRAPH_SPACING, after: PARAGRAPH_SPACING },
    bidirectional: true,
  });
}

/**
 * Create indented body paragraph
 */
function createBodyParagraph(text: string, indent: number = INDENT_SMALL): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: PARAGRAPH_SPACING, line: LINE_SPACING },
    indent: { start: indent },
    bidirectional: true,
  });
}

/**
 * Create הואיל paragraph - with TAB after prefix, matching lawyer format exactly
 */
function createRecitalParagraph(prefix: string, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: prefix + '  \t',  // Space + TAB after הואיל/והואיל
        bold: true,
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
      new TextRun({
        text,
        size: 24,
        font: 'David',
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.START,
    spacing: { after: PARAGRAPH_SPACING, line: LINE_SPACING },
    bidirectional: true,
  });
}

/**
 * Create empty line for spacing - matches lawyer's document formatting
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
    spacing: { after: LINE_SPACING },
  });
}

/**
 * Generate divorce agreement document
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

  console.log('📝 Generating Divorce Agreement (court-ready format)...');

  const divorceData = formData.divorceAgreement || {};
  const propertyData = formData.property || {};
  // Children are in formData.children, not propertyData.children
  const children = formData.children || [];
  const minors = children.filter((child: any) => isMinor(child.birthDate));

  const today = new Date();
  const todayFormatted = formatHebrewDate(today);
  const city = basicInfo.address?.split(',').pop()?.trim() || 'תל אביב';

  // Detect other claims
  const hasPropertyClaim = selectedClaims.includes('property');
  const hasCustodyClaim = selectedClaims.includes('custody');
  const hasAlimonyClaim = selectedClaims.includes('alimony');

  // Groq context
  const groqContext: Omit<TransformContext, 'fieldLabel' | 'additionalContext'> = {
    claimType: 'הסכם גירושין',
    applicantName: basicInfo.fullName || 'המבקש/ת',
    respondentName: basicInfo.fullName2 || 'המשיב/ה',
  };

  // Determine wife/husband based on gender
  const applicantIsWife = basicInfo.gender === 'female';
  const wifeName = applicantIsWife ? basicInfo.fullName : basicInfo.fullName2;
  const wifeId = applicantIsWife ? basicInfo.idNumber : basicInfo.idNumber2;
  const husbandName = applicantIsWife ? basicInfo.fullName2 : basicInfo.fullName;
  const husbandId = applicantIsWife ? basicInfo.idNumber2 : basicInfo.idNumber;

  const paragraphs: Paragraph[] = [];

  // ==================== TITLE ====================
  paragraphs.push(createTitle('הסכם גירושין ומזונות'));

  // ==================== DATE LINE ====================
  paragraphs.push(createDateLine(city, todayFormatted));

  // ==================== PARTIES ====================
  // בין:
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'בין:',
          bold: true,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  // Wife info
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${wifeName}    ת.ז. ${wifeId}    להלן "האישה${minors.length > 0 ? ' ו/או האם' : ''}"`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  // מצד אחד
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'מצד אחד',
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  // לבין:
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'לבין:',
          bold: true,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  // Husband info
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${husbandName}    ת.ז. ${husbandId}    להלן "הבעל${minors.length > 0 ? ' ו/או האב' : ''}"`,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  // מצד שני
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'מצד שני',
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  // Empty line before recitals
  paragraphs.push(createEmptyLine());

  // ==================== הואיל (RECITALS) ====================
  const weddingDate = basicInfo.weddingDay ? formatDate(basicInfo.weddingDay) : '____________';

  // First הואיל - marriage
  paragraphs.push(
    createRecitalParagraph(
      'הואיל',
      `והאישה והבעל (להלן "בני הזוג" ו/או "הצדדים"), נישאו זל"ז כדמו"י ביום ${weddingDate};`
    )
  );

  // והואיל - children (if any)
  if (minors.length > 0) {
    if (minors.length === 1) {
      const child = minors[0];
      paragraphs.push(
        createRecitalParagraph(
          'והואיל',
          `ומנישואיהם לבני הזוג נולד/ה ${child.firstName} ${child.lastName || ''} ת.ז. ${child.idNumber || ''} (להלן: "הילד/ה");`
        )
      );
    } else {
      let childText = `ומנישואיהם לבני הזוג נולדו ${minors.length} ילדים:\n`;
      minors.forEach((child: any, index: number) => {
        childText += `                   ${index + 1}. ${child.firstName} ${child.lastName || ''} ת.ז. ${child.idNumber || ''}\n`;
      });
      childText += `                   (להלן: "הילדים");`;
      paragraphs.push(createRecitalParagraph('והואיל', childText));
    }
  }

  // והואיל - relationship ended
  paragraphs.push(
    createRecitalParagraph(
      'והואיל',
      'והחיים המשותפים בין בני הזוג עלו על שרטון וכל הניסיונות ליישב הסכסוך שביניהם עלו בתוהו;'
    )
  );

  // והואיל - want to divorce
  paragraphs.push(
    createRecitalParagraph(
      'והואיל',
      'וברצון בני הזוג להתגרש זמ"ז בג"פ כדמו"י בהקדם האפשרי;'
    )
  );

  // והואיל - agreement reached
  const agreementText = minors.length > 0
    ? 'ובני הזוג הגיעו ביניהם להסכמה בכל העניינים הנובעים מנישואיהם והכרוכים בגירושיהם, לרבות ומבלי לפגוע בכלליות האמור, גט, מזונות, החזקת הילדים וחלוקת הרכוש בין בני הזוג;'
    : 'ובני הזוג הגיעו ביניהם להסכמה בכל העניינים הנובעים מנישואיהם והכרוכים בגירושיהם, לרבות ומבלי לפגוע בכלליות האמור, גט וחלוקת הרכוש בין בני הזוג;';

  paragraphs.push(createRecitalParagraph('והואיל', agreementText));

  // Empty line before לפיכך
  paragraphs.push(createEmptyLine());

  // לפיכך
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'לפיכך הוצהר, הוסכם והותנה בין הצדדים כלהלן:',
          bold: true,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SECTION_SPACING, after: SECTION_SPACING },
      bidirectional: true,
    })
  );

  // ==================== מבוא ====================
  paragraphs.push(createSectionHeader('מבוא'));
  paragraphs.push(createBodyParagraph('המבוא להסכם זה הינו חלק בלתי נפרד ממנו.'));
  paragraphs.push(createEmptyLine());

  // ==================== גירושין ====================
  paragraphs.push(createSectionHeader('גירושין'));
  paragraphs.push(
    createBodyParagraph(
      'בני הזוג מסכימים להיפרד זמ"ז בג"פ כדמו"י ולשם כך הם יגישו בקשה לבית הדין הרבני תוך שבעה ימים ממועד אישור הסכם זה.'
    )
  );
  paragraphs.push(
    createBodyParagraph(
      'הצדדים יישאו בחלקים שווים באגרות הכרוכות בהסדרת גירושיהם בביה"ד הרבני.'
    )
  );
  paragraphs.push(createEmptyLine());

  // ==================== אפוטרופסות (if children) ====================
  if (minors.length > 0) {
    paragraphs.push(createSectionHeader('אפוטרופסות'));

    const childRef = minors.length === 1 ? 'הילד/ה' : 'הילדים';

    paragraphs.push(
      createBodyParagraph(
        `הצדדים מצהירים, כי הוראות הסכם זה גובשו ביניהם בהסכמה מתוך ראייתם את טובת ${childRef} וכי הינם פועלים ויפעלו בעתיד בכל עניין הקשור ${minors.length === 1 ? 'אליו/ה' : 'אליהם'} רק על פי טובתם.`
      )
    );

    paragraphs.push(
      createBodyParagraph(
        `מוסכם על הצדדים כי הן הבעל והן האישה היו והינם האפוטרופסים המשותפים על ${childRef} וכי אין בכל האמור בהסכם זה כדי לפגוע באפוטרופסותם זו. הצדדים מתחייבים לנהוג האחד כלפי השני בכבוד ובדרך ראויה, להימנע מלהשמיץ האחד את השני ו/או האחד את משפחתו המורחבת של השני בפני ${childRef}, להימנע מלפגוע האחד בשני בפני ${childRef}, להימנע מלערב את ${childRef} בכל דרך שהיא בכל מחלוקת הקיימת או שתתקיים ביניהם בעתיד, לשמור ולכבד את סמכותו ההורית של ההורה האחר ולחנך את ${childRef} ברוח כיבוד ואהבת אב ואם.`
      )
    );
    paragraphs.push(createEmptyLine());
  }

  // ==================== משמורת והסדרי שהייה (if children) ====================
  if (minors.length > 0) {
    paragraphs.push(createSectionHeader('משמורת והסדרי שהייה'));

    const childRef = minors.length === 1 ? 'הילד/ה' : 'הילדים';
    const custodyAgreement = divorceData.custodyAgreement;

    if (custodyAgreement === 'referenceClaim' && hasCustodyClaim) {
      paragraphs.push(
        createBodyParagraph(
          `הסדרי המשמורת על ${childRef} יהיו כמפורט בתביעת המשמורת הנפרדת שהוגשה לבית המשפט.`
        )
      );
    } else if (custodyAgreement === 'applicantCustody') {
      // Primary custody with applicant - use preset schedule
      const custodyParent = applicantIsWife ? 'האם' : 'האב';
      const otherParent = applicantIsWife ? 'האב' : 'האם';
      const schedule = getPrimaryCustodySchedule(childRef, custodyParent, otherParent);
      schedule.forEach(line => paragraphs.push(createBodyParagraph(line)));
    } else if (custodyAgreement === 'respondentCustody') {
      // Primary custody with respondent - use preset schedule
      const custodyParent = applicantIsWife ? 'האב' : 'האם';
      const otherParent = applicantIsWife ? 'האם' : 'האב';
      const schedule = getPrimaryCustodySchedule(childRef, custodyParent, otherParent);
      schedule.forEach(line => paragraphs.push(createBodyParagraph(line)));
    } else if (custodyAgreement === 'custom' && divorceData.custodyCustom) {
      console.log('🤖 Transforming custody text with Groq...');
      const transformed = await transformToLegalLanguage(divorceData.custodyCustom, {
        ...groqContext,
        fieldLabel: 'הסדר משמורת',
        additionalContext: 'תיאור ההסכמה על משמורת הקטינים',
      });
      paragraphs.push(createBodyParagraph(transformed || divorceData.custodyCustom));
    } else {
      // Default: joint custody (50/50) - use preset schedule with days and holidays
      const schedule = getJointCustodySchedule(childRef);
      schedule.forEach(line => paragraphs.push(createBodyParagraph(line)));
    }

    // General custody provisions
    paragraphs.push(
      createBodyParagraph(
        `כל אחד מההורים מסכים, כי ההורה האחר יקבל מידע מכל גוף ש${minors.length === 1 ? 'הילד/ה קשור/ה אליו' : 'הילדים קשורים אליו'} וכמו כן, כל אחד מהצדדים ידווח למשנהו, מבעוד מועד, על כל מידע ואירוע הקשור ${minors.length === 1 ? 'בילד/ה' : 'בילדים'} לרבות אירועים במוסדות החינוך ו/או אצל גורמים מטפלים אחרים, אסיפות הורים וכו'.`
      )
    );

    paragraphs.push(
      createBodyParagraph(
        `כל הורה יהיה אחראי להשתתפות ${minors.length === 1 ? 'הילד/ה' : 'הילדים'} בפעילויות ובחוגים בעת שהותו עמו.`
      )
    );
    paragraphs.push(createEmptyLine());
  }

  // ==================== מזונות ומדור ====================
  paragraphs.push(createSectionHeader('מזונות ומדור'));

  const alimonyAgreement = divorceData.alimonyAgreement;

  if (alimonyAgreement === 'referenceClaim' && hasAlimonyClaim) {
    paragraphs.push(
      createBodyParagraph(
        'הסדרי המזונות יהיו כמפורט בתביעת המזונות הנפרדת שהוגשה לבית המשפט.'
      )
    );
  } else if (minors.length > 0) {
    const childRef = minors.length === 1 ? 'הילד/ה' : 'הילדים';

    paragraphs.push(
      createBodyParagraph(
        `כל אחד מההורים יישא במלוא הוצאות ${childRef} השוטפות בזמן ש${childRef} אצלו ע"פ זמני השהות שנקבעו לעיל, ובכלל זה מזונות ומדורו.`
      )
    );

    if (alimonyAgreement === 'specificAmount' && divorceData.alimonyAmount) {
      const amount = formatCurrency(divorceData.alimonyAmount);
      paragraphs.push(
        createBodyParagraph(
          `מוסכם, כי האב יפקיד לחשבונה של האישה סכום חודשי של ${amount}, כל 10 לחודש קלנדרי עבור כלל מזונות ${childRef} (להלן: "המזונות").`
        )
      );
    }

    paragraphs.push(
      createBodyParagraph(
        `נוסף לאמור, הצדדים ישאו בחלקים שווים בהוצאות ${childRef} המשולמות לצדדי ג', כדלקמן:`
      )
    );

    paragraphs.push(
      createBodyParagraph(
        `כל ההוצאות הרפואיות של ${childRef}, שאינן מכוסות על ידי קופת החולים או ביטוח רפואי ובכלל זאת תרופות, טיפולי שיניים, טיפול אורתודנטי, הוצאות אופטומטריה, טיפולים פסיכולוגיים/נפשיים, ייעוצים, וכו'. הוצאות אלו יתואמו בין הצדדים בהסכמה מראש.`,
        INDENT_MEDIUM
      )
    );

    paragraphs.push(
      createBodyParagraph(
        'כל הוצאה הקשורה למסגרת המוסד החינוכי, רכישת ספרי לימוד, מכשירי כתיבה, טיולים, אגרת חינוך בתחילת שנה"ל, רכישת ציוד לביה"ס ומסיבות חגים וסוף שנה, ועד כיתה, בעלות המקובלת.',
        INDENT_MEDIUM
      )
    );

    paragraphs.push(
      createBodyParagraph('גן / צהרון בעלות עירייה.', INDENT_MEDIUM)
    );

    paragraphs.push(
      createBodyParagraph('עד שני חוגים בתעריף מתנ"ס.', INDENT_MEDIUM)
    );

    paragraphs.push(
      createBodyParagraph(
        `המזונות ישולמו עד בהגיע כל ילד לגיל שמונה עשרה או עד סיום שנת הלימודים של כיתה יב' (לפי המאוחר מהשנים). ובעת השירות הצבאי החובה, ישולם שליש ממחצית הסכום היחסי עבור כל ילד.`
      )
    );
    paragraphs.push(createEmptyLine());
  } else if (alimonyAgreement === 'custom' && divorceData.alimonyCustom) {
    console.log('🤖 Transforming alimony text with Groq...');
    const transformed = await transformToLegalLanguage(divorceData.alimonyCustom, {
      ...groqContext,
      fieldLabel: 'הסדר מזונות',
      additionalContext: 'תיאור ההסכמה על מזונות',
    });
    paragraphs.push(createBodyParagraph(transformed || divorceData.alimonyCustom));
  } else {
    paragraphs.push(
      createBodyParagraph(
        'בני הזוג הסכימו כי אין חיוב במזונות בין הצדדים.'
      )
    );
  }
  paragraphs.push(createEmptyLine());

  // ==================== חלוקת רכוש ====================
  paragraphs.push(createSectionHeader('חלוקת רכוש'));

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
    paragraphs.push(
      createBodyParagraph(
        'כל צד יישאר עם הזכויות הסוציאליות שצבר לרבות זכויות פנסיה, ביטוחי מנהלים, קופות וקרנות.'
      )
    );
  } else if (propertyAgreement === 'equalSplit') {
    paragraphs.push(createSubsectionHeader('כללי'));
    paragraphs.push(
      createBodyParagraph(
        'מוסכם בין הצדדים על חלוקה שווה של כל הרכוש המשותף שנצבר במהלך הנישואין, לרבות נכסים, כלי רכב, חשבונות בנק וזכויות סוציאליות.'
      )
    );

    paragraphs.push(createSubsectionHeader('זכויות סוציאליות'));
    paragraphs.push(
      createBodyParagraph(
        'בתוך 30 יום מאישור הסכם זה, יעבירו הצדדים זה לזה את המסמכים הרלוונטיים לצורך קיזוז בכל הקשור לזכויות שנצברו במהלך הנישואין. ככל שיהיה צורך לבצע תשלום בגין זכויות יתרות שצבר אחד מבני הזוג על האחר, יעביר הצד שצבר יותר תשלומי איזון תוך 30 יום.'
      )
    );
  } else if (propertyAgreement === 'custom' && divorceData.propertyCustom) {
    console.log('🤖 Transforming property text with Groq...');
    const transformed = await transformToLegalLanguage(divorceData.propertyCustom, {
      ...groqContext,
      fieldLabel: 'חלוקת רכוש',
      additionalContext: 'תיאור ההסכמה על חלוקת הרכוש',
    });
    paragraphs.push(createBodyParagraph(transformed || divorceData.propertyCustom));
  } else {
    paragraphs.push(
      createBodyParagraph(
        'בני הזוג הסכימו על הסדר חלוקת רכוש על-פי תנאים שהוסכמו ביניהם.'
      )
    );
  }
  paragraphs.push(createEmptyLine());

  // ==================== מזונות אישה וכתובה ====================
  paragraphs.push(createSectionHeader('מזונות אישה וכתובה'));
  paragraphs.push(
    createBodyParagraph(
      'במועד מתן הגט, האישה מוותרת על מזונותיה, כתובתה ותוספת כתובתה.'
    )
  );
  paragraphs.push(createEmptyLine());

  // ==================== סילוק תביעות ====================
  paragraphs.push(createSectionHeader('סילוק תביעות'));
  paragraphs.push(
    createBodyParagraph(
      'כל חוב ו/או הלוואה הרשומים ביום חתימת הסכם זה ע"ש אחד מבני הזוג, ואשר לא הוזכר במפורש בהסכם זה יחולו על אותו צד אשר על שמו רשום החוב ו/או ההלוואה.'
    )
  );
  paragraphs.push(
    createBodyParagraph(
      'פרט לאמור בהסכם זה אין לצדדים ולא תהיינה להם כל טענות ו/או תביעות מכל מין וסוג שהוא האחד כנגד משנהו והסכם זה ממצה את כל התביעות וכל הדרישות וכל הטענות של מי מהצדדים כלפי משנהו בכל הנוגע לנישואיהם ובכל הכרוך בפרידתם.'
    )
  );
  paragraphs.push(createEmptyLine());

  // ==================== אישור הערכאה המוסמכת ====================
  paragraphs.push(createSectionHeader('אישור הערכאה המוסמכת'));
  paragraphs.push(
    createBodyParagraph(
      'הצדדים עותרים לערכאה המוסמכת לאשר הסכם זה עפ"י הוראות חוק יחסי ממון בין בני זוג התשל"ג – 1973, חוק לתיקון דיני משפחה (מזונות) התשי"ט – 1959 וחוק הכשרות המשפטית והאפוטרופסות התשכ"ב – 1962 וליתן לו תוקף של פס"ד ע"פ כל דין.'
    )
  );

  // ==================== SIGNATURES ====================
  paragraphs.push(createEmptyLine());
  paragraphs.push(createEmptyLine());

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'ולראיה באו הצדדים על החתום:',
          bold: true,
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.START,
      spacing: { before: SECTION_SPACING, after: SECTION_SPACING },
      bidirectional: true,
    })
  );

  paragraphs.push(createEmptyLine());
  paragraphs.push(createEmptyLine());

  // Signature lines
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '  __________________\t\t\t\t\t\t__________________  ',
          size: 24,
          font: 'David',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: PARAGRAPH_SPACING },
      bidirectional: true,
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '        האישה\t\t\t\t\t\t\t\t\t\t     הבעל        ',
          size: 24,
          font: 'David',
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: SECTION_SPACING },
      bidirectional: true,
    })
  );

  // Actual signatures if provided
  if (applicantSignature) {
    paragraphs.push(createSignatureImage(applicantSignature, 200, 100, AlignmentType.START));
  }

  if (respondentSignature) {
    paragraphs.push(createSignatureImage(respondentSignature, 200, 100, AlignmentType.END));
  }

  // ==================== LAWYER CONFIRMATION ====================
  if (lawyerSignature) {
    paragraphs.push(createPageBreak());
    paragraphs.push(createSectionHeader('אישור עורך דין'));

    paragraphs.push(
      createBodyParagraph(
        `אני החתום מטה, עוה"ד אריאל דרור מ"ר 31892, מאשר בזאת כי הסכם זה נחתם בפניי על-ידי ${wifeName} ו${husbandName} לאחר שהוסברו להם תנאיו והשלכותיו המשפטיות.`
      )
    );

    paragraphs.push(
      createBodyParagraph('הצדדים חתמו על ההסכם מרצונם החופשי ובהבנה מלאה של תוכנו.')
    );

    paragraphs.push(createEmptyLine());
    paragraphs.push(createBodyParagraph(`תאריך: ${todayFormatted}`));
    paragraphs.push(createEmptyLine());

    paragraphs.push(createSignatureImage(lawyerSignature, 300, 150, AlignmentType.LEFT));

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'אריאל דרור, עו"ד',
            size: 24,
            font: 'David',
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: PARAGRAPH_SPACING },
      })
    );
  }

  // ==================== POWER OF ATTORNEY ====================
  paragraphs.push(createPageBreak());
  const powerOfAttorneyParagraphs = generatePowerOfAttorney(
    basicInfo,
    formData,
    applicantSignature,
    lawyerSignature,
    'הסכם גירושין'
  );
  paragraphs.push(...powerOfAttorneyParagraphs);

  // NOTE: No תצהיר (affidavit) needed for הסכם גירושין

  // ==================== ATTACHMENTS ====================
  if (attachments && attachments.length > 0) {
    paragraphs.push(createPageBreak());
    const attachmentParagraphs = generateAttachmentsSection(attachments, 7);
    paragraphs.push(...attachmentParagraphs);
  }

  // ==================== CREATE DOCUMENT ====================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  console.log('✅ Divorce agreement document generated successfully');

  return await Packer.toBuffer(doc);
}

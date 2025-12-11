/**
 * Comprehensive Divorce Agreement Test
 * Tests: Mutual divorce agreement (הסכם גירושין)
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

const testData = {
  basicInfo: {
    fullName: 'תמר גולדשטיין',
    idNumber: '678901234',
    email: 'test-agreement@law4us.co.il',
    phone: '053-6789012',
    address: 'רחוב אבן גבירול 50, תל אביב',
    birthDate: '1986-07-22',
    gender: 'female',
    fullName2: 'ניר גולדשטיין',
    idNumber2: '432109876',
    phone2: '054-4321098',
    email2: 'nir@example.com',
    address2: 'רחוב קפלן 12, תל אביב',
    birthDate2: '1983-12-05',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2009-10-18',
  },

  // DIVORCE AGREEMENT is EXCLUSIVE - cannot combine with other claims
  selectedClaims: ['divorceAgreement'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'יובל',
        lastName: 'גולדשטיין',
        idNumber: '789012345',
        birthDate: '2012-04-15',
        address: 'רחוב אבן גבירול 50, תל אביב',
        nameOfParent: 'ניר גולדשטיין',
        childRelationship: 'יובל הוא ילד חכם ובוגר. לומד בכיתה ו\' ומצטיין בלימודים.',
      },
      {
        firstName: 'ליאור',
        lastName: 'גולדשטיין',
        idNumber: '890123456',
        birthDate: '2015-09-28',
        address: 'רחוב אבן גבירול 50, תל אביב',
        nameOfParent: 'ניר גולדשטיין',
        childRelationship: 'ליאור היא ילדה שמחה ויצירתית. לומדת בכיתה ג\'.',
      },
    ],

    // GLOBAL: Previous marriages
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',

    // GLOBAL: Housing
    applicantHomeType: 'jointOwnership',
    partnerHomeType: 'jointOwnership',

    // GLOBAL: Separation
    livingSeparately: 'כן',
    separationDate: '2024-01-01',

    // GLOBAL: Violence & Protection
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',

    // GLOBAL: Welfare & Counseling
    contactedWelfare: 'no',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'no',
    willingToJoinMediation: 'no',

    // GLOBAL: Other cases
    otherFamilyCases: [],

    // GLOBAL: Relationship description
    relationshipDescription: 'היינו נשואים במשך 15 שנים. למרות שהחלטנו להיפרד, אנחנו שומרים על יחסים טובים ומכבדים למען הילדים ומסכימים על כל ההסדרים.',

    // DIVORCE AGREEMENT SPECIFIC DATA
    divorceAgreement: {
      // Property agreement
      propertyAgreement: 'custom',
      propertyCustom: `הצדדים מסכימים על חלוקת הרכוש כדלקמן:

1. דירת המגורים ברחוב אבן גבירול 50, תל אביב (שווי מוערך: 3,800,000 ש"ח):
   - האישה תמשיך להתגורר בדירה עם הילדים למשך 5 שנים או עד שהילד הקטן יגיע לגיל 13, המוקדם מביניהם.
   - לאחר מכן, הדירה תימכר והתמורה תחולק שווה בשווה בין הצדדים.
   - המשכנתא (יתרה: 600,000 ש"ח) תשולם מחשבון משותף.

2. הרכבים:
   - טויוטה RAV4 2022 (שווי: 180,000 ש"ח) - יעבור לבעלות האישה.
   - מאזדה 3 2020 (שווי: 120,000 ש"ח) - יישאר בבעלות הבעל.
   - הבעל ישלם לאישה פער של 30,000 ש"ח תוך 6 חודשים.

3. חסכונות והשקעות (סה"כ: 850,000 ש"ח):
   - יחולקו שווה בשווה בין הצדדים.
   - כל צד יקבל 425,000 ש"ח תוך 60 יום מאישור ההסכם.

4. קופות גמל ופנסיה:
   - כל צד ישמור על הזכויות הפנסיוניות שלו.
   - לא יבוצע איזון משאבים.`,

      // Custody agreement
      custodyAgreement: 'jointCustody',
      custodyCustom: '',

      // Visitation agreement
      visitationAgreement: 'fixed',
      visitationCustom: `הסדרי שהייה ומפגשים:

1. שגרה שבועית:
   - הילדים יהיו אצל האם בימים א'-ד' (כולל לילות).
   - הילדים יהיו אצל האב מיום ה' אחה"צ (16:00) עד יום א' בבוקר (08:00).

2. חופשות:
   - חופשת קיץ: חלוקה שווה - כל הורה 3 שבועות רצופים.
   - פסח, סוכות: שבוע לסירוגין.
   - חנוכה: חלוקה לפי ימים - 4 ימים אצל כל הורה.
   - יום הולדת הילדים: הילד יהיה עם ההורה שאצלו נמצא באותו יום, והורה שני יקיים חגיגה נפרדת.

3. חגים:
   - ראש השנה וכיפור: לסירוגין.
   - ליל הסדר: בשנים זוגיות אצל האם, בשנים אי-זוגיות אצל האב.

4. כללי:
   - שני ההורים יהיו זמינים טלפונית לילדים בכל עת.
   - שינויים בלוח הזמנים יתואמו מראש ובהסכמה הדדית.`,

      // Alimony agreement
      alimonyAgreement: 'specificAmount',
      alimonyAmount: 7500,
      alimonyCustom: '',

      // Additional terms
      additionalTerms: `תנאים נוספים:

1. מזונות ילדים:
   - הבעל ישלם מזונות בסך 7,500 ש"ח לחודש עבור שני הילדים.
   - הסכום יעודכן מדי שנה לפי מדד המחירים לצרכן.
   - התשלום יבוצע עד ה-5 בכל חודש לחשבון האישה.

2. הוצאות מיוחדות:
   - הוצאות רפואיות חריגות, חינוך מיוחד, וחוגים יחולקו שווה בשווה.
   - כל הוצאה מעל 500 ש"ח תתואם מראש.

3. חינוך:
   - החלטות על בית ספר, חוגים, וטיפולים יתקבלו במשותף.
   - במקרה של אי הסכמה, יפנו למגשר משפחתי.

4. מגורים:
   - אף צד לא יעבור מגורים מעבר למרחק של 30 ק"מ ממקום המגורים הנוכחי ללא הסכמת הצד השני.
   - במקרה של מעבר לחו"ל, יידרש אישור בית המשפט.

5. יחסי הורים-ילדים:
   - שני ההורים מתחייבים לשמור על יחסים מכבדים ולא לדבר רעות זה על זה בנוכחות הילדים.
   - שניהם מתחייבים לעודד את הקשר של הילדים עם ההורה השני.

6. ביטוחים:
   - ביטוח בריאות של הילדים יישאר על שם האם.
   - ביטוח חיים של הבעל יכלול את הילדים כמוטבים עד גיל 21.

7. גט:
   - הצדדים מתחייבים לסדר גט בבית הדין הרבני תוך 60 יום מאישור ההסכם.`,
    },
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תעודת נישואין', file: SAMPLE_IMAGE, name: 'marriage-certificate.png', mimeType: 'image/png' },
    { label: 'ב', description: 'תעודות לידה של הילדים', file: SAMPLE_IMAGE, name: 'birth-certificates.png', mimeType: 'image/png' },
    { label: 'ג', description: 'נסח טאבו - דירת מגורים', file: SAMPLE_IMAGE, name: 'tabu.png', mimeType: 'image/png' },
    { label: 'ד', description: 'דפי חשבון בנק - חסכונות', file: SAMPLE_IMAGE, name: 'bank-statements.png', mimeType: 'image/png' },
    { label: 'ה', description: 'רישיון רכב - שני הרכבים', file: SAMPLE_IMAGE, name: 'vehicle-licenses.png', mimeType: 'image/png' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Divorce-Agreement-' + new Date().toISOString().split('T')[0],
};

console.log('🧪 Testing DIVORCE AGREEMENT Claim\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Property Agreement: ${testData.formData.divorceAgreement.propertyAgreement}`);
console.log(`   Custody Agreement: ${testData.formData.divorceAgreement.custodyAgreement}`);
console.log(`   Alimony Amount: ${testData.formData.divorceAgreement.alimonyAmount} ש"ח/חודש`);
console.log(`   Attachments: ${testData.attachments.length}`);
console.log('');

axios
  .post('http://localhost:3000/api/submission', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
  })
  .catch((error) => {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  });

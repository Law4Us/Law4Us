/**
 * Comprehensive Custody Claim Test
 * Tests: Child custody claim with full data and attachments
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

const testData = {
  basicInfo: {
    fullName: 'שרה כהן',
    idNumber: '234567890',
    email: 'test-custody@law4us.co.il',
    phone: '054-2345678',
    address: 'רחוב ויצמן 22, רמת גן',
    birthDate: '1987-08-20',
    gender: 'female',
    fullName2: 'משה כהן',
    idNumber2: '876543210',
    phone2: '050-8765432',
    email2: 'moshe@example.com',
    address2: 'רחוב ז׳בוטינסקי 45, בני ברק',
    birthDate2: '1984-02-10',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2012-04-22',
  },

  selectedClaims: ['custody'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'יעל',
        lastName: 'כהן',
        idNumber: '345678901',
        birthDate: '2014-11-15',
        address: 'רחוב ויצמן 22, רמת גן',
        nameOfParent: 'משה כהן',
        childRelationship: 'יעל היא ילדה רגישה וחכמה. אני מלווה אותה לכל פעילויותיה, עוזרת בשיעורי בית, ודואגת לצרכיה הרגשיים.',
      },
      {
        firstName: 'אלון',
        lastName: 'כהן',
        idNumber: '456789012',
        birthDate: '2017-03-08',
        address: 'רחוב ויצמן 22, רמת גן',
        nameOfParent: 'משה כהן',
        childRelationship: 'אלון הוא ילד אנרגטי ושמח. אני דואגת לכל צרכיו היומיומיים, מכינה לו ארוחות בריאות, ומלווה אותו לגן.',
      },
      {
        firstName: 'תומר',
        lastName: 'כהן',
        idNumber: '567890123',
        birthDate: '2020-07-25',
        address: 'רחוב ויצמן 22, רמת גן',
        nameOfParent: 'משה כהן',
        childRelationship: 'תומר הוא הקטן שלנו. אני מטפלת בו באופן בלעדי כמעט מאז לידתו, כולל הנקה, לילות, וכל הטיפול היומיומי.',
      },
    ],

    // GLOBAL: Previous marriages
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',

    // GLOBAL: Housing
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',

    // GLOBAL: Separation
    livingSeparately: 'כן',
    separationDate: '2024-03-15',

    // GLOBAL: Violence & Protection
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',

    // GLOBAL: Welfare & Counseling
    contactedWelfare: 'yes',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',

    // GLOBAL: Other cases
    otherFamilyCases: [],

    // GLOBAL: Relationship description
    relationshipDescription: 'היינו נשואים במשך 12 שנים. במהלך השנים האחרונות התפתחו חילוקי דעות חמורים בנוגע לחינוך הילדים וניהול החיים המשותפים.',

    // CUSTODY-SPECIFIC DATA
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-03-15',
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים, מיום שישי בשעה 16:00 עד יום ראשון בשעה 18:00. בנוסף, פגישה אחת באמצע השבוע ביום רביעי בין השעות 16:00-20:00.',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי מאז לידתם. אני זו שמקימה אותם בבוקר, מכינה ארוחות, מלווה לבית ספר ולגן, עוזרת בשיעורי בית, ודואגת לכל צרכיהם הרפואיים והחברתיים. יש לי גמישות בעבודה שמאפשרת לי להיות זמינה עבורם בכל עת. הילדים רגילים לשגרה יציבה איתי ומרגישים בטוחים.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עובד בשעות ארוכות ולעיתים קרובות חוזר הביתה מאוחר בערב. הוא נוסע לחו"ל לפגישות עסקיות כ-10 ימים בחודש. למרות שהוא אוהב את הילדים, אין לו את הזמינות הנדרשת לטיפול יומיומי עקבי. בנוסף, הוא פחות בקיא בשגרת הילדים - לוח זמני בית הספר, חוגים, תרופות, וצרכים מיוחדים של כל ילד.',
    },
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תעודות בית ספר של הילדים', file: SAMPLE_IMAGE, name: 'school-certificates.png', mimeType: 'image/png' },
    { label: 'ב', description: 'אישור מהמעסיק על שעות עבודה גמישות', file: SAMPLE_IMAGE, name: 'employer-flexibility.png', mimeType: 'image/png' },
    { label: 'ג', description: 'אישורים רפואיים של הילדים', file: SAMPLE_IMAGE, name: 'medical-certificates.png', mimeType: 'image/png' },
    { label: 'ד', description: 'הוכחת מגורים (חוזה שכירות)', file: SAMPLE_IMAGE, name: 'residence-proof.png', mimeType: 'image/png' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Custody-' + new Date().toISOString().split('T')[0],
};

console.log('🧪 Testing CUSTODY Claim\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Current Arrangement: ${testData.formData.custody.currentLivingArrangement}`);
console.log(`   Requested: ${testData.formData.custody.requestedArrangement}`);
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

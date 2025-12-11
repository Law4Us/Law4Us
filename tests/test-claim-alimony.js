/**
 * Comprehensive Alimony Claim Test
 * Tests: Alimony/child support claim with full data and attachments
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

const testData = {
  basicInfo: {
    fullName: 'מיכל אברהם',
    idNumber: '345678901',
    email: 'test-alimony@law4us.co.il',
    phone: '053-3456789',
    address: 'רחוב סוקולוב 18, הרצליה',
    birthDate: '1990-01-25',
    gender: 'female',
    fullName2: 'אבי אברהם',
    idNumber2: '765432109',
    phone2: '054-7654321',
    email2: 'avi@example.com',
    address2: 'רחוב הנשיא 55, הרצליה',
    birthDate2: '1986-06-12',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2015-08-30',
  },

  selectedClaims: ['alimony'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'עומר',
        lastName: 'אברהם',
        idNumber: '456789012',
        birthDate: '2016-12-05',
        address: 'רחוב סוקולוב 18, הרצליה',
        gender: 'male',
        nameOfParent: 'אבי אברהם',
        childRelationship: 'עומר הוא ילד חברותי ואנרגטי. לומד בכיתה ב\' ומשתתף בחוג כדורגל ופסנתר.',
      },
      {
        firstName: 'נועה',
        lastName: 'אברהם',
        idNumber: '567890123',
        birthDate: '2019-05-18',
        address: 'רחוב סוקולוב 18, הרצליה',
        gender: 'female',
        nameOfParent: 'אבי אברהם',
        childRelationship: 'נועה היא ילדה חכמה ויצירתית. היא בגן חובה ואוהבת לצייר ולרקוד.',
      },
    ],

    // GLOBAL: Previous marriages
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',

    // GLOBAL: Housing
    applicantHomeType: 'rental',
    partnerHomeType: 'ownership',

    // GLOBAL: Separation
    livingSeparately: 'כן',
    separationDate: '2024-05-01',

    // GLOBAL: Violence & Protection
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',

    // GLOBAL: Welfare & Counseling
    contactedWelfare: 'no',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',

    // GLOBAL: Other cases
    otherFamilyCases: [],

    // GLOBAL: Relationship description
    relationshipDescription: 'היינו נשואים במשך 9 שנים. הקדשתי את עצמי לגידול הילדים ולניהול משק הבית, בעוד בן הזוג התמקד בקריירה ופיתח עסק מצליח.',

    // ALIMONY-SPECIFIC DATA
    alimony: {
      relationshipDescription: 'במהלך הנישואים הקדשתי את רוב זמני לגידול הילדים ולתפקוד המשפחה. עבדתי חלקית כדי להיות זמינה עבור הילדים. בן הזוג פיתח קריירה מצליחה והגדיל את הכנסותיו באופן משמעותי לאורך השנים.',
      wasPreviousAlimony: 'no',
      // Employment data
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'רשת מכבי שירותי בריאות',
      applicantGrossSalary: 8500,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת הייטק בע"מ',
      respondentGrossSalary: 35000,
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד וספרים', monthlyAmount: 3500 },
        { category: 'בריאות', description: 'ביטוח בריאות משלים ותרופות', monthlyAmount: 800 },
        { category: 'ביגוד', description: 'בגדים והנעלה', monthlyAmount: 1200 },
        { category: 'חוגים', description: 'חוג כדורגל, פסנתר, ריקוד', monthlyAmount: 2000 },
        { category: 'הוצאות נוספות', description: 'כיס, טיולים, ימי הולדת', monthlyAmount: 1500 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'שכירות דירה 3.5 חדרים', monthlyAmount: 5500 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות כולל ארנונה', monthlyAmount: 1000 },
        { category: 'מזון', description: 'קניות מזון שבועיות', monthlyAmount: 4000 },
        { category: 'תחבורה', description: 'דלק, תחזוקת רכב, חניה', monthlyAmount: 1500 },
        { category: 'תקשורת', description: 'אינטרנט, טלפון, טלוויזיה', monthlyAmount: 500 },
        { category: 'ביטוחים', description: 'ביטוח דירה ורכב', monthlyAmount: 600 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק הפועלים', accountNumber: '12-345-67890' },
        { bankName: 'בנק לאומי', accountNumber: '98-765-43210' },
      ],
      hasVehicle: 'yes',
      vehicleDetails: 'טויוטה קורולה 2020, מספר רישוי 12-345-67',
    },
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תלוש שכר - המבקשת (עבודה חלקית)', file: SAMPLE_IMAGE, name: 'salary-applicant.png', mimeType: 'image/png' },
    { label: 'ב', description: 'דוח הכנסות המשיב (עצמאי)', file: SAMPLE_IMAGE, name: 'income-respondent.png', mimeType: 'image/png' },
    { label: 'ג', description: 'קבלות על הוצאות הילדים', file: SAMPLE_IMAGE, name: 'children-expenses.png', mimeType: 'image/png' },
    { label: 'ד', description: 'חוזה שכירות דירה', file: SAMPLE_IMAGE, name: 'rental-contract.png', mimeType: 'image/png' },
    { label: 'ה', description: 'דפי חשבון בנק - 3 חודשים', file: SAMPLE_IMAGE, name: 'bank-statements.png', mimeType: 'image/png' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Alimony-' + new Date().toISOString().split('T')[0],
};

// Calculate totals
const childrenTotal = testData.formData.alimony.childrenNeeds.reduce((sum, n) => sum + n.monthlyAmount, 0);
const householdTotal = testData.formData.alimony.householdNeeds.reduce((sum, n) => sum + n.monthlyAmount, 0);

console.log('🧪 Testing ALIMONY Claim\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Children's Needs: ${childrenTotal.toLocaleString()} ש"ח/חודש`);
console.log(`   Household Needs: ${householdTotal.toLocaleString()} ש"ח/חודש`);
console.log(`   Total Monthly: ${(childrenTotal + householdTotal).toLocaleString()} ש"ח/חודש`);
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

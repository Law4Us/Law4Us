/**
 * Comprehensive Property Claim Test
 * Tests: Property division claim with full data and attachments
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

// Minimal valid PDF
const SAMPLE_PDF = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMDQKJSVFT0Y=';

const testData = {
  basicInfo: {
    fullName: 'רחל לוי',
    idNumber: '123456789',
    email: 'test-property@law4us.co.il',
    phone: '052-1234567',
    address: 'רחוב הרצל 50, תל אביב',
    birthDate: '1985-03-15',
    gender: 'female',
    fullName2: 'דוד לוי',
    idNumber2: '987654321',
    phone2: '053-9876543',
    email2: 'partner@example.com',
    address2: 'רחוב דיזנגוף 100, תל אביב',
    birthDate2: '1982-07-20',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2010-06-15',
  },

  selectedClaims: ['property'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'נועם',
        lastName: 'לוי',
        idNumber: '567890123',
        birthDate: '2015-04-10',
        address: 'רחוב הרצל 50, תל אביב',
        nameOfParent: 'דוד לוי',
        childRelationship: 'נועם הוא ילד חכם ומוכשר, אוהב ספורט ומוזיקה.',
      },
      {
        firstName: 'מיכל',
        lastName: 'לוי',
        idNumber: '678901234',
        birthDate: '2018-08-22',
        address: 'רחוב הרצל 50, תל אביב',
        nameOfParent: 'דוד לוי',
        childRelationship: 'מיכל היא ילדה מקסימה, אוהבת לצייר ולקרוא.',
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
    separationDate: '2024-06-01',

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
    relationshipDescription: 'היינו נשואים במשך 14 שנים. במהלך השנים הצטברו חילוקי דעות משמעותיים בנוגע לניהול משק הבית, חינוך הילדים, וניהול הכספים.',

    // PROPERTY-SPECIFIC DATA
    property: {
      apartments: [
        {
          description: 'דירת 4 חדרים ברחוב הרצל 50, תל אביב',
          value: 2800000,
          owner: 'שניהם',
          purchaseDate: '2012-03-15',
        },
        {
          description: 'דירה להשקעה ברחוב אלנבי 30, תל אביב (3 חדרים)',
          value: 1900000,
          owner: 'שניהם',
          purchaseDate: '2018-09-01',
        },
      ],
      vehicles: [
        {
          description: 'טויוטה קורולה 2020',
          value: 95000,
          owner: 'רחל לוי',
          purchaseDate: '2020-06-01',
        },
        {
          description: 'הונדה CR-V 2019',
          value: 120000,
          owner: 'דוד לוי',
          purchaseDate: '2019-02-15',
        },
      ],
      savings: [
        {
          description: 'חשבון עו"ש בנק הפועלים',
          value: 180000,
          owner: 'שניהם',
        },
        {
          description: 'חשבון חיסכון בנק לאומי',
          value: 250000,
          owner: 'רחל לוי',
        },
        {
          description: 'תיק השקעות בנק דיסקונט',
          value: 420000,
          owner: 'שניהם',
        },
      ],
      benefits: [
        {
          description: 'קופת גמל כלל ביטוח',
          value: 520000,
          owner: 'דוד לוי',
        },
        {
          description: 'קרן פנסיה מנורה',
          value: 380000,
          owner: 'רחל לוי',
        },
        {
          description: 'קרן השתלמות הראל',
          value: 145000,
          owner: 'דוד לוי',
        },
      ],
      properties: [
        {
          description: 'ריהוט ומוצרי חשמל',
          value: 80000,
          owner: 'שניהם',
        },
        {
          description: 'תכשיטים ויודאיקה',
          value: 35000,
          owner: 'שניהם',
        },
      ],
      debts: [
        {
          description: 'משכנתא בנק הפועלים',
          amount: 950000,
          creditor: 'בנק הפועלים',
          debtor: 'שניהם',
        },
        {
          description: 'הלוואה לרכב',
          amount: 45000,
          creditor: 'בנק לאומי',
          debtor: 'דוד לוי',
        },
        {
          description: 'הלוואה אישית',
          amount: 30000,
          creditor: 'בנק דיסקונט',
          debtor: 'רחל לוי',
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת הייטק ישראל בע"מ',
      applicantGrossSalary: 22000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'בנק הפועלים',
      respondentGrossSalary: 28000,
    },
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תלוש שכר - נובמבר 2024 (המבקשת)', file: SAMPLE_IMAGE, name: 'salary-applicant.png', mimeType: 'image/png' },
    { label: 'ב', description: 'תלוש שכר - נובמבר 2024 (המשיב)', file: SAMPLE_IMAGE, name: 'salary-respondent.png', mimeType: 'image/png' },
    { label: 'ג', description: 'נסח טאבו - דירת מגורים', file: SAMPLE_PDF, name: 'tabu-home.pdf', mimeType: 'application/pdf' },
    { label: 'ד', description: 'נסח טאבו - דירת השקעה', file: SAMPLE_PDF, name: 'tabu-investment.pdf', mimeType: 'application/pdf' },
    { label: 'ה', description: 'דפי חשבון בנק', file: SAMPLE_PDF, name: 'bank-statements.pdf', mimeType: 'application/pdf' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Property-' + new Date().toISOString().split('T')[0],
};

console.log('🧪 Testing PROPERTY Claim\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Apartments: ${testData.formData.property.apartments.length}`);
console.log(`   Vehicles: ${testData.formData.property.vehicles.length}`);
console.log(`   Savings: ${testData.formData.property.savings.length}`);
console.log(`   Benefits: ${testData.formData.property.benefits.length}`);
console.log(`   Debts: ${testData.formData.property.debts.length}`);
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

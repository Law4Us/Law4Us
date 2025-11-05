const axios = require('axios');

/**
 * Test with properly formatted attachments
 * Client: Rachel Levi
 */

// Helper to create a simple 1x1 pixel PNG buffer
const createPlaceholderPNGBuffer = () => {
  // 1x1 red pixel PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  return Buffer.from(base64, 'base64');
};

const testData = {
  basicInfo: {
    fullName: 'רחל לוי',
    idNumber: '987654321',
    email: 'rachel@example.com',
    phone: '052-9876543',
    address: 'רחוב דיזנגוף 50, תל אביב',
    birthDate: '1988-03-12',
    gender: 'female',
    fullName2: 'יוסי לוי',
    idNumber2: '123456789',
    phone2: '053-1234567',
    email2: 'yossi@example.com',
    address2: 'רחוב בן יהודה 30, תל אביב',
    birthDate2: '1985-07-25',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2010-09-15',
  },
  selectedClaims: ['property', 'alimony', 'custody'],
  formData: {
    children: [
      {
        firstName: 'נועם',
        lastName: 'לוי',
        idNumber: '567890123',
        birthDate: '2012-03-14',
        address: 'רחוב דיזנגוף 50, תל אביב',
        nameOfParent: 'יוסי לוי',
        childRelationship: 'נועם הוא ילד חכם ומתחשב. יש לנו קשר חזק.',
      },
      {
        firstName: 'תמר',
        lastName: 'לוי',
        idNumber: '678901234',
        birthDate: '2015-08-22',
        address: 'רחוב דיזנגוף 50, תל אביב',
        nameOfParent: 'יוסי לוי',
        childRelationship: 'תמר היא ילדה מקסימה ואנרגטית.',
      },
    ],
    separationDate: '2024-02-20',
    property: {
      apartments: [
        {
          description: 'דירת 5 חדרים, רחוב דיזנגוף 50',
          value: 3200000,
          owner: 'שניהם',
          purchaseDate: '2011-05-10',
        },
      ],
      vehicles: [
        {
          description: 'הונדה סיוויק 2021',
          value: 120000,
          owner: 'רחל לוי',
          purchaseDate: '2021-06-15',
        },
      ],
      savings: [
        {
          description: 'חשבון בנק דיסקונט',
          value: 280000,
          owner: 'שניהם',
        },
      ],
      benefits: [
        {
          description: 'קופת גמל מנורה',
          value: 450000,
          owner: 'יוסי לוי',
        },
      ],
      properties: [],
      debts: [
        {
          description: 'משכנתא בנק הפועלים',
          amount: 1200000,
          creditor: 'בנק הפועלים',
          debtor: 'שניהם',
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת סטארט-אפ בע"מ',
      applicantGrossSalary: 18000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת הייטק גדולה בע"מ',
      respondentGrossSalary: 25000,
    },
    alimony: {
      relationshipDescription: 'היינו זוג נשוי במשך 14 שנים. בשנים הראשונות היה לנו קשר טוב.',
      wasPreviousAlimony: 'no',
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד', monthlyAmount: 4000 },
        { category: 'בריאות', description: 'ביטוח בריאות', monthlyAmount: 2000 },
        { category: 'ביגוד', description: 'בגדים', monthlyAmount: 1500 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'שכירות', monthlyAmount: 6000 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות', monthlyAmount: 1000 },
        { category: 'מזון', description: 'קניות', monthlyAmount: 4000 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [{ bankName: 'בנק דיסקונט', accountNumber: '87654321' }],
      hasVehicle: 'yes',
      vehicleDetails: 'הונדה סיוויק 2021',
      requestedAmount: 10000,
    },
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-02-20',
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים.',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי מאז שנולדו.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עסוק מאוד בעבודה.',
    },
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',
    otherFamilyCases: [],
    contactedWelfare: 'yes',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',
  },
  // Attachments in proper format (top-level) - as base64 strings
  attachments: [
    {
      label: 'א',
      description: 'אישור בעלות על דירה - רחוב דיזנגוף 50',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='],
    },
    {
      label: 'ב',
      description: 'רישיון רכב - הונדה סיוויק 2021',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='],
    },
    {
      label: 'ג',
      description: 'אישור יתרה מבנק דיסקונט',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='],
    },
    {
      label: 'ד',
      description: 'אישור צבירה - קופת גמל מנורה',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='],
    },
    {
      label: 'ה',
      description: 'אישור יתרת משכנתא - בנק הפועלים',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='],
    },
  ],
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing Claims with ATTACHMENTS (Rachel Levi)\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   📎 Attachments: ${testData.attachments.length}`);
testData.attachments.forEach((att) => {
  console.log(`      ${att.label}. ${att.description} (${att.images.length} page(s))`);
});
console.log('');

axios
  .post('http://localhost:3001/api/submission/submit', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
    console.log('');
    console.log('🔍 Check the property claim document for:');
    console.log(`   ✅ נספחים section with ${testData.attachments.length} attachments`);
    console.log('   ✅ Hebrew letter labels (א, ב, ג, ד, ה)');
    console.log('   ✅ Table of contents with page numbers');
  })
  .catch((error) => {
    console.error('❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from backend');
      console.error('Request was made but no response');
    } else {
      console.error('Error setting up request:', error.message);
      console.error('Full error:', error);
    }
    process.exit(1);
  });

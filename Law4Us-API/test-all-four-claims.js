const axios = require('axios');

/**
 * Comprehensive Test: ALL FOUR CLAIM TYPES
 * Client: ליאת גולדשטיין (new person)
 * Claims: Property + Alimony + Custody + Divorce Agreement
 * All in ONE folder!
 */

const testData = {
  basicInfo: {
    fullName: 'ליאת גולדשטיין',
    idNumber: '333444555',
    email: 'liat@example.com',
    phone: '053-3334445',
    address: 'רחוב דיזנגוף 120, תל אביב',
    birthDate: '1987-11-18',
    gender: 'female',
    fullName2: 'אורן גולדשטיין',
    idNumber2: '666777888',
    phone2: '053-6667778',
    email2: 'oren@example.com',
    address2: 'רחוב בן יהודה 55, תל אביב',
    birthDate2: '1985-04-22',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2010-06-15',
  },
  selectedClaims: ['property', 'alimony', 'custody', 'divorceAgreement'], // ALL FOUR!
  formData: {
    // GLOBAL: Children
    children: [
      {
        firstName: 'מיכל',
        lastName: 'גולדשטיין',
        idNumber: '999000111',
        birthDate: '2012-09-08',
        address: 'רחוב דיזנגוף 120, תל אביב',
        nameOfParent: 'אורן גולדשטיין',
        childRelationship: 'מיכל היא בתי הגדולה. יש לנו קשר חזק מאוד, אני מלווה אותה בכל דבר.',
      },
      {
        firstName: 'רוני',
        lastName: 'גולדשטיין',
        idNumber: '222333444',
        birthDate: '2016-03-14',
        address: 'רחוב דיזנגוף 120, תל אביב',
        nameOfParent: 'אורן גולדשטיין',
        childRelationship: 'רוני הוא הקטן שלנו. ילד מקסים ואנרגטי.',
      },
    ],

    // GLOBAL: Separation date
    separationDate: '2024-06-01',

    // PROPERTY
    property: {
      apartments: [
        {
          description: 'דירת 5 חדרים, רחוב דיזנגוף 120',
          value: 3500000,
          owner: 'שניהם',
          purchaseDate: '2011-08-10',
        },
      ],
      vehicles: [
        {
          description: 'יונדאי טוסון 2022',
          value: 140000,
          owner: 'ליאת גולדשטיין',
          purchaseDate: '2022-02-15',
        },
      ],
      savings: [
        {
          description: 'חשבון חיסכון בנק הפועלים',
          value: 220000,
          owner: 'שניהם',
        },
      ],
      benefits: [
        {
          description: 'קופת גמל הפניקס',
          value: 380000,
          owner: 'אורן גולדשטיין',
        },
      ],
      properties: [],
      debts: [
        {
          description: 'משכנתא בנק לאומי',
          amount: 1100000,
          creditor: 'בנק לאומי',
          debtor: 'שניהם',
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת פרסום בע"מ',
      applicantGrossSalary: 19000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת הייטק בע"מ',
      respondentGrossSalary: 28000,
    },

    // ALIMONY
    alimony: {
      relationshipDescription:
        'היינו זוג נשוי במשך 14 שנים. בשנים הראשונות היה לנו קשר מצוין, אבל בשנים האחרונות התרחקנו בגלל לחצי עבודה וחילוקי דעות על חינוך הילדים.',
      wasPreviousAlimony: 'no',
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד פרטי', monthlyAmount: 3500 },
        { category: 'בריאות', description: 'ביטוח בריאות מורחב', monthlyAmount: 1800 },
        { category: 'ביגוד', description: 'בגדים ונעליים', monthlyAmount: 1200 },
        { category: 'פנאי', description: 'חוגים וספורט', monthlyAmount: 1000 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'שכירות', monthlyAmount: 5500 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות', monthlyAmount: 900 },
        { category: 'מזון', description: 'קניות', monthlyAmount: 3500 },
        { category: 'תחבורה', description: 'דלק ותחזוקה', monthlyAmount: 1300 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [{ bankName: 'בנק הפועלים', accountNumber: '98765432' }],
      hasVehicle: 'yes',
      vehicleDetails: 'יונדאי טוסון 2022',
      requestedAmount: 9000,
    },

    // CUSTODY
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-06-01',
      currentVisitationArrangement:
        'הילדים נפגשים עם האב בסופי שבוע מתחלפים ויום אחד באמצע השבוע (רביעי 16:00-20:00).',
      whoShouldHaveCustody:
        'אני מטפלת בילדים באופן יומיומי מאז שנולדו. אני עוזרת להם בשיעורי בית, דואגת לבריאותם, מלווה לרופא ולחוגים. יש לי גמישות בעבודה.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent:
        'אורן עסוק מאוד בעבודה בהייטק, עובד שעות ארוכות ולפעמים נוסע לחול. הוא אוהב את הילדים אבל אין לו זמינות לטיפול יומיומי.',
    },

    // DIVORCE AGREEMENT
    divorceAgreement: {
      // Property - reference the property claim
      propertyAgreement: 'referenceClaim',

      // Custody - reference the custody claim
      custodyAgreement: 'referenceClaim',

      // Alimony - reference the alimony claim
      alimonyAgreement: 'referenceClaim',

      // Additional terms only
      additionalTerms:
        'אורן ימשיך לשלם ביטוח חיים וביטוח בריאות לילדים. הוצאות חינוך חריגות (מעל 2000 ש"ח) נחלק שווה בשווה. שני הצדדים מוותרים על תביעות נוספות.',
    },

    // GLOBAL questions
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
  signature:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing ALL FOUR CLAIMS in ONE FOLDER\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName} (${testData.basicInfo.gender})`);
console.log(`   Partner: ${testData.basicInfo.fullName2} (${testData.basicInfo.gender2})`);
console.log(`   Marriage: ${testData.basicInfo.weddingDay}`);
console.log(`   Separation: ${testData.formData.separationDate}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log('');
console.log('📄 Claims (ALL FOUR):');
console.log('   1️⃣  Property (תביעה רכושית)');
console.log('   2️⃣  Alimony (תביעת מזונות)');
console.log('   3️⃣  Custody (תביעת משמורת)');
console.log('   4️⃣  Divorce Agreement (הסכם גירושין)');
console.log('');
console.log('💰 Financial Summary:');
const totalAssets = 3500000 + 140000 + 220000 + 380000;
console.log(`   Assets: ${totalAssets.toLocaleString()} ILS`);
console.log(`   Debts: 1,100,000 ILS`);
console.log(`   Net: ${(totalAssets - 1100000).toLocaleString()} ILS`);
console.log(`   Alimony: ${testData.formData.alimony.requestedAmount.toLocaleString()} ILS/month`);
console.log('');

axios
  .post('http://localhost:3000/api/submit', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
    console.log('');
    console.log('📂 ONE FOLDER WITH ALL FOUR DOCUMENTS:');
    console.log(`   ${response.data.folderName}/`);
    console.log('   ├── submission-data-*.json');
    console.log('   ├── תביעה רכושית/');
    console.log('   │   └── תביעת-רכושית.docx');
    console.log('   ├── תביעת מזונות/');
    console.log('   │   └── תביעת-מזונות.docx');
    console.log('   ├── תביעת משמורת/');
    console.log('   │   └── תביעת-משמורת.docx');
    console.log('   └── הסכם גירושין/');
    console.log('       └── הסכם-גירושין.docx');
    console.log('');
    console.log('🎯 All four claim types in ONE hierarchical folder!');
  })
  .catch((error) => {
    console.error('❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  });

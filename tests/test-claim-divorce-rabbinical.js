/**
 * Comprehensive Divorce Claim Test - RABBINICAL COURT (BUNDLE)
 * Tests: Divorce petition routed to Rabbinical Court with bundled claims (property, custody, alimony)
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

const testData = {
  basicInfo: {
    fullName: 'רבקה שלום',
    idNumber: '567890123',
    email: 'test-divorce-rabbinical@law4us.co.il',
    phone: '054-5678901',
    address: 'רחוב הרב קוק 15, ירושלים',
    birthDate: '1990-11-08',
    gender: 'female',
    fullName2: 'יצחק שלום',
    idNumber2: '543210987',
    phone2: '052-5432109',
    email2: 'yitzhak@example.com',
    address2: 'רחוב יפו 200, ירושלים',
    birthDate2: '1987-03-15',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2013-09-10',
  },

  // BUNDLE: divorceRabbinical includes property, custody, alimony
  selectedClaims: ['divorceRabbinical'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'שירה',
        lastName: 'שלום',
        idNumber: '678901234',
        birthDate: '2015-05-20',
        address: 'רחוב הרב קוק 15, ירושלים',
        nameOfParent: 'יצחק שלום',
        childRelationship: 'שירה היא ילדה חכמה ורצינית. לומדת בבית ספר ממלכתי-דתי ומצטיינת בלימודים.',
      },
      {
        firstName: 'יונתן',
        lastName: 'שלום',
        idNumber: '789012345',
        birthDate: '2018-01-12',
        address: 'רחוב הרב קוק 15, ירושלים',
        nameOfParent: 'יצחק שלום',
        childRelationship: 'יונתן הוא ילד שמח וחברותי. לומד בגן דתי ואוהב לשחק עם חברים.',
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
    separationDate: '2024-02-15',

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
    relationshipDescription: 'היינו נשואים במשך 11 שנים בנישואין דתיים. בשנים האחרונות בן הזוג מסרב לקיים יחסי אישות באופן עקבי, מה שמהווה עילה הלכתית לגירושין.',

    // DIVORCE-SPECIFIC DATA - RABBINICAL COURT ROUTING
    // Routing fields (triggers RABBINICAL COURT due to halachic grounds)
    'divorce.currentSituation': 'wantDivorce',
    'divorce.infidelity': 'לא',
    'divorce.youngestChildAge': 'under6',
    'divorce.careerDisparity': 'similar',
    'divorce.significantProperty': 'כן',
    'divorce.halachicGrounds': ['refusalRelations', 'neglect'],  // TRIGGERS RABBINICAL COURT

    // Core divorce questions
    'divorce.childrenDispute': 'כן',
    'divorce.needSupport': 'כן',
    'divorce.propertyDispute': 'כן',
    'divorce.urgentRelief': 'לא',
    'divorce.parallelCases': 'לא',

    // Story
    'divorce.whoWantsDivorceAndWhy': 'אני מבקשת גירושין לאחר 11 שנות נישואין. במהלך 3 השנים האחרונות בן הזוג מסרב באופן עקבי לקיים יחסי אישות, למרות פניות חוזרות ונשנות שלי ולמרות ייעוץ זוגי. בנוסף, הוא מזניח את צרכי המשפחה ואינו משתתף בחיי הבית באופן פעיל. מצב זה מהווה עילה הלכתית ברורה לגירושין על פי דין תורה.',

    // Legal reasons
    'divorce.divorceReasons': 'מאיס עלי - סירוב לקיום יחסי אישות במשך 3 שנים, הזנחת צרכי המשפחה, אי השתתפות בחיי הבית, חוסר תקשורת ממושך, אי מילוי חובות הבעל על פי ההלכה.',

    // Marriage details
    'divorce.weddingCity': 'ירושלים',
    'divorce.religiousMarriage': 'כן',
    'divorce.religiousCouncil': 'הרבנות הראשית ירושלים',

    // Police & Mediation
    'divorce.policeComplaints': 'לא',
    'divorce.hadPreviousMediation': 'כן',
    'divorce.previousMediationDetails': 'פנינו לרב מגשר בקהילה בחודש ינואר 2024. למרות מספר פגישות, בן הזוג סירב לשנות את התנהגותו.',
    'divorce.marriageCounselingDetails': 'התקיים ייעוץ זוגי אצל יועצת נישואין דתית במשך שנה. הטיפול לא הצליח לפתור את הבעיות.',

    // Ketubah
    'divorce.ketubahAmount': '500 זקוקים כסף צרוף',
    'divorce.ketubahRequest': 'המבקשת דורשת את מלוא סכום הכתובה בהתאם להתחייבות המשיב. הכתובה נחתמה כדין ביום הנישואין בנוכחות עדים כשרים.',

    // PROPERTY DATA (bundled)
    property: {
      apartments: [
        {
          description: 'דירת 4 חדרים ברחוב הרב קוק 15, ירושלים',
          value: 3200000,
          owner: 'שניהם',
          purchaseDate: '2014-08-01',
        },
      ],
      vehicles: [
        {
          description: 'קיה ספורטאז\' 2021',
          value: 110000,
          owner: 'שניהם',
          purchaseDate: '2021-03-15',
        },
      ],
      savings: [
        {
          description: 'חשבון חיסכון בנק מזרחי',
          value: 150000,
          owner: 'שניהם',
        },
      ],
      benefits: [
        {
          description: 'קרן פנסיה - הבעל',
          value: 280000,
          owner: 'יצחק שלום',
        },
        {
          description: 'קרן פנסיה - האישה',
          value: 95000,
          owner: 'רבקה שלום',
        },
      ],
      properties: [],
      debts: [
        {
          description: 'משכנתא',
          amount: 800000,
          creditor: 'בנק מזרחי טפחות',
          debtor: 'שניהם',
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'משרד החינוך',
      applicantGrossSalary: 12000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת תוכנה',
      respondentGrossSalary: 18000,
    },

    // CUSTODY DATA (bundled)
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-02-15',
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים, משבת בבוקר עד מוצאי שבת.',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי ומספקת להם סביבה יציבה ודתית.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עובד שעות ארוכות ופחות זמין לטיפול יומיומי בילדים.',
    },

    // ALIMONY DATA (bundled)
    alimony: {
      relationshipDescription: 'במהלך הנישואים עבדתי חלקית כדי לטפל בילדים ולנהל את הבית.',
      wasPreviousAlimony: 'no',
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד וחוגים', monthlyAmount: 3000 },
        { category: 'בריאות', description: 'ביטוח ותרופות', monthlyAmount: 600 },
        { category: 'ביגוד', description: 'בגדים והנעלה', monthlyAmount: 800 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'משכנתא', monthlyAmount: 4500 },
        { category: 'מזון', description: 'קניות', monthlyAmount: 3500 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות', monthlyAmount: 800 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק מזרחי', accountNumber: '123-456789' },
      ],
      hasVehicle: 'no',
    },
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תעודת נישואין', file: SAMPLE_IMAGE, name: 'marriage-certificate.png', mimeType: 'image/png' },
    { label: 'ב', description: 'הכתובה', file: SAMPLE_IMAGE, name: 'ketubah.png', mimeType: 'image/png' },
    { label: 'ג', description: 'תעודות לידה של הילדים', file: SAMPLE_IMAGE, name: 'birth-certificates.png', mimeType: 'image/png' },
    { label: 'ד', description: 'אישור מהרב המגשר', file: SAMPLE_IMAGE, name: 'rabbi-mediator.png', mimeType: 'image/png' },
    { label: 'ה', description: 'נסח טאבו', file: SAMPLE_IMAGE, name: 'tabu.png', mimeType: 'image/png' },
    { label: 'ו', description: 'תלושי שכר', file: SAMPLE_IMAGE, name: 'salary-slips.png', mimeType: 'image/png' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Divorce-Rabbinical-' + new Date().toISOString().split('T')[0],
};

console.log('🧪 Testing DIVORCE Claim (RABBINICAL COURT - BUNDLE)\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Infidelity: ${testData.formData['divorce.infidelity']}`);
console.log(`   Halachic Grounds: ${JSON.stringify(testData.formData['divorce.halachicGrounds'])} (→ RABBINICAL COURT)`);
console.log(`   Bundle Claims: divorceRabbinical (includes property, custody, alimony)`);
console.log(`   Attachments: ${testData.attachments.length}`);
console.log('');

axios
  .post('http://localhost:3000/api/submission', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
    if (response.data.divorceRouting) {
      console.log(`⚖️ Court: ${response.data.divorceRouting.courtTypeName}`);
      console.log(`📍 Track: ${response.data.divorceRouting.trackName}`);
    }
  })
  .catch((error) => {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  });

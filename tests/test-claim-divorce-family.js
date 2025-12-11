/**
 * Comprehensive Divorce Claim Test - FAMILY COURT
 * Tests: Divorce petition routed to Family Court (due to infidelity)
 */

const axios = require('axios');

// 1x1 pixel orange PNG for sample attachments
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAHl6u3QAAAABJRU5ErkJggg==';

const testData = {
  basicInfo: {
    fullName: 'דנה רוזנברג',
    idNumber: '456789012',
    email: 'test-divorce-family@law4us.co.il',
    phone: '052-4567890',
    address: 'רחוב רוטשילד 88, תל אביב',
    birthDate: '1988-04-12',
    gender: 'female',
    fullName2: 'עמית רוזנברג',
    idNumber2: '654321098',
    phone2: '053-6543210',
    email2: 'amit@example.com',
    address2: 'רחוב אלנבי 120, תל אביב',
    birthDate2: '1985-09-28',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2011-05-22',
  },

  selectedClaims: ['divorce'],

  formData: {
    // GLOBAL: Children
    hasSharedChildren: 'yes',
    children: [
      {
        firstName: 'אורי',
        lastName: 'רוזנברג',
        idNumber: '567890123',
        birthDate: '2013-02-14',
        address: 'רחוב רוטשילד 88, תל אביב',
        nameOfParent: 'עמית רוזנברג',
        childRelationship: 'אורי הוא ילד רגיש וחכם. לומד בכיתה ה\' ומצטיין בלימודים ובספורט.',
      },
      {
        firstName: 'מאיה',
        lastName: 'רוזנברג',
        idNumber: '678901234',
        birthDate: '2016-08-30',
        address: 'רחוב רוטשילד 88, תל אביב',
        nameOfParent: 'עמית רוזנברג',
        childRelationship: 'מאיה היא ילדה שמחה ויצירתית. לומדת בכיתה ב\' ואוהבת לצייר.',
      },
      {
        firstName: 'איתמר',
        lastName: 'רוזנברג',
        idNumber: '789012345',
        birthDate: '2020-01-15',
        address: 'רחוב רוטשילד 88, תל אביב',
        nameOfParent: 'עמית רוזנברג',
        childRelationship: 'איתמר הוא הקטן שלנו, בגן טרום חובה. ילד חמוד ומלא אנרגיה.',
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
    separationDate: '2024-04-01',

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
    relationshipDescription: 'היינו נשואים במשך 13 שנים. בשנתיים האחרונות התגלתה בגידה של בן הזוג, מה שהביא לקריסת האמון ביננו.',

    // PROPERTY DATA - for the רכוש section
    property: {
      apartments: [
        { description: 'דירת 4 חדרים ברחוב רוטשילד 88, תל אביב', value: 4500000, owner: 'שניהם', purchaseDate: '2013-01-15' },
      ],
      vehicles: [
        { description: 'מרצדס E-Class 2021', value: 280000, owner: 'עמית רוזנברג', purchaseDate: '2021-03-10' },
        { description: 'מאזדה 3 2019', value: 85000, owner: 'דנה רוזנברג', purchaseDate: '2019-08-20' },
      ],
      savings: [
        { description: 'חשבון עו"ש משותף בנק לאומי', value: 320000, owner: 'שניהם' },
        { description: 'חסכונות בבנק הפועלים', value: 180000, owner: 'דנה רוזנברג' },
      ],
      benefits: [
        { description: 'קרן פנסיה מגדל', value: 850000, owner: 'עמית רוזנברג' },
        { description: 'קרן פנסיה הראל', value: 420000, owner: 'דנה רוזנברג' },
        { description: 'קופת גמל כלל', value: 150000, owner: 'עמית רוזנברג' },
      ],
      properties: [
        { description: 'ריהוט ומוצרי חשמל', value: 120000, owner: 'שניהם' },
        { description: 'תכשיטים', value: 45000, owner: 'דנה רוזנברג' },
      ],
      debts: [
        { description: 'משכנתא בנק לאומי', amount: 1200000, creditor: 'בנק לאומי', debtor: 'שניהם' },
        { description: 'הלוואה לרכב', amount: 80000, creditor: 'בנק הפועלים', debtor: 'עמית רוזנברג' },
      ],
    },

    // DIVORCE-SPECIFIC DATA - FAMILY COURT ROUTING
    // Routing fields (triggers FAMILY COURT due to infidelity = 'כן')
    'divorce.currentSituation': 'wantDivorce',
    'divorce.infidelity': 'כן',  // TRIGGERS FAMILY COURT
    'divorce.youngestChildAge': 'under6',
    'divorce.careerDisparity': 'partnerEarnsMore',
    'divorce.significantProperty': 'כן',
    'divorce.halachicGrounds': 'none',

    // Core divorce questions
    'divorce.childrenDispute': 'כן',
    'divorce.needSupport': 'כן',
    'divorce.propertyDispute': 'כן',
    'divorce.urgentRelief': 'לא',
    'divorce.parallelCases': 'לא',

    // Story - who wants divorce and why
    'divorce.whoWantsDivorceAndWhy': 'אני מבקשת גירושין לאחר 13 שנות נישואין. במהלך השנתיים האחרונות התגלתה בגידה ממושכת של בן הזוג עם עמיתה לעבודה. הבגידה נמשכה כשנתיים. כאשר גיליתי את הקשר, בן הזוג הודה אך סירב לנתק אותו. האמון נשבר לחלוטין ואין כל אפשרות לשקם את הקשר. אני מבקשת לסיים את הנישואין בכבוד ולשמור על יחסים תקינים לטובת הילדים.',

    // Legal reasons for divorce
    'divorce.divorceReasons': 'בגידה מתמשכת של בן הזוג לאורך כשנתיים, הפרת אמון חמורה, התרחקות רגשית מוחלטת, חוסר יכולת לסלוח ולשקם את הקשר, סירוב בן הזוג לנתק את הקשר החיצוני למרות גילויו.',

    // Marriage details
    'divorce.weddingCity': 'תל אביב',
    'divorce.religiousMarriage': 'כן',
    'divorce.religiousCouncil': 'הרבנות הראשית תל אביב',

    // Police & Mediation
    'divorce.policeComplaints': 'לא',
    'divorce.hadPreviousMediation': 'כן',
    'divorce.previousMediationDetails': 'התקיים גישור בחודש אפריל 2024 אצל המגשר עו"ד יוסף כהן. הגישור לא צלח עקב סירוב בן הזוג לנתק את הקשר החיצוני וחוסר הסכמה על חלוקת הרכוש.',
    'divorce.marriageCounselingDetails': 'התקיים ייעוץ זוגי אצל הפסיכולוגית ד"ר מיכל לוי במשך 8 חודשים בין נובמבר 2023 ליוני 2024. הטיפול הופסק משום שלא הושגה התקדמות עקב המשך הקשר החיצוני.',

    // Ketubah
    'divorce.ketubahAmount': '200 זקוקים כסף צרוף',
    'divorce.ketubahRequest': 'המבקשת דורשת את מלוא סכום הכתובה בהתאם להתחייבות המשיב בעת הנישואין. הכתובה נחתמה בעדות שני עדים כשרים ביום הנישואין.',
  },

  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  attachments: [
    { label: 'א', description: 'תעודת נישואין', file: SAMPLE_IMAGE, name: 'marriage-certificate.png', mimeType: 'image/png' },
    { label: 'ב', description: 'תעודות לידה של הילדים', file: SAMPLE_IMAGE, name: 'birth-certificates.png', mimeType: 'image/png' },
    { label: 'ג', description: 'הכתובה', file: SAMPLE_IMAGE, name: 'ketubah.png', mimeType: 'image/png' },
    { label: 'ד', description: 'אישור גישור', file: SAMPLE_IMAGE, name: 'mediation-confirmation.png', mimeType: 'image/png' },
    { label: 'ה', description: 'אישור ייעוץ זוגי', file: SAMPLE_IMAGE, name: 'counseling-confirmation.png', mimeType: 'image/png' },
  ],

  paymentData: { paid: true, date: new Date().toISOString() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
  folderNameOverride: 'TEST-Divorce-Family-' + new Date().toISOString().split('T')[0],
};

console.log('🧪 Testing DIVORCE Claim (FAMILY COURT)\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Partner: ${testData.basicInfo.fullName2}`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Infidelity: ${testData.formData['divorce.infidelity']} (→ FAMILY COURT)`);
console.log(`   Halachic Grounds: ${testData.formData['divorce.halachicGrounds']}`);
console.log(`   Religious Marriage: ${testData.formData['divorce.religiousMarriage']}`);
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

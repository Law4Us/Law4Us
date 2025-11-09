const axios = require('axios');

/**
 * Comprehensive Test - All 5 Claim Types
 * Tests: property, custody, alimony, divorce, divorceAgreement
 * Client: רחל and יוסי לוי
 */

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
  selectedClaims: ['property', 'custody', 'alimony', 'divorce', 'divorceAgreement'],
  formData: {
    // Global fields
    livingSeparately: 'כן',
    separationDate: '2024-02-20',
    courtProceedings: 'no',
    contactedWelfare: 'כן',
    contactedMarriageCounseling: 'כן',
    willingToJoinFamilyCounseling: 'כן',
    willingToJoinMediation: 'כן',

    // Children
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

    // Property claim data
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

    // Alimony claim data
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
    },

    // Custody claim data
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-02-20',
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים.',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי מאז שנולדו.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עסוק מאוד בעבודה.',
    },

    // Divorce claim data
    divorce: {
      relationshipDescription: 'הנישואין התאפיינו בחוסר יציבות והיעדר שיתוף פעולה פיננסי.',
      whoWantsDivorceAndWhy: 'המבקשת מבקשת גירושין בשל הפרדת חשבונות, הסתרת נכסים ופערים עמוקים באמון.',
      weddingCity: 'תל אביב',
      religiousMarriage: 'כן',
      religiousCouncil: 'תל אביב',
      policeComplaints: 'לא',
      policeComplaintsWho: '',
      policeComplaintsWhere: '',
      policeComplaintsDate: '',
      policeComplaintsOutcome: '',
      divorceReasons: 'היעדר אמון מתמשך\nניהול סיכונים פיננסיים בלי שיתוף\nפערים חינוכיים',
      hadPreviousMediation: 'כן',
      previousMediationDetails: 'התקיים גישור בחודש 03/2023 בפני המגשרת עו"ד רונית כהן, בנושאי חלוקת רכוש ומשמורת הילדים. הגישור לא הסתיים בהסכם.',
      marriageCounselingDetails: 'התקיים טיפול זוגי במרכז המשפחה תל אביב ממרץ 2022 עד אוגוסט 2022, בהנחיית יועצת זוגית גב\' מיכל לוי.',
      ketubahAmount: '200 זוז כסף',
      ketubahRequest: 'המבקשת מבקשת שהמשיב ישלם את מלוא סכום הכתובה בצירוף הפרשי הצמדה.',
    },

    // Divorce agreement data
    divorceAgreement: {
      propertyAgreement: 'custom',
      propertyCustom: 'הצדדים מסכימים על חלוקה שווה של כל הרכוש המשותף. הדירה תימכר והתמורה תחולק שווה בשווה.',
      custodyAgreement: 'jointCustody',
      custodyCustom: '',
      visitationSchedule: 'הילדים יהיו עם האם בימים א-ד, ועם האב בימים ה-ש. חילופי חגים.',
      alimonyAgreement: 'specificAmount',
      alimonyAmount: 8000,
      alimonyCustom: '',
      additionalTerms: 'הצדדים מתחייבים לשמור על קשר תקין למען טובת הילדים.',
    },

    // Other fields
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',
    otherFamilyCases: [],
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing ALL 5 CLAIM TYPES - Upload to Google Drive\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName} & ${testData.basicInfo.fullName2}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log('');
console.log('Claims to generate:');
testData.selectedClaims.forEach((claim, index) => {
  console.log(`   ${index + 1}. ${claim}`);
});
console.log('');

axios
  .post('http://localhost:3000/api/submission', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
    console.log('');
    console.log('📂 Expected folder structure:');
    console.log(`   ${response.data.folderName}/`);
    console.log('   ├── submission-data-*.json');
    console.log('   ├── טופס 4.pdf');
    console.log('   ├── תביעות/');
    console.log('   │   ├── תביעת רכושית.docx');
    console.log('   │   ├── תביעת משמורת.docx');
    console.log('   │   ├── תביעת מזונות.docx');
    console.log('   │   └── תביעת גירושין.docx');
    console.log('   └── הסכמים/');
    console.log('       └── הסכם-גירושין.docx');
    console.log('');
    console.log('✅ All 5 claim types generated successfully!');
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

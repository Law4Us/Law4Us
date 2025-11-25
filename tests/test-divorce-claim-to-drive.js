require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

/**
 * Divorce Claim Test - Uploads to Google Drive
 * Client: שרה כהן
 * Tests: תביעת גירושין
 */

const testData = {
  basicInfo: {
    fullName: 'שרה כהן',
    idNumber: '123456789',
    email: 'sara@example.com',
    phone: '050-1112233',
    address: 'רחוב הרצל 10, תל אביב',
    birthDate: '1987-05-12',
    gender: 'female',
    fullName2: 'דניאל כהן',
    idNumber2: '987654321',
    phone2: '052-9988776',
    email2: 'daniel@example.com',
    address2: 'רחוב ביאליק 22, תל אביב',
    birthDate2: '1984-11-03',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2012-06-20',
  },
  selectedClaims: ['divorce'],
  formData: {
    children: [
      {
        firstName: 'נועם',
        lastName: 'כהן',
        idNumber: '321654987',
        birthDate: '2014-04-18',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'דניאל כהן',
        childRelationship: 'התובעת היא ההורה הדומיננטי בכל התחומים.',
      },
      {
        firstName: 'הילה',
        lastName: 'כהן',
        idNumber: '321654988',
        birthDate: '2017-09-02',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'דניאל כהן',
        childRelationship: 'הילדה צמודה לאמה וניזונה משגרה שהיא זו שמנהלת.',
      },
    ],
    apartments: [
      { description: 'דירת מגורים רח\' הרצל 10, תל אביב', owner: 'שניהם', purchaseDate: '2013' },
    ],
    vehicles: [{ description: 'קיה ספורטאז\' 2020', owner: 'דניאל כהן', purchaseDate: '2020' }],
    savings: [{ amount: '180000', owner: 'שניהם' }],
    benefits: [{ amount: '250000', owner: 'שרה כהן' }],
    debts: [
      {
        amount: '900000',
        owner: 'שניהם',
        date: '2013-08-01',
        purpose: 'משכנתא',
        appendix: 'א',
      },
    ],
    relationship: 'הצדדים התחתנו ב-2012, ניהלו חיים משותפים עד 2023, ונפרדו בעקבות הסלמה בעימותים כלכליים.',
    livingSeparately: 'כן',
    separationDate: '2023-05-01',
    courtProceedings: 'no',
    contactedWelfare: 'לא',
    contactedMarriageCounseling: 'כן',
    willingToJoinFamilyCounseling: 'כן',
    willingToJoinMediation: 'כן',
    husbandJobType: 'employee',
    occupation: 'מנהלת מוצר בחברת טכנולוגיה',
    establishedDate: '',
    registeredOwner: '',
    grossSalary: '23000',
    remedies: 'לאזן את כלל הזכויות, להורות על חלוקת הדירה לטובת המבקשת, ולהבטיח מזונות בהתאם לצרכי הקטינים.',
    divorce: {
      reconcileNow: 'לא',
      wantDivorceNow: 'כן',
      childrenDispute: 'כן',
      needSupport: 'כן',
      propertyDispute: 'כן',
      urgentRelief: 'לא',
      urgentReliefDetails: '',
      parallelCases: 'לא',
      parallelCasesDetails: '',
      relationshipDescription: 'הנישואין התאפיינו בחוסר יציבות והיעדר שיתוף פעולה פיננסי מצד המשיב.',
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
      divorceProofsDescription: 'דו"חות בנקאי, תיעוד טיפול משפחתי.',
      hadPreviousMediation: 'כן',
      previousMediationDetails: 'התקיים גישור בחודש 03/2023 בפני המגשרת עו"ד רונית כהן, בנושאי חלוקת רכוש ומשמורת הילדים. הגישור לא הסתיים בהסכם.',
      marriageCounselingDetails: 'התקיים טיפול זוגי במרכז המשפחה תל אביב ממרץ 2022 עד אוגוסט 2022, בהנחיית יועצת זוגית גב\' מיכל לוי.',
      ketubahAmount: '200 זוז כסף',
      ketubahRequest: 'המבקשת מבקשת שהמשיב ישלם את מלוא סכום הכתובה בצירוף הפרשי הצמדה.',
    },
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing תביעת גירושין (Divorce Claim) - Upload to Google Drive\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children: ${testData.formData.children.length}`);
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
    console.log('   └── תביעות/');
    console.log('       └── תביעת גירושין.docx');
  })
  .catch((error) => {
    console.error('❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from backend');
    } else {
      console.error('Error setting up request:', error.message);
    }
    process.exit(1);
  });

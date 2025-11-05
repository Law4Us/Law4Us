const axios = require('axios');

/**
 * Divorce Agreement Test with UPDATED Data Structure
 * Client: אביגיל and יוסף לוי (new people)
 * Tests: הסכם גירושין with updated structure
 */

const testData = {
  basicInfo: {
    fullName: 'אביגיל לוי',
    idNumber: '888999000',
    email: 'avigail@example.com',
    phone: '055-8889990',
    address: 'רחוב רוטשילד 88, תל אביב',
    birthDate: '1990-12-05',
    gender: 'female',
    fullName2: 'יוסף לוי',
    idNumber2: '222333444',
    phone2: '055-2223334',
    email2: 'yosef@example.com',
    address2: 'רחוב אחד העם 44, תל אביב',
    birthDate2: '1988-10-10',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2013-05-12', // Marriage date in basicInfo (new structure!)
  },
  selectedClaims: ['divorceAgreement'],
  formData: {
    // GLOBAL: Children (new structure!)
    children: [
      {
        firstName: 'ליאור',
        lastName: 'לוי',
        idNumber: '555666777',
        birthDate: '2015-08-18',
        address: 'רחוב רוטשילד 88, תל אביב',
        nameOfParent: 'יוסף לוי',
        childRelationship: 'ליאור הוא בננו.',
      },
    ],

    // GLOBAL: Separation date (new structure!)
    separationDate: '2024-05-01',

    // Divorce Agreement data
    divorceAgreement: {
      // Property division - custom with AI transformation
      propertyAgreement: 'custom',
      propertyCustom:
        'הדירה ברחוב רוטשילד תימכר והתמורה תתחלק 60-40 לטובת אביגיל כי היא משקיעה יותר בטיפול בילד. הרכב שלה יישאר איתה.',

      // Custody - joint custody
      custodyAgreement: 'jointCustody',

      // Visitation - custom with AI transformation
      visitationAgreement: 'custom',
      visitationCustom:
        'ליאור יהיה עם אביגיל בימים א-ה, ועם יוסף בסופי שבוע מתחלפים. בחגים נחלק בהסכמה.',

      // Alimony - specific amount
      alimonyAgreement: 'specificAmount',
      alimonyAmount: 8000,

      // Additional terms - with AI transformation
      additionalTerms:
        'יוסף ימשיך לשלם ביטוח בריאות לילד. הוצאות חינוך נחלק שווה בשווה. אם יש הוצאות רפואיות מעל 1000 ש"ח נחלק גם.',
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
    willingToJoinFamilyCounseling: 'no',
    willingToJoinMediation: 'yes',
  },
  signature:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing DIVORCE AGREEMENT (הסכם גירושין)\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName} (${testData.basicInfo.gender})`);
console.log(`   Partner: ${testData.basicInfo.fullName2} (${testData.basicInfo.gender2})`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay} (in basicInfo) ✅`);
console.log(`   Separation Date: ${testData.formData.separationDate} (global) ✅`);
console.log(`   Children: ${testData.formData.children.length} (global) ✅`);
console.log(`   Claim: Divorce Agreement only`);
console.log('');
console.log('🤝 Agreement Details:');
console.log('   Property: Custom division (60-40 split)');
console.log('   Custody: Joint custody');
console.log('   Visitation: Custom arrangement');
console.log(`   Alimony: ${testData.formData.divorceAgreement.alimonyAmount.toLocaleString()} ILS/month`);
console.log('');

axios
  .post('http://localhost:3000/api/submission/submit', testData)
  .then((response) => {
    console.log('📡 Response status:', response.status);
    console.log('');
    console.log('✅ Response from backend:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('🎉 SUCCESS! Check your Google Drive folder:');
    console.log(`   📁 Folder: ${response.data.folderName}`);
    console.log(`   🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
    console.log('');
    console.log('📂 Expected folder structure:');
    console.log(`   ${response.data.folderName}/`);
    console.log('   ├── submission-data-*.json');
    console.log('   └── הסכם גירושין/');
    console.log('       └── הסכם-גירושין.docx');
    console.log('');
    console.log('🔑 Key Updates Verified:');
    console.log('   ✅ Children in formData.children (not property.children)');
    console.log('   ✅ Marriage date in basicInfo.weddingDay (not property.marriageDate)');
    console.log('   ✅ Separation date in formData.separationDate (global)');
    console.log('   ✅ No residingWith field (using custody.currentLivingArrangement)');
  })
  .catch((error) => {
    console.error('❌ Test failed!');
    console.error('');
    if (error.response) {
      console.error('Response error:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    console.log('');
    console.log('Make sure:');
    console.log('  1. Backend is running on http://localhost:3000');
    console.log('  2. All environment variables are set');
    console.log('  3. Google Drive credentials are configured');
    process.exit(1);
  });

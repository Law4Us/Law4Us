const axios = require('axios');

/**
 * Divorce Agreement Test - Tests mutual exclusivity
 * Client: דוד and שרה כהן
 * Tests: ONLY divorceAgreement (no other claims)
 */

const testData = {
  basicInfo: {
    fullName: 'דוד כהן',
    idNumber: '111222333',
    email: 'david@example.com',
    phone: '054-1234567',
    address: 'רחוב הנביאים 15, ירושלים',
    birthDate: '1980-06-15',
    gender: 'male',
    fullName2: 'שרה כהן',
    idNumber2: '444555666',
    phone2: '054-7654321',
    email2: 'sara@example.com',
    address2: 'רחוב הנביאים 15, ירושלים',
    birthDate2: '1982-09-20',
    gender2: 'female',
    relationshipType: 'married',
    weddingDay: '2005-12-25',
  },
  selectedClaims: ['divorceAgreement'], // ONLY agreement, no other claims
  formData: {
    children: [
      {
        firstName: 'יונתן',
        lastName: 'כהן',
        idNumber: '777888999',
        birthDate: '2010-05-10',
        address: 'רחוב הנביאים 15, ירושלים',
        nameOfParent: 'דוד כהן',
        childRelationship: 'יונתן הוא ילד רגוע ומתחשב.',
      },
    ],
    livingSeparately: 'כן',
    separationDate: '2024-01-15',
    courtProceedings: 'no',
    contactedWelfare: 'לא',
    contactedMarriageCounseling: 'כן',
    willingToJoinFamilyCounseling: 'כן',
    willingToJoinMediation: 'כן',
    divorceAgreement: {
      propertyAgreement: 'equalSplit',
      custodyAgreement: 'jointCustody',
      visitationSchedule: 'שבוע אצל כל הורה לסירוגין',
      alimonyAgreement: 'specificAmount',
      alimonyAmount: 5000,
      additionalTerms: 'בני הזוג מסכימים לחלוק את הוצאות החינוך באופן שווה.',
    },
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing הסכם גירושין (Divorce Agreement Only) - Upload to Google Drive\n');
console.log('📋 Test Data Summary:');
console.log(`   Clients: ${testData.basicInfo.fullName} & ${testData.basicInfo.fullName2}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log('');
console.log('✅ This test verifies mutual exclusivity - divorceAgreement should work alone');
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
    console.log('   └── הסכם גירושין/');
    console.log('       └── הסכם-גירושין.docx');
    console.log('');
    console.log('✅ Divorce agreement generated successfully (no other claims)!');
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

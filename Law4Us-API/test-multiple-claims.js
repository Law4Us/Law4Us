const axios = require('axios');

const testData = {
  basicInfo: {
    fullName: 'שרה כהן',
    idNumber: '123456789',
    email: 'sarah@example.com',
    phone: '050-1234567',
    address: 'רחוב הרצל 10, תל אביב',
    gender: 'female',
    fullName2: 'דוד כהן',
    idNumber2: '987654321',
    phone2: '050-9876543',
    address2: 'רחוב ביאליק 20, תל אביב',
    gender2: 'male',
  },
  selectedClaims: ['property', 'alimony', 'custody'],
  formData: {
    property: {
      marriageDate: '2015-06-15',
      separationDate: '2024-01-15',
      children: [
        {
          name: 'נועה כהן',
          firstName: 'נועה',
          lastName: 'כהן',
          idNumber: '234567890',
          birthDate: '2016-03-20',
          address: 'רחוב הרצל 10, תל אביב',
          residingWith: 'applicant',
        },
        {
          name: 'יונתן כהן',
          firstName: 'יונתן',
          lastName: 'כהן',
          idNumber: '345678901',
          birthDate: '2018-08-10',
          address: 'רחוב הרצל 10, תל אביב',
          residingWith: 'applicant',
        },
      ],
      apartments: [
        {
          description: 'דירת מגורים 4 חדרים',
          address: 'רחוב הרצל 10, תל אביב',
          value: 2500000,
          owner: 'שניהם',
        },
      ],
      vehicles: [
        {
          description: 'טויוטה קורולה 2020',
          value: 80000,
          owner: 'דוד כהן',
        },
      ],
      savings: [
        {
          description: 'חשבון בנק',
          value: 150000,
          owner: 'שניהם',
        },
      ],
      benefits: [
        {
          description: 'קופת גמל',
          value: 300000,
          owner: 'דוד כהן',
        },
      ],
      debts: [
        {
          description: 'משכנתא',
          value: 800000,
          debtor: 'שניהם',
        },
      ],
      applicantEmploymentStatus: 'employed',
      applicantEmployer: 'חברת היי-טק בע"מ',
      applicantGrossSalary: 15000,
      respondentEmploymentStatus: 'employed',
      respondentEmployer: 'חברת בנייה בע"מ',
      respondentEstimatedIncome: 20000,
    },
    alimony: {
      childrenNeeds: [
        { category: 'חינוך', monthlyAmount: 3000 },
        { category: 'בריאות', monthlyAmount: 1500 },
        { category: 'ביגוד', monthlyAmount: 1000 },
      ],
      householdNeeds: [
        { category: 'שכירות', monthlyAmount: 5000 },
        { category: 'חשמל ומים', monthlyAmount: 800 },
        { category: 'מזון', monthlyAmount: 3000 },
      ],
    },
    custody: {
      custodySummary: 'אני מטפלת בילדים באופן יומיומי, עוזרת להם בשיעורים, ומקפידה על בריאותם ורווחתם.',
      whyNotOtherParent: 'האב עסוק מאוד בעבודה ואינו זמין לטיפול יומיומי בילדים.',
    },
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing Multiple Claims Submission\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children: ${testData.formData.property.children.length}`);
console.log(`   Total property value: ₪${(2500000 + 80000 + 150000 + 300000).toLocaleString()}`);
console.log(`   Total debts: ₪${800000}`);
console.log('');

axios
  .post('http://localhost:3001/api/submission/submit', testData)
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
    console.log('   ├── תביעה רכושית/');
    console.log('   │   └── תביעת-רכושית.docx');
    console.log('   ├── תביעת מזונות/');
    console.log('   │   └── תביעת-מזונות.docx');
    console.log('   └── תביעת משמורת/');
    console.log('       └── תביעת-משמורת.docx');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\nMake sure the backend is running on http://localhost:3001');
  });

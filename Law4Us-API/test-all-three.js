const axios = require('axios');

const testData = {
  basicInfo: {
    fullName: 'שרה כהן',
    idNumber: '123456789',
    email: 'sarah@example.com',
    phone: '050-1234567',
    address: 'רחוב הרצל 10, תל אביב',
    birthDate: '1985-05-15',
    gender: 'female',
    fullName2: 'דוד כהן',
    idNumber2: '987654321',
    phone2: '050-9876543',
    email2: 'david@example.com',
    address2: 'רחוב ביאליק 20, תל אביב',
    birthDate2: '1983-08-20',
    gender2: 'male',
    relationshipType: 'married',
    weddingDay: '2015-06-15',
  },
  selectedClaims: ['property', 'alimony', 'custody'],
  formData: {
    children: [
      {
        firstName: 'נועה',
        lastName: 'כהן',
        idNumber: '234567890',
        birthDate: '2016-03-20',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'דוד כהן',
        childRelationship: 'נועה היא ילדה מתחשבת שאוהבת ללמוד ולשחק.',
      },
      {
        firstName: 'יונתן',
        lastName: 'כהן',
        idNumber: '345678901',
        birthDate: '2018-08-10',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'דוד כהן',
        childRelationship: 'יונתן הוא ילד אנרגטי ושמח.',
      },
    ],
    separationDate: '2024-01-15',
    property: {
      apartments: [
        {
          description: 'דירת מגורים 4 חדרים',
          address: 'רחוב הרצל 10, תל אביב',
          value: 2500000,
          owner: 'שניהם',
          purchaseDate: '2016-07-20',
        },
      ],
      vehicles: [
        {
          description: 'טויוטה קורולה 2020',
          value: 80000,
          owner: 'דוד כהן',
          purchaseDate: '2020-03-15',
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
      relationshipDescription: 'היינו זוג נשוי במשך 9 שנים. בתחילה היו יחסים טובים אבל בשנים האחרונות התרחקנו.',
      wasPreviousAlimony: 'no',
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד', monthlyAmount: 3000 },
        { category: 'בריאות', description: 'ביטוח בריאות', monthlyAmount: 1500 },
        { category: 'ביגוד', description: 'בגדים ונעליים', monthlyAmount: 1000 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'שכירות דירה', monthlyAmount: 5000 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות', monthlyAmount: 800 },
        { category: 'מזון', description: 'קניות', monthlyAmount: 3000 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק לאומי', accountNumber: '12345678' },
      ],
      hasVehicle: 'no',
      requestedAmount: 8000,
    },
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-01-15',
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי, עוזרת להם בשיעורים, ומקפידה על בריאותם ורווחתם.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עסוק מאוד בעבודה ואינו זמין לטיפול יומיומי בילדים.',
    },
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing All Three Claims (Updated Structure)\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children (global): ${testData.formData.children.length}`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay} (in basicInfo)`);
console.log(`   Purchase dates: Added for apartment and vehicle`);
console.log(`   Living arrangement: ${testData.formData.custody.currentLivingArrangement}`);
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

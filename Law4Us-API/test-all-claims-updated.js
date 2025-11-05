const axios = require('axios');

/**
 * Comprehensive Test for All Three Claim Types (Updated Structure)
 * Tests: Property, Alimony, Custody claims with new data structure
 */

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
    weddingDay: '2015-06-15', // Marriage date now in basicInfo
  },
  selectedClaims: ['property', 'alimony', 'custody'],
  formData: {
    // GLOBAL: Children (shared across all claims)
    children: [
      {
        firstName: 'נועה',
        lastName: 'כהן',
        idNumber: '234567890',
        birthDate: '2016-03-20',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'דוד כהן', // Identifies this as shared child
        childRelationship: 'מערכת יחסים קרובה, נועה היא ילדה מתחשבת שאוהבת ללמוד ולשחק. אני מבלה איתה כל יום, עוזר לה בשיעורים ומקפיד על רווחתה.',
      },
      {
        firstName: 'יונתן',
        lastName: 'כהן',
        idNumber: '345678901',
        birthDate: '2018-08-10',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'דוד כהן', // Identifies this as shared child
        childRelationship: 'יונתן הוא ילד אנרגטי ושמח. אני מבלה איתו זמן רב, משחק כדורגל ועוזר לו להתפתח.',
      },
      {
        firstName: 'תמר',
        lastName: 'לוי',
        idNumber: '456789012',
        birthDate: '2010-12-05',
        address: 'רחוב הרצל 10, תל אביב',
        nameOfParent: 'יוסי לוי', // Different parent - from previous marriage
        childRelationship: 'תמר היא הבת שלי מנישואים קודמים. אנחנו שומרים על קשר קרוב.',
      },
    ],

    // GLOBAL: Separation date
    separationDate: '2024-01-15',

    // PROPERTY-specific data
    property: {
      apartments: [
        {
          description: 'דירת מגורים 4 חדרים, רחוב הרצל 10',
          value: 2500000,
          owner: 'שניהם',
          purchaseDate: '2016-07-20', // Now used in document
        },
      ],
      vehicles: [
        {
          description: 'טויוטה קורולה 2020',
          value: 80000,
          owner: 'דוד כהן',
          purchaseDate: '2020-03-15', // Now used in document
        },
      ],
      savings: [
        {
          description: 'חשבון בנק לאומי',
          value: 150000,
          owner: 'שניהם',
        },
      ],
      benefits: [
        {
          description: 'קופת גמל מנורה',
          value: 300000,
          owner: 'דוד כהן',
        },
      ],
      properties: [
        {
          description: 'ריהוט ומוצרי חשמל',
          value: 50000,
          owner: 'שניהם',
        },
      ],
      debts: [
        {
          description: 'משכנתא בנק הפועלים',
          amount: 800000,
          debtor: 'שניהם',
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת היי-טק בע"מ', // New required field
      applicantGrossSalary: 15000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת בנייה בע"מ',
      respondentGrossSalary: 20000,
    },

    // ALIMONY-specific data
    alimony: {
      relationshipDescription: 'היינו זוג נשוי במשך 9 שנים. בתחילה היו יחסים טובים, אבל בשנים האחרונות התרחקנו עקב עומס בעבודה וחילוקי דעות בנושא חינוך הילדים.', // Used in custody with AI transformation
      wasPreviousAlimony: 'no',
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד ופעילויות', monthlyAmount: 3000 },
        { category: 'בריאות', description: 'ביטוח בריאות ותרופות', monthlyAmount: 1500 },
        { category: 'ביגוד', description: 'בגדים ונעליים', monthlyAmount: 1000 },
        { category: 'פנאי', description: 'חוגים ופעילויות', monthlyAmount: 800 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'שכירות דירה', monthlyAmount: 5000 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות', monthlyAmount: 800 },
        { category: 'מזון', description: 'קניות שבועיות', monthlyAmount: 3000 },
        { category: 'תחבורה', description: 'הסעות וכלי רכב', monthlyAmount: 1200 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק לאומי', accountNumber: '12345678', balance: 25000 },
      ],
      hasVehicle: 'yes',
      vehicleDetails: 'מאזדה 3 לבן',
      requestedAmount: 8000,
    },

    // CUSTODY-specific data
    custody: {
      currentLivingArrangement: 'with_applicant', // Where children live now
      sinceWhen: '2024-01-15', // When this arrangement began
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים, ויום אחד באמצע השבוע בין השעות 16:00-20:00',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי. אני זו שמכינה להם ארוחות, עוזרת בשיעורי בית, ודואגת לכל צרכיהם. יש לי גמישות בעבודה שמאפשרת לי להיות איתם.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עסוק מאוד בעבודה ופעמים רבות חוזר מאוחר. הוא אוהב את הילדים אבל אין לו את הזמינות הנדרשת לטיפול יומיומי.',
    },

    // GLOBAL questions
    marriedBefore: 'yes',
    hadChildrenFromPrevious: 'yes',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',
    otherFamilyCases: [
      {
        caseNumber: 'תמ-12345-06-24',
        caseType: 'תביעת רכושית',
        court: 'בית משפט לענייני משפחה תל אביב',
        judge: 'השופטת כהן',
        status: 'הסתיים',
        caseEndDate: '2023-12-01',
      },
    ],
    contactedWelfare: 'yes',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing All Three Claims with UPDATED Structure\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName} (${testData.basicInfo.gender})`);
console.log(`   Partner: ${testData.basicInfo.fullName2} (${testData.basicInfo.gender2})`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay} (now in basicInfo)`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children (global): ${testData.formData.children.length}`);
console.log(`     - Shared children: ${testData.formData.children.filter(c => c.nameOfParent === testData.basicInfo.fullName2).length}`);
console.log(`     - From previous marriage: ${testData.formData.children.filter(c => c.nameOfParent !== testData.basicInfo.fullName2 && c.nameOfParent).length}`);
console.log(`   Property value: ${(2500000 + 80000 + 150000 + 300000 + 50000).toLocaleString()} ILS`);
console.log(`   Debts: ${800000.toLocaleString()} ILS`);
console.log(`   Requested alimony: ${testData.formData.alimony.requestedAmount.toLocaleString()} ILS/month`);
console.log(`   Living arrangement: ${testData.formData.custody.currentLivingArrangement}`);
console.log('');
console.log('🔑 Key Updates Tested:');
console.log('   ✅ Children in formData.children (shared across claims)');
console.log('   ✅ Marriage date in basicInfo.weddingDay');
console.log('   ✅ nameOfParent field for child filtering');
console.log('   ✅ No residingWith field (using custody.currentLivingArrangement)');
console.log('   ✅ applicantEmployer field added');
console.log('   ✅ Purchase dates for apartments and vehicles');
console.log('   ✅ Other Family Cases with caseType, court, status');
console.log('   ✅ relationshipDescription for AI transformation in custody');
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
    console.log('');
    console.log('📝 What to check in documents:');
    console.log('   1. Property claim: Purchase dates shown for apartment & car');
    console.log('   2. All claims: Only 2 shared children listed in מערכת היחסים');
    console.log('   3. All claims: Previous child (תמר) listed separately');
    console.log('   4. Custody: Living arrangement shows "עם שרה כהן"');
    console.log('   5. Custody: Relationship description transformed with AI');
    console.log('   6. Other Family Cases: Shows caseType, court, and status');
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
    console.log('  1. Backend is running on http://localhost:3001');
    console.log('  2. All environment variables are set (GROQ_API_KEY, etc.)');
    console.log('  3. Google Drive credentials are configured');
    process.exit(1);
  });

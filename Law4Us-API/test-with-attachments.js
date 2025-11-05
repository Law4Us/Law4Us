const axios = require('axios');

/**
 * Comprehensive Test with Attachments and Multiple Claims
 * Tests: Property, Alimony, Custody with real attachment files
 * New person: Rachel Levi
 */

// Create placeholder attachments (small PNG images)
const createPlaceholderImage = (label) => {
  // 1x1 pixel PNG with text embedded in filename
  return {
    fileName: `נספח-${label}.png`,
    mimeType: 'image/png',
    content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };
};

// Create placeholder PDF attachment
const createPlaceholderPDF = (label) => {
  // Minimal valid PDF (empty page)
  const pdfBase64 = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMDQKJSVFT0Y=';
  return {
    fileName: `נספח-${label}.pdf`,
    mimeType: 'application/pdf',
    content: `data:application/pdf;base64,${pdfBase64}`
  };
};

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
  selectedClaims: ['property', 'alimony', 'custody'],
  formData: {
    // GLOBAL: Children
    children: [
      {
        firstName: 'נועם',
        lastName: 'לוי',
        idNumber: '567890123',
        birthDate: '2012-03-14',
        address: 'רחוב דיזנגוף 50, תל אביב',
        nameOfParent: 'יוסי לוי',
        childRelationship: 'נועם הוא ילד חכם ומתחשב. אני מבלה איתו כל יום, עוזרת לו בשיעורי בית ודואגת לכל צרכיו. יש לנו קשר חזק ומיוחד.',
      },
      {
        firstName: 'תמר',
        lastName: 'לוי',
        idNumber: '678901234',
        birthDate: '2015-08-22',
        address: 'רחוב דיזנגוף 50, תל אביב',
        nameOfParent: 'יוסי לוי',
        childRelationship: 'תמר היא ילדה מקסימה ואנרגטית. אני דואגת לה מאז שנולדה, מכינה לה ארוחות ומלווה אותה לכל פעילות.',
      },
      {
        firstName: 'איתי',
        lastName: 'לוי',
        idNumber: '789012345',
        birthDate: '2018-01-05',
        address: 'רחוב דיזנגוף 50, תל אביב',
        nameOfParent: 'יוסי לוי',
        childRelationship: 'איתי הוא הקטן שלנו. אני מטפלת בו בכל צרכיו היומיומיים ודואגת לבריאותו ולמוחו.',
      },
    ],

    // GLOBAL: Separation date
    separationDate: '2024-02-20',

    // PROPERTY-specific data
    property: {
      apartments: [
        {
          description: 'דירת 5 חדרים, רחוב דיזנגוף 50',
          value: 3200000,
          owner: 'שניהם',
          purchaseDate: '2011-05-10',
          proof: createPlaceholderPDF('דירה-דיזנגוף'),
        },
        {
          description: 'דירה להשקעה ברמת גן, 3 חדרים',
          value: 1800000,
          owner: 'שניהם',
          purchaseDate: '2018-12-01',
          proof: createPlaceholderPDF('דירה-רמת-גן'),
        },
      ],
      vehicles: [
        {
          description: 'הונדה סיוויק 2021',
          value: 120000,
          owner: 'רחל לוי',
          purchaseDate: '2021-06-15',
          proof: createPlaceholderImage('רכב-הונדה'),
        },
        {
          description: 'מאזדה CX5 2019',
          value: 150000,
          owner: 'יוסי לוי',
          purchaseDate: '2019-03-20',
          proof: createPlaceholderImage('רכב-מאזדה'),
        },
      ],
      savings: [
        {
          description: 'חשבון בנק דיסקונט',
          value: 280000,
          owner: 'שניהם',
          proof: createPlaceholderPDF('בנק-דיסקונט'),
        },
        {
          description: 'חשבון חיסכון בנק לאומי',
          value: 150000,
          owner: 'רחל לוי',
          proof: createPlaceholderPDF('בנק-לאומי'),
        },
      ],
      benefits: [
        {
          description: 'קופת גמל מנורה',
          value: 450000,
          owner: 'יוסי לוי',
          proof: createPlaceholderPDF('קופת-גמל-יוסי'),
        },
        {
          description: 'קרן פנסיה הראל',
          value: 320000,
          owner: 'רחל לוי',
          proof: createPlaceholderPDF('פנסיה-רחל'),
        },
      ],
      properties: [
        {
          description: 'ריהוט ומוצרי חשמל',
          value: 80000,
          owner: 'שניהם',
          proof: createPlaceholderImage('ריהוט'),
        },
      ],
      debts: [
        {
          description: 'משכנתא בנק הפועלים',
          amount: 1200000,
          creditor: 'בנק הפועלים',
          debtor: 'שניהם',
          proof: createPlaceholderPDF('משכנתא'),
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת סטארט-אפ בע"מ',
      applicantGrossSalary: 18000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'חברת הייטק גדולה בע"מ',
      respondentGrossSalary: 25000,
    },

    // ALIMONY-specific data
    alimony: {
      relationshipDescription: 'היינו זוג נשוי במשך 14 שנים. בשנים הראשונות היה לנו קשר טוב, אבל בשנים האחרונות התרחקנו עקב עומס בעבודה וחילוקי דעות בנושאים משפחתיים.',
      wasPreviousAlimony: 'no',
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד בבית ספר פרטי', monthlyAmount: 4000 },
        { category: 'בריאות', description: 'ביטוח בריאות מורחב', monthlyAmount: 2000 },
        { category: 'ביגוד', description: 'בגדים ונעליים', monthlyAmount: 1500 },
        { category: 'פנאי', description: 'חוגים ופעילויות', monthlyAmount: 1200 },
        { category: 'תחבורה', description: 'הסעות והוצאות נסיעה', monthlyAmount: 800 },
      ],
      householdNeeds: [
        { category: 'דיור', description: 'שכירות דירה', monthlyAmount: 6000 },
        { category: 'חשמל ומים', description: 'הוצאות קבועות', monthlyAmount: 1000 },
        { category: 'מזון', description: 'קניות שבועיות', monthlyAmount: 4000 },
        { category: 'תחבורה', description: 'דלק ותחזוקה', monthlyAmount: 1500 },
        { category: 'ביטוחים', description: 'ביטוח דירה ורכב', monthlyAmount: 800 },
      ],
      hasBankAccounts: 'yes',
      bankAccounts: [
        { bankName: 'בנק דיסקונט', accountNumber: '87654321', balance: 35000 },
        { bankName: 'בנק לאומי', accountNumber: '12348765', balance: 18000 },
      ],
      hasVehicle: 'yes',
      vehicleDetails: 'הונדה סיוויק 2021 לבן',
      requestedAmount: 10000,
    },

    // CUSTODY-specific data
    custody: {
      currentLivingArrangement: 'with_applicant',
      sinceWhen: '2024-02-20',
      currentVisitationArrangement: 'הילדים נפגשים עם האב בסופי שבוע מתחלפים (שבת-ראשון), ויום אחד באמצע השבוע (רביעי) בין השעות 16:00-20:00.',
      whoShouldHaveCustody: 'אני מטפלת בילדים באופן יומיומי מאז שנולדו. אני זו שמכינה להם ארוחות בריאות, עוזרת בשיעורי בית, מלווה לרופא ולחוגים. יש לי גמישות בעבודה שמאפשרת לי להיות זמינה עבורם בכל עת.',
      requestedArrangement: 'primary_with_visits',
      whyNotOtherParent: 'האב עסוק מאוד בעבודה במשרה מלאה פלוס שעות נוספות. הוא חוזר הביתה מאוחר ולעיתים גם נוסע לחול לתקופות ממושכות. למרות שהוא אוהב את הילדים, אין לו את הזמינות הנדרשת לטיפול יומיומי מלא.',
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
    otherFamilyCases: [
      {
        caseNumber: 'תמ-98765-03-23',
        caseType: 'תביעת מזונות זמניים',
        court: 'בית משפט לענייני משפחה תל אביב',
        judge: 'השופט כהן',
        status: 'הסתיים',
        caseEndDate: '2023-12-15',
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

console.log('🧪 Testing All Three Claims with ATTACHMENTS\n');
console.log('📋 Test Data Summary:');
console.log(`   Client: ${testData.basicInfo.fullName} (${testData.basicInfo.gender})`);
console.log(`   Partner: ${testData.basicInfo.fullName2} (${testData.basicInfo.gender2})`);
console.log(`   Marriage Date: ${testData.basicInfo.weddingDay}`);
console.log(`   Claims: ${testData.selectedClaims.join(', ')}`);
console.log(`   Children: ${testData.formData.children.length}`);
console.log(`   Separation Date: ${testData.formData.separationDate}`);
console.log('');
console.log('📎 Attachments Summary:');
console.log(`   Apartments: ${testData.formData.property.apartments.filter(a => a.proof).length} attachments`);
console.log(`   Vehicles: ${testData.formData.property.vehicles.filter(v => v.proof).length} attachments`);
console.log(`   Savings: ${testData.formData.property.savings.filter(s => s.proof).length} attachments`);
console.log(`   Benefits: ${testData.formData.property.benefits.filter(b => b.proof).length} attachments`);
console.log(`   Properties: ${testData.formData.property.properties.filter(p => p.proof).length} attachments`);
console.log(`   Debts: ${testData.formData.property.debts.filter(d => d.proof).length} attachments`);
const totalAttachments =
  testData.formData.property.apartments.filter(a => a.proof).length +
  testData.formData.property.vehicles.filter(v => v.proof).length +
  testData.formData.property.savings.filter(s => s.proof).length +
  testData.formData.property.benefits.filter(b => b.proof).length +
  testData.formData.property.properties.filter(p => p.proof).length +
  testData.formData.property.debts.filter(d => d.proof).length;
console.log(`   📊 Total Attachments: ${totalAttachments}`);
console.log('');
console.log('💰 Financial Summary:');
const totalAssets = 3200000 + 1800000 + 120000 + 150000 + 280000 + 150000 + 450000 + 320000 + 80000;
console.log(`   Total Assets: ${totalAssets.toLocaleString()} ILS`);
console.log(`   Total Debts: 1,200,000 ILS`);
console.log(`   Net Worth: ${(totalAssets - 1200000).toLocaleString()} ILS`);
console.log(`   Requested Alimony: ${testData.formData.alimony.requestedAmount.toLocaleString()} ILS/month`);
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
    console.log('   │   └── תביעת-רכושית.docx (with נספחים section!)');
    console.log('   ├── תביעת מזונות/');
    console.log('   │   └── תביעת-מזונות.docx');
    console.log('   └── תביעת משמורת/');
    console.log('       └── תביעת-משמורת.docx');
    console.log('');
    console.log('🔍 What to check in תביעת רכושית:');
    console.log(`   ✅ נספחים section should have ${totalAttachments} attachments`);
    console.log('   ✅ Each attachment should be labeled with Hebrew letters (א, ב, ג...)');
    console.log('   ✅ Table of contents should show page numbers');
    console.log('   ✅ Purchase dates should be shown for apartments and vehicles');
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
    console.log('  2. All environment variables are set');
    console.log('  3. Google Drive credentials are configured');
    process.exit(1);
  });

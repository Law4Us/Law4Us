const axios = require('axios');

/**
 * Simple Property Claim Test with 3 Attachments
 * Client: Moshe Cohen (new person)
 * Focus: Testing נספחים (attachments) section
 */

const testData = {
  basicInfo: {
    fullName: 'משה כהן',
    idNumber: '111222333',
    email: 'moshe@example.com',
    phone: '054-1112223',
    address: 'רחוב קינג ג\'ורג\' 15, ירושלים',
    birthDate: '1980-06-10',
    gender: 'male',
    fullName2: 'מרים כהן',
    idNumber2: '444555666',
    phone2: '054-4445556',
    email2: 'miriam@example.com',
    address2: 'רחוב בן יהודה 25, ירושלים',
    birthDate2: '1982-09-15',
    gender2: 'female',
    relationshipType: 'married',
    weddingDay: '2005-08-20',
  },
  selectedClaims: ['property'],
  formData: {
    children: [
      {
        firstName: 'דניאל',
        lastName: 'כהן',
        idNumber: '777888999',
        birthDate: '2008-04-12',
        address: 'רחוב קינג ג\'ורג\' 15, ירושלים',
        nameOfParent: 'מרים כהן',
        childRelationship: 'דניאל הוא בני הבכור.',
      },
    ],
    separationDate: '2024-03-01',
    property: {
      apartments: [
        {
          description: 'דירת 4 חדרים ברחוב קינג ג\'ורג\'',
          value: 2800000,
          owner: 'שניהם',
          purchaseDate: '2006-01-15',
        },
      ],
      vehicles: [
        {
          description: 'סקודה אוקטביה 2020',
          value: 95000,
          owner: 'משה כהן',
          purchaseDate: '2020-07-10',
        },
      ],
      savings: [
        {
          description: 'חשבון חיסכון בנק לאומי',
          value: 180000,
          owner: 'שניהם',
        },
      ],
      benefits: [],
      properties: [],
      debts: [
        {
          description: 'משכנתא בנק דיסקונט',
          amount: 950000,
          creditor: 'בנק דיסקונט',
          debtor: 'שניהם',
        },
      ],
      applicantEmploymentStatus: 'employee',
      applicantEmployer: 'חברת טכנולוגיה בע"מ',
      applicantGrossSalary: 22000,
      respondentEmploymentStatus: 'employee',
      respondentEmployer: 'בית ספר ממלכתי',
      respondentGrossSalary: 16000,
    },
    marriedBefore: 'no',
    hadChildrenFromPrevious: 'no',
    marriedBefore2: 'no',
    hadChildrenFromPrevious2: 'no',
    applicantHomeType: 'rental',
    partnerHomeType: 'rental',
    protectionOrderRequested: 'no',
    pastViolenceReported: 'no',
    otherFamilyCases: [],
    contactedWelfare: 'no',
    contactedMarriageCounseling: 'yes',
    willingToJoinFamilyCounseling: 'yes',
    willingToJoinMediation: 'yes',
  },
  // 3 simple attachments (small base64 images)
  attachments: [
    {
      label: 'א',
      description: 'תעודת בעלות על הדירה - רחוב קינג ג\'ורג\' 15',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='],
    },
    {
      label: 'ב',
      description: 'רישיון רכב - סקודה אוקטביה',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0ciA0gAAAABJRU5ErkJggg=='],
    },
    {
      label: 'ג',
      description: 'אישור יתרת משכנתא - בנק דיסקונט',
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='],
    },
  ],
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  paymentData: { paid: true, date: new Date() },
  filledDocuments: {},
  submittedAt: new Date().toISOString(),
};

console.log('🧪 Testing Property Claim with ATTACHMENTS\n');
console.log('📋 Client: משה כהן (new person)');
console.log('📄 Claim: Property only');
console.log(`📎 Attachments: ${testData.attachments.length}`);
testData.attachments.forEach((att) => {
  console.log(`   ${att.label}. ${att.description}`);
});
console.log('');

axios
  .post('http://localhost:3001/api/submission/submit', testData)
  .then((response) => {
    console.log('✅ SUCCESS!');
    console.log(`📁 Folder: ${response.data.folderName}`);
    console.log(`🔗 https://drive.google.com/drive/folders/${response.data.folderId}`);
    console.log('');
    console.log('🔍 Check the property claim document:');
    console.log('   ✅ נספחים section at the end');
    console.log('   ✅ Table of contents with page numbers');
    console.log('   ✅ 3 attachments labeled א, ב, ג');
  })
  .catch((error) => {
    console.error('❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response from backend');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  });

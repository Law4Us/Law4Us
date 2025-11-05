/**
 * Simple test: Generate documents locally without Google Drive upload
 * Tests document generation in isolation
 */

const { generateDocument } = require('./Law4Us-API/src/services/document-generator');
const fs = require('fs');
const path = require('path');

const testData = {
  basicInfo: {
    fullName: 'שרה לוי',
    idNumber: '123456789',
    email: 'sarah@example.com',
    phone: '0501234567',
    address: 'רחוב הרצל 123, תל אביב',
    gender: 'female',
    fullName2: 'דוד לוי',
    idNumber2: '987654321',
    email2: 'david@example.com',
    phone2: '0509876543',
    address2: 'רחוב ביאליק 456, חיפה',
    gender2: 'male',
    marriageDate: '2015-06-15',
    weddingLocation: 'תל אביב',
  },
  formData: {
    children: [
      {
        firstName: 'נועם',
        lastName: 'לוי',
        idNumber: '567890123',
        birthDate: '2016-03-14',
        address: 'רחוב הרצל 123, תל אביב',
        otherParent: 'דוד לוי',
        relationshipDescription: 'יש לי קשר קרוב מאוד עם נועם.',
      },
    ],
    relationshipDescription: 'התחלנו את הקשר ב-2014 ונישאנו ב-2015.',
    propertyRegime: 'community',
    apartments: [
      { description: 'דירת 4 חדרים ברחוב הרצל 123', value: '2500000', owner: 'משותף' },
    ],
    vehicles: [
      { description: 'מאזדה 3, 2020', value: '80000', owner: 'משותף' },
    ],
    savings: [
      { description: 'חשבון חיסכון בנק הפועלים', value: '150000', owner: 'משותף' },
    ],
    benefits: [],
    properties: [],
    debts: [
      { description: 'משכנתא על הדירה', value: '1200000', owner: 'משותף' },
    ],
    applicantEmployment: 'employee',
    applicantIncome: '15000',
    respondentEmployment: 'employee',
    respondentIncome: '18000',
    livingTogether: 'no',
    separationDate: '2024-02-01',
    remedies: 'אני מבקשת לחלק את הרכוש המשותף באופן שווה.',
  },
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
};

async function testGeneration() {
  console.log('🧪 Testing document generation (WITHOUT Google Drive upload)\\n');

  const outputDir = path.join(__dirname, 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log('📄 Generating property claim document...');
    const propertyDoc = await generateDocument({
      basicInfo: testData.basicInfo,
      formData: testData.formData,
      selectedClaims: ['property'],
      claimType: 'property',
      signature: testData.signature,
      lawyerSignature: undefined, // Will load from env
    });

    const outputPath = path.join(outputDir, 'תביעת-רכושית-test.docx');
    fs.writeFileSync(outputPath, propertyDoc);

    console.log(`✅ Document generated successfully!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📏 Size: ${(propertyDoc.length / 1024).toFixed(2)} KB`);
    console.log('');
    console.log('🎉 Test passed! Document generation works correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open the generated document to verify it looks correct');
    console.log('  2. Set up Google Drive credentials to test full submission');

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testGeneration();

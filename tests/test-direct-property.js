/**
 * Direct Property Claim Generator Test
 * Tests the generator directly without requiring API server
 */

const fs = require('fs');
const path = require('path');
const { getSignatureBuffer } = require('./utils/get-signature-buffer');

// Import the generator (we'll use dynamic import since it's TypeScript)
async function testDirectGeneration() {
  console.log('\n🧪 Testing Property Claim Generator DIRECTLY...\n');

  // Read the lawyer signature
  const signatureBuffer = getSignatureBuffer();
  const signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;

  console.log(`📷 Loaded signature: ${signatureBuffer.length} bytes`);

  // Create a realistic payslip image
  const createMockPayslipImage = () => {
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAiYAAALuCAIAAABuj461AAAADElEQVR4nGP4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC";
    return Buffer.from(base64, "base64");
  };

  const testData = {
    basicInfo: {
      fullName: "דוד מזרחי",
      idNumber: "234567890",
      address: "רחוב ביאליק 15, דירה 12, חיפה",
      phone: "050-1234567",
      email: "david.mizrahi@example.com",
      birthDate: "1980-03-20",
      gender: "male",
      fullName2: "רחל כהן-מזרחי",
      idNumber2: "345678901",
      address2: "רחוב הרצל 88, דירה 5, חיפה",
      phone2: "052-9876543",
      email2: "rachel.mizrahi@example.com",
      birthDate2: "1982-07-15",
      gender2: "female",
      relationshipType: "married",
      weddingDay: "2005-09-12",
    },

    formData: {
      // Children
      children: [
        {
          __id: "child-1",
          firstName: "יעל",
          lastName: "מזרחי",
          birthDate: "2008-02-14",
          idNumber: "456789012",
          address: "רחוב ביאליק 15, חיפה",
        },
        {
          __id: "child-2",
          firstName: "אורי",
          lastName: "מזרחי",
          birthDate: "2011-06-22",
          idNumber: "567890123",
          address: "רחוב ביאליק 15, חיפה",
        },
        {
          __id: "child-3",
          firstName: "טל",
          lastName: "מזרחי",
          birthDate: "2015-11-03",
          idNumber: "678901234",
          address: "רחוב ביאליק 15, חיפה",
        },
      ],

      wereMarried: "yes",
      separationDate: "2024-01-15",

      // Job details
      job1: {
        employer: "חברת הייטק בע\"מ",
        position: "מהנדס תוכנה",
        monthlySalary: "18500",
      },
      job2: {
        employer: "בית חולים רמב\"ם",
        position: "אחות מוסמכת",
        monthlySalary: "16200",
      },

      // APARTMENTS
      apartments: [
        {
          description: "דירת מגורים - רח' ביאליק 15, חיפה (5 חדרים)",
          value: "3200000",
          owner: "שניהם",
        },
        {
          description: "דירת השקעה - רח' נורדאו 42, תל אביב (3 חדרים)",
          value: "2800000",
          owner: "שניהם",
        },
      ],

      // VEHICLES
      vehicles: [
        {
          description: "רכב מרצדס C200 (2021)",
          value: "180000",
          owner: "המבקש",
        },
        {
          description: "רכב הונדה CRV (2019)",
          value: "145000",
          owner: "הנתבעת",
        },
      ],

      // SAVINGS
      savings: [
        {
          description: "חשבון חיסכון משותף - בנק הפועלים",
          value: "420000",
          owner: "שניהם",
        },
        {
          description: "תיק השקעות - בנק לאומי",
          value: "550000",
          owner: "שניהם",
        },
      ],

      // BENEFITS
      benefits: [
        {
          description: "קופת גמל - המבקש",
          value: "280000",
          owner: "המבקש",
        },
        {
          description: "קרן פנסיה - הנתבעת",
          value: "310000",
          owner: "הנתבעת",
        },
      ],

      // PROPERTIES (general)
      properties: [
        {
          description: "ריהוט ומוצרי חשמל",
          value: "120000",
          owner: "שניהם",
        },
      ],

      // DEBTS
      debts: [
        {
          description: "משכנתא על דירת המגורים",
          amount: "850000",
          creditor: "בנק מזרחי טפחות",
        },
        {
          description: "הלוואה בנקית",
          amount: "75000",
          creditor: "בנק הפועלים",
        },
      ],
    },

    signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    lawyerSignature: signatureBase64,

    attachments: [
      {
        label: "א",
        description: "תלושי שכר - 3 חודשים אחרונים (המבקש)",
        images: [
          createMockPayslipImage(),
          createMockPayslipImage(),
          createMockPayslipImage(),
        ],
      },
      {
        label: "ב",
        description: "תלושי שכר - 3 חודשים אחרונים (הנתבעת)",
        images: [
          createMockPayslipImage(),
          createMockPayslipImage(),
        ],
      },
      {
        label: "ג",
        description: "אישור בעלות על דירה - רח' ביאליק 15",
        images: [createMockPayslipImage()],
      },
    ],
  };

  console.log('📋 Test Data Summary:');
  console.log(`   Name: ${testData.basicInfo.fullName}`);
  console.log(`   Partner: ${testData.basicInfo.fullName2}`);
  console.log(`   Children: ${testData.formData.children.length}`);
  console.log(`   Apartments: ${testData.formData.apartments.length}`);
  console.log(`   Vehicles: ${testData.formData.vehicles.length}`);
  console.log(`   Savings: ${testData.formData.savings.length}`);
  console.log(`   Benefits: ${testData.formData.benefits.length}`);
  console.log(`   Properties (general): ${testData.formData.properties.length}`);
  console.log(`   Debts: ${testData.formData.debts.length}`);
  console.log(`   Attachments: ${testData.attachments.length} documents`);
  console.log('');

  try {
    // Import TypeScript module using ts-node
    console.log('🔧 Loading generator module...');
    const { generatePropertyClaimDocument } = require('./dist/services/property-claim-generator');

    console.log('📝 Generating document...');
    const buffer = await generatePropertyClaimDocument(testData);

    // Save to file
    const outputPath = path.join(__dirname, 'output', 'property-claim-test.docx');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);

    console.log(`\n✅ SUCCESS! Document generated:`);
    console.log(`   📄 File: ${outputPath}`);
    console.log(`   💾 Size: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log('\n🎉 Open the document in Microsoft Word to see accurate page numbers in the TOC!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);

    // If compiled version doesn't exist, suggest compilation
    if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Tip: Run "npm run build" first to compile TypeScript files');
    }
  }
}

testDirectGeneration();
